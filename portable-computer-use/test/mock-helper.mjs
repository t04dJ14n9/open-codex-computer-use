#!/usr/bin/env node
// A contract-compliant fake native helper. It exists so the platform-neutral
// JS/MCP layers can be tested on any OS without a real Windows/Wayland helper.
// See porting/BACKEND-CONTRACT.md.
import { createInterface } from "node:readline";

const PNG_1X1 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==";
const state = {
  accessibility: true,
  screenRecording: true,
  backgroundAvailable: false,
  globalInput: false,
  inputMode: "foreground-only",
  helper: "mock-helper",
  missingSymbols: [],
  pid: process.pid,
  windowTargetedInput: false,
  axTree: true,
  screenshot: true,
  consentRequired: true,
  cursor: { enabled: true, visible: false, phase: "hidden", moves: 0, frames: 0, clickThrough: true, canBecomeKey: false, panelWindowID: 0, point: null, targetWindowID: null },
};
const apps = [{
  id: "com.example.Mock",
  displayName: "Mock App",
  isRunning: true,
  pid: 4242,
  windows: [{ id: 7, title: "Mock Window", app: "com.example.Mock#window=7" }],
}];
const tree = "0 window, Mock Window, ID: MockWindow, Actions: AXRaise\n\t1 button, OK";

const results = {
  permissionStatus: () => ({ ...state }),
  requestPermissions: () => ({ ...state }),
  list_apps: () => apps,
  get_app_state: params => ({
    app: params.app ?? "com.example.Mock#window=7",
    text: tree,
    screenshot: { url: `data:image/png;base64,${PNG_1X1}` },
  }),
  screenshot: params => params?.allow_fullscreen
    ? { url: `data:image/png;base64,${PNG_1X1}`, scope: "full-screen" }
    : { url: `data:image/png;base64,${PNG_1X1}`, scope: "window" },
  click: () => null,
  drag: () => null,
  paste: () => null,
  press_key: () => null,
  scroll: () => null,
  set_value: () => null,
  select_text: () => null,
  type_text: () => null,
  perform_secondary_action: () => null,
  cursorStatus: () => state.cursor,
  cursorImage: () => ({ url: `data:image/png;base64,${PNG_1X1}` }),
  hideCursor: () => null,
  test_move_window: () => null,
  test_activate_app: () => null,
};

const rl = createInterface({ input: process.stdin });
rl.on("line", line => {
  let message;
  try { message = JSON.parse(line); } catch { return; }
  if (message.method === "cancel") return;
  const id = message.id;
  if (typeof id !== "number") return;
  const handler = results[message.method];
  const response = handler
    ? { id, result: handler(message.params ?? {}) }
    : { id, error: { message: `Unsupported helper operation: ${message.method}` } };
  process.stdout.write(JSON.stringify(response) + "\n");
});
