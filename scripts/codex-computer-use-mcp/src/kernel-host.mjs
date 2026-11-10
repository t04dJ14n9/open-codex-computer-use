import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { kernelRoot, runtimeEnvironment, nodeBinary } from "./config.mjs";
import { timeouts, clampTimeout } from "./timeouts.mjs";

export class KernelHost {
  constructor({ approval, cwd = process.cwd(), timeoutMs = timeouts.jsMs } = {}) {
    this.cwd = cwd;
    this.approval = approval;
    this.timeoutMs = timeoutMs;
    this.pending = new Map();
    this.sockets = new Map();
    this.workers = new Set();
    this.queue = Promise.resolve();
    this.current = null;
    this.closed = false;
  }

  start() {
    if (this.kernel) return;
    if (this.closed) throw new Error("Computer-use runtime is closed");
    const env = runtimeEnvironment();
    this.kernel = this.worker("kernel", [
      "--experimental-vm-modules", path.join(kernelRoot, "kernel.js"),
      "--session-id", randomUUID(), "--working-dir", this.cwd,
    ], env);
    this.trusted = this.worker("trusted", [path.join(kernelRoot, "trusted-worker.js"), this.cwd], env);
  }

  worker(role, args, env) {
    const child = spawn(nodeBinary, args, { cwd: this.cwd, env, stdio: ["pipe", "pipe", "pipe"] });
    this.workers.add(child);
    child.role = role;
    child.diagnostics = "";
    child.stderr.on("data", (chunk) => {
      child.diagnostics = (child.diagnostics + chunk.toString()).slice(-8000);
    });
    createInterface({ input: child.stdout }).on("line", (line) => {
      let message;
      try { message = JSON.parse(line); }
      catch { this.fail(new Error(`${role} worker returned invalid JSON`)); return; }
      void this.handle(child, message).catch((error) => {
        const failure = { id: message.id, ok: false, error: error.message };
        if (message.type === "native_pipe_request") failure.type = "native_pipe_response";
        process.stderr.write(JSON.stringify({ role, operation: message.type, nativeOp: message.op, error: error.message }) + "\n");
        this.send(child, failure);
      });
    });
    child.once("error", (error) => this.fail(error));
    child.once("exit", (code, signal) => {
      this.workers.delete(child);
      if (this.kernel !== child && this.trusted !== child) return;
      this.fail(new Error(`${role} worker exited (${signal || code}): ${child.diagnostics}`));
    });
    return child;
  }

  send(child, message) {
    if (!child?.stdin.writable || child.stdin.destroyed) return;
    child.stdin.write(JSON.stringify(message) + "\n");
  }

  execute(code, { timeoutMs = this.timeoutMs, requestMeta = null, signal } = {}) {
    const effective = clampTimeout(timeoutMs);
    const task = () => this.run(code, { timeoutMs: effective, requestMeta, signal });
    const result = this.queue.then(task, task);
    this.queue = result.catch(() => {});
    return result;
  }

  run(code, options) {
    this.start();
    if (options.signal?.aborted) return Promise.reject(new Error("Computer-use call cancelled"));
    const id = randomUUID();
    return new Promise((resolve, reject) => {
      const abort = () => this.fail(new Error("Computer-use call cancelled; JavaScript session reset"));
      const call = {
        id, resolve, reject, content: [], responseMeta: {}, requestMeta: options.requestMeta,
        signal: options.signal, abort, timeoutMs: options.timeoutMs, timer: null,
      };
      this.current = call;
      this.pending.set(id, call);
      options.signal?.addEventListener("abort", abort, { once: true });
      this.armTimer(call);
      this.send(this.kernel, {
        type: "exec", id, code, request_meta: options.requestMeta,
        form_elicitation_supported: true,
      });
    });
  }

  armTimer(call) {
    clearTimeout(call.timer);
    call.timer = setTimeout(() => this.fail(new Error(`JavaScript exceeded ${call.timeoutMs}ms; session reset`)), call.timeoutMs);
  }

  finish(call, value) {
    clearTimeout(call.timer);
    call.signal?.removeEventListener("abort", call.abort);
    this.pending.delete(call.id);
    if (this.current === call) this.current = null;
    call.resolve(value);
  }

