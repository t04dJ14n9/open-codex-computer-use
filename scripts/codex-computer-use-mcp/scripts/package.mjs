import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdtemp, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { packageRoot } from "../src/config.mjs";

const outputs = path.dirname(packageRoot);
const scratch = path.resolve(outputs, "../work");
const temporary = await mkdtemp(path.join(scratch, "package-"));
const archives = [
  { filename: "codex-computer-use-source.zip", entries: ["codex-computer-use-source"] },
  { filename: "codex-computer-use-mcp.zip", entries: ["codex-computer-use-mcp"] },
  { filename: "codex-computer-use-for-claude.zip", entries: ["codex-computer-use-mcp", "codex-computer-use-source"] },
];

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: outputs, stdio: ["ignore", "inherit", "inherit"] });
    child.once("error", reject);
    child.once("close", (code) => code === 0 ? resolve() : reject(new Error(`${command} failed (${code})`)));
  });
}

async function digest(filename) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(filename)) hash.update(chunk);
  return hash.digest("hex");
}

try {
  const artifacts = [];
  for (const archive of archives) {
    const staged = path.join(temporary, archive.filename);
    process.stderr.write(`Packaging ${archive.filename}\n`);
    await run("/usr/bin/zip", ["-q", "-r", "-y", staged, ...archive.entries,
      "-x", "*/installation-backup/*", "*/.DS_Store", "*/.native-build-*/*"]);
    await run("/usr/bin/unzip", ["-tq", staged]);
    const info = await stat(staged);
    const sha256 = await digest(staged);
    await rename(staged, path.join(outputs, archive.filename));
    artifacts.push({ filename: archive.filename, bytes: info.size, sha256 });
  }
  await writeFile(path.join(outputs, "ARCHIVES.json"), JSON.stringify({ recordedAt: new Date().toISOString(), artifacts }, null, 2) + "\n");
  console.log(JSON.stringify(artifacts, null, 2));
} finally { await rm(temporary, { recursive: true, force: true }); }
