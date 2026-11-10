#!/usr/bin/env node
// Verifies the Windows / Linux helper's protocol and backend orchestration on
// ANY host (including macOS) by overriding sys.platform and stubbing the OS
// tools it probes. The actual OS APIs (UIA, portals, PipeWire, ctypes Win32)
// can only be validated on real target desktops; those paths are noted below.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, chmodSync, readFileSync, existsSync, symlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pythonCommand } from "./python.mjs";

// Stub OS tools are POSIX shell/Python scripts, so this particular harness is
// POSIX-only. On Windows the real OS tools exist and the live protocol test
// (test/protocol.mjs) plus setup --check validate the helper instead.
if (process.platform === "win32") {
  console.log(JSON.stringify({
    passed: true, checks: [],
    skipped: "stubbed-tool harness is POSIX-only; validate the real Windows helper with setup --check and the target-OS checklist",
  }, null, 2));
  process.exit(0);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const helper = path.join(root, "native/crossplatform/computer_use_helper.py");
const python = pythonCommand();
const tmp = mkdtempSync(path.join(tmpdir(), "pcu-cross-"));
const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==";
const xdotoolLog = path.join(tmp, "xdotool.log");
const importLog = path.join(tmp, "import.log");

function stub(name, body) {
  const file = path.join(tmp, name);
  writeFileSync(file, `#!/usr/bin/env python3\n${body}\n`, { mode: 0o755 });
  chmodSync(file, 0o755);
}

stub("xdotool", `
import sys, os
a = sys.argv[1:]
log = os.environ.get("PCU_XDOTOOL_LOG")
if log:
    with open(log, "a") as f: f.write(" ".join(a) + "\\n")
if a[:1] == ["search"]:
    print("101"); print("102")
elif a[:1] == ["getwindowname"]:
    print("Window " + (a[1] if len(a) > 1 else "?"))
sys.exit(0)
`);
stub("xprop", `print('WM_CLASS(STRING) = "mockapp", "MockApp"')`);
stub("xwininfo", `
print("xwininfo: Window id: 0x65")
print('     0x66 "child": ("child" "child")  100x50+0+0  +0+0')
`);
stub("import", `
import sys, os, base64
log = os.environ.get("PCU_IMPORT_LOG")
if log:
    with open(log, "a") as f: f.write(" ".join(sys.argv[1:]) + "\\n")
open(sys.argv[-1], "wb").write(base64.b64decode("${PNG}"))
`);
stub("grim", `
import sys, base64
open(sys.argv[-1], "wb").write(base64.b64decode("${PNG}"))
`);
stub("wtype", `import sys; sys.exit(0)`);
stub("ydotool", `import sys; sys.exit(0)`);
stub("scrot", `import sys; sys.exit(0)`);
stub("gnome-screenshot", `import sys; sys.exit(0)`);
stub("powershell", `
import sys, json
a = sys.argv[1:]
if "-Action" in a:
    print("ok")
else:
    print(json.dumps([
      {"depth": 0, "label": "window, Mock Window", "id": "root", "x": 0, "y": 0, "w": 800, "h": 600, "enabled": True, "actions": ["InvokePattern"]},
      {"depth": 1, "label": "button, OK", "id": "ok", "x": 10, "y": 10, "w": 80, "h": 24, "enabled": True, "actions": ["InvokePattern"]}
    ]))
`);

function bootstrap(platform, session) {
  const lines = [
    // Preload stdlib while sys.platform is still the real host value: some
    // modules (e.g. shutil) branch on platform at import time.
    "import base64, json, os, re, shutil, struct, subprocess, sys, tempfile, traceback, zlib, ctypes, runpy, urllib.parse",
    `sys.platform = ${JSON.stringify(platform)}`,
    "os.environ.pop('WAYLAND_DISPLAY', None); os.environ.pop('DISPLAY', None); os.environ.pop('XDG_SESSION_TYPE', None)",
  ];
  if (platform === "linux" && session === "x11") {
    lines.push('os.environ["XDG_SESSION_TYPE"] = "x11"; os.environ["DISPLAY"] = ":0"');
  } else if (platform === "linux" && session === "wayland") {
    lines.push('os.environ["XDG_SESSION_TYPE"] = "wayland"; os.environ["WAYLAND_DISPLAY"] = "wayland-0"');
  }
  lines.push(`runpy.run_path(${JSON.stringify(helper)}, run_name="__main__")`);
  return lines.join("\n");
}

function talk(platform, session, requests, { stubPath = tmp, extraEnv = {} } = {}) {
  const input = requests.map((r, i) => JSON.stringify({ id: i + 1, ...r })).join("\n") + "\n";
  const result = spawnSync(python, ["-c", bootstrap(platform, session)], {
    input,
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${stubPath}${path.delimiter}${process.env.PATH}`,
      PCU_XDOTOOL_LOG: xdotoolLog,
      PCU_IMPORT_LOG: importLog,
      ...extraEnv,
    },
    timeout: 30000,
  });
  assert.equal(result.status, 0, `helper exited ${result.status}: ${result.stderr}`);
  return result.stdout.trim().split("\n").filter(Boolean).map(line => JSON.parse(line));
}

// A PATH containing only `python3` — no OS tools at all — for capability tests.
const pythonAbs = spawnSync("which", [python], { encoding: "utf8" }).stdout.trim() || python;
const noToolsDir = mkdtempSync(path.join(tmpdir(), "pcu-notools-"));
symlinkSync(pythonAbs, path.join(noToolsDir, "python3"));

function logLines(file) {
  if (!existsSync(file)) return [];
  return readFileSync(file, "utf8").trim().split("\n").filter(Boolean);
}

const checks = [];

// 1. Core protocol on an unsupported host (this macOS box).
{
  const core = spawnSync(python, ["-c", bootstrap("darwin", null)], {
    input: [
      JSON.stringify({ id: 1, method: "permissionStatus", params: {} }),
      "not-json",
      JSON.stringify({ id: 2, method: "list_apps", params: {} }),
      JSON.stringify({ method: "cancel", params: { id: 2 } }),
      JSON.stringify({ id: 3, method: "cursorStatus", params: {} }),
    ].join("\n") + "\n",
    encoding: "utf8",
    env: { ...process.env, PATH: `${tmp}${path.delimiter}${process.env.PATH}` },
  });
  assert.equal(core.status, 0, `core loop exited ${core.status}: ${core.stderr}`);
  const replies = core.stdout.trim().split("\n").map(l => JSON.parse(l));
  assert.equal(replies.length, 3, "malformed lines and cancel produce no replies");
  assert.equal(replies[0].result.helper, "cross-platform-python");
  assert.equal(replies[0].result.platform, "unsupported");
  assert.match(replies[1].error.message, /background_unavailable/);
  assert.equal(replies[2].result.enabled, false);
  checks.push("JSON-lines core: status, typed refusals, cancel, malformed input, cursor stub");
}

// 2. Linux X11 (FIX: exact-window binding + window-scoped screenshot).
{
  const r = talk("linux", "x11", [
    { method: "permissionStatus", params: {} },
    { method: "list_apps", params: {} },
    { method: "get_app_state", params: { app: "101" } },
    { method: "screenshot", params: { app: "101" } },
    { method: "click", params: { app: "101", x: 10, y: 20 } },
    { method: "press_key", params: { app: "101", key: "Return" } },
    { method: "type_text", params: { app: "101", text: "hello" } },
    { method: "scroll", params: { app: "101", direction: "down", x: 1, y: 2 } },
    { method: "set_value", params: { app: "101", element_index: 1, value: "x" } },
    { method: "press_key", params: { app: "Firefox", key: "Return" } },
    { method: "click", params: { app: "Firefox", x: 1, y: 2 } },
    { method: "screenshot", params: { app: "Firefox" } },
  ]);
  assert.equal(r[0].result.sessionType, "x11");
  assert.equal(r[0].result.backend, "linux-x11");
  assert.equal(r[0].result.backgroundAvailable, true);
  assert.equal(r[0].result.windowTargetedInput, true);
  assert.equal(r[0].result.axTree, true);
  assert.equal(r[0].result.screenshot, true);
  assert.equal(r[0].result.globalInput, false);
  assert(Array.isArray(r[1].result) && r[1].result.length > 0);
  assert.match(r[1].result[0].windows[0].app, /#window=101/);
  assert.match(r[2].result.text, /^0 window/);
  assert.match(r[3].result.url, /^data:image\/png;base64,/);
  assert.equal(r[3].result.scope, "window");
  for (const i of [4, 5, 6, 7]) assert.equal(r[i].error, undefined, JSON.stringify(r[i]));
  assert.match(r[8].error.message, /background_unavailable/);
  // A bare app name must be refused, never silently sent to the focused window.
  for (const i of [9, 10, 11]) {
    assert.match(r[i].error.message, /background_unavailable/);
    assert.match(r[i].error.message, /window|bind|exact/i);
  }
  // Every xdotool input invocation carries --window with a numeric id.
  const invocations = logLines(xdotoolLog).filter(l => /(^| )(key|type|click|mousemove)( |$)/.test(l));
  assert(invocations.length > 0, "xdotool was invoked for legitimate requests");
  for (const line of invocations) {
    assert.match(line, /--window \d+/, `xdotool invoked without a window target: ${line}`);
  }
  // Screenshot uses `import -window <numeric id>`, never scrot/gnome fallbacks.
  const imports = logLines(importLog);
  assert(imports.length > 0);
  for (const line of imports) assert.match(line, /-window \d+/);
  checks.push("Linux X11: exact-window binding, --window on every input, window-scoped import, bare-name refusals");
}

// 3. Linux Wayland (FIX: full-screen capture requires explicit opt-in).
{
  const r = talk("linux", "wayland", [
    { method: "permissionStatus", params: {} },
    { method: "list_apps", params: {} },
    { method: "screenshot", params: { app: "x" } },
    { method: "screenshot", params: { app: "x", allow_fullscreen: true } },
    { method: "press_key", params: { app: "x", key: "Return" } },
    { method: "click", params: { app: "x", x: 1, y: 2 } },
    { method: "get_app_state", params: { app: "x" } },
  ]);
  assert.equal(r[0].result.sessionType, "wayland");
  assert.equal(r[0].result.backend, "wayland-portal");
  assert.equal(r[0].result.backgroundAvailable, false);
  assert.equal(r[0].result.windowTargetedInput, false);
  assert.equal(r[0].result.consentRequired, true);
  assert.equal(r[0].result.fullScreenCaptureRequiresOptIn, true);
  assert(Array.isArray(r[1].result));
  // Default request must be refused, NOT silently return a full-screen image.
  assert.match(r[2].error.message, /background_unavailable/);
  assert.match(r[2].error.message, /allow_fullscreen|full-screen|window/i);
  // Explicit opt-in is allowed but clearly tagged as full-screen.
  assert.equal(r[3].error, undefined, JSON.stringify(r[3]));
  assert.match(r[3].result.url, /^data:image\/png;base64,/);
  assert.equal(r[3].result.scope, "full-screen");
  assert.equal(r[4].error, undefined, JSON.stringify(r[4]));
  assert.match(r[5].error.message, /no per-window background coordinate input/);
  assert.match(r[6].error.message, /AT-SPI2/);
  checks.push("Linux Wayland: capability downgrade, refusal without opt-in, tagged full-screen opt-in, foreground keyboard");
}

// 4. Windows UI Automation (FIX: -File invocation, exact-window binding).
{
  const r = talk("win32", null, [
    { method: "permissionStatus", params: {} },
    { method: "get_app_state", params: { app: "101" } },
    { method: "set_value", params: { app: "101", element_index: 1, value: "abc" } },
    { method: "perform_secondary_action", params: { app: "101", element_index: 1, action: "invoke" } },
    { method: "paste", params: { app: "101", text: "x", format: "text" } },
  ]);
  assert.equal(r[0].result.platform, "win32");
  assert.equal(r[0].result.backend, "windows-uia");
  assert.equal(r[0].result.backgroundAvailable, false);
  assert.equal(r[0].result.globalInput, true);
  assert.match(r[1].result.text, /0 window, Mock Window/);
  assert.match(r[1].result.text, /1 button, OK/);
  assert.equal(r[2].error, undefined, JSON.stringify(r[2]));
  assert.equal(r[3].error, undefined, JSON.stringify(r[3]));
  assert.match(r[4].error.message, /background_unavailable/);
  checks.push("Windows: UI Automation tree via -File, control-pattern actions, capability downgrade, paste refusal");
}

// 5. Capability honesty (FIX: no hardcoded true when dependencies are absent).
{
  const r = talk("linux", "x11", [
    { method: "permissionStatus", params: {} },
  ], { stubPath: noToolsDir, extraEnv: { PATH: noToolsDir } });
  const s = r[0].result;
  assert.equal(s.accessibility, false, "no xwininfo/pyatspi -> axTree false");
  assert.equal(s.screenRecording, false, "no import -> screenshot false");
  assert.equal(s.axTree, false);
  assert.equal(s.screenshot, false);
  assert.equal(s.backgroundAvailable, false, "no xdotool -> no targeted input");
  assert.equal(s.windowTargetedInput, false);
  assert.equal(s.inputMode, "unavailable");
  assert.equal(s.capabilityBasis, "dependency-probe; no OS consent is claimed");
  assert(Array.isArray(s.missingTools) && s.missingTools.length > 0);
  checks.push("permissionStatus derives capabilities from probed tools (all-false when absent)");
}

rmSync(tmp, { recursive: true, force: true });
rmSync(noToolsDir, { recursive: true, force: true });
console.log(JSON.stringify({
  passed: true,
  checks,
  unverified: [
    "ctypes Win32 calls (EnumWindows/SendInput/PrintWindow) require a real Windows host",
    "PowerShell UIAutomationClient assemblies / parameter binding require Windows",
    "XDG portal dialogs, PipeWire frames, libei and AT-SPI buses require a real Linux desktop",
  ],
}, null, 2));
