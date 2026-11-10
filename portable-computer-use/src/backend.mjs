// Platform detection and native-helper discovery.
//
// The JS/MCP layers of this skill are platform-neutral. The only OS-specific
// piece is the helper binary, selected here. A Windows or Wayland port drops a
// helper into build/<platform>/ and adds one path below; nothing else changes.
// See porting/BACKEND-CONTRACT.md and porting/PORTING-RESEARCH.md.
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PLATFORM_HELPERS = {
  darwin: "build/Computer Use Helper.app/Contents/MacOS/ComputerUse",
  win32: "build/windows/computer-use-helper.exe",
  linux: "build/linux/computer-use-helper",
};

const NATIVE_BACKENDS = {
  darwin: "macos-ax",
  win32: "windows-uia",
  linux: null, // resolved from the session type below
};

// Pure, testable: given a platform string and an environment object, describe
// what backend would be used. No filesystem access for the non-active cases.
export function describePlatform(platform, env = {}, { fileExists = existsSync } = {}) {
  const sessionType = platform === "linux"
    ? (env.XDG_SESSION_TYPE || (env.WAYLAND_DISPLAY ? "wayland" : env.DISPLAY ? "x11" : "unknown"))
    : platform === "darwin" ? "quartz" : platform === "win32" ? "win32" : "unknown";
  const nativeBackend = platform === "linux"
    ? (sessionType === "wayland" ? "wayland-portal" : "linux-x11")
    : (NATIVE_BACKENDS[platform] ?? "none");

  const override = env.COMPUTER_USE_HELPER || null;
  const relative = PLATFORM_HELPERS[platform] ?? null;
  const candidates = [override, relative ? path.join(root, relative) : null].filter(Boolean);
  const helper = candidates.find(candidate => fileExists(candidate)) ?? candidates[0] ?? null;
  const helperPresent = !!helper && fileExists(helper);
  const supported = !!PLATFORM_HELPERS[platform];

  let backendStatus;
  if (!supported) backendStatus = "unsupported-platform";
  else if (helperPresent) backendStatus = "ready";
  else if (platform === "darwin") backendStatus = "missing-helper";
  else backendStatus = "not-implemented";

  const helperApp = platform === "darwin" && helper ? path.resolve(helper, "../../..") : null;

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
    helperCandidates: candidates,
    platformDefaults,
    portingResearch: "porting/PORTING-RESEARCH.md",
  };
}

const active = describePlatform(process.platform, process.env);

export const helperCandidates = active.helperCandidates;
export const helperPath = active.helper;
export const helperApp = active.helperApp;
export const backendStatus = active.backendStatus;

export function platformInfo() {
  return { ...active };
}
