import { existsSync, realpathSync } from "node:fs";
import path from "node:path";
import { homedir } from "node:os";
import { fileURLToPath } from "node:url";

export const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const sourcesRoot = path.resolve(process.env.CODEX_CUA_SOURCES || path.join(packageRoot, "../codex-computer-use-source"));
export const modulesRoot = path.join(sourcesRoot, "shipped-runtime/node_modules");
export const kernelRoot = path.join(sourcesRoot, "node-repl-embedded");
export const signedNode = process.env.CODEX_CUA_NODE || path.join(
  process.env.CODEX_COMPUTER_USE_APP || "/Applications/ChatGPT.app", "Contents/Resources/cua_node/bin/node",
);
export const backend = process.env.CODEX_CUA_BACKEND || "standalone";
if (!["standalone", "source", "codex"].includes(backend)) throw new Error("CODEX_CUA_BACKEND must be standalone, source, or codex");
export const nodeBinary = backend === "codex" ? signedNode : process.execPath;
export const standaloneHelper = process.env.CODEX_CUA_HELPER || path.join(packageRoot, "build/Codex Computer Use Standalone.app/Contents/MacOS/ComputerUse");
export const serviceApp = process.env.SKY_CUA_SERVICE_PATH || path.join(homedir(), ".tcodex/computer-use/Codex Computer Use.app");
export const serviceSocket = process.env.SKY_CUA_SERVICE_NATIVE_PIPE_PATH || path.join(
  homedir(), "Library/Group Containers/2DC432GLL2.com.openai.sky.CUAService/IPC/computeruse.sock",
);

export function runtimeEnvironment() {
  if (process.platform !== "darwin") throw new Error("This computer-use implementation requires macOS 14 or later");
  for (const required of [nodeBinary, kernelRoot, path.join(modulesRoot, "@oai/sky/package.json"), path.join(modulesRoot, "@oai/cua/package.json")]) {
    if (!existsSync(required)) throw new Error(`Missing runtime file: ${required}. Run npm run recover from ${packageRoot}.`);
  }
  const environment = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
    ["HOME", "LOGNAME", "PATH", "SHELL", "TERM", "USER", "TMPDIR", "LANG", "LC_ALL", "LC_CTYPE", "CODEX_CUA_HELPER"].includes(key),
  ));
  return {
    ...environment,
    CUA_REPL_ENABLED_SURFACES: "computer",
    NODE_REPL_NODE_MODULE_DIRS: realpathSync(modulesRoot),
    NODE_REPL_TRUSTED_CODE_PATHS: [realpathSync(modulesRoot), packageRoot].join(path.delimiter),
    NODE_REPL_TRUSTED_SERVICES: JSON.stringify({ sky: backend === "standalone" ? path.join(packageRoot, "src/standalone-sky.mjs") : "@oai/sky/service" }),
    NODE_REPL_TRUSTED_RPC_ENABLED: "1",
    NODE_REPL_UNTRUSTED_ENV_ALLOWLIST: "CUA_REPL_ENABLED_SURFACES",
    NODE_REPL_JS_BANNER: 'await import("@oai/cua/tinyskyAlt");',
    SKY_CUA_SERVICE_PATH: serviceApp,
    SKY_CUA_SERVICE_NATIVE_PIPE_PATH: serviceSocket,
    SKY_ENABLE_AUDIO: "0",
    NODE_REPL_DISABLE_ANALYTICS: "1",
    BROWSER_USE_DISABLE_AMBIENT_NETWORK: "1",
  };
}

export function runtimeStatus() {
  const nativeBackend = backend === "codex";
  return {
    platform: process.platform, architecture: process.arch,
    processExecutable: process.execPath,
    supervisor: nativeBackend ? "shipped native supervisor with source MCP adapter" : "reconstructed JavaScript",
    backend,
    nodeReplBinaryRequired: nativeBackend,
    node: nodeBinary, nodePresent: existsSync(nodeBinary),
    sources: sourcesRoot, sourcesPresent: existsSync(path.join(modulesRoot, "@oai/cua/package.json")),
    nativeService: serviceApp, nativeServicePresent: existsSync(serviceApp),
    socket: serviceSocket, socketPresent: existsSync(serviceSocket),
    nativeServiceReconstructed: false,
    helper: standaloneHelper, helperPresent: existsSync(standaloneHelper),
    codexServiceRequired: backend !== "standalone",
  };
}
