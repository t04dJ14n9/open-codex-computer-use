#!/usr/bin/env node
// Registers this skill and its stdio MCP server in any agent. Dependency-free:
// only Node builtins are used, and no client binary needs to be installed.
import { copyFile, lstat, mkdir, readFile, realpath, symlink, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = await realpath(fileURLToPath(new URL("../", import.meta.url)));
const name = "portable-computer-use";
const launcher = path.join(root, "bin/computer-use"); // POSIX CLI wrapper
const cli = path.join(root, "src", "cli.mjs");
// Register `node <skill>/src/cli.mjs mcp` rather than the zsh wrapper: this
// works unchanged on Windows, macOS and Linux (Windows cannot spawn shebang
// scripts). `bin/computer-use` remains available as an interactive CLI.
const entry = { type: "stdio", command: process.execPath, args: [cli, "mcp"] };
const universal = { mcpServers: { [name]: entry } };
const toolIds = ["computer", "js", "js_reset", "status"].map(tool => `mcp__${name}__${tool}`);
const home = homedir();

const argv = process.argv.slice(2);
const flags = { claude: null, codex: false, dsh: false, cursor: false, windsurf: false, gemini: false, generic: null, printConfig: false, all: false };
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === "--help" || arg === "-h") {
    console.log(`Usage: node scripts/install.mjs [flags]

Links this skill into selected agents and registers the stdio MCP server.
Every config write is backed up under .local/installation-backup/ and is
idempotent. No client binary or product host is required.

Flags:
  --claude [binary]   Claude Code (skill link, ~/.claude.json, four tool grants)
  --codex             Codex (skill link only; uses the CLI fallback)
  --dsh               DeepSeek Harness (skill link + ~/.dsh/cordis.patch.yml)
  --cursor            Cursor (~/.cursor/mcp.json)
  --windsurf          Windsurf (~/.codeium/windsurf/mcp_config.json)
  --gemini            Gemini CLI (~/.gemini/settings.json)
  --generic <path>    Merge the MCP entry into an arbitrary JSON config file
  --all               All six built-in clients
  --print-config      Print the universal MCP JSON and exit without writing
  --help              Show this message

Universal MCP entry (paste into any stdio MCP client):
${JSON.stringify(universal, null, 2)}`);
    process.exit(0);
  } else if (arg === "--claude") {
    flags.claude = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "claude";
  } else if (arg === "--codex") flags.codex = true;
  else if (arg === "--dsh") flags.dsh = true;
  else if (arg === "--cursor") flags.cursor = true;
  else if (arg === "--windsurf") flags.windsurf = true;
  else if (arg === "--gemini") flags.gemini = true;
  else if (arg === "--all") flags.all = true;
  else if (arg === "--print-config") flags.printConfig = true;
  else if (arg === "--generic") {
    if (!argv[i + 1] || argv[i + 1].startsWith("--")) throw new Error("--generic requires an absolute file path");
    flags.generic = path.resolve(argv[++i]);
  } else throw new Error(`Unknown or incomplete flag: ${arg}`);
}

if (flags.printConfig) {
  console.log(JSON.stringify(universal, null, 2));
  process.exit(0);
}
if (flags.all) {
  flags.claude ??= "claude";
  flags.codex = flags.dsh = flags.cursor = flags.windsurf = flags.gemini = true;
}
if (!flags.claude && !flags.codex && !flags.dsh && !flags.cursor && !flags.windsurf && !flags.gemini && !flags.generic) {
  console.log("No client selected. Use --help for flags, or --print-config for the universal snippet.");
  process.exit(0);
}

async function present(file) {
  try { return await lstat(file); }
  catch (error) { if (error.code === "ENOENT") return null; throw error; }
}
async function readJson(file) {
  if (!await present(file)) return {};
  const value = JSON.parse(await readFile(file, "utf8"));
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`Expected a JSON object: ${file}`);
  return value;
}
async function backup(file) {
  if (!await present(file)) return null;
  const directory = path.join(root, ".local/installation-backup", new Date().toISOString().replaceAll(":", "-"));
  await mkdir(directory, { recursive: true });
  const destination = path.join(directory, path.basename(file));
  await copyFile(file, destination);
  return destination;
}
async function mergeJson(file, mutate) {
  const existing = await readJson(file);
  const before = JSON.stringify(existing);
  mutate(existing);
  const after = JSON.stringify(existing);
  if (after === before) { console.log(`Already configured: ${file}`); return; }
  const saved = await backup(file);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(existing, null, 2) + "\n", { mode: 0o600 });
  console.log(`Registered ${name} in ${file}${saved ? ` (backup: ${saved})` : ""}`);
}
async function linkSkill(directory) {
  const target = path.join(directory, name);
  const info = await present(target);
  if (info) {
    let resolved = null;
    if (info.isSymbolicLink()) {
      try { resolved = await realpath(target); } catch { /* broken link */ }
    }
    if (!info.isSymbolicLink() || resolved !== root) {
      throw new Error(`Existing skill is not this checkout; refusing to overwrite ${target}.`);
    }
    console.log(`Skill already installed: ${target}`);
    return;
  }
  await mkdir(directory, { recursive: true });
  await symlink(root, target, "dir");
  console.log(`Installed skill: ${target}`);
}

