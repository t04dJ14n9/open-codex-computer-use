// JSON-lines bridge to the platform helper (macOS binary or Windows/Linux
// Python script). This is a plain local subprocess; there is no signed
// supervisor, no XPC service and no socket.
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { helperPath, root, helperSpec } from "./config.mjs";
import { timeouts, clampTimeout } from "./timeouts.mjs";

export const METHODS = [
  "list_apps", "get_app_state", "screenshot", "click", "drag", "paste",
  "press_key", "scroll", "set_value", "select_text", "type_text",
  "perform_secondary_action", "permissionStatus", "requestPermissions",
  "cursorStatus", "cursorImage", "hideCursor",
  "test_move_window", "test_activate_app",
];

let child;
let sequence = 0;
const pending = new Map();

// The bundled binary predates this skill's neutral naming. Rewrite its two
// legacy permission strings so callers never see a product-specific name.
function normalize(message) {
  return String(message).replaceAll("Codex Computer Use Standalone", "the bundled Computer Use Helper");
}

function sendCancel(id) {
  if (!child?.stdin.writable || child.stdin.destroyed) return;
  child.stdin.write(JSON.stringify({ method: "cancel", params: { id } }) + "\n");
}

function cancelRequest(id, reason) {
  const request = pending.get(id);
  if (!request || request.cancelTimer) return;
  sendCancel(id);
  request.cancelTimer = setTimeout(() => { void closeHelper(reason); }, timeouts.cancelGraceMs);
}

function ensureHelper() {
  if (child) return;
  if (!helperPath || !existsSync(helperPath) || !helperSpec) {
    throw new Error(
      `No native helper is available for ${process.platform} (${helperPath ?? "no candidate"}). ` +
      "On macOS rebuild with `node scripts/build-native.mjs`; on Windows/Linux run `node scripts/build-cross-platform.mjs`; see porting/PORTING-RESEARCH.md."
    );
  }
  // macOS ships a native binary; Windows/Linux ship a Python script run by the
  // platform interpreter. `helperSpec` carries { command, args } for both.
  const handle = spawn(helperSpec.command, helperSpec.args, { stdio: ["pipe", "pipe", "pipe"] });
  child = handle;
  let diagnostics = "";
  handle.stderr.on("data", chunk => { diagnostics = (diagnostics + chunk).slice(-4000); });
  createInterface({ input: handle.stdout }).on("line", line => {
    let message;
    try { message = JSON.parse(line); }
    catch { fail(new Error("Helper returned invalid JSON"), handle); return; }
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    clearTimeout(request.cancelTimer);
    request.signal?.removeEventListener("abort", request.abort);
    if (message.error) request.reject(new Error(normalize(message.error.message || message.error)));
    else request.resolve(message.result);
  });
  handle.once("error", error => fail(error, handle));
  handle.once("exit", (code, signal) => {
    if (child === handle) child = null;
    fail(new Error(`Helper exited (${signal || code}): ${diagnostics}`), handle);
  });
}

function fail(error, owner) {
  for (const [id, request] of pending) {
    if (owner && request.owner !== owner) continue;
    clearTimeout(request.timer);
    clearTimeout(request.cancelTimer);
    request.signal?.removeEventListener("abort", request.abort);
    request.reject(error);
    pending.delete(id);
  }
}

export function nativeRequest(method, params = {}, { signal, timeoutMs } = {}) {
  if (signal?.aborted) return Promise.reject(new Error("Native call cancelled"));
  if (!METHODS.includes(method)) return Promise.reject(new Error(`Unsupported helper operation: ${method}`));
  ensureHelper();
  const deadline = clampTimeout(timeoutMs ?? params.timeout_ms ?? timeouts.nativeMs);
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const abort = () => cancelRequest(id, `Native ${method} call cancelled`);
    const timer = setTimeout(
      () => cancelRequest(id, `Native ${method} exceeded ${deadline} ms (configure COMPUTER_USE_TIMEOUT_MS or pass timeout_ms)`),
      deadline,
    );
    const request = { resolve, reject, timer, cancelTimer: null, owner: child, signal, abort };
    pending.set(id, request);
    signal?.addEventListener("abort", abort, { once: true });
    child.stdin.write(JSON.stringify({ id, method, params }) + "\n", error => {
      if (error) {
        pending.delete(id);
        clearTimeout(timer);
        clearTimeout(request.cancelTimer);
        signal?.removeEventListener("abort", abort);
        reject(error);
      }
    });
  });
}

export async function closeHelper(reason = "Helper closed") {
  if (!child) return;
  const handle = child;
  child = null;
  if (handle.stdin.writable && !handle.stdin.destroyed) {
    for (const id of pending.keys()) handle.stdin.write(JSON.stringify({ method: "cancel", params: { id } }) + "\n");
  }
  handle.stdin.end();
  fail(new Error(reason), handle);
  await new Promise(resolve => {
    if (handle.exitCode !== null || handle.signalCode !== null) { resolve(); return; }
    const terminateTimer = setTimeout(() => handle.kill("SIGTERM"), 1000);
    const killTimer = setTimeout(() => { handle.kill("SIGKILL"); resolve(); }, 2500);
    handle.once("exit", () => { clearTimeout(terminateTimer); clearTimeout(killTimer); resolve(); });
  });
}

process.once("exit", () => child?.kill());
