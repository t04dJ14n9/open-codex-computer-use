#!/usr/bin/env node
// Read-only self-check for the portable computer-use skill.
//   1. runs `scripts/setup.mjs --check` via spawnSync
//   2. spawns `bin/computer-use mcp`, drives an MCP handshake, collects tool names
//   3. prints { ok, checks, tools }; exits nonzero unless every check passes
// NOTE: bin/computer-use and src/** are authored by a separate component. This
// script only references them; if they are not ready it reports that the
// handshake could not be run rather than creating any files.
import { spawn, spawnSync } from "node:child_process";
import { accessSync, constants } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = fileURLToPath(new URL("../", import.meta.url));
const setupPath = path.join(skillRoot, "scripts", "setup.mjs");
const cliPath = path.join(skillRoot, "bin", "computer-use");

const EXPECTED_TOOLS = ["computer", "js", "js_reset", "status"];
const PROTOCOL_VERSION = "2024-11-05"; // legacy version accepted by the MCP SDK
const HANDSHAKE_TIMEOUT_MS = 10000; // ~10s cap on the child process

const checks = [];
function check(name, passed, detail) {
  checks.push({ name, passed: !!passed, ...(detail !== undefined ? { detail } : {}) });
}

// (a) setup.mjs --check
const setup = spawnSync(process.execPath, [setupPath, "--check"], {
  cwd: skillRoot,
  encoding: "utf8",
  env: process.env,
});
let setupJson = null;
try { setupJson = JSON.parse(setup.stdout); } catch {}
check("setup-check", setup.status === 0 && setupJson?.ok === true, {
  exitCode: setup.status,
  ...(setup.error ? { error: setup.error.message } : {}),
  ...(setupJson
    ? { ok: setupJson.ok, failed: (setupJson.checks || []).filter((c) => !c.passed).map((c) => c.name) }
    : { parseError: "setup.mjs --check produced no JSON" }),
});

// (b) MCP handshake with `bin/computer-use mcp`
let cliExecutable = false;
try { accessSync(cliPath, constants.X_OK); cliExecutable = true; } catch {}
const child = cliExecutable
  ? spawn(cliPath, ["mcp"], { cwd: skillRoot, stdio: ["pipe", "pipe", "pipe"] })
  : spawn("/bin/zsh", [cliPath, "mcp"], { cwd: skillRoot, stdio: ["pipe", "pipe", "pipe"] });

let buffer = "";
let stderr = "";
let initResult = null;
let tools = [];
let gotTools = false;
let spawnError = null;

function handleLine(line) {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return; }
  if (msg.id === 1 && msg.result) initResult = msg.result;
  if (msg.id === 2 && msg.result && Array.isArray(msg.result.tools)) {
    tools = msg.result.tools.map((t) => t.name);
    gotTools = true;
  }
}

child.stdout?.on("data", (chunk) => {
  buffer += chunk.toString();
  let idx;
  while ((idx = buffer.indexOf("\n")) !== -1) {
    const line = buffer.slice(0, idx);
    buffer = buffer.slice(idx + 1);
    handleLine(line);
  }
});
child.stderr?.on("data", (chunk) => { stderr += chunk.toString(); });
child.once("error", (error) => { spawnError = error.message; });

const send = (obj) => {
  if (child.stdin?.writable) child.stdin.write(`${JSON.stringify(obj)}\n`);
};
send({
  jsonrpc: "2.0",
  id: 1,
  method: "initialize",
  params: {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {},
    clientInfo: { name: "portable-computer-use-verify", version: "1.0.0" },
  },
});
send({ jsonrpc: "2.0", method: "notifications/initialized" });
send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });

await new Promise((resolve) => {
  let done = false;
  const finish = () => { if (done) return; done = true; resolve(); };
  const deadline = setTimeout(finish, HANDSHAKE_TIMEOUT_MS);
  const poll = setInterval(() => {
    if (gotTools) { clearInterval(poll); clearTimeout(deadline); setTimeout(finish, 200); }
  }, 50);
  child.once("close", () => { clearInterval(poll); clearTimeout(deadline); finish(); });
});

try { child.kill("SIGKILL"); } catch {}

check("mcp-handshake", gotTools && !!initResult, {
  initialize: !!initResult,
  ...(initResult ? { protocolVersion: initResult.protocolVersion, serverInfo: initResult.serverInfo } : {}),
  ...(spawnError ? { spawnError } : {}),
  ...(stderr ? { stderrTail: stderr.trim().slice(-800) } : {}),
});
check("tools-list",
  gotTools && tools.length === 4 && EXPECTED_TOOLS.every((t) => tools.includes(t)),
  { tools, expected: EXPECTED_TOOLS });

const result = {
  ok: checks.every((c) => c.passed),
  checks,
  tools,
  ...(setupJson ? { setup: setupJson } : {}),
};
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exitCode = result.ok ? 0 : 1;