const tasks = [];
if (flags.claude) {
  const dir = path.resolve(process.env.CUA_CLAUDE_CONFIG_DIR || path.join(home, ".claude"));
  const file = path.resolve(process.env.CUA_CLAUDE_CONFIG_FILE || path.join(home, ".claude.json"));
  tasks.push(async () => {
    await mergeJson(file, config => {
      config.mcpServers ??= {};
      config.mcpServers[name] = entry;
    });
    const grants = path.join(dir, "settings.local.json");
    await mergeJson(grants, config => {
      config.permissions ??= {};
      const allow = config.permissions.allow ?? [];
      if (!Array.isArray(allow)) throw new Error(`permissions.allow must be an array: ${grants}`);
      config.permissions.allow = [...new Set([...allow, ...toolIds])];
    });
    await linkSkill(path.join(dir, "skills"));
  });
}
if (flags.codex) {
  const directory = process.env.CUA_CODEX_SKILLS_DIR
    || path.join(process.env.CODEX_HOME || path.join(home, ".codex"), "skills");
  tasks.push(() => linkSkill(path.resolve(directory)));
}
if (flags.dsh) {
  const skills = path.resolve(process.env.DSH_SKILLS_DIR || path.join(home, ".agents/skills"));
  const configFile = path.resolve(process.env.DSH_MCP_CONFIG_FILE || path.join(home, ".dsh", "cordis.patch.yml"));
  const marker = `# === ${name} MCP BEGIN ===`;
  tasks.push(async () => {
    const existing = await present(configFile) ? await readFile(configFile, "utf8") : "";
    const trimmed = existing.trim();
    if (trimmed && trimmed !== "[]" && !/^- insert:/m.test(existing)) {
      throw new Error(`Refusing to modify ${configFile}: expected a block-style top-level "- insert:" list. Register manually with --print-config.`);
    }
    if (existing.includes(marker)) {
      console.log(`${name} MCP already present in ${configFile}; left unchanged.`);
    } else {
      const saved = await backup(configFile);
      const quote = value => `'${value.replaceAll("'", "''")}'`;
      const block = [
        marker,
        "- insert:",
        `    - id: mcp-${name}`,
        "      name: '@deepseek-ai/dsh-mcp-client'",
        "      config:",
        `        serverName: ${name}`,
        "        transport: stdio",
        `        command: ${quote(process.execPath)}`,
        "        args:",
        `          - ${quote(cli)}`,
        "          - mcp",
        `# === ${name} MCP END ===`,
      ].join("\n") + "\n";
      const base = trimmed === "" || trimmed === "[]" ? "" : existing.replace(/\s*$/, "\n");
      await mkdir(path.dirname(configFile), { recursive: true });
      await writeFile(configFile, base + (base ? "\n" : "") + block, { mode: 0o600 });
      console.log(`Registered ${name} MCP in ${configFile}${saved ? ` (backup: ${saved})` : ""}`);
    }
    await linkSkill(skills);
  });
}
const jsonClients = [
  ["cursor", flags.cursor, process.env.CUA_CURSOR_CONFIG_FILE || path.join(home, ".cursor", "mcp.json")],
  ["windsurf", flags.windsurf, process.env.CUA_WINDSURF_CONFIG_FILE || path.join(home, ".codeium", "windsurf", "mcp_config.json")],
  ["gemini", flags.gemini, process.env.CUA_GEMINI_CONFIG_FILE || path.join(home, ".gemini", "settings.json")],
];
for (const [, enabled, file] of jsonClients) {
  if (!enabled) continue;
  tasks.push(() => mergeJson(path.resolve(file), config => {
    config.mcpServers ??= {};
    config.mcpServers[name] = entry;
  }));
}
if (flags.generic) {
  const file = flags.generic;
  tasks.push(() => mergeJson(file, config => {
    config.mcpServers ??= {};
    config.mcpServers[name] = entry;
  }));
}

for (const task of tasks) await task();
console.log("Start a new session in each client so the skill and MCP tools are discovered.");
