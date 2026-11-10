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
let dsh = false;
let timeoutMs = process.env.CUA_TIMEOUT_MS ?? null;
for (let i = 0; i < args.length; i++) {
  if (args[i] === "--claude" && args[i + 1] && !args[i + 1].startsWith("--")) claude = args[++i];
  else if (args[i] === "--codex") codex = true;
  else if (args[i] === "--dsh") dsh = true;
  else if (args[i] === "--timeout-ms" && args[i + 1] && !args[i + 1].startsWith("--")) timeoutMs = args[++i];
  else if (args[i] === "--help") {
    console.log("Usage: node scripts/install.mjs [--claude claude] [--codex] [--dsh] [--timeout-ms N]\nLinks this skill into selected profiles. Claude and DSH also receive a codex-computer-use MCP registration; Claude gets four tool grants. --timeout-ms (or CUA_TIMEOUT_MS) writes CODEX_CUA_TIMEOUT_MS into the MCP server env, raising the default 30 s deadline for slow apps. Existing configuration is backed up locally.");
    process.exit(0);
  } else throw new Error(`Unknown or incomplete option: ${args[i]}`);
}
if (timeoutMs !== null) {
  const value = Number(timeoutMs);
  if (!Number.isInteger(value) || value < 1000 || value > 3600000) throw new Error("--timeout-ms must be an integer between 1000 and 3600000");
  timeoutMs = String(value);
}
if (!claude && !codex && !dsh) throw new Error("Select --claude claude, --codex, --dsh, or a combination.");
const check = spawnSync(process.execPath, [path.join(root, "scripts/setup.mjs"), "--check"], { stdio: "inherit" });
if (check.error) throw check.error;
if (check.status !== 0) throw new Error("Setup validation failed; no client configuration was changed.");

const name = "open-codex-computer-use";
const launcher = path.join(root, "scripts/computer-use");
const targets = [];
let configRoot;
let configFile;
let dshConfigFile;
if (claude) {
  const availability = spawnSync(claude, ["--version"], { encoding: "utf8" });
  if (availability.error || availability.status !== 0) throw new Error(`Cannot run ${claude}; no configuration was changed.`);
  configRoot = path.resolve(process.env.CUA_CLAUDE_CONFIG_DIR || process.env.CLAUDE_CONFIG_DIR || path.join(homedir(), ".claude"));
  configFile = path.resolve(process.env.CUA_CLAUDE_CONFIG_FILE || (process.env.CUA_CLAUDE_CONFIG_DIR || process.env.CLAUDE_CONFIG_DIR ? path.join(configRoot, ".claude.json") : path.join(homedir(), ".claude.json")));
  targets.push(path.join(configRoot, "skills", name));
}
if (codex) targets.push(path.join(process.env.CODEX_HOME || path.join(homedir(), ".codex"), "skills", name));
if (dsh) {
  const dshSkills = path.resolve(process.env.DSH_SKILLS_DIR || path.join(homedir(), ".agents/skills"));
  const dshRoot = path.resolve(process.env.DSH_CONFIG_DIR || path.join(homedir(), ".dsh"));
  dshConfigFile = path.resolve(process.env.DSH_MCP_CONFIG_FILE || path.join(dshRoot, "cordis.patch.yml"));
  targets.push(path.join(dshSkills, name));
}

