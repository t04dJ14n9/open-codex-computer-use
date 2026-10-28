import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createHost } from "./host.mjs";
import { callTool } from "./tools.mjs";
import { closeHelper, nativeRequest } from "./standalone-sky.mjs";

const args = process.argv.slice(2);
const command = args.shift() || "mcp";
if (command === "mcp") {
  const { startServer } = await import("./server.mjs");
  await startServer();
} else if (["--help", "-h", "help"].includes(command)) {
  console.log(`Codex Computer Use 0.2.0 (macOS)
Usage:
  codex-computer-use mcp                           Start the stdio MCP server
  codex-computer-use status                        Show runtime paths
  codex-computer-use permissions                   Check macOS app permissions
  codex-computer-use permissions --request         Open macOS permission prompts
  codex-computer-use list-apps                     List apps as JSON
  codex-computer-use state 'Finder'                Read accessibility state
  codex-computer-use screenshot 'Finder' out.png   Save a window screenshot
  codex-computer-use js 'await cua.listApps()'      Execute JavaScript
  codex-computer-use js --file script.js           Execute a JavaScript file
  codex-computer-use computer '{"action":"click","app":"TextEdit","element_index":42}'
  codex-computer-use test/protocol.mjs              Run a local Node test file
Run install.sh to add MCP tools and /open-codex-computer-use to Claude Code.`);
} else if (command === "--version") {
  console.log("codex-computer-use 0.2.0");
} else if (command.endsWith(".mjs")) {
  await import(pathToFileURL(path.resolve(command)).href);
} else if (command === "status") {
  try {
    const result = await callTool(null, "status", {});
    console.log(result.content[0].text);
  } finally { await closeHelper(); }
} else if (command === "permissions") {
  try { console.log(JSON.stringify(await nativeRequest(args.includes("--request") ? "requestPermissions" : "permissionStatus"), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
  finally { await closeHelper(); }
} else {
  const host = createHost();
  try {
    let result;
    if (command === "list-apps") result = await callTool(host, "computer", { action: "list_apps" });
    else if (command === "state") result = await callTool(host, "computer", { action: "get_app_state", app: args[0] });
    else if (command === "screenshot") {
      if (!args[1]) throw new Error("screenshot requires an app and output filename");
      result = await callTool(host, "computer", { action: "screenshot", app: args[0] });
      const image = result.content.find((item) => item.type === "image");
      if (!image) throw new Error(result.content.filter((item) => item.type === "text").map((item) => item.text).join("\n"));
      await writeFile(args[1], Buffer.from(image.data, "base64"));
      console.log(path.resolve(args[1]));
      result = null;
    } else if (command === "js") {
      const code = args[0] === "--file" ? await readFile(args[1], "utf8") : args.join(" ");
      result = await callTool(host, "js", { code });
    } else if (command === "computer") result = await callTool(host, "computer", JSON.parse(args.join(" ")));
    else throw new Error(`Unknown command: ${command}`);
    if (result) {
      for (const item of result.content) {
        if (item.type === "text") console.log(item.text);
        else if (item.type === "image") console.log(JSON.stringify({ type: "image", mimeType: item.mimeType, bytes: Buffer.from(item.data, "base64").length }));
      }
      if (result.isError) process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await host.close();
    await closeHelper();
  }
}
