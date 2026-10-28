import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, readFile, writeFile, copyFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { nativeRequest, closeHelper } from "../src/standalone-sky.mjs";

process.env.CODEX_CUA_ENABLE_TEST_HOOKS = "1";
const root = fileURLToPath(new URL("../", import.meta.url));
const directory = process.env.CUA_TEST_OUTPUT || await mkdtemp(path.join(tmpdir(), "cua-background-test-"));
const staging = await mkdtemp(path.join(tmpdir(), "cua-background-fixtures-"));
await mkdir(directory, { recursive: true });
const processes = [];
let fixtureSequence = 0;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function run(command, args) {
  const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  child.stdout.on("data", chunk => { output += chunk; });
  child.stderr.on("data", chunk => { output += chunk; });
  const code = await new Promise((resolve, reject) => { child.once("error", reject); child.once("close", resolve); });
  assert.equal(code, 0, output);
}
async function readObservation(kind) {
  try { return JSON.parse(await readFile(path.join(directory, `${kind}.json`), "utf8")); }
  catch { return null; }
}
async function observation(kind) {
  for (let i = 0; i < 300; i++) {
    const state = await readObservation(kind);
    if (state) return state;
    await delay(30);
  }
  throw new Error(`${kind} fixture did not become ready`);
}
async function fixture(kind) {
  const bundleID = `local.codex.cua.${kind}.${process.pid}.${++fixtureSequence}`;
  const app = path.join(staging, `${kind}.app`);
  const contents = path.join(app, "Contents");
  await mkdir(path.join(contents, "MacOS"), { recursive: true });
  const plist = `<?xml version="1.0"?><plist version="1.0"><dict><key>CFBundleExecutable</key><string>Fixture</string><key>CFBundleIdentifier</key><string>${bundleID}</string><key>CFBundleName</key><string>CUA ${kind}</string><key>CFBundlePackageType</key><string>APPL</string><key>NSHighResolutionCapable</key><true/></dict></plist>`;
  await writeFile(path.join(contents, "Info.plist"), plist);
  await copyFile(path.join(directory, "Fixture"), path.join(contents, "MacOS/Fixture"));
  await run("/usr/bin/codesign", ["--force", "--sign", "-", app]);
  const child = spawn(path.join(contents, "MacOS/Fixture"), [], { env: { ...process.env,
    CUA_FIXTURE_MODE: kind, CUA_FIXTURE_BACKGROUND: "1",
    CUA_FIXTURE_OBSERVATION: path.join(directory, `${kind}.json`),
    CUA_FIXTURE_CONTROL: path.join(directory, `${kind}.control`), CUA_FIXTURE_RESULT: path.join(directory, `${kind}-result.json`),
  }, stdio: ["ignore", "pipe", "pipe"] });
  let diagnostics = "";
  child.stdout.on("data", chunk => { diagnostics += chunk; });
  child.stderr.on("data", chunk => { diagnostics += chunk; });
  processes.push(child);
  for (let i = 0; i < 300; i++) {
    if (child.exitCode !== null) throw new Error(`${kind} fixture exited before publishing state: ${diagnostics}`);
    const state = await readObservation(kind);
    if (state?.pid === child.pid) return { ...state, bundleID };
    await delay(30);
  }
  throw new Error(`${kind} fixture did not publish its current process${diagnostics ? `: ${diagnostics}` : ""}`);
}

