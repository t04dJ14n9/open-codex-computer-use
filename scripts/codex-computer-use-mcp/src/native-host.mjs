import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import path from "node:path";
import { homedir } from "node:os";
import { runtimeEnvironment, signedNode } from "./config.mjs";

export class NativeHost {
  constructor({ cwd = process.cwd() } = {}) {
    this.cwd = cwd;
    this.client = null;
    this.connecting = null;
    this.queue = Promise.resolve();
    this.closed = false;
  }

  async connect() {
    if (this.closed) throw new Error("Computer-use runtime is closed");
    if (this.connecting) return this.connecting;
    this.connecting = this.open().catch((error) => { this.connecting = null; throw error; });
    return this.connecting;
  }

  async open() {
    const client = new Client({ name: "codex-computer-use-bridge", version: "0.2.0" }, {
      capabilities: { elicitation: { form: {} } },
    });
    client.setRequestHandler("elicitation/create", async (request) => {
      const meta = request.params._meta ?? {};
      if (meta.connector_id === "computer-use" && meta.codex_approval_kind === "mcp_tool_call") {
        return { action: "accept", content: {}, _meta: { persist: "session" } };
      }
      return { action: "decline" };
    });
    const runtimeEnv = runtimeEnvironment();
    const env = Object.fromEntries(Object.entries(runtimeEnv).filter(([key]) => [
      "HOME", "LOGNAME", "PATH", "SHELL", "TERM", "USER", "TMPDIR",
      "CUA_REPL_ENABLED_SURFACES", "NODE_REPL_NODE_MODULE_DIRS", "NODE_REPL_NODE_PATH",
      "NODE_REPL_TRUSTED_CODE_PATHS", "SKY_CUA_SERVICE_PATH", "NODE_REPL_DISABLE_ANALYTICS",
    ].includes(key)));
    const transport = new StdioClientTransport({
      command: signedNode,
      args: [process.env.CODEX_CUA_WRAPPER || path.resolve(path.dirname(signedNode), "../lib/node_modules/@oai/cua-repl/bin/cua-repl.mjs")],
      cwd: this.cwd,
      env: {
        ...env,
        CUA_REPL_NODE_REPL_PATH: process.env.CODEX_CUA_SUPERVISOR || path.join(path.dirname(signedNode), "node_repl"),
        NODE_REPL_NODE_PATH: signedNode,
        CODEX_CLI_PATH: process.env.CODEX_CUA_SANDBOX_CLI || path.resolve(path.dirname(signedNode), "../../codex-cli/bin/codex"),
        CODEX_HOME: path.join(homedir(), ".tcodex"),
      },
      stderr: "pipe",
    });
    transport.stderr?.on("data", (chunk) => process.stderr.write(chunk));
    this.client = client;
    this.transport = transport;
    try { await client.connect(transport); }
    catch (error) { await client.close(); this.client = null; throw error; }
  }

  execute(code, options = {}) {
    const task = async () => {
      await this.connect();
      const result = await this.client.callTool({
        name: "js", arguments: { code, timeout_ms: options.timeoutMs ?? 30000 },
        ...(options.requestMeta ? { _meta: options.requestMeta } : {}),
      }, { timeout: (options.timeoutMs ?? 30000) + 10000, signal: options.signal });
      return {
        ...result,
        content: result.content.filter((item) => item.type !== "text" || !item.text.startsWith("## Computer Use\n")),
      };
    };
    const result = this.queue.then(task, task);
    this.queue = result.catch(() => {});
    return result;
  }

  async reset() {
    await this.queue;
    if (this.client) await this.client.callTool({ name: "js_reset", arguments: {} });
  }

  async close() {
    this.closed = true;
    if (this.client) await this.client.close();
    this.client = null;
    this.connecting = null;
  }
}
