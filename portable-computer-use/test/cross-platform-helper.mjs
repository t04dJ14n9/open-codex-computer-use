#!/usr/bin/env node
// Verifies the Windows / Linux helper's protocol and backend orchestration on
// ANY host (including macOS) by overriding sys.platform and stubbing the OS
// tools it probes. The actual OS APIs (UIA, portals, PipeWire, ctypes Win32)
// can only be validated on real target desktops; those paths are noted below.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, chmodSync, rmSync } from "node:fs";
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

function stub(name, body) {
  const file = path.join(tmp, name);
  writeFileSync(file, `#!/usr/bin/env python3\n${body}\n`, { mode: 0o755 });
  chmodSync(file, 0o755);
}

stub("xdotool", `
import sys
a = sys.argv[1:]
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
import sys, base64
open(sys.argv[-1], "wb").write(base64.b64decode("${PNG}"))
`);
stub("grim", `
import sys, base64
open(sys.argv[-1], "wb").write(base64.b64decode("${PNG}"))
`);
stub("wtype", `import sys; sys.exit(0)`);
stub("ydotool", `import sys; sys.exit(0)`);
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

function talk(platform, session, requests) {
  const input = requests.map((r, i) => JSON.stringify({ id: i + 1, ...r })).join("\n") + "\n";
  const result = spawnSync(python, ["-c", bootstrap(platform, session)], {
    input,
    encoding: "utf8",
    env: { ...process.env, PATH: `${tmp}:${process.env.PATH}` },
    timeout: 30000,
  });
  assert.equal(result.status, 0, `helper exited ${result.status}: ${result.stderr}`);
  return result.stdout.trim().split("\n").filter(Boolean).map(line => JSON.parse(line));
}

const checks = [];

// 1. Core protocol on an unsupported host (this macOS box): status works,
//    unsupported methods refuse, malformed input and cancel are ignored.
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
    env: { ...process.env, PATH: `${tmp}:${process.env.PATH}` },
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

// 2. Linux X11 with stubbed xdotool/xwininfo/import.
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
  ]);
  assert.equal(r[0].result.sessionType, "x11");
  assert.equal(r[0].result.backend, "linux-x11");
  assert.equal(r[0].result.backgroundAvailable, true);
  assert.equal(r[0].result.windowTargetedInput, true);
  assert(Array.isArray(r[1].result) && r[1].result.length > 0);
  assert.match(r[1].result[0].windows[0].app, /#window=101/);
  assert.match(r[2].result.text, /^0 window/);
  assert.match(r[3].result.url, /^data:image\/png;base64,/);
  for (const i of [4, 5, 6, 7]) assert.equal(r[i].error, undefined, JSON.stringify(r[i]));
  assert.match(r[8].error.message, /background_unavailable/);
  checks.push("Linux X11: app inventory, numbered tree, PNG screenshot, targeted input, set_value refusal");
}

// 3. Linux Wayland with stubbed grim/wtype.
{
  const r = talk("linux", "wayland", [
    { method: "permissionStatus", params: {} },
    { method: "list_apps", params: {} },
    { method: "screenshot", params: { app: "x" } },
    { method: "press_key", params: { app: "x", key: "Return" } },
    { method: "click", params: { app: "x", x: 1, y: 2 } },
    { method: "get_app_state", params: { app: "x" } },
  ]);
  assert.equal(r[0].result.sessionType, "wayland");
  assert.equal(r[0].result.backend, "wayland-portal");
  assert.equal(r[0].result.backgroundAvailable, false);
  assert.equal(r[0].result.windowTargetedInput, false);
  assert.equal(r[0].result.consentRequired, true);
  assert(Array.isArray(r[1].result));
  assert.match(r[2].result.url, /^data:image\/png;base64,/);
  assert.equal(r[3].error, undefined, JSON.stringify(r[3]));
  assert.match(r[4].error.message, /no per-window background coordinate input/);
  assert.match(r[5].error.message, /AT-SPI2/);
  checks.push("Linux Wayland: capability downgrade, compositor screenshot, foreground keyboard, explicit refusals");
}

// 4. Windows UI Automation path with a stubbed PowerShell.
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
  assert.match(r[1].result.text, /0 window, Mock Window/);
  assert.match(r[1].result.text, /1 button, OK/);
  assert.equal(r[2].error, undefined, JSON.stringify(r[2]));
  assert.equal(r[3].error, undefined, JSON.stringify(r[3]));
  assert.match(r[4].error.message, /background_unavailable/);
  checks.push("Windows: UI Automation tree, control-pattern actions, capability downgrade, paste refusal");
}

// Cleanup.
rmSync(tmp, { recursive: true, force: true });
console.log(JSON.stringify({
  passed: true,
  checks,
  unverified: [
    "ctypes Win32 calls (EnumWindows/SendInput/PrintWindow) require a real Windows host",
    "Powered UI Automation assemblies / WGC picker are Windows-only",
    "XDG portal dialogs, PipeWire frames, libei and AT-SPI buses require a real Linux desktop",
  ],
}, null, 2));
