#!/usr/bin/env node
// Verifies the DeepSeek Harness integration without changing any configuration.
// Usage: node scripts/verify-dsh.mjs
import { spawn } from "node:child_process";
import { lstat, readFile, realpath } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const name = "open-codex-computer-use";
const launcher = path.join(root, "scripts/computer-use");
const skillsRoot = path.resolve(process.env.DSH_SKILLS_DIR || path.join(homedir(), ".agents/skills"));
const configFile = path.resolve(process.env.DSH_MCP_CONFIG_FILE || path.join(homedir(), ".dsh", "cordis.patch.yml"));
const expectedTools = ["computer", "js", "js_reset", "status"];
const checks = [];
const record = (label, ok, detail) => checks.push({ label, ok: Boolean(ok), detail });

// 1. Skill link into DSH's skill directory.
try {
  const target = path.join(skillsRoot, name);
  const info = await lstat(target);
  const resolved = await realpath(target);
  record("skill link", info.isSymbolicLink() && resolved === root, `${target} -> ${resolved}`);
} catch (error) {
  record("skill link", false, error.message);
}

// 2. MCP registration in cordis.patch.yml.
let configText = "";
try {
  configText = await readFile(configFile, "utf8");
  record("MCP registration",
    configText.includes("id: mcp-codex-computer-use") &&
    configText.includes("serverName: codex-computer-use") &&
    configText.includes("transport: stdio"),
    configFile);
} catch (error) {
  record("MCP registration", false, error.message);
}

// 3. Optional YAML syntax validation via system Ruby (skip when unavailable).
try {
  const ruby = await new Promise(resolve => {
    const child = spawn("ruby", ["-ryaml", "-e", "YAML.load_file(ARGV[0]); puts 'ok'", configFile], { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    child.stdout.on("data", d => out += d);
    child.stderr.on("data", d => err += d);
    child.on("error", () => resolve({ skipped: true, reason: "ruby not found" }));
    child.on("exit", code => resolve({ skipped: false, code, out: out.trim(), err: err.trim() }));
  });
  if (ruby.skipped) record("YAML syntax", true, `skipped: ${ruby.reason}`);
  else record("YAML syntax", ruby.code === 0 && ruby.out === "ok", ruby.code === 0 ? ruby.out : ruby.err);
} catch (error) {
  record("YAML syntax", false, error.message);
}

// 4. Live stdio MCP handshake against the registered launcher.
try {
  const tools = await new Promise(resolve => {
    const child = spawn(launcher, ["mcp"], {
      env: { ...process.env, CODEX_CUA_BACKEND: "standalone" },
      stdio: ["pipe", "pipe", "pipe"],
    });
    let out = "", err = "", settled = false;
    const finish = value => { if (!settled) { settled = true; child.kill(); resolve(value); } };
    child.stdout.on("data", d => {
      out += d;
      for (const line of out.split("\n")) {
        try {
          const message = JSON.parse(line);
          if (message.id === 2 && message.result?.tools) finish(message.result.tools.map(t => t.name));
        } catch { /* partial line */ }
      }
    });
    child.stderr.on("data", d => err += d);
    child.on("error", error => finish({ error: error.message }));
    child.on("exit", () => finish({ error: `server exited: ${err.slice(0, 200)}` }));
    const send = value => child.stdin.write(JSON.stringify(value) + "\n");
    send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "verify-dsh", version: "1" } } });
    setTimeout(() => send({ jsonrpc: "2.0", method: "notifications/initialized" }), 300);
    setTimeout(() => send({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} }), 700);
    setTimeout(() => finish({ error: "tools/list timed out" }), 12000);
  });
  const names = Array.isArray(tools) ? tools : [];
  record("MCP tools", expectedTools.every(t => names.includes(t)), Array.isArray(tools) ? names.join(", ") : JSON.stringify(tools));
} catch (error) {
  record("MCP tools", false, error.message);
}

const report = {
  ok: checks.every(check => check.ok),
  dsh: { skillsRoot, configFile, launcher },
  checks,
  note: "DSH discovers the skill folder live; a new DSH session is required before the MCP tools attach to the agent.",
};
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;
