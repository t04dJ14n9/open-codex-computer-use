#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const runtime = path.join(root, "scripts/codex-computer-use-mcp");
const sources = path.join(root, "scripts/codex-computer-use-source");
const args = process.argv.slice(2);
if (args.some(arg => !["--check", "--help"].includes(arg))) throw new Error("Usage: node scripts/setup.mjs [--check]");
if (args.includes("--help")) {
  console.log("Usage: node scripts/setup.mjs [--check]\nInstalls locked npm dependencies; --check validates without installing. Does not change agent configuration or macOS permissions.");
  process.exit(0);
}
if (process.platform !== "darwin") throw new Error("This skill requires macOS 14 or later.");
const macVersion = spawnSync("/usr/bin/sw_vers", ["-productVersion"], { encoding: "utf8" });
if (macVersion.status !== 0 || Number(macVersion.stdout.split(".")[0]) < 14) throw new Error("macOS 14 or later is required.");
const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 24 || (major === 24 && minor < 11)) throw new Error("Node.js 24.11 or later is required.");
for (const file of ["node-repl-embedded/kernel.js", "shipped-runtime/node_modules/@oai/cua/package.json", "shipped-runtime/node_modules/@oai/sky/package.json"]) {
  await access(path.join(sources, file));
}
const manifest = JSON.parse(await readFile(path.join(runtime, "build/native-manifest.json"), "utf8"));
const arch = { arm64: "arm64", x64: "x86_64" }[process.arch];
if (arch !== manifest.architecture) throw new Error(`The bundled helper targets ${manifest.architecture}, but this Node process is ${process.arch}. Rebuild with CUA_NATIVE_ARCH=${arch || "arm64"} node scripts/codex-computer-use-mcp/scripts/build-native.mjs`);
const helper = path.join(runtime, "build/Codex Computer Use Standalone.app/Contents/MacOS/ComputerUse");
await access(helper, constants.X_OK);
for (const [key, file] of Object.entries({ executable: helper, source: path.join(runtime, "native/ComputerUse.swift"), infoPlist: path.join(runtime, "native/Info.plist") })) {
  const hash = createHash("sha256").update(await readFile(file)).digest("hex");
  if (hash !== manifest.sha256[key]) throw new Error(`Native ${key} hash does not match the build manifest. Inspect or rebuild before running.`);
}
for (const source of manifest.sourceFiles ?? []) {
  const hash = createHash("sha256").update(await readFile(path.join(runtime, source.path))).digest("hex");
  if (hash !== source.sha256) throw new Error(`Native source ${source.path} differs from its build manifest. Rebuild before running.`);
}
if (!args.includes("--check")) {
  const npm = spawnSync("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: runtime, stdio: "inherit" });
  if (npm.error) throw npm.error;
  if (npm.status !== 0) throw new Error(`npm ci failed (${npm.status}).`);
}
const require = createRequire(path.join(runtime, "package.json"));
for (const name of ["@modelcontextprotocol/server", "@modelcontextprotocol/client", "zod"]) {
  try { require.resolve(name); }
  catch { throw new Error(`Missing dependency ${name}. Run node scripts/setup.mjs`); }
}
console.log(JSON.stringify({ ready: true, platform: process.platform, architecture: manifest.architecture, node: process.versions.node, helper, configurationChanged: false }, null, 2));
