#!/usr/bin/env node
// Setup helper for the portable computer-use skill.
//   node scripts/setup.mjs --check   read-only validation, no side effects
//   node scripts/setup.mjs           run `npm ci` in the skill root
// Neither mode touches any config file or macOS permission.
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { execFileSync, spawnSync } from "node:child_process";
import { accessSync, constants, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const skillRoot = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = path.join(skillRoot, "build", "native-manifest.json");
const isCheck = process.argv.includes("--check");

const result = {
  mode: isCheck ? "check" : "setup",
  platform: process.platform,
  node: process.versions.node,
  skillRoot,
  checks: [],
  ok: true,
};

function check(name, passed, detail) {
  const ok = !!passed;
  result.checks.push({ name, passed: ok, ...(detail !== undefined ? { detail } : {}) });
  if (!ok) result.ok = false;
}

function sha256(rel) {
  return createHash("sha256").update(readFileSync(path.join(skillRoot, rel))).digest("hex");
}

function fileInfo(rel) {
  const full = path.join(skillRoot, rel);
  const info = { exists: false, executable: false };
  try { statSync(full); info.exists = true; } catch { return info; }
  try { accessSync(full, constants.X_OK); info.executable = true; } catch {}
  return info;
}

if (isCheck) {
  // (a) platform is macOS
  check("platform-darwin", process.platform === "darwin", { platform: process.platform });

  // (b) macOS >= 14, read from /usr/bin/sw_vers
  let macVersion = null, macOk = false, macError = null;
  try {
    macVersion = execFileSync("/usr/bin/sw_vers", ["-productVersion"], { encoding: "utf8" }).trim();
    macOk = parseInt(macVersion.split(".")[0], 10) >= 14;
  } catch (error) { macError = error.message; }
  check("macos-14-or-newer", macOk, { productVersion: macVersion, error: macError });

  // (c) Node major >= 18
  const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
  check("node-18-or-newer", nodeMajor >= 18, { version: process.versions.node });

  // Load the manifest (required by d and e).
  let manifest = null;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    check("manifest-readable", true, { path: "build/native-manifest.json" });
  } catch (error) {
    check("manifest-readable", false, { error: error.message });
  }

  if (manifest) {
    const exeRel = manifest.executablePath;

    // (d) helper executable exists and is executable
    const info = fileInfo(exeRel);
    check("helper-executable", info.exists && info.executable, { path: exeRel, ...info });

    // (e) executable, three Swift sources and Info.plist hashes match the manifest
    const targets = [
      { key: "executable", path: exeRel, expected: manifest.sha256?.executable },
      { key: "infoPlist", path: manifest.infoPlistPath, expected: manifest.sha256?.infoPlist },
      { key: "source", path: manifest.sourcePath ?? "native/ComputerUse.swift", expected: manifest.sha256?.source },
    ];
    const sourceFiles = manifest.sourceFiles ?? [];
    for (const sf of sourceFiles) {
      targets.push({ key: "sourceFile", path: sf.path, expected: sf.sha256 });
    }
    const files = targets.map((t) => {
      let actual = null, error = null;
      try { actual = sha256(t.path); } catch (e) { error = e.message; }
      return {
        key: t.key,
        path: t.path,
        expected: t.expected ?? null,
        actual,
        error,
        match: !!actual && !!t.expected && actual === t.expected,
      };
    });
    check("sha256-matches-manifest",
      sourceFiles.length >= 3 && files.every((f) => f.match),
      { files, sourceFilesCount: sourceFiles.length });
  } else {
    check("helper-executable", false, { error: "manifest unavailable" });
    check("sha256-matches-manifest", false, { error: "manifest unavailable" });
  }

  // (f) required packages resolve from the skill root
  const req = createRequire(path.join(skillRoot, "package.json"));
  const dependencies = ["@modelcontextprotocol/server", "zod"].map((pkg) => {
    try { return { package: pkg, resolved: req.resolve(pkg), ok: true }; }
    catch (error) { return { package: pkg, resolved: null, error: error.code || error.message, ok: false }; }
  });
  check("dependencies-resolve", dependencies.every((d) => d.ok), { dependencies });
} else {
  const run = spawnSync("npm", ["ci", "--ignore-scripts", "--no-audit", "--no-fund"], {
    cwd: skillRoot,
    encoding: "utf8",
    env: process.env,
  });
  check("npm-ci", run.status === 0, {
    command: "npm ci --ignore-scripts --no-audit --no-fund",
    exitCode: run.status,
    ...(run.error ? { error: run.error.message } : {}),
    ...(run.stdout ? { stdoutTail: run.stdout.trim().slice(-2000) } : {}),
    ...(run.stderr ? { stderrTail: run.stderr.trim().slice(-2000) } : {}),
  });
}

process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
process.exitCode = result.ok ? 0 : 1;
