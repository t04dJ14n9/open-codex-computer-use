#!/usr/bin/env node
// Verifies the Claude Code plugin wrapper without the Claude CLI installed:
// validates the manifest shape, resolves ${CLAUDE_PLUGIN_ROOT} exactly as the
// plugin loader does, and drives the MCP server from that resolved root.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = path.join(root, ".claude-plugin/plugin.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const checks = [];

// 1. Manifest shape.
assert.equal(manifest.name, "portable-computer-use");
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
assert.deepEqual(manifest.skills, ["."], "plugin root itself is the skill");
assert.equal(manifest.license, "NOASSERTION");
assert.equal(manifest.icon, ".claude-plugin/icon.png");
assert.equal(manifest.userConfig.timeout_ms.default, "120000");
assert.equal(manifest.mcpServers["portable-computer-use"].command, "node");
checks.push("plugin.json: name, version, skills=root, inline MCP server, userConfig, license, icon");

// 2. Skill and command files exist at the declared default locations.
const skill = readFileSync(path.join(root, "SKILL.md"), "utf8");
assert.match(skill, /^name: portable-computer-use$/m);
const command = readFileSync(path.join(root, "commands/status.md"), "utf8");
assert.match(command, /^description:/m);
assert(readFileSync(path.join(root, ".claude-plugin/icon.png")).length > 1000);
checks.push("SKILL.md, commands/status.md and icon.png present at default locations");

// 3. Marketplace entry points at this plugin directory.
const marketplace = JSON.parse(readFileSync(path.resolve(root, "../.claude-plugin/marketplace.json"), "utf8"));
assert.equal(marketplace.name, "open-codex-computer-use");
const entry = marketplace.plugins.find(p => p.name === "portable-computer-use");
assert(entry && entry.source === "./portable-computer-use");
checks.push("marketplace.json declares source ./portable-computer-use");

// 4. Resolve ${CLAUDE_PLUGIN_ROOT} and ${user_config.timeout_ms} the way the
//    loader does, then start the MCP server from the resolved path.
const server = manifest.mcpServers["portable-computer-use"];
const args = server.args.map(a => a.replaceAll("${CLAUDE_PLUGIN_ROOT}", root));
const env = {
  ...process.env,
  CLAUDE_PLUGIN_ROOT: root,
  ...Object.fromEntries(Object.entries(server.env).map(([k, v]) => [
    k, v.replaceAll("${user_config.timeout_ms}", manifest.userConfig.timeout_ms.default),
  ])),
};
assert.equal(args[0], path.join(root, "src/cli.mjs"));
assert.equal(env.COMPUTER_USE_TIMEOUT_MS, "120000");
checks.push("loader variable substitution resolves the CLI path and timeout env");

const child = spawn(server.command, args, { env, stdio: ["pipe", "pipe", "pipe"] });
let buffer = "", stderr = "";
const waiting = new Map();
child.stdout.on("data", chunk => {
  buffer += chunk;
  let i;
  while ((i = buffer.indexOf("\n")) >= 0) {
    const line = buffer.slice(0, i); buffer = buffer.slice(i + 1);
    try {
      const m = JSON.parse(line);
      if (m.id && waiting.has(m.id)) { waiting.get(m.id)(m); waiting.delete(m.id); }
    } catch { /* partial */ }
  }
});
child.stderr.on("data", chunk => { stderr += chunk; });
let nextId = 0;
const request = (method, params) => new Promise(resolve => {
  const id = ++nextId;
  waiting.set(id, resolve);
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
});
const text = r => (r.result?.content ?? []).filter(i => i.type === "text").map(i => i.text).join("\n");

try {
  const init = await request("initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "plugin-test", version: "1" } });
  assert.deepEqual(init.result.serverInfo, { name: "portable-computer-use", version: "1.0.0" });
  child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  const tools = await request("tools/list", {});
  assert.deepEqual(tools.result.tools.map(t => t.name).sort(), ["computer", "js", "js_reset", "status"]);
  const status = await request("tools/call", { name: "status", arguments: {} });
  const value = JSON.parse(text(status));
  assert.equal(value.backend, "standalone");
  assert.equal(value.productHostRequired, false);
  assert.equal(value.timeouts.nativeMs, 120000, "userConfig default reaches the runtime");
  assert.equal(stderr, "", `unexpected stderr: ${stderr}`);
  checks.push("MCP handshake from plugin root: 4 tools, standalone backend, configured 120000 ms deadline");
} finally {
  child.kill();
}

console.log(JSON.stringify({ passed: true, checks }, null, 2));
