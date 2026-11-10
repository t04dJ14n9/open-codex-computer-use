import { writeFile } from "node:fs/promises";
import { callTool } from "./tools.mjs";
import { createRuntime } from "./runtime.mjs";
import { nativeRequest, closeHelper } from "./helper.mjs";
import { helperPath } from "./config.mjs";

const args = process.argv.slice(2);
const command = args.shift() || "mcp";

function print(result) {
  if (!result) return;
  for (const item of result.content) {
    if (item.type === "text") console.log(item.text);
    else if (item.type === "image") console.log(JSON.stringify({ type: "image", mimeType: item.mimeType, bytes: Buffer.from(item.data, "base64").length }));
  }
  if (result.isError) process.exitCode = 1;
}

if (command === "mcp") {
  const { startServer } = await import("./server.mjs");
  await startServer();
} else if (["--help", "-h", "help"].includes(command)) {
  console.log(`Portable Computer Use 1.0.0 (macOS)
Usage:
  computer-use mcp                            Start the stdio MCP server
  computer-use status                         Show runtime paths and permissions
  computer-use permissions                    Check macOS app permissions
  computer-use permissions --request          Open macOS permission prompts
  computer-use list-apps                      List running apps as JSON
  computer-use state 'Finder'                 Read the numbered accessibility tree
  computer-use screenshot 'Finder' out.png    Save a window screenshot
  computer-use js 'await cua.listApps()'      Execute JavaScript in a new session
  computer-use js --file script.js            Execute a JavaScript file
  computer-use computer '{"action":"get_app_state","app":"Finder"}'
Input is background-only; unsupported drag, paste, global pointer and window-raising
operations refuse. No product host or external runtime is required.
Helper: ${helperPath}`);
} else if (command === "--version") {
  console.log("portable-computer-use 1.0.0");
} else if (command === "status") {
  try { print(await callTool(null, "status", {})); }
  finally { await closeHelper(); }
} else if (command === "permissions") {
  try {
    const method = args.includes("--request") ? "requestPermissions" : "permissionStatus";
    console.log(JSON.stringify(await nativeRequest(method), null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { await closeHelper(); }
} else {
  const runtime = createRuntime();
  try {
    let result;
    if (command === "list-apps") result = await callTool(runtime, "computer", { action: "list_apps" });
    else if (command === "state") result = await callTool(runtime, "computer", { action: "get_app_state", app: args[0] });
    else if (command === "screenshot") {
      if (!args[1]) throw new Error("screenshot requires an app and output filename");
      result = await callTool(runtime, "computer", { action: "screenshot", app: args[0] });
      const image = result.content.find(item => item.type === "image");
      if (!image) throw new Error(result.content.filter(item => item.type === "text").map(item => item.text).join("\n"));
      await writeFile(args[1], Buffer.from(image.data, "base64"));
      console.log(args[1]);
      result = null;
    } else if (command === "js") {
      const { readFile } = await import("node:fs/promises");
      const code = args[0] === "--file" ? await readFile(args[1], "utf8") : args.join(" ");
      result = await callTool(runtime, "js", { code });
    } else if (command === "computer") result = await callTool(runtime, "computer", JSON.parse(args.join(" ")));
    else throw new Error(`Unknown command: ${command}`);
    print(result);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await closeHelper();
  }
}
