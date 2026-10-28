import { cp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sources = path.resolve(root, "../codex-computer-use-source");
const app = process.env.CODEX_COMPUTER_USE_APP || "/Applications/ChatGPT.app";
const shipped = path.join(app, "Contents/Resources/cua_node");
const destination = path.join(sources, "shipped-runtime");
await mkdir(destination, { recursive: true });
await cp(path.join(shipped, "lib/node_modules"), path.join(destination, "node_modules"), {
  recursive: true, dereference: false, preserveTimestamps: true,
});
await mkdir(path.join(destination, "bin"), { recursive: true });
await cp(path.join(shipped, "bin/node_repl"), path.join(destination, "bin/node_repl"), {
  preserveTimestamps: true,
});

const files = [];
async function inventory(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await inventory(filename);
    else if (entry.isFile()) {
      const bytes = await readFile(filename);
      files.push({
        path: path.relative(destination, filename), bytes: bytes.length,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        executable: Boolean((await stat(filename)).mode & 0o111),
      });
    }
  }
}
await inventory(destination);
files.sort((a, b) => a.path.localeCompare(b.path));
await writeFile(path.join(sources, "SHIPPED-RUNTIME-MANIFEST.json"), JSON.stringify({
  source: "Installed app Contents/Resources/cua_node", snapshot: "shipped-runtime", recordedAt: new Date().toISOString(),
  scope: "All installed cua_node node_modules plus original node_repl; signed Node remains in ChatGPT.app",
  fileCount: files.length, files,
}, null, 2) + "\n");
console.log(`Snapshotted ${files.length} runtime files into ${destination}`);
