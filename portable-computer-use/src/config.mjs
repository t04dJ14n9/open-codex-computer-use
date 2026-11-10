import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// The helper is an authored Swift reconstruction bundled with this skill. Its
// location is the only platform-specific path; no product host, signed Node
// binary, IPC socket or third-party runtime is consulted.
export const helperCandidates = [
  process.env.COMPUTER_USE_HELPER,
  path.join(root, "build/Computer Use Helper.app/Contents/MacOS/ComputerUse"),
].filter(Boolean);

export const helperPath = helperCandidates.find(candidate => existsSync(candidate)) ?? helperCandidates[0];
export const helperApp = path.resolve(helperPath, "../../..");

export function runtimeStatus() {
  return {
    platform: process.platform,
    architecture: process.arch,
    node: process.execPath,
    nodeVersion: process.versions.node,
    skillRoot: root,
    helper: helperPath,
    helperApp,
    helperPresent: existsSync(helperPath),
    backend: "standalone",
    inputMode: "background-only",
    globalInput: false,
    productHostRequired: false,
    externalRuntimeRequired: false,
  };
}
