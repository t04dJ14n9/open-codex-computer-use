#!/usr/bin/env node
// Setup helper for the portable computer-use skill.
//   node scripts/setup.mjs --check   read-only validation, no side effects
//   node scripts/setup.mjs           run `npm ci` in the skill root
// Neither mode touches any config file or OS permission.
//
// macOS is the shipped backend. Windows / Wayland are researched but not yet
// implemented (see porting/PORTING-RESEARCH.md); --check reports that
// explicitly instead of failing as "not darwin".
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { execFileSync, spawnSync } from "node:child_process";
import { accessSync, constants, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { platformInfo } from "../src/backend.mjs";

const skillRoot = fileURLToPath(new URL("../", import.meta.url));
const manifestPath = path.join(skillRoot, "build", "native-manifest.json");
const isCheck = process.argv.includes("--check");
const info = platformInfo();

const result = {
  mode: isCheck ? "check" : "setup",
  platform: process.platform,
  sessionType: info.sessionType,
  nativeBackend: info.nativeBackend,
  backendStatus: info.backendStatus,
  node: process.versions.node,
  skillRoot,
  checks: [],
  warnings: [],
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
  // (a) platform and backend status — informational on non-macOS targets.
  const supported = ["darwin", "win32", "linux"].includes(info.platform);
  check("platform-supported", supported, {
    platform: info.platform,
    sessionType: info.sessionType,
    nativeBackend: info.nativeBackend,
    backendStatus: info.backendStatus,
    helper: info.helper,
    helperPresent: info.helperPresent,
  });
  if (!supported || info.backendStatus !== "ready") {
    result.warnings.push({
      platform: info.platform,
      backendStatus: info.backendStatus,
      requiredHelper: info.helperCandidates[0] ?? null,
      note: "Native helper is not available on this platform. The JS/MCP layers are portable; see porting/PORTING-RESEARCH.md and porting/BACKEND-CONTRACT.md.",
    });
  }

  // (b) Node major >= 20 (MCP SDK requirement), all platforms.
  const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
  check("node-20-or-newer", nodeMajor >= 20, { version: process.versions.node });

  // (c) macOS-only: OS version, helper signature/hashes.
  if (info.platform === "darwin") {
    let macVersion = null, macOk = false, macError = null;
    try {
      macVersion = execFileSync("/usr/bin/sw_vers", ["-productVersion"], { encoding: "utf8" }).trim();
      macOk = parseInt(macVersion.split(".")[0], 10) >= 14;
    } catch (error) { macError = error.message; }
    check("macos-14-or-newer", macOk, { productVersion: macVersion, error: macError });

    let manifest = null;
    try {
      manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
      check("manifest-readable", true, { path: "build/native-manifest.json" });
    } catch (error) {
      check("manifest-readable", false, { error: error.message });
    }

    if (manifest) {
      const exeRel = manifest.executablePath;
      const executable = fileInfo(exeRel);
      check("helper-executable", executable.exists && executable.executable, { path: exeRel, ...executable });

      const targets = [
        { key: "executable", path: exeRel, expected: manifest.sha256?.executable },
        { key: "infoPlist", path: manifest.infoPlistPath, expected: manifest.sha256?.infoPlist },
        { key: "source", path: manifest.sourcePath ?? "native/ComputerUse.swift", expected: manifest.sha256?.source },
      ];
      const sourceFiles = manifest.sourceFiles ?? [];
      for (const sf of sourceFiles) targets.push({ key: "sourceFile", path: sf.path, expected: sf.sha256 });
      const files = targets.map(t => {
        let actual = null, error = null;
        try { actual = sha256(t.path); } catch (e) { error = e.message; }
        return { key: t.key, path: t.path, expected: t.expected ?? null, actual, error,
          match: !!actual && !!t.expected && actual === t.expected };
      });
      check("sha256-matches-manifest", sourceFiles.length >= 3 && files.every(f => f.match),
        { files, sourceFilesCount: sourceFiles.length });
    } else {
      check("helper-executable", false, { error: "manifest unavailable" });
      check("sha256-matches-manifest", false, { error: "manifest unavailable" });
    }
  } else {
    // (c') Windows / Linux: verify the cross-platform Python helper instead.
    let crossManifest = null;
    try {
      crossManifest = JSON.parse(readFileSync(path.join(skillRoot, "build", "cross-platform-manifest.json"), "utf8"));
      check("cross-platform-manifest-readable", true, { path: "build/cross-platform-manifest.json" });
    } catch (error) {
      check("cross-platform-manifest-readable", false, { error: error.message });
    }
    const target = info.platform === "win32" ? "windows" : "linux";
    const rel = `build/${target}/computer_use_helper.py`;
    const script = fileInfo(rel);
    check("cross-platform-helper-present", script.exists, { path: rel, ...script });
    const sourceRel = "native/crossplatform/computer_use_helper.py";
    let hashMatch = false, actual = null, expected = null;
    try {
      actual = sha256(rel);
      expected = crossManifest?.targets?.[target]?.sha256 ?? crossManifest?.sourceSha256 ?? null;
      hashMatch = !!actual && actual === expected;
    } catch (error) { /* reported below */ }
    check("cross-platform-helper-hash", hashMatch, { path: rel, actual, expected, source: sourceRel });
    const candidates = process.env.COMPUTER_USE_PYTHON
      ? [process.env.COMPUTER_USE_PYTHON]
      : (info.platform === "win32" ? ["python", "py", "python3"] : ["python3", "python"]);
    let interpreter = null, version = null;
    for (const candidate of candidates) {
      const probe = spawnSync(candidate, ["--version"], { encoding: "utf8" });
      if (probe.status === 0) {
        interpreter = candidate;
        version = (probe.stdout || probe.stderr || "").trim().slice(0, 120);
        break;
      }
    }
    check("python-interpreter", !!interpreter, {
      candidates,
      selected: interpreter,
      version,
      note: interpreter && interpreter !== (info.platform === "win32" ? "python" : "python3")
        ? `Set COMPUTER_USE_PYTHON=${interpreter} so the helper uses this interpreter.`
        : "Set COMPUTER_USE_PYTHON to override (Windows installs often use `py` or `python3`).",
    });
    check("platform-backend", true, {
      backendStatus: info.backendStatus,
      nativeBackend: info.nativeBackend,
      sessionType: info.sessionType,
      helperSpec: info.helperSpec,
      note: "Helper is present; OS API behaviour (UIA, portals, PipeWire, AT-SPI) must be verified on the target desktop.",
      research: info.portingResearch,
    });
  }

  // (d) required packages resolve from the skill root, all platforms.
  const req = createRequire(path.join(skillRoot, "package.json"));
  const dependencies = ["@modelcontextprotocol/server", "zod"].map(pkg => {
    try { return { package: pkg, resolved: req.resolve(pkg), ok: true }; }
    catch (error) { return { package: pkg, resolved: null, error: error.code || error.message, ok: false }; }
  });
  check("dependencies-resolve", dependencies.every(d => d.ok), { dependencies });
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
