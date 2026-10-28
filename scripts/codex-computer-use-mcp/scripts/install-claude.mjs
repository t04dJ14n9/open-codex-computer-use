import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const installer = fileURLToPath(new URL("../../install.mjs", import.meta.url));
const result = spawnSync(process.execPath, [installer, "--claude", process.env.CLAUDE_CLI || "claude"], { stdio: "inherit" });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
