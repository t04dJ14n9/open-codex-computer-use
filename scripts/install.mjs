#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { copyFile, lstat, mkdir, readFile, realpath, symlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = await realpath(fileURLToPath(new URL("../", import.meta.url)));
const args = process.argv.slice(2);
let claude;
let codex = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--claude" && args[i + 1] && !args[i + 1].startsWith("--")) claude = args[++i];
  else if (args[i] === "--codex") codex = true;
  else if (args[i] === "--help") {
    console.log("Usage: node scripts/install.mjs [--claude claude] [--codex]\nLinks this skill into selected profiles. Claude also receives a user MCP registration and four tool grants. Existing configuration is backed up locally.");
    process.exit(0);
  } else throw new Error(`Unknown or incomplete option: ${args[i]}`);
}
if (!claude && !codex) throw new Error("Select --claude claude, --codex, or both.");
const check = spawnSync(process.execPath, [path.join(root, "scripts/setup.mjs"), "--check"], { stdio: "inherit" });
if (check.error) throw check.error;
if (check.status !== 0) throw new Error("Setup validation failed; no client configuration was changed.");

const name = "open-codex-computer-use";
const launcher = path.join(root, "scripts/computer-use");
const targets = [];
let configRoot;
let configFile;
if (claude) {
  const availability = spawnSync(claude, ["--version"], { encoding: "utf8" });
  if (availability.error || availability.status !== 0) throw new Error(`Cannot run ${claude}; no configuration was changed.`);
  configRoot = path.resolve(process.env.CUA_CLAUDE_CONFIG_DIR || process.env.CLAUDE_CONFIG_DIR || path.join(homedir(), ".claude"));
  configFile = path.resolve(process.env.CUA_CLAUDE_CONFIG_FILE || (process.env.CUA_CLAUDE_CONFIG_DIR || process.env.CLAUDE_CONFIG_DIR ? path.join(configRoot, ".claude.json") : path.join(homedir(), ".claude.json")));
  targets.push(path.join(configRoot, "skills", name));
}
if (codex) targets.push(path.join(process.env.CODEX_HOME || path.join(homedir(), ".codex"), "skills", name));

async function present(file) {
  try { return await lstat(file); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}
for (const target of targets) {
  const info = await present(target);
  if (info && (!info.isSymbolicLink() || await realpath(target) !== root)) throw new Error(`Existing skill is not this checkout; refusing to overwrite ${target}.`);
}
async function readJson(file) {
  if (!await present(file)) return {};
  const value = JSON.parse(await readFile(file, "utf8"));
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Expected a JSON object: ${file}`);
  return value;
}
if (claude) {
  const settingsFile = path.join(configRoot, "settings.local.json");
  const config = await readJson(configFile);
  const settings = await readJson(settingsFile);
  config.mcpServers ??= {};
  settings.permissions ??= {};
  const allow = settings.permissions.allow ?? [];
  if (!Array.isArray(allow)) throw new Error(`permissions.allow must be an array: ${settingsFile}`);
  const backup = path.join(root, ".local/installation-backup", new Date().toISOString().replaceAll(":", "-"));
  await mkdir(backup, { recursive: true });
  for (const [file, label] of [[configFile, "claude-user-config.json"], [settingsFile, "settings.local.json"]]) {
    if (await present(file)) await copyFile(file, path.join(backup, label));
  }
  config.mcpServers["codex-computer-use"] = { type: "stdio", command: launcher, args: ["mcp"], env: { CODEX_CUA_BACKEND: "standalone" } };
  settings.permissions.allow = [...new Set([...allow, ...["computer", "js", "js_reset", "status"].map(tool => `mcp__codex-computer-use__${tool}`)])];
  await mkdir(path.dirname(configFile), { recursive: true });
  await mkdir(configRoot, { recursive: true });
  await writeFile(configFile, JSON.stringify(config, null, 2) + "\n", { mode: 0o600 });
  await writeFile(settingsFile, JSON.stringify(settings, null, 2) + "\n", { mode: 0o600 });
  console.log(`Registered codex-computer-use in ${configFile}\nAdded four tool-specific grants in ${settingsFile}\nBackups: ${backup}`);
}
for (const target of targets) {
  await mkdir(path.dirname(target), { recursive: true });
  if (!await present(target)) await symlink(root, target, "dir");
  console.log(`Installed skill: ${target}`);
}
console.log("Restart existing client sessions. macOS permissions are not changed by this installer.");
