import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { packageRoot, backend } from "../src/config.mjs";

const client = new Client({ name: "codex-cua-verification", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: process.execPath, args: [path.join(packageRoot, "src/cli.mjs"), "mcp"],
  stderr: "pipe",
  env: { CODEX_CUA_BACKEND: backend },
});
const checks = [];
const started = Date.now();
let stderr = "";
transport.stderr?.on("data", (chunk) => { stderr += chunk; });
const call = async (name, input) => {
  const result = await client.callTool({ name, arguments: input }, { timeout: 45000 });
  assert.equal(result.isError, undefined, result.content.filter((item) => item.type === "text").map((item) => item.text).join("\n"));
  return result;
};
const text = (result) => result.content.filter((item) => item.type === "text").map((item) => item.text).join("\n");
try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((tool) => tool.name).sort(), ["computer", "js", "js_reset", "status"]);
  checks.push("MCP handshake and four tool definitions");
  const { prompts } = await client.listPrompts();
  assert(prompts.some((prompt) => prompt.name === "computer-use"));
  checks.push("computer-use MCP prompt");
  const status = JSON.parse(text(await call("status", {})));
  assert.equal(status.nodeReplBinaryRequired, backend === "codex");
  assert.equal(status.sourcesPresent, true);
  checks.push(`runtime backend: ${status.backend}`);
  const apps = JSON.parse(text(await call("computer", { action: "list_apps" })));
  assert(apps.some((app) => app.id === "com.apple.finder"));
  checks.push(`native service app inventory (${apps.length} apps)`);
  const state = text(await call("computer", { action: "get_app_state", app: "com.apple.finder" }));
  assert.match(state, /\d+ (?:standard )?(?:window|menu bar|toolbar|application|outline|AXWindow)/);
  checks.push("Finder numbered accessibility tree");
  await call("js", { code: "var cuaVerificationCounter = 40; nodeRepl.write(cuaVerificationCounter);" });
  assert.equal(text(await call("js", { code: "cuaVerificationCounter += 2; nodeRepl.write(cuaVerificationCounter);" })), "42");
  checks.push("persistent JavaScript bindings");
  const failure = await client.callTool({ name: "js", arguments: { code: 'throw new Error("intentional-verification-error");' } });
  assert.equal(failure.isError, true);
  assert.match(text(failure), /intentional-verification-error/);
  assert.equal(text(await call("js", { code: "nodeRepl.write(cuaVerificationCounter);" })), "42");
  checks.push("error result and retained session");
  const screenshot = await call("computer", { action: "screenshot", app: process.env.CUA_TEST_APP || "com.apple.finder" });
  const image = screenshot.content.find((item) => item.type === "image");
  assert(image);
  const bytes = Buffer.from(image.data, "base64");
  assert(bytes.length > 1000);
  checks.push(`app screenshot (${bytes.length} bytes)`);
  await call("js_reset", {});
  assert.equal(text(await call("js", { code: "nodeRepl.write(typeof cuaVerificationCounter);" })), "undefined");
  checks.push("reset clears persistent bindings");
  const invalid = await client.callTool({ name: "computer", arguments: { action: "click", app: "TextEdit" } });
  assert.equal(invalid.isError, true);
  assert.match(text(invalid), /x is required/);
  checks.push("invalid actions rejected before interaction");
  const report = { passed: true, recordedAt: new Date().toISOString(), durationMs: Date.now() - started, checks, server: client.getServerVersion(), stderr };
  await writeFile(path.join(packageRoot, "test/protocol-result.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
} finally {
  await client.close();
}
