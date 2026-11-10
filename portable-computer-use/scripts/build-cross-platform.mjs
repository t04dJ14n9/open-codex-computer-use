#!/usr/bin/env node
// Materialize the Windows and Linux Python helpers into build/<platform>/.
// No compilation is required: the helpers are Python 3 scripts using only the
// standard library plus OS-provided tools probed at runtime.
//
//   node scripts/build-cross-platform.mjs          copy + write manifest
//   node scripts/build-cross-platform.mjs --check  verify hashes, write nothing
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile, access, constants } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "native/crossplatform/computer_use_helper.py");
const targets = ["windows", "linux"];
const manifestPath = path.join(root, "build/cross-platform-manifest.json");
const isCheck = process.argv.includes("--check");

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

const sourceBytes = await readFile(source);
const sourceHash = sha256(sourceBytes);

if (isCheck) {
  let manifest;
  try { manifest = JSON.parse(await readFile(manifestPath, "utf8")); }
  catch (error) {
    console.log(JSON.stringify({ ok: false, error: `manifest missing: ${error.message}` }, null, 2));
    process.exit(1);
  }
  const checks = [{ path: "native/crossplatform/computer_use_helper.py", expected: manifest.sourceSha256, actual: sourceHash }];
  for (const target of targets) {
    const rel = `build/${target}/computer_use_helper.py`;
    try { checks.push({ path: rel, expected: manifest.targets[target].sha256, actual: sha256(await readFile(path.join(root, rel))) }); }
    catch { checks.push({ path: rel, expected: manifest.targets[target].sha256, actual: null }); }
  }
  const ok = checks.every(c => c.actual && c.actual === c.expected);
  console.log(JSON.stringify({ ok, checks }, null, 2));
  process.exit(ok ? 0 : 1);
}

const targetsInfo = {};
for (const target of targets) {
  const directory = path.join(root, "build", target);
  await mkdir(directory, { recursive: true });
  const destination = path.join(directory, "computer_use_helper.py");
  await copyFile(source, destination);
  await access(destination, constants.R_OK);
  targetsInfo[target] = {
    path: `build/${target}/computer_use_helper.py`,
    sha256: sha256(await readFile(destination)),
    bytes: sourceBytes.length,
  };
}

const manifest = {
  schemaVersion: 1,
  helper: "cross-platform-python",
  builtAt: new Date().toISOString(),
  runtime: "python3 >= 3.8 (Windows: python or py)",
  source: "native/crossplatform/computer_use_helper.py",
  sourceSha256: sourceHash,
  byteCount: sourceBytes.length,
  targets: targetsInfo,
  notes: [
    "Helpers use only the Python standard library plus OS-provided tools.",
    "Windows: Win32 ctypes (EnumWindows/SendInput/PrintWindow) + PowerShell UIAutomationClient.",
    "Linux X11: xdotool / xwininfo / import|scrot + optional pyatspi.",
    "Linux Wayland: AT-SPI2, xdg-desktop-portal Screenshot via Gio, grim/spectacle, ydotool/wtype.",
    "Wayland cannot reproduce macOS background-only window-targeted input; see porting/PORTING-RESEARCH.md.",
    "No helper is re-signed or compiled; hashes here are integrity checks only.",
  ],
};
await mkdir(path.dirname(manifestPath), { recursive: true });
await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify({ ok: true, source: manifest.source, sourceSha256: sourceHash, targets: targetsInfo, manifest: "build/cross-platform-manifest.json" }, null, 2));
