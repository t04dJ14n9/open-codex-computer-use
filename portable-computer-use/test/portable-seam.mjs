#!/usr/bin/env node
// Verifies the platform-neutral seam: point COMPUTER_USE_HELPER at a fake
// contract-compliant helper and drive the real MCP server unchanged. This is
// the harness a Windows/Wayland port can reuse in CI.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { writeFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const launcher = path.join(root, "bin/computer-use");
const mockHelper = path.join(root, "test", "mock-helper.mjs");

// bin/computer-use spawns the helper with no arguments, so wrap the mock in a
// tiny executable shell script.
const wrapper = path.join(tmpdir(), `pcu-mock-helper-${process.pid}.sh`);
writeFileSync(wrapper, `#!/bin/sh\nexec "${process.execPath}" "${mockHelper}"\n`, { mode: 0o755 });

const server = spawn(launcher, ["mcp"], {
  env: { ...process.env, COMPUTER_USE_HELPER: wrapper },
  stdio: ["pipe", "pipe", "pipe"],
});
let buffer = "";
let stderr = "";
const waiting = new Map();
server.stdout.on("data", chunk => {
  buffer += chunk;
  let index;
  while ((index = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, index);
    buffer = buffer.slice(index + 1);
    try {
      const message = JSON.parse(line);
      if (message.id && waiting.has(message.id)) { waiting.get(message.id)(message); waiting.delete(message.id); }
    } catch { /* partial line */ }
  }
});
server.stderr.on("data", chunk => { stderr += chunk; });

let nextId = 0;
function request(method, params) {
  return new Promise(resolve => {
    const id = ++nextId;
    waiting.set(id, resolve);
    server.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
}
function call(name, args) { return request("tools/call", { name, arguments: args }); }
function text(result) { return (result.result?.content ?? []).filter(i => i.type === "text").map(i => i.text).join("\n"); }

const checks = [];
try {
  const init = await request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "seam-test", version: "1" } });
  assert.deepEqual(init.result.serverInfo, { name: "portable-computer-use", version: "1.0.0" });
  server.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  checks.push("MCP server starts with a non-macOS helper");

  const tools = await request("tools/list", {});
  assert.deepEqual(tools.result.tools.map(t => t.name).sort(), ["computer", "js", "js_reset", "status"]);
  checks.push("all four tools registered unchanged");

  const status = await call("status", {});
  assert.equal(status.result?.isError, undefined, text(status));
  const value = JSON.parse(text(status));
  assert.equal(value.productHostRequired, false);
  assert.equal(value.externalRuntimeRequired, false);
  assert.equal(value.backend, "standalone");
  assert.equal(value.helperPresent, true);
  assert.equal(value.permissions.helper, "mock-helper");
  assert.equal(value.permissions.backgroundAvailable, false);
  checks.push("status reports helper-provided capabilities, not platform defaults");

  const apps = await call("computer", { action: "list_apps" });
  assert.equal(apps.result?.isError, undefined, text(apps));
  assert.match(text(apps), /com\.example\.Mock/);
  checks.push("list_apps through the fake helper");

  const state = await call("computer", { action: "get_app_state", app: "com.example.Mock" });
  assert.equal(state.result?.isError, undefined, text(state));
  assert.match(text(state), /0 window, Mock Window/);
  checks.push("numbered accessibility tree through the fake helper");

  const shot = await call("computer", { action: "screenshot", app: "com.example.Mock" });
  assert.equal(shot.result?.isError, undefined, text(shot));
  assert(shot.result.content.some(i => i.type === "image"));
  checks.push("screenshot image through the fake helper");

  const js = await call("js", { code: 'var a = await cua.listApps(); nodeRepl.write(a[0].displayName);' });
  assert.equal(js.result?.isError, undefined, text(js));
  assert.match(text(js), /Mock App/);
  checks.push("persistent js runtime + cua API through the fake helper");

  const click = await call("computer", { action: "click", app: "com.example.Mock", element_index: 1 });
  assert.equal(click.result?.isError, undefined, text(click));
  checks.push("action dispatch through the fake helper");

  console.log(JSON.stringify({ passed: true, checks, stderr }, null, 2));
} finally {
  server.kill();
  try { unlinkSync(wrapper); } catch {}
}
