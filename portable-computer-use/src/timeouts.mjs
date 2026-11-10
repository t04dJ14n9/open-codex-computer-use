// Central timeout configuration for the portable computer-use helper bridge.
// Shares the same env names as the reconstructed skill so one setting can
// configure either runtime. Values are milliseconds, positive integers.
const MIN_MS = 1000;
const MAX_MS = 60 * 60 * 1000;

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
    process.stderr.write(`[portable-computer-use] ${found.name} must be an integer number of ms; using ${fallback}\n`);
    return fallback;
  }
  if (value < min || value > max) {
    const clamped = Math.max(min, Math.min(max, value));
    process.stderr.write(`[portable-computer-use] ${found.name}=${value} out of range ${min}..${max}; using ${clamped}\n`);
    return clamped;
  }
  return value;
}

function envNames(suffix) {
  return [`COMPUTER_USE_${suffix}`, `CODEX_CUA_${suffix}`];
}

const master = parseMs(envNames("TIMEOUT_MS"), 30_000);

export const timeouts = Object.freeze({
  nativeMs: parseMs(envNames("NATIVE_TIMEOUT_MS"), master),
  jsMs: parseMs(envNames("JS_TIMEOUT_MS"), master),
  maxMs: parseMs(envNames("MAX_TIMEOUT_MS"), Math.max(600_000, master)),
  statusMs: parseMs(envNames("STATUS_TIMEOUT_MS"), Math.min(10_000, master)),
  cancelGraceMs: parseMs(envNames("CANCEL_GRACE_MS"), 1000, { min: 100, max: 30_000 }),
});

export function clampTimeout(value) {
  if (value === undefined || value === null) return timeouts.jsMs;
  // 100 ms floor matches the `js` tool schema (short deadlines are useful for
  // cancellation tests); `MIN_MS` only bounds configuration env values.
  return Math.max(100, Math.min(timeouts.maxMs, Math.round(Number(value))));
}

export function timeoutSummary() {
  return {
    nativeMs: timeouts.nativeMs,
    jsMs: timeouts.jsMs,
    maxMs: timeouts.maxMs,
    statusMs: timeouts.statusMs,
    cancelGraceMs: timeouts.cancelGraceMs,
    envVars: [
      "COMPUTER_USE_TIMEOUT_MS", "COMPUTER_USE_NATIVE_TIMEOUT_MS",
      "COMPUTER_USE_JS_TIMEOUT_MS", "COMPUTER_USE_MAX_TIMEOUT_MS",
      "COMPUTER_USE_STATUS_TIMEOUT_MS", "COMPUTER_USE_CANCEL_GRACE_MS",
      "CODEX_CUA_TIMEOUT_MS (shared alias)",
    ],
  };
}
