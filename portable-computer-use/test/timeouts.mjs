#!/usr/bin/env node
// Verifies the configurable timeouts in the portable skill without a helper.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mod = path.join(root, "src/timeouts.mjs");
const node = process.execPath;
const cleanEnv = Object.fromEntries(
  Object.keys(process.env).filter(k => /^(CODEX_CUA|COMPUTER_USE)_/.test(k) && /TIMEOUT|CANCEL_GRACE/.test(k)).map(k => [k, ""]),
);

function configWith(env) {
  const r = spawnSync(node, ["-e", "import(process.argv[1]).then(m=>process.stdout.write(JSON.stringify({t:m.timeouts,s:m.timeoutSummary(),small:m.clampTimeout(200),huge:m.clampTimeout(999999999)})))", mod], {
    encoding: "utf8", env: { ...process.env, ...cleanEnv, ...env },
  });
  assert.equal(r.status, 0, r.stderr);
  return JSON.parse(r.stdout);
}

const checks = [];

{
  const d = configWith({});
  assert.deepEqual(d.t, { nativeMs: 30000, jsMs: 30000, maxMs: 600000, statusMs: 10000, cancelGraceMs: 1000 });
  assert.equal(d.small, 200, "200 ms watchdog deadline preserved");
  assert.equal(d.huge, 600000);
  checks.push("defaults + clamping (30 s native/JS, 10 s status, 200 ms floor)");
}
{
  const d = configWith({ COMPUTER_USE_TIMEOUT_MS: "120000" });
  assert.equal(d.t.nativeMs, 120000);
  assert.equal(d.t.jsMs, 120000);
  checks.push("COMPUTER_USE_TIMEOUT_MS=120000 raises native + JS");
}
{
  const d = configWith({
    COMPUTER_USE_NATIVE_TIMEOUT_MS: "150000", COMPUTER_USE_JS_TIMEOUT_MS: "80000",
    COMPUTER_USE_STATUS_TIMEOUT_MS: "20000", COMPUTER_USE_CANCEL_GRACE_MS: "2000",
    COMPUTER_USE_MAX_TIMEOUT_MS: "300000",
  });
  assert.equal(d.t.nativeMs, 150000);
  assert.equal(d.t.jsMs, 80000);
  assert.equal(d.t.statusMs, 20000);
  assert.equal(d.t.cancelGraceMs, 2000);
  assert.equal(d.t.maxMs, 300000);
  checks.push("per-layer overrides + shared CODEX_CUA alias precedence");
}
{
  const file = path.join(root, "src/config.mjs");
  const r = spawnSync(node, ["-e", `import(${JSON.stringify(file)}).then(m=>process.stdout.write(JSON.stringify(m.runtimeStatus().timeouts)))`], {
    encoding: "utf8", env: { ...process.env, ...cleanEnv, COMPUTER_USE_TIMEOUT_MS: "45000" },
  });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(JSON.parse(r.stdout).nativeMs, 45000);
  checks.push("runtimeStatus() exposes effective timeouts");
}
{
  const file = path.join(root, "src/tools.mjs");
  const r = spawnSync(node, ["-e", `import(${JSON.stringify(file)}).then(m=>process.stdout.write(JSON.stringify({
    cAbove: m.computerSchema.safeParse({action:"list_apps",timeout_ms:240001}).success,
    cAt: m.computerSchema.safeParse({action:"list_apps",timeout_ms:240000}).success,
    jAbove: m.jsSchema.safeParse({code:"1",timeout_ms:240001}).success,
    jAt: m.jsSchema.safeParse({code:"1",timeout_ms:240000}).success,
    jSmall: m.jsSchema.safeParse({code:"1",timeout_ms:200}).success,
  })))`], {
    encoding: "utf8", env: { ...process.env, ...cleanEnv, COMPUTER_USE_MAX_TIMEOUT_MS: "240000" },
  });
  assert.equal(r.status, 0, r.stderr);
  const v = JSON.parse(r.stdout);
  assert.equal(v.cAt, true);
  assert.equal(v.cAbove, false);
  assert.equal(v.jAt, true);
  assert.equal(v.jAbove, false);
  assert.equal(v.jSmall, true, "200 ms still accepted for watchdog tests");
  checks.push("both tool schemas honor COMPUTER_USE_MAX_TIMEOUT_MS via safeParse");
}

console.log(JSON.stringify({ passed: true, checks }, null, 2));
