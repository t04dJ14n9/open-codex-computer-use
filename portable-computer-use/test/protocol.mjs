#!/usr/bin/env node
// Self-contained protocol test: plain stdio JSON-RPC, no extra dependencies.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(root, "src", "cli.mjs");
const child = spawn(process.execPath, [cli, "mcp"], { stdio: ["pipe", "pipe", "pipe"] });
let buffer = "";
let stderr = "";
const waiting = new Map();
child.stdout.on("data", chunk => {
  buffer += chunk;
  let index;
  while ((index = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, index);
    buffer = buffer.slice(index + 1);
    try {
      const message = JSON.parse(line);
      if (message.id && waiting.has(message.id)) {
        waiting.get(message.id)(message);
        waiting.delete(message.id);
      }
    } catch { /* partial line */ }
  }
});
child.stderr.on("data", chunk => { stderr += chunk; });

let nextId = 0;
function request(method, params) {
  return new Promise(resolve => {
    const id = ++nextId;
    waiting.set(id, resolve);
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
  });
}
function call(name, args) { return request("tools/call", { name, arguments: args }); }
function text(result) {
  return (result.result?.content ?? []).filter(item => item.type === "text").map(item => item.text).join("\n");
}
function assertOk(result, label) {
  assert.equal(result.result?.isError, undefined, `${label}: ${text(result)}`);
}

const checks = [];
const skipped = [];
const started = Date.now();
// Finder / ScreenCaptureKit assertions are macOS-specific. On Windows/Linux
// the same protocol is exercised, but OS-dependent operations may legitimately
// return a typed background_unavailable refusal when tools are missing.
const isMac = process.platform === "darwin";
try {
  const init = await request("initialize", {
    protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "portable-computer-use-test", version: "1.0.0" },
  });
  assert.deepEqual(init.result.serverInfo, { name: "portable-computer-use", version: "1.0.0" });
  checks.push("MCP initialize and server identity");
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");

  const tools = await request("tools/list", {});
  assert.deepEqual(tools.result.tools.map(tool => tool.name).sort(), ["computer", "js", "js_reset", "status"]);
  checks.push("four MCP tools");

  const prompts = await request("prompts/list", {});
  assert(prompts.result?.prompts?.some(prompt => prompt.name === "computer-use"));
  checks.push("computer-use prompt");

  const status = await call("status", {});
  assertOk(status, "status");
  const statusValue = JSON.parse(text(status));
  assert.equal(statusValue.backend, "standalone");
  assert.equal(statusValue.productHostRequired, false);
  assert.equal(statusValue.externalRuntimeRequired, false);
  assert.equal(statusValue.helperPresent, true);
  checks.push("standalone backend with bundled helper, no product host");

  if (isMac) {
    const apps = await call("computer", { action: "list_apps" });
    assertOk(apps, "list_apps");
    const appList = JSON.parse(text(apps));
    assert(appList.some(app => app.id === "com.apple.finder"));
    checks.push(`running app inventory (${appList.length} apps)`);

    const state = await call("computer", { action: "get_app_state", app: "com.apple.finder" });
    assertOk(state, "get_app_state");
    assert.match(text(state), /\d+ (?:standard )?(?:window|menu bar|toolbar|application|outline|AXWindow)/);
    checks.push("numbered accessibility tree");
  } else {
    // A real result OR a typed refusal is acceptable: both prove the helper
    // answered over the contract, without assuming OS tools are installed.
    const apps = await call("computer", { action: "list_apps" });
    assert(apps.result?.content?.length > 0, "list_apps returned no content");
    const refused = apps.result.isError && /background_unavailable/.test(text(apps));
    checks.push(refused ? "list_apps returned a typed refusal (OS tools absent)" : "list_apps through the platform helper");
    skipped.push("Finder AX tree (macOS-specific; use the target-OS checklist)");
  }

  const first = await call("js", { code: "var counter = 40; nodeRepl.write(counter);" });
  assertOk(first, "js first");
  assert.equal(text(first).trim(), "40");
  const second = await call("js", { code: "counter += 2; nodeRepl.write(counter);" });
  assertOk(second, "js second");
  assert.equal(text(second).trim(), "42");
  checks.push("persistent JavaScript bindings across calls");

  const imported = await call("js", { code: 'var fs = await import("node:fs/promises"); nodeRepl.write(typeof fs.readFile);' });
  assertOk(imported, "js import");
  assert.equal(text(imported).trim(), "function");
  checks.push("dynamic import() shim");

  const failure = await call("js", { code: 'throw new Error("intentional-verification-error");' });
  assert.equal(failure.result.isError, true);
  assert.match(text(failure), /intentional-verification-error/);
  checks.push("error results do not break the session");

  const reset = await call("js_reset", {});
  assertOk(reset, "js_reset");
  const afterReset = await call("js", { code: "nodeRepl.write(typeof counter);" });
  assertOk(afterReset, "js after reset");
  assert.equal(text(afterReset).trim(), "undefined");
  checks.push("js_reset clears bindings");

  const invalid = await call("computer", { action: "click", app: "TextEdit" });
  assert.equal(invalid.result.isError, true);
  assert.match(text(invalid), /x is required/);
  checks.push("invalid actions rejected before interaction");

  const screenshot = await call("computer", {
    action: "screenshot", app: isMac ? "com.apple.finder" : (process.platform === "win32" ? "notepad" : "xterm"),
  });
  if (screenshot.result.isError && /Screen Recording|background_unavailable/.test(text(screenshot))) {
    skipped.push("app screenshot (permission or OS tool unavailable)");
  } else {
    assertOk(screenshot, "screenshot");
    const image = screenshot.result.content.find(item => item.type === "image");
    assert(image && Buffer.from(image.data, "base64").length > 1000);
    checks.push(`app screenshot (${Buffer.from(image.data, "base64").length} bytes)`);
  }

  const report = { passed: true, recordedAt: new Date().toISOString(), durationMs: Date.now() - started, checks, skipped, stderr };
  console.log(JSON.stringify(report, null, 2));
} finally {
  child.kill();
}
