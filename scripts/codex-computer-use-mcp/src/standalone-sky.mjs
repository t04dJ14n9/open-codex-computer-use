import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const helperPath = process.env.CODEX_CUA_HELPER || path.join(root, "build/Codex Computer Use Standalone.app/Contents/MacOS/ComputerUse");
const methods = [
  "list_apps", "get_app_state", "click", "drag", "paste", "press_key",
  "scroll", "set_value", "select_text", "type_text", "perform_secondary_action",
];
let child;
let sequence = 0;
const pending = new Map();

function ensureHelper() {
  if (child) return;
  if (!existsSync(helperPath)) throw new Error(`Standalone macOS helper is missing. Run npm run build:native in ${root}`);
  const processHandle = spawn(helperPath, [], { stdio: ["pipe", "pipe", "pipe"] });
  child = processHandle;
  let diagnostics = "";
  processHandle.stderr.on("data", (chunk) => { diagnostics = (diagnostics + chunk).slice(-4000); });
  createInterface({ input: processHandle.stdout }).on("line", (line) => {
    let message;
    try { message = JSON.parse(line); }
    catch { fail(new Error("Native helper returned invalid JSON"), processHandle); return; }
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (message.error) request.reject(new Error(message.error.message || String(message.error)));
    else request.resolve(message.result);
  });
  processHandle.once("error", (error) => fail(error, processHandle));
  processHandle.once("exit", (code, signal) => {
    if (child === processHandle) child = null;
    fail(new Error(`Native helper exited (${signal || code}): ${diagnostics}`), processHandle);
  });
}

function fail(error, owner) {
  for (const [id, request] of pending) {
    if (owner && request.owner !== owner) continue;
    clearTimeout(request.timer);
    request.reject(error);
    pending.delete(id);
  }
}

export function nativeRequest(method, params = {}) {
  ensureHelper();
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Native ${method} exceeded 30 seconds`)); }, 30000);
    pending.set(id, { resolve, reject, timer, owner: child });
    child.stdin.write(JSON.stringify({ id, method, params }) + "\n", (error) => {
      if (error) { pending.delete(id); clearTimeout(timer); reject(error); }
    });
  });
}

export async function handleRpc(request) {
  if (request.type === "setup") return { target: "mac", methods };
  if (request.type !== "execute" || !methods.includes(request.method)) throw new Error("Unsupported standalone computer operation");
  return nativeRequest(request.method, request.args?.[0] ?? {});
}

export async function closeHelper() {
  if (!child) return;
  const handle = child;
  child = null;
  handle.stdin.end();
  handle.kill("SIGTERM");
  fail(new Error("Native helper closed"), handle);
  await new Promise((resolve) => {
    if (handle.exitCode !== null || handle.signalCode !== null) { resolve(); return; }
    const timer = setTimeout(() => { handle.kill("SIGKILL"); resolve(); }, 1000);
    handle.once("exit", () => { clearTimeout(timer); resolve(); });
  });
}

process.once("exit", () => child?.kill());