async function present(file) {
  try { return await lstat(file); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}
for (const target of targets) {
  const info = await present(target);
  if (!info) continue;
  let resolved = null;
  if (info.isSymbolicLink()) {
    try { resolved = await realpath(target); } catch { /* broken symlink: treat as nonmatching */ }
  }
  if (!info.isSymbolicLink() || resolved !== root) throw new Error(`Existing skill is not this checkout; refusing to overwrite ${target}.`);
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
  config.mcpServers["codex-computer-use"] = {
    type: "stdio", command: launcher, args: ["mcp"],
    env: { CODEX_CUA_BACKEND: "standalone", ...(timeoutMs ? { CODEX_CUA_TIMEOUT_MS: timeoutMs } : {}) },
  };
  settings.permissions.allow = [...new Set([...allow, ...["computer", "js", "js_reset", "status"].map(tool => `mcp__codex-computer-use__${tool}`)])];
  await mkdir(path.dirname(configFile), { recursive: true });
  await mkdir(configRoot, { recursive: true });
  await writeFile(configFile, JSON.stringify(config, null, 2) + "\n", { mode: 0o600 });
  await writeFile(settingsFile, JSON.stringify(settings, null, 2) + "\n", { mode: 0o600 });
  console.log(`Registered codex-computer-use in ${configFile}\nAdded four tool-specific grants in ${settingsFile}\nBackups: ${backup}`);
}
if (dsh) {
  // DSH composes its profile from cordis.patch.yml, a top-level YAML array of
  // loader patch entries. Append one stdio MCP client insert without rewriting
  // existing entries. The launcher path is single-quoted for YAML safety.
  const existing = await present(dshConfigFile) ? await readFile(dshConfigFile, "utf8") : "";
  const trimmed = existing.trim();
  // Only append to the block-style top-level array DSH uses. Other valid YAML
  // shapes (flow arrays, multi-document files, !!js expressions) are refused
  // rather than risk writing invalid config; register manually in that case.
  if (trimmed && trimmed !== "[]" && !/^- insert:/m.test(existing)) {
    throw new Error(`Refusing to modify ${dshConfigFile}: expected a block-style top-level "- insert:" list. Register the server manually; see references/dsh.md.`);
  }
  const marker = "# === codex-computer-use MCP (open-codex-computer-use) BEGIN ===";
  const base = trimmed === "" || trimmed === "[]" ? "" : existing.replace(/\s*$/, "\n");
  const quote = value => `'${value.replaceAll("'", "''")}'`;
  const block = [
    marker,
    "- insert:",
    "    - id: mcp-codex-computer-use",
    "      name: '@deepseek-ai/dsh-mcp-client'",
    "      config:",
    "        serverName: codex-computer-use",
    "        transport: stdio",
    `        command: ${quote(launcher)}`,
    "        args:",
    "          - mcp",
    "        env:",
    "          CODEX_CUA_BACKEND: standalone",
    ...(timeoutMs ? [`          CODEX_CUA_TIMEOUT_MS: ${quote(timeoutMs)}`] : []),
    "# === codex-computer-use MCP END ===",
  ].join("\n") + "\n";
  if (existing.includes(marker)) {
    console.log(`codex-computer-use MCP already present in ${dshConfigFile}; left unchanged.`);
  } else {
    // Colocate the backup with the config when a nondefault DSH profile is
    // selected, so an isolated install never writes into this checkout.
    const dshBackupRoot = process.env.CUA_DSH_BACKUP_DIR
      || (process.env.DSH_CONFIG_DIR || process.env.DSH_MCP_CONFIG_FILE
        ? path.join(path.dirname(dshConfigFile), "installation-backup")
        : path.join(root, ".local/installation-backup"));
    const backup = path.join(dshBackupRoot, new Date().toISOString().replaceAll(":", "-"));
    await mkdir(backup, { recursive: true });
    if (await present(dshConfigFile)) await copyFile(dshConfigFile, path.join(backup, "dsh-cordis.patch.yml"));
    await mkdir(path.dirname(dshConfigFile), { recursive: true });
    await writeFile(dshConfigFile, base + (base ? "\n" : "") + block, { mode: 0o600 });
    console.log(`Registered codex-computer-use MCP in ${dshConfigFile}\nBackup: ${path.join(backup, "dsh-cordis.patch.yml")}`);
  }
}
for (const target of targets) {
  await mkdir(path.dirname(target), { recursive: true });
  if (!await present(target)) {
    await symlink(root, target, "dir");
    console.log(`Installed skill: ${target}`);
  } else {
    console.log(`Skill already installed: ${target}`);
  }
}
console.log("Restart existing client sessions. For DSH, reload the profile / start a new session so the skill and MCP server are discovered. macOS permissions are not changed by this installer.");
