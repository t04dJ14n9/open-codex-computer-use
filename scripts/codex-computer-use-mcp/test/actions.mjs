import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { packageRoot } from "../src/config.mjs";

const target = "local.codex.cua.verification";
const client = new Client({ name: "codex-cua-action-verification", version: "1.0.0" });
const transport = new StdioClientTransport({ command: process.execPath, args: [path.join(packageRoot, "src/cli.mjs")], stderr: "pipe" });
const checks = [];
const text = (r) => r.content.filter((c) => c.type === "text").map((c) => c.text).join("\n");
const call = async (action, params = {}) => {
  const r = await client.callTool({ name: "computer", arguments: { app: target, action, ...params } });
  assert.notEqual(r.isError, true, text(r));
  return r;
};
const state = async () => text(await call("get_app_state"));
const element = (s, id) => {
  const line = s.split("\n").find((line) => line.includes(`ID: ${id}`));
  assert(line, `Missing fixture element: ${id}`);
  return Number(/^\s*(\d+)/.exec(line)[1]);
};
try {
  await client.connect(transport);
  let s = await state();
  await call("click", { element_index: element(s, "verification-input") });
  await call("press_key", { key: "Super_L+a" });
  await call("type_text", { text: "prefix replace suffix" });
  s = await state();
  assert.match(s, /Value: prefix replace suffix/);
  checks.push("targeted key chord and Unicode text entry");

  await call("select_text", { element_index: element(s, "verification-input"), text: "replace", prefix: "prefix ", suffix: " suffix" });
  await call("type_text", { text: "selected" });
  s = await state();
  assert.match(s, /Value: prefix selected suffix/);
  checks.push("text selection with prefix/suffix and replacement");

  await call("set_value", { element_index: element(s, "verification-input"), value: "set-value-verified" });
  s = await state();
  assert.match(s, /Value: set-value-verified/);
  checks.push("accessibility set_value");

  await call("click", { element_index: element(s, "verification-input") });
  await call("press_key", { key: "Super_L+a" });
  await call("paste", { text: "paste-verified", format: "text" });
  s = await state();
  assert.match(s, /Value: paste-verified/);
  checks.push("clipboard paste and returned app state");

  await call("perform_secondary_action", { element_index: element(s, "verification-button"), secondary_action: "AXPress" });
  s = await state();
  assert.match(s, /Verified: paste-verified/);
  checks.push("secondary accessibility action");

  await call("click", { x: 150, y: 134 });
  await call("press_key", { key: "Super_L+a" });
  await call("type_text", { text: "claude-codex-cua-verified-20261028" });
  await call("click", { x: 76, y: 184 });
  s = await state();
  assert.match(s, /Verified: claude-codex-cua-verified-20261028/);
  checks.push("window screenshot coordinates select input and press button");

  const screenshot = await call("screenshot");
  const image = screenshot.content.find((c) => c.type === "image");
  assert(image?.mimeType === "image/png");
  const bytes = Buffer.from(image.data, "base64");
  assert.equal(bytes.readUInt32BE(16), 520);
  assert(bytes.readUInt32BE(20) >= 240);
  await writeFile(path.join(packageRoot, "test/verified-window.png"), bytes);
  checks.push("full selected-window screenshot, 520px wide");

  const invalid = await client.callTool({ name: "computer", arguments: { app: target, action: "click", x: -100, y: -100 } });
  assert.equal(invalid.isError, true);
  assert.match(text(invalid), /outside the selected app window/);
  checks.push("out-of-window coordinates rejected");

  const report = { passed: true, recordedAt: new Date().toISOString(), checks };
  await writeFile(path.join(packageRoot, "test/actions-result.json"), JSON.stringify(report, null, 2) + "\n");
  console.log(JSON.stringify(report, null, 2));
} finally { await client.close(); }
