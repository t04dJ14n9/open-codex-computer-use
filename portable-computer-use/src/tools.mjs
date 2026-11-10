import { z } from "zod";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { nativeRequest } from "./helper.mjs";
import { runtimeStatus } from "./config.mjs";

export const computerActions = [
  "list_apps", "get_app_state", "screenshot", "click", "press_key", "type_text",
  "paste", "scroll", "drag", "set_value", "select_text", "perform_secondary_action",
];

export const computerSchema = z.object({
  action: z.enum(computerActions),
  app: z.string().optional().describe("App name, bundle ID, or absolute .app path; required except list_apps"),
  window_id: z.number().int().positive().max(4294967295).optional().describe("Exact window ID from list_apps"),
  element_index: z.number().int().optional().describe("Number from the latest accessibility tree"),
  x: z.number().optional(), y: z.number().optional(),
  text: z.string().optional(), value: z.string().optional(), key: z.string().optional(),
  direction: z.enum(["up", "down", "left", "right"]).optional(),
  pages: z.number().positive().optional(),
  mouse_button: z.enum(["left", "right", "middle"]).optional(),
  click_count: z.number().int().positive().optional(), duration: z.number().nonnegative().optional(),
  from_x: z.number().optional(), from_y: z.number().optional(),
  to_x: z.number().optional(), to_y: z.number().optional(),
  format: z.enum(["text", "md", "html"]).optional(),
  prefix: z.string().optional(), suffix: z.string().optional(),
  selection_type: z.enum(["text", "cursor_before", "cursor_after"]).optional(),
  secondary_action: z.string().optional().describe("Exact secondary action name from the tree"),
  disableDiff: z.boolean().optional(),
  allow_fullscreen: z.boolean().optional().describe("Explicitly permit a full-screen screenshot when the backend cannot scope capture to one window (Wayland). Without it such requests are refused."),
});

export const jsSchema = z.object({
  code: z.string(),
  title: z.string().optional(),
  timeout_ms: z.number().int().min(100).max(120000).optional(),
});

export const descriptions = {
  computer: "Read and operate macOS, Windows and Linux applications through the platform helper. list_apps lists apps; get_app_state returns numbered accessibility text; screenshot returns a window image. Other actions operate the named app using fresh element_index values or window-screenshot coordinates. Use window_id from list_apps for exact-window binding (required on Windows/X11 input and screenshots; a bare app name is refused rather than sent to the focused window). On macOS input is background-only: the target is never activated and the physical pointer is never driven. On Windows input is foreground/global; on Linux X11 it is window-targeted synthetic input; on Wayland per-window input is unavailable and returns explicit refusals. Wayland cannot scope a screenshot to one window: pass allow_fullscreen=true to explicitly permit a tagged full-screen capture (which may include other apps/notifications). macOS Accessibility and Screen Recording permissions are required.",
  js: "Run JavaScript in a persistent local runtime. `cua` and `nodeRepl` are already loaded: await cua.listApps(), var app = await cua.getApp(\"TextEdit\"), await app.getAXState(), await app.getScreenshot(), app.click(index or [x,y]), app.typeText(text), app.pressKey(key), app.setValue(index, value). Use nodeRepl.write(value) for text and await nodeRepl.emitImage(bytesOrUrl) for images. Variables declared with var/let/const at the top level persist until js_reset; nodeRepl.state is also available. Dynamic import() is supported. Batch predictable actions with the resulting state read in one call.",
  js_reset: "Reset persistent JavaScript bindings and the runtime context.",
  status: "Inspect runtime paths, backend and macOS permission state without interacting with apps.",
};

export function textResult(value) {
  return { content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }] };
}

async function imageResult(url) {
  if (!url) throw new Error("Screenshot unavailable; check Screen Recording permission");
  let data;
  let mimeType = "image/png";
  if (typeof url === "string" && url.startsWith("data:")) {
    const match = /^data:([^;,]+);base64,(.*)$/s.exec(url);
    if (!match) throw new Error("Unsupported data URL");
    mimeType = match[1];
    data = match[2];
  } else {
    const location = typeof url === "string" && url.startsWith("file://") ? fileURLToPath(url) : url;
    data = (await readFile(location)).toString("base64");
  }
  return { content: [{ type: "image", data, mimeType }] };
}

function appSpec(input) {
  return input.window_id ? `${input.app}#window=${input.window_id}` : input.app;
}

export function validateComputerInput(input) {
  if (input.action !== "list_apps" && (!input.app || !input.app.trim())) throw new Error("app is required");
  const needsTarget = ["click", "set_value", "select_text", "perform_secondary_action", "scroll"];
  if (needsTarget.includes(input.action) && input.element_index === undefined && input.x === undefined) {
    // Coordinate-only clicks still require x; keep the helper's own precise errors.
    if (input.action === "click" && input.x === undefined) throw new Error("x is required");
  }
}

export async function callTool(runtime, name, input, options = {}) {
  if (name === "status") {
    const status = runtimeStatus();
    try { status.permissions = await nativeRequest("permissionStatus"); }
    catch (error) { status.permissionError = error.message; }
    return textResult(status);
  }
  if (name === "js_reset") {
    runtime.reset();
    return textResult("JavaScript session reset");
  }
  if (name === "js") {
    const parsed = jsSchema.parse(input);
    return runtime.execute(parsed.code, { timeoutMs: parsed.timeout_ms ?? 120000, signal: options.signal });
  }
  if (name !== "computer") throw new Error(`Unknown tool: ${name}`);
  const parsed = computerSchema.parse(input);
  validateComputerInput(parsed);
  const spec = appSpec(parsed);

  if (parsed.action === "list_apps") {
    return textResult(JSON.stringify(await nativeRequest("list_apps"), null, 2));
  }
  if (parsed.action === "get_app_state") {
    const state = await nativeRequest("get_app_state", { app: spec, disableDiff: parsed.disableDiff ?? true });
    return textResult(state.text);
  }
  if (parsed.action === "screenshot") {
    const params = { app: spec };
    if (parsed.allow_fullscreen) params.allow_fullscreen = true;
    const result = await nativeRequest("screenshot", params);
    const image = await imageResult(result?.url);
    if (result?.scope === "full-screen") {
      image.content.push({ type: "text", text: "Warning: full-screen capture (may include other applications and notifications); no window-scoped capture is available on this backend." });
    }
    return image;
  }

  const { action, app, window_id, secondary_action, ...params } = parsed;
  params.app = spec;
  if (action === "paste") params.format ??= "text";
  if (action === "perform_secondary_action") params.action = secondary_action;
  await nativeRequest(action, params, { signal: options.signal });
  return textResult("Done");
}
