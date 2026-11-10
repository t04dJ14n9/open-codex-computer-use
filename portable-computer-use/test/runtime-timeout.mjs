#!/usr/bin/env node
// Regression test for review finding: a synchronous `while(true){}` must not
// block the MCP process. `runInContext` must carry a VM watchdog timeout so
// the call errors promptly and the runtime stays usable for later calls.
import assert from "node:assert/strict";
import { createRuntime } from "../src/runtime.mjs";

const checks = [];
const runtime = createRuntime();

// 1. Plain synchronous infinite loop is interrupted by the VM watchdog.
{
  const started = Date.now();
  const result = await runtime.execute("while(true){}", { timeoutMs: 200 });
  const elapsed = Date.now() - started;
  assert.equal(result.isError, true, "infinite loop must return an error result");
  assert.match(result.content[0].text, /exceeded 200 ms|timed out/i);
  assert(elapsed < 4000, `should be interrupted promptly, took ${elapsed} ms`);
  checks.push(`synchronous infinite loop interrupted in ${elapsed} ms`);
}

// 2. Runtime still responsive after the timeout (status / reset semantics).
{
  const ok = await runtime.execute("nodeRepl.write(1 + 1)", { timeoutMs: 5000 });
  assert.equal(ok.isError, undefined, "runtime must remain usable");
  assert.equal(ok.content[0].text.trim(), "2");
  runtime.reset();
  const after = await runtime.execute("var x = 5; nodeRepl.write(x);", { timeoutMs: 5000 });
  assert.equal(after.isError, undefined);
  assert.equal(after.content[0].text.trim(), "5");
  checks.push("runtime and reset remain responsive after a VM timeout");
}

// 3. Normal async host awaits still resolve (VM timeout must not break them).
{
  const result = await runtime.execute(
    'var v = await Promise.resolve(41); nodeRepl.write(v + 1);',
    { timeoutMs: 5000 },
  );
  assert.equal(result.isError, undefined, "async await must not be broken");
  assert.equal(result.content[0].text.trim(), "42");
  checks.push("normal async await still resolves");
}

// 4. A generous timeout does not fire prematurely for legitimate work.
{
  const started = Date.now();
  const result = await runtime.execute(
    'var n = 0; while (n < 200000) { n += 1; } nodeRepl.write(n);',
    { timeoutMs: 10000 },
  );
  assert.equal(result.isError, undefined);
  assert.equal(result.content[0].text.trim(), "200000");
  assert(Date.now() - started < 10000);
  checks.push("legitimate synchronous work is not cut short");
}

console.log(JSON.stringify({
  passed: true,
  checks,
  limitation: "An infinite loop that starts AFTER an `await` runs in a microtask outside runInContext; Node's VM watchdog cannot interrupt it. See README/SKILL limitations.",
}, null, 2));
