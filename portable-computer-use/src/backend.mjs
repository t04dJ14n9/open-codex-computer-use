// Platform detection and native-helper discovery.
//
// The JS/MCP layers of this skill are platform-neutral. The only OS-specific
// piece is the helper process, selected here. A helper is a *spec*
// ({ command, args }) so it can be a native binary (macOS) or an interpreter
// running a script (Windows/Linux). See porting/BACKEND-CONTRACT.md and
// porting/PORTING-RESEARCH.md.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// `script` is the file that must exist; `command` is the interpreter/binary
// spawned with `args = [script]`. Override order is in describePlatform().
const PLATFORM_HELPERS = {
  darwin: {
    script: "build/Computer Use Helper.app/Contents/MacOS/ComputerUse",
    command: null, // the script itself is the executable
    defaultInterpreter: null,
  },
  win32: {
    script: "build/windows/computer_use_helper.py",
    command: null,
    defaultInterpreter: "python",
  },
  linux: {
    script: "build/linux/computer_use_helper.py",
    command: null,
    defaultInterpreter: "python3",
  },
};

const NATIVE_BACKENDS = {
  darwin: "macos-ax",
  win32: "windows-uia",
  linux: null, // resolved from the session type below
};

function probeInterpreter(candidate) {
  try {
    return spawnSync(candidate, ["--version"], { stdio: "ignore" }).status === 0;
  } catch {
    return false;
  }
}

// Pure, testable: given a platform string and an environment object, describe
// what backend would be used. `fileExists` / `interpreterExists` are injectable
// for unit tests so no OS probing is needed there.
export function describePlatform(platform, env = {}, { fileExists = existsSync, interpreterExists = probeInterpreter } = {}) {
  const sessionType = platform === "linux"
    ? (env.XDG_SESSION_TYPE || (env.WAYLAND_DISPLAY ? "wayland" : env.DISPLAY ? "x11" : "unknown"))
    : platform === "darwin" ? "quartz" : platform === "win32" ? "win32" : "unknown";
  const nativeBackend = platform === "linux"
    ? (sessionType === "wayland" ? "wayland-portal" : "linux-x11")
    : (NATIVE_BACKENDS[platform] ?? "none");

  const entry = PLATFORM_HELPERS[platform] ?? null;
  const override = env.COMPUTER_USE_HELPER || null;
  const script = entry ? path.join(root, entry.script) : null;
  let interpreter = null;
  if (entry?.defaultInterpreter) {
    const candidates = env.COMPUTER_USE_PYTHON
      ? [env.COMPUTER_USE_PYTHON]
      : platform === "win32" ? ["python", "py", "python3"] : ["python3", "python"];
    interpreter = env.COMPUTER_USE_PYTHON || candidates.find(interpreterExists) || candidates[0];
  }

  let helper = null;
  let helperSpec = null;
  let helperCandidates = [];
  if (override) {
    helper = override;
    helperSpec = { command: override, args: [] };
    helperCandidates = [override];
  } else if (script) {
    helper = script;
    helperSpec = entry.defaultInterpreter
      ? { command: interpreter, args: [script] }
      : { command: script, args: [] };
    helperCandidates = entry.defaultInterpreter ? [interpreter, script] : [script];
  }

  const helperPresent = !!helper && fileExists(helper);
  const supported = !!entry;
  let backendStatus;
  if (!supported) backendStatus = "unsupported-platform";
  else if (override && helperPresent) backendStatus = "ready";
  else if (helperPresent) backendStatus = "ready";
  else if (platform === "darwin") backendStatus = "missing-helper";
  else backendStatus = "not-implemented";

  const helperApp = platform === "darwin" && helper && !override
    ? path.resolve(helper, "../../..")
    : null;

  // Static platform defaults only — NOT verified capabilities. The authoritative
  // values come from the helper's `permissionStatus` (see BACKEND-CONTRACT.md)
  // and are surfaced as `status.permissions`.
  const platformDefaults = {
    backgroundAvailable: platform === "darwin",
    windowTargetedInput: platform === "darwin",
    axTree: true,
    screenshot: true,
    consentRequired: platform !== "darwin",
    inputMode: platform === "darwin" ? "background-only" : "foreground-only",
    globalInput: false,
  };

  return {
    platform,
    sessionType,
    nativeBackend,
    backendStatus,
    helper,
    helperApp,
    helperPresent,
    helperSpec,
    helperCandidates,
    interpreter,
    platformDefaults,
    portingResearch: "porting/PORTING-RESEARCH.md",
  };
}

const active = describePlatform(process.platform, process.env);

export const helperCandidates = active.helperCandidates;
export const helperPath = active.helper;
export const helperApp = active.helperApp;
export const helperSpec = active.helperSpec;
export const backendStatus = active.backendStatus;

export function platformInfo() {
  return { ...active };
}
