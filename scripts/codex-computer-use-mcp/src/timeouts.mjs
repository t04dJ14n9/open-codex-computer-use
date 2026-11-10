// Central timeout configuration for the reconstructed computer-use runtime.
//
// All layer deadlines derive from one place so slow Chromium-based apps
// (e.g. WeCom's ~2000-element AX tree, ~40 s) can be handled without editing
// source or rebuilding the ad-hoc-signed helper (which would invalidate TCC
// grants). Values are milliseconds, positive integers, clamped to sane bounds.
//
// Precedence for each layer: skill-specific env -> shared env -> master env ->
// default. Both `CODEX_CUA_*` (this skill) and `COMPUTER_USE_*` (the portable
// skill) prefixes are accepted so one setting can configure either runtime.

const MIN_MS = 1000;
const MAX_MS = 60 * 60 * 1000; // 1 hour hard ceiling

function readEnv(names) {
  for (const name of names) {
    const raw = process.env[name];
    if (raw !== undefined && raw !== "") return { name, raw };
  }
  return null;
}

function parseMs(names, fallback, { min = MIN_MS, max = MAX_MS } = {}) {
  const found = readEnv(names);
  if (!found) return fallback;
  const value = Number(found.raw);
  if (!Number.isFinite(value) || !Number.isInteger(value)) {
    process.stderr.write(`[computer-use] ${found.name} must be an integer number of ms; using ${fallback}\n`);
    return fallback;
  }
  if (value < min || value > max) {
    const clamped = Math.max(min, Math.min(max, value));
    process.stderr.write(`[computer-use] ${found.name}=${value} out of range ${min}..${max}; using ${clamped}\n`);
    return clamped;
  }
  return value;
}

function envNames(suffix) {
  return [`CODEX_CUA_${suffix}`, `COMPUTER_USE_${suffix}`];
}

const master = parseMs(envNames("TIMEOUT_MS"), 30_000);

export const timeouts = Object.freeze({
  /** Native helper request deadline (standalone-sky.mjs). */
  nativeMs: parseMs(envNames("NATIVE_TIMEOUT_MS"), master),
  /** Default JavaScript execution deadline (kernel-host.mjs / native-host.mjs). */
  jsMs: parseMs(envNames("JS_TIMEOUT_MS"), master),
  /** Upper bound accepted for a per-call `timeout_ms` on `js` / `computer`. */
  maxMs: parseMs(envNames("MAX_TIMEOUT_MS"), Math.max(600_000, master)),
  /** Short deadline for the `permissionStatus` probe in `status`. */
  statusMs: parseMs(envNames("STATUS_TIMEOUT_MS"), Math.min(10_000, master)),
  /** Grace period after a cancellation before the helper is closed. */
  cancelGraceMs: parseMs(envNames("CANCEL_GRACE_MS"), 1000, { min: 100, max: 30_000 }),
});

/** Clamp a caller-supplied per-call timeout to the configured ceiling. */
export function clampTimeout(value) {
  if (value === undefined || value === null) return timeouts.jsMs;
  // 100 ms floor matches the `js` tool schema (short deadlines are useful for
  // cancellation tests); `MIN_MS` only bounds configuration env values.
  return Math.max(100, Math.min(timeouts.maxMs, Math.round(Number(value))));
}

/** Human-readable form for the `status` tool. */
export function timeoutSummary() {
  return {
    nativeMs: timeouts.nativeMs,
    jsMs: timeouts.jsMs,
    maxMs: timeouts.maxMs,
    statusMs: timeouts.statusMs,
    cancelGraceMs: timeouts.cancelGraceMs,
    envVars: [
      "CODEX_CUA_TIMEOUT_MS", "CODEX_CUA_NATIVE_TIMEOUT_MS", "CODEX_CUA_JS_TIMEOUT_MS",
      "CODEX_CUA_MAX_TIMEOUT_MS", "CODEX_CUA_STATUS_TIMEOUT_MS", "CODEX_CUA_CANCEL_GRACE_MS",
      "COMPUTER_USE_TIMEOUT_MS (shared alias)",
    ],
  };
}

/** Env keys that must reach the node_repl kernel worker. */
export const TIMEOUT_ENV_KEYS = [
  "CODEX_CUA_TIMEOUT_MS", "CODEX_CUA_NATIVE_TIMEOUT_MS", "CODEX_CUA_JS_TIMEOUT_MS",
  "CODEX_CUA_MAX_TIMEOUT_MS", "CODEX_CUA_STATUS_TIMEOUT_MS", "CODEX_CUA_CANCEL_GRACE_MS",
  "COMPUTER_USE_TIMEOUT_MS", "COMPUTER_USE_NATIVE_TIMEOUT_MS", "COMPUTER_USE_JS_TIMEOUT_MS",
  "COMPUTER_USE_MAX_TIMEOUT_MS", "COMPUTER_USE_STATUS_TIMEOUT_MS", "COMPUTER_USE_CANCEL_GRACE_MS",
];
