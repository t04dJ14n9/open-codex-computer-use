import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { timeouts, clampTimeout, timeoutSummary } from "./timeouts.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const helperPath = process.env.CODEX_CUA_HELPER || path.join(root, "build/Codex Computer Use Standalone.app/Contents/MacOS/ComputerUse");
const methods = [
  "list_apps", "get_app_state", "click", "drag", "paste", "press_key",
  "scroll", "set_value", "select_text", "type_text", "perform_secondary_action",
  "permissionStatus", "cursorStatus", "cursorImage", "hideCursor",
  "test_move_window",
  "test_activate_app",
];
let child;
let sequence = 0;
const pending = new Map();

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
  if (!existsSync(helperPath)) throw new Error(`Standalone macOS helper is missing. Run npm run build:native in ${root}`);
  const processHandle = spawn(helperPath, [], { stdio: ["pipe", "pipe", "pipe"] });
  child = processHandle;
  let diagnostics = "";
  processHandle.stderr.on("data", (chunk) => { diagnostics = (diagnostics + chunk).slice(-4000); });
  createInterface({ input: processHandle.stdout }).on("line", (line) => {
    let message;
    try { message = JSON.parse(line); }
    catch { fail(new Error("Native helper returned invalid JSON"), processHandle); return; }
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    clearTimeout(request.timer);
    clearTimeout(request.cancelTimer);
    request.signal?.removeEventListener("abort", request.abort);
    if (message.error) request.reject(new Error(message.error.message || String(message.error)));
    else request.resolve(message.result);
  });
  processHandle.once("error", (error) => fail(error, processHandle));
  processHandle.once("exit", (code, signal) => {
    if (child === processHandle) child = null;
    fail(new Error(`Native helper exited (${signal || code}): ${diagnostics}`), processHandle);
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
  ensureHelper();
  const deadline = clampTimeout(timeoutMs ?? timeouts.nativeMs);
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    const reason = `Native ${method} call cancelled`;
    const abort = () => cancelRequest(id, reason);
    const timer = setTimeout(
      () => cancelRequest(id, `Native ${method} exceeded ${deadline} ms (configure CODEX_CUA_NATIVE_TIMEOUT_MS or pass timeout_ms)`),
      deadline,
    );
    const request = { resolve, reject, timer, cancelTimer: null, owner: child, signal, abort };
    pending.set(id, request);
    signal?.addEventListener("abort", abort, { once: true });
    child.stdin.write(JSON.stringify({ id, method, params }) + "\n", (error) => {
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

export async function handleRpc(request) {
  if (request.type === "setup") return { target: "mac", methods, timeouts: timeoutSummary() };
  if (request.type !== "execute" || !methods.includes(request.method)) throw new Error("Unsupported standalone computer operation");
  const params = request.args?.[0] ?? {};
  // A per-call `timeout_ms` travels inside the params object; the native
  // Swift helper ignores unknown params, and the bridge uses it as its
  // deadline instead of the configured default.
  const timeoutMs = request.timeout_ms ?? params.timeout_ms;
  return nativeRequest(request.method, params, { timeoutMs });
}

export async function closeHelper(reason = "Native helper closed") {
  if (!child) return;
  const handle = child;
  child = null;
  if (handle.stdin.writable && !handle.stdin.destroyed) {
    for (const id of pending.keys()) handle.stdin.write(JSON.stringify({ method: "cancel", params: { id } }) + "\n");
  }
  handle.stdin.end();
  fail(new Error(reason), handle);
  await new Promise((resolve) => {
    if (handle.exitCode !== null || handle.signalCode !== null) { resolve(); return; }
    const terminateTimer = setTimeout(() => handle.kill("SIGTERM"), 1000);
    const killTimer = setTimeout(() => { handle.kill("SIGKILL"); resolve(); }, 2500);
    handle.once("exit", () => {
      clearTimeout(terminateTimer);
      clearTimeout(killTimer);
      resolve();
    });
  });
}

if (process.env.CODEX_CUA_SERVICE_PROCESS === "1") {
  process.once("SIGTERM", () => {
    void closeHelper("Computer-use service stopping").finally(() => process.exit(0));
  });
}

process.once("exit", () => child?.kill());
