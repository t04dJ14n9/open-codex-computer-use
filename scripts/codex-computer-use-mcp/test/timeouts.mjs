#!/usr/bin/env node
// Verifies the configurable timeouts without talking to the native helper.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configModule = path.join(root, "src/timeouts.mjs");
const node = process.execPath;

function configWith(env = {}) {
  const result = spawnSync(node, ["-e", "import(process.argv[1]).then(m=>process.stdout.write(JSON.stringify({t:m.timeouts,s:m.timeoutSummary(),c:m.clampTimeout(undefined),clamp:m.clampTimeout(123456789),small:m.clampTimeout(200)})))", configModule], {
    encoding: "utf8",
    env: { ...process.env, ...env },
    // Clear all timeout env vars so host configuration cannot leak in.
    ...(Object.keys(env).length === 0 ? {} : {}),
  });
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout);
}

const checks = [];

// 1. Defaults (clear every timeout env var that might be set in the host).
const cleanEnv = Object.fromEntries(
  Object.keys(process.env).filter(k => /^(CODEX_CUA|COMPUTER_USE)_/.test(k) && /TIMEOUT|CANCEL_GRACE/.test(k)).map(k => [k, ""]),
);
{
  const d = configWith(cleanEnv);
  assert.deepEqual(d.t, { nativeMs: 30000, jsMs: 30000, maxMs: 600000, statusMs: 10000, cancelGraceMs: 1000 });
  assert.equal(d.c, 30000);
  assert.equal(d.clamp, 600000, "per-call timeout clamped to maxMs");
  assert.equal(d.small, 200, "short deadline preserved for cancellation tests");
  checks.push("defaults: 30 s native/JS, 10 s status, 1 s cancel grace; clamping bounds");
}

// 2. Master env var raises every layer at once.
{
  const d = configWith({ ...cleanEnv, CODEX_CUA_TIMEOUT_MS: "120000" });
  assert.equal(d.t.nativeMs, 120000);
  assert.equal(d.t.jsMs, 120000);
  assert.equal(d.t.statusMs, 10000, "status stays short by default");
  checks.push("CODEX_CUA_TIMEOUT_MS=120000 raises native + JS together");
}

// 3. Layer-specific overrides and shared alias.
{
  const d = configWith({
    ...cleanEnv,
    COMPUTER_USE_TIMEOUT_MS: "90000",
    CODEX_CUA_NATIVE_TIMEOUT_MS: "150000",
    CODEX_CUA_JS_TIMEOUT_MS: "80000",
    CODEX_CUA_STATUS_TIMEOUT_MS: "20000",
    CODEX_CUA_CANCEL_GRACE_MS: "2500",
    CODEX_CUA_MAX_TIMEOUT_MS: "300000",
  });
  assert.equal(d.t.nativeMs, 150000);
  assert.equal(d.t.jsMs, 80000);
  assert.equal(d.t.statusMs, 20000);
  assert.equal(d.t.cancelGraceMs, 2500);
  assert.equal(d.t.maxMs, 300000);
  assert.equal(d.clamp, 300000);
  checks.push("per-layer env overrides win over the shared master alias");
}

// 4. Invalid / out-of-range values are clamped, not fatal.
{
  const r = spawnSync(node, ["-e", "import(process.argv[1]).then(m=>process.stdout.write(JSON.stringify(m.timeouts)))", configModule], {
    encoding: "utf8",
    env: { ...process.env, ...cleanEnv, CODEX_CUA_TIMEOUT_MS: "not-a-number", CODEX_CUA_MAX_TIMEOUT_MS: "999999999" },
  });
  assert.equal(r.status, 0, r.stderr);
  const t = JSON.parse(r.stdout);
  assert.equal(t.nativeMs, 30000, "non-integer falls back to default");
  assert.equal(t.maxMs, 3600000, "out-of-range clamped to 1 h ceiling");
  assert.match(r.stderr, /must be an integer|out of range/);
  checks.push("invalid env values fall back or clamp with a stderr warning");
}

// 5. The generated `computer` code carries timeout_ms into native RPC params.
{
  const result = spawnSync(node, ["-e", `
    import { computerCode, computerSchema, jsSchema } from ${JSON.stringify(path.join(root, "src/tools.mjs"))};
    const code = computerCode({ action: "get_app_state", app: "WeCom", window_id: 17498 }, 120000);
    process.stdout.write(JSON.stringify({ code, hasTimeout: code.includes('"timeout_ms":120000'),
      computerAt: computerSchema.safeParse({ action: "list_apps", timeout_ms: 600000 }).success,
      computerAbove: computerSchema.safeParse({ action: "list_apps", timeout_ms: 600001 }).success,
      jsSmall: jsSchema.safeParse({ code: "1", timeout_ms: 200 }).success }));
  `], { encoding: "utf8", env: { ...process.env, ...cleanEnv } });
  assert.equal(result.status, 0, result.stderr);
  const out = JSON.parse(result.stdout);
  assert.equal(out.hasTimeout, true, "computerCode must pass timeout_ms to the native bridge");
  assert.equal(out.computerAt, true);
  assert.equal(out.computerAbove, false);
  assert.equal(out.jsSmall, true);
  checks.push("computerCode injects timeout_ms; both schemas honor maxMs via safeParse");
}

// 6. status exposes the effective config.
{
  const file = path.join(root, "src/config.mjs");
  const r = spawnSync(node, ["-e", `import(${JSON.stringify(file)}).then(m=>process.stdout.write(JSON.stringify(m.runtimeStatus().timeouts)))`,], {
    encoding: "utf8", env: { ...process.env, ...cleanEnv, CODEX_CUA_TIMEOUT_MS: "45000" },
  });
  assert.equal(r.status, 0, r.stderr);
  const s = JSON.parse(r.stdout);
  assert.equal(s.nativeMs, 45000);
  assert(Array.isArray(s.envVars) && s.envVars.length > 0);
  checks.push("runtimeStatus() reports effective timeouts and env var names");
}

console.log(JSON.stringify({ passed: true, checks }, null, 2));
