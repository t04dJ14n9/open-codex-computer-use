import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { z } from "zod";
import { createHost } from "./host.mjs";
import { callTool, computerDescription, computerPrompt, computerSchema, jsDescription, jsSchema } from "./tools.mjs";
import { closeHelper } from "./standalone-sky.mjs";

export async function startServer() {
  const server = new McpServer({ name: "codex-computer-use", version: "0.2.0" }, {
    instructions: "macOS computer use. Prefer the computer tool for single operations; js has the persistent cua API. Inspect state after actions.",
  });
  const host = createHost();
  const register = (name, description, inputSchema, annotations) => server.registerTool(name, {
    description, inputSchema, annotations,
  }, async (input, context) => {
    try {
      return await callTool(host, name, input, { signal: context.signal, requestMeta: context.requestMeta ?? null });
    } catch (error) {
      return { isError: true, content: [{ type: "text", text: error.message }] };
    }
  });
  register("computer", computerDescription, computerSchema, { destructiveHint: true, openWorldHint: true });
  register("js", jsDescription, jsSchema, { openWorldHint: true });
  register("js_reset", "Reset persistent JavaScript bindings and runtime workers.", z.object({}), { destructiveHint: false, openWorldHint: false });
  register("status", "Inspect installed runtime paths and availability without interacting with apps.", z.object({}), { readOnlyHint: true, idempotentHint: true, openWorldHint: false });
  server.registerPrompt("computer-use", {
    title: "Computer Use", description: "Operate macOS applications with Codex computer use",
    argsSchema: z.object({ task: z.string().optional() }),
  }, ({ task }) => ({ messages: [{ role: "user", content: { type: "text", text: computerPrompt + (task ? `\n\nTask: ${task}` : "") } }] }));

  let stopping = false;
  const stop = async () => {
    if (stopping) return;
    stopping = true;
    await host.close();
    await closeHelper();
    await server.close();
  };
  process.once("SIGINT", () => void stop());
  process.once("SIGTERM", () => void stop());
  process.stdin.once("end", () => void stop());
  await server.connect(new StdioServerTransport());
  return { server, host, close: stop };
}