const client = new Client({ name: "background-fixture-verification", version: "1.0.0" });
const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(root, "src/cli.mjs"), "mcp"], stderr: "pipe" });
const text = result => result.content.filter(item => item.type === "text").map(item => item.text).join("\n");
let target;
let guard;
let started = false;
let app;
const checks = [];
const armGuard = async protectedPIDs => {
  const current = await observation("guard");
  assert(current.frontmostPID, "No frontmost application is available for background verification");
  assert.notEqual(current.frontmostPID, target.pid, "Target became frontmost before the preservation baseline");
  assert(!protectedPIDs.includes(current.frontmostPID), "Computer-use helper became frontmost before the preservation baseline");
  const watched = `${target.windowID} ${target.guardWindowID} ${guard.windowID}`;
  const command = `arm guard=${current.frontmostPID} protect=${protectedPIDs.join(",")} windows=${watched.replaceAll(" ", ",")}`;
  await writeFile(path.join(directory, "target.control"), command);
  await writeFile(path.join(directory, "guard.control"), command);
  await delay(150);
};
const call = async (action, params = {}) => {
  const result = await client.callTool({ name: "computer", arguments: { action, app, window_id: target.windowID, ...params } });
  assert.notEqual(result.isError, true, text(result));
  return result;
};
const index = (state, id) => {
  const line = state.split("\n").find(line => line.includes(`ID: ${id}`));
  assert(line, `Missing ${id}`);
  return Number(/^\s*(\d+)/.exec(line)[1]);
};
try {
  await run("/usr/bin/xcrun", ["swiftc", "-O", "-framework", "AppKit", path.join(root, "test/macos-fixture/Fixture.swift"), "-o", path.join(directory, "Fixture")]);
  target = await fixture("target");
  guard = await fixture("guard");
  app = target.bundleID;
  await client.connect(transport);
  started = true;
  const bootStatus = JSON.parse(text(await client.callTool({ name: "status", arguments: {} })));
  assert.equal(bootStatus.permissions.accessibility, true);
  assert.equal(bootStatus.permissions.screenRecording, true);
  await armGuard([target.pid, bootStatus.permissions.pid]);
  let state = text(await call("get_app_state"));
  assert.match(state, new RegExp(`Window ID: ${target.windowID}`));
  assert(!state.includes("foreground-guard-input"), "Snapshot contains a sibling window");
  checks.push("AX tree and screenshot bind to the exact requested native window");
  const boundApp = `${app}#window=${target.windowID}`;
  const jsClick = await client.callTool({ name: "js", arguments: { code:
    `var cuaPersistentProof = 41; await cua.computer.click({app:${JSON.stringify(boundApp)},element_index:${index(state, "verification-input")}}); nodeRepl.write(cuaPersistentProof);`,
  } });
  assert.notEqual(jsClick.isError, true, text(jsClick));
  assert.equal(text(jsClick), "41");
  await call("press_key", { key: "Super_L+a" });
  await call("type_text", { text: "background-input-verified" });
  state = text(await call("get_app_state"));
  assert.match(state, /Value: background-input-verified/);
  await call("click", { element_index: index(state, "verification-button") });
  state = text(await call("get_app_state"));
  assert.match(state, /Verified: background-input-verified/);
  checks.push("background indexed click, select-all, type and AX button action");
  assert.equal(text(await client.callTool({ name: "js", arguments: { code:
    "cuaPersistentProof += 1; nodeRepl.write(cuaPersistentProof);",
  } })), "42");
  checks.push("computer and persistent js share one helper, element state and JavaScript session");

  await call("click", { x: 150, y: 134 });
  await call("press_key", { key: "Super_L+a" });
  await call("type_text", { text: "background-pixel-verified" });
  await call("click", { x: 76, y: 184 });
  state = text(await call("get_app_state"));
  assert.match(state, /Verified: background-pixel-verified/);
  assert.equal(JSON.parse(await readFile(path.join(directory, "target-result.json"), "utf8")).text, "background-pixel-verified");
  checks.push("background coordinate click and independently verified fixture result");
  const scrollRefusal = await client.callTool({ name: "computer", arguments: {
    app, window_id: target.windowID, action: "scroll",
    element_index: index(state, "verification-scroll"), direction: "down", pages: 1,
  } });
  assert.equal(scrollRefusal.isError, true);
  assert.match(text(scrollRefusal), /background_unavailable.*AX page-scroll failed/);
  checks.push("unsupported background scroll refuses without global wheel input");
  await call("set_value", { element_index: index(state, "verification-input"), value: "same same" });
  state = text(await call("get_app_state"));
  const ambiguous = await client.callTool({ name: "computer", arguments: { app, window_id: target.windowID,
    action: "select_text", element_index: index(state, "verification-input"), text: "same" } });
  assert.equal(ambiguous.isError, true);
  assert.match(text(ambiguous), /exactly one match/);
  await call("select_text", { element_index: index(state, "verification-input"), text: "same", prefix: "same " });
  await call("type_text", { text: "selected" });
  state = text(await call("get_app_state"));
  assert.match(state, /Value: same selected/);
  checks.push("background set_value, ambiguous selection refusal and verified exact selection");
  await call("click", { element_index: index(state, "verification-button") });

  const visualStatus = JSON.parse(text(await client.callTool({ name: "status", arguments: {} })));
  assert.equal(visualStatus.permissions.cursor.visible, true);
  assert(visualStatus.permissions.cursor.moves >= 4);
  assert(visualStatus.permissions.cursor.frames > 40);
  const panelID = visualStatus.permissions.cursor.panelWindowID;
  await run("/usr/sbin/screencapture", ["-x", "-o", "-l", String(panelID), path.join(directory, "live-agent-cursor.png")]);
  checks.push("live agent overlay captured from its WindowServer window");

  for (const params of [{ action: "drag", from_x: 20, from_y: 20, to_x: 50, to_y: 50 },
                        { action: "paste", text: "must-not-paste" }, { action: "press_key", key: "Super_L+l" }]) {
    const result = await client.callTool({ name: "computer", arguments: { app, window_id: target.windowID, ...params } });
    assert.equal(result.isError, true);
    assert.match(text(result), /background_unavailable/);
  }
  checks.push("unverified drag, shared-clipboard paste and focus-changing shortcut refuse");
  const invalid = await client.callTool({ name: "computer", arguments: { app, window_id: target.windowID, action: "click", x: -10, y: 10 } });
  assert.equal(invalid.isError, true);
  checks.push("out-of-window coordinates refuse without global fallback");
  state = text(await call("get_app_state"));
  const staleIndex = index(state, "verification-input");
  await nativeRequest("test_move_window", { app, window_id: target.windowID, dx: 24, dy: 16 });
  const stale = await client.callTool({ name: "computer", arguments: {
    app, window_id: target.windowID, action: "click", element_index: staleIndex,
  } });
  assert.equal(stale.isError, true);
  assert.match(text(stale), /window_stale/);
  await nativeRequest("test_move_window", { app, window_id: target.windowID, dx: -24, dy: -16 });
  await call("get_app_state");
  checks.push("moved window invalidates its exact-window element snapshot");
  state = text(await call("get_app_state"));
  await call("click", { element_index: index(state, "verification-input") });
  const controller = new AbortController();
  const longAction = client.callTool({ name: "computer", arguments: {
    app, window_id: target.windowID, action: "press_key", key: "space", duration: 8,
  } }, { signal: controller.signal });
  await delay(300);
  controller.abort();
  await assert.rejects(longAction, /abort|cancel/i);
  await delay(1300);
  assert.notEqual((await client.callTool({ name: "js_reset", arguments: {} })).isError, true);
  state = text(await call("get_app_state"));
  await call("set_value", { element_index: index(state, "verification-input"), value: "cancel-cleanup-verified" });
  state = text(await call("get_app_state"));
  assert.match(state, /Value: cancel-cleanup-verified/);
  checks.push("aborted native action resets cleanly and leaves a fresh reusable helper");
  const screenshot = await call("screenshot");
  const png = Buffer.from(screenshot.content.find(item => item.type === "image").data, "base64");
  assert.equal(png.readUInt32BE(16), 520);
  await writeFile(path.join(directory, "verified-window.png"), png);
  const status = JSON.parse(text(await client.callTool({ name: "status", arguments: {} })));
  assert.equal(status.permissions.cursor.clickThrough, true);
  assert.equal(status.permissions.cursor.canBecomeKey, false);
  checks.push("agent overlay animated multiple frames, remains click-through and cannot become key");
  const cursorResult = await client.callTool({ name: "js", arguments: { code:
    `nodeRepl.write(JSON.stringify(await nodeRepl.rpc("sky",${JSON.stringify({ type: "execute", method: "cursorImage", args: [{}] })})));`,
  } });
  assert.notEqual(cursorResult.isError, true, text(cursorResult));
  const cursor = JSON.parse(text(cursorResult));
  await writeFile(path.join(directory, "agent-cursor.png"), Buffer.from(cursor.url.split(",")[1], "base64"));
  if (process.env.CUA_TEST_AGENT_COMMAND) {
    const marker = "agent-background-verified";
    const prompt = `Use the Skill tool to read open-codex-computer-use. Operate only the CUA target scratch app, bundle ID ${app}, native window_id ${target.windowID}. Keep it in the background. Read state, click verification-input, select all with Super_L+a, type exactly ${marker}, click Verify, and verify fresh state and a screenshot. Do not use shell tools or interact with other apps. Report the result.`;
    const agent = spawn(process.env.CUA_TEST_AGENT_COMMAND, ["-p", prompt, "--output-format", "stream-json", "--verbose",
      "--tools", "Skill", "--allowedTools", "Skill", "--strict-mcp-config", "--mcp-config", JSON.stringify({ mcpServers: {
        "codex-computer-use": { type: "stdio", command: path.resolve(root, "../computer-use"), args: ["mcp"] },
      } })], { cwd: path.resolve(root, "../.."), stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    let stderr = "";
    agent.stdout.on("data", chunk => { output += chunk; });
    agent.stderr.on("data", chunk => { stderr += chunk; });
    const timer = setTimeout(() => agent.kill("SIGTERM"), 240000);
    let code;
    try { code = await new Promise((resolve, reject) => { agent.once("error", reject); agent.once("close", resolve); }); }
    finally { clearTimeout(timer); }
    // Keep client-specific diagnostic material only in the caller's output directory.
    await writeFile(path.join(directory, "agent-raw.jsonl"), output);
    await writeFile(path.join(directory, "agent-stderr.log"), stderr);
    assert.equal(code, 0, stderr + output.slice(-2000));
    const rows = output.trim().split("\n").map(line => JSON.parse(line));
    const final = rows.findLast(row => row.type === "result");
    assert.equal(final?.is_error, false);
    assert.equal(final?.permission_denials?.length ?? 0, 0);
    const calls = rows.flatMap(row => row.type === "assistant" ? row.message?.content?.filter(item => item.type === "tool_use") ?? [] : []);
    assert(calls.some(item => item.name === "Skill" && item.input.skill === "open-codex-computer-use"));
    for (const action of ["click", "press_key", "type_text", "get_app_state", "screenshot"]) {
      assert(calls.some(item => item.name === "mcp__codex-computer-use__computer" && item.input.action === action), `Agent did not call ${action}`);
    }
    assert(!calls.some(item => /Bash|Write|Edit|PowerShell/.test(item.name)));
    assert.equal(JSON.parse(await readFile(path.join(directory, "target-result.json"), "utf8")).text, marker);
    const results = rows.flatMap(row => row.type === "user" ? row.message?.content?.filter(item => item.type === "tool_result") ?? [] : []);
    assert(results.some(item => JSON.stringify(item).includes(`Verified: ${marker}`)));
    assert(results.some(item => Array.isArray(item.content) && item.content.some(content => content.type === "image")));
    const agentScreenshot = await call("screenshot");
    const agentPng = Buffer.from(agentScreenshot.content.find(item => item.type === "image").data, "base64");
    await writeFile(path.join(directory, "agent-verified-window.png"), agentPng);
    checks.push("agent CLI loaded packaged skill, operated exact background window and received verified state/image");
    checks.push("agent test used only the skill/MCP, with no permission denials");
  }
  const externalBeforeFocusTest = await observation("guard");
  state = text(await call("get_app_state"));
  await call("click", { element_index: index(state, "verification-input") });
  const focusChangeAction = client.callTool({ name: "computer", arguments: {
    app, window_id: target.windowID, action: "press_key", key: "space", duration: 8,
  } });
  await delay(250);
  await nativeRequest("test_activate_app", { app, window_id: target.windowID });
  const interrupted = await focusChangeAction;
  assert.equal(interrupted.isError, true);
  assert.match(text(interrupted), /foreground_changed/);
  const foregroundRejected = await client.callTool({ name: "computer", arguments: {
    app, window_id: target.windowID, action: "get_app_state",
  } });
  assert.notEqual(foregroundRejected.isError, true, text(foregroundRejected));
  const foregroundAction = await client.callTool({ name: "computer", arguments: {
    app, window_id: target.windowID, action: "click", element_index: index(text(foregroundRejected), "verification-input"),
  } });
  assert.equal(foregroundAction.isError, true);
  assert.match(text(foregroundAction), /target_is_foreground/);
  await nativeRequest("test_activate_app", { app: String(externalBeforeFocusTest.frontmostPID) });
  await delay(250);
  await armGuard([target.pid, status.permissions.pid]);
  await call("get_app_state");
  checks.push("foreground changes stop input and frontmost targets are rejected");
  await delay(750);
  const targetAfter = await observation("target");
  const guardAfter = await observation("guard");
  assert(targetAfter.samples > 0);
  assert(guardAfter.samples > 50);
  for (const item of [targetAfter, guardAfter]) {
    assert.equal(item.focusViolations, 0, JSON.stringify(item));
    assert.equal(item.windowOrderViolations, 0, JSON.stringify(item));
    assert.equal(item.focusStateViolations, 0, JSON.stringify(item));
    if (item.externalFocusSamples === 0) assert.equal(item.pointerViolations, 0, JSON.stringify(item));
  }
  checks.push("continuous sampling: target and helper never stole foreground or key state");
  checks.push(guardAfter.externalFocusSamples === 0
    ? "physical pointer and fixture window order preserved"
    : `external foreground activity (${guardAfter.externalFocusSamples} samples) classified separately; window order preserved`);
  const report = { passed: true, recordedAt: new Date().toISOString(), checks,
    samples: { target: targetAfter.samples, guard: guardAfter.samples,
      externalFocus: guardAfter.externalFocusSamples, externalPointer: guardAfter.pointerViolations },
    cursor: { moves: visualStatus.permissions.cursor.moves, frames: visualStatus.permissions.cursor.frames },
    limitations: "Finite AppKit fixture; private APIs are version-sensitive. No browser, drag, paste, raw-pointer, or universal scroll parity claim." };
  await writeFile(path.join(directory, "result.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify({ ...report, output: directory }, null, 2));
} finally {
  if (started) await client.close();
  await closeHelper();
  for (const child of processes) {
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      await new Promise(resolve => child.once("close", resolve));
    }
  }
  await rm(staging, { recursive: true, force: true });
}