  async handle(child, message) {
    const call = this.pending.get(message.exec_id ?? message.id) ?? this.current;
    switch (message.type) {
      case "exec_result": {
        const result = this.pending.get(message.id);
        if (!result) return;
        const content = [...result.content];
        for (const text of message.content_items ?? []) {
          if (!text.startsWith("## Computer Use\n")) content.push({ type: "text", text });
        }
        if (message.output) content.push({ type: "text", text: message.output });
        for (const text of message.named_outputs ?? []) {
          if (!text.startsWith("## Computer Use\n")) content.push({ type: "text", text });
        }
        if (!message.ok) content.push({ type: "text", text: message.error || "JavaScript execution failed" });
        if (!message.ok) process.stderr.write(JSON.stringify({ operation: "exec_result", error: message.error }) + "\n");
        if (!content.length) content.push({ type: "text", text: "Done" });
        this.finish(result, {
          content, ...(message.ok ? {} : { isError: true }),
          ...(Object.keys(result.responseMeta).length ? { _meta: result.responseMeta } : {}),
        });
        return;
      }
      case "trusted_service_request":
      case "trusted_service_hooks":
        this.send(this.trusted, {
          ...message,
          type: message.type === "trusted_service_request" ? "service" : "run_hooks",
          request_meta: call?.requestMeta, form_elicitation_supported: true,
        });
        return;
      case "trusted_service_response":
        this.send(this.kernel, message);
        return;
      case "native_pipe_request":
        await this.nativePipe(child, message);
        return;
      case "emit_image": {
        try {
          const image = await decodeImage(message.image_url);
          call?.content.push(image);
          this.send(child, { id: message.id, ok: true });
        } catch (error) {
          this.send(child, { id: message.id, ok: false, error: error.message });
        }
        return;
      }
      case "response_meta":
        if (call) Object.assign(call.responseMeta, message.response_meta);
        return;
      case "elicit": {
        clearTimeout(call?.timer);
        try {
          const response = await this.approve(message);
          this.send(child, { id: message.id, ok: true, ...response });
        } catch (error) {
          this.send(child, { id: message.id, ok: false, error: error.message });
        } finally {
          if (call && this.pending.has(call.id)) this.armTimer(call);
        }
        return;
      }
      case "launch_services_action": {
        const args = message.application_path ? ["-g", "-a", message.application_path] : ["-g", "-b", message.bundle_identifier];
        await runCommand("/usr/bin/open", args);
        this.send(child, { id: message.id, ok: true, value: {} });
        return;
      }
      case "suspend_timeout":
        clearTimeout(call?.timer);
        return;
      case "resume_timeout":
        if (call) this.armTimer(call);
        return;
      case "config_action":
      case "authenticated_fetch":
        this.send(child, { id: message.id, ok: false, error: "This standalone runtime has no Codex host or authenticated browser session" });
        return;
      case "submitted_code_complete":
      case "exec_redacted_source":
      case "otel_log":
      case "response_meta_trace":
        return;
      default:
        if (message.id) this.send(child, { id: message.id, ok: false, error: `Unsupported host operation: ${message.type}` });
    }
  }

  async approve(message) {
    // Claude's tool permission is the app grant; the shipped service still enforces its own policy.
    if (message.meta?.connector_id === "computer-use" && message.meta?.codex_approval_kind === "mcp_tool_call") {
      return { action: "accept", content: {}, _meta: { persist: "session" } };
    }
    if (this.approval) return this.approval(message);
    throw new Error(`Approval needs an interactive MCP client: ${message.message}`);
  }

  async nativePipe(child, message) {
    const reply = (ok, result, error) => this.send(child, {
      type: "native_pipe_response", id: message.id, ok,
      ...(result ? { result } : {}), ...(error ? { error } : {}),
    });
    if (message.op === "connect") {
      const socket = net.createConnection(message.path);
      const connectionId = randomUUID();
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => { socket.destroy(); reject(new Error("Native pipe connection timed out")); }, 3000);
        socket.once("connect", () => { clearTimeout(timer); resolve(); });
        socket.once("error", (error) => { clearTimeout(timer); reject(error); });
      }).catch((error) => { socket.destroy(); throw error; });
      this.sockets.set(connectionId, socket);
      let socketError;
      socket.on("data", (data) => this.send(child, { type: "native_pipe_data", connection_id: connectionId, data_base64: data.toString("base64") }));
      socket.on("error", (error) => { socketError = error.message; });
      socket.on("close", () => {
        this.sockets.delete(connectionId);
        this.send(child, { type: "native_pipe_closed", connection_id: connectionId, error: socketError });
      });
      reply(true, { connection_id: connectionId });
      return;
    }
    const socket = this.sockets.get(message.connection_id);
    if (!socket) { reply(false, null, "Native pipe connection is closed"); return; }
    if (message.op === "write") {
      socket.write(Buffer.from(message.data_base64, "base64"), (error) => reply(!error, {}, error?.message));
    } else if (message.op === "close") {
      socket.end();
      reply(true, {});
    } else reply(false, null, `Unsupported pipe operation: ${message.op}`);
  }

  fail(error) {
    for (const call of this.pending.values()) {
      clearTimeout(call.timer);
      call.signal?.removeEventListener("abort", call.abort);
      call.reject(error);
    }
    this.pending.clear();
    this.current = null;
    this.stopWorkers();
  }

  stopWorkers() {
    const workers = [this.kernel, this.trusted].filter(Boolean);
    this.kernel = null;
    this.trusted = null;
    for (const socket of this.sockets.values()) socket.destroy();
    this.sockets.clear();
    for (const child of workers) {
      child.stdin.end();
      child.kill("SIGTERM");
    }
  }

  async reset() {
    await this.queue;
    this.stopWorkers();
  }

  async close() {
    this.closed = true;
    this.fail(new Error("Computer-use runtime closed"));
    await Promise.all([...this.workers].map((child) => new Promise((resolve) => {
      if (child.exitCode !== null || child.signalCode !== null) { resolve(); return; }
      const timer = setTimeout(() => { child.kill("SIGKILL"); resolve(); }, 3000);
      child.once("exit", () => { clearTimeout(timer); resolve(); });
    })));
  }
}

async function decodeImage(url) {
  if (url.startsWith("file:")) {
    const bytes = await readFile(fileURLToPath(url));
    return { type: "image", data: bytes.toString("base64"), mimeType: imageMimeType(bytes, "image/png") };
  }
  const match = /^data:(image\/[a-z0-9.+-]+);base64,([\s\S]+)$/i.exec(url);
  if (!match) throw new Error("Screenshot must be an image data URL or local file URL");
  return { type: "image", mimeType: imageMimeType(Buffer.from(match[2], "base64"), match[1]), data: match[2] };
}

function imageMimeType(bytes, fallback) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return "image/png";
  if (bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP") return "image/webp";
  return fallback;
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", (code) => code === 0 ? resolve() : reject(new Error(stderr || `${command} failed (${code})`)));
  });
}
