#!/usr/bin/env node
// Pure unit test for platform detection / helper discovery. No OS calls needed:
// describePlatform() takes a platform string and an env object.
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describePlatform, root } from "../src/backend.mjs";

const rootPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
assert.equal(path.resolve(root), rootPath, "skill root resolves correctly");
const checks = [];

// macOS: shipped helper is present.
const mac = describePlatform("darwin", {}, { fileExists: p => p.includes("Computer Use Helper.app") });
assert.equal(mac.platform, "darwin");
assert.equal(mac.sessionType, "quartz");
assert.equal(mac.nativeBackend, "macos-ax");
assert.equal(mac.backendStatus, "ready");
assert.equal(mac.helperPresent, true);
assert.equal(mac.platformDefaults.backgroundAvailable, true);
assert.equal(mac.platformDefaults.windowTargetedInput, true);
assert.equal(mac.platformDefaults.inputMode, "background-only");
checks.push("darwin -> macos-ax / ready / background-only");

// Windows: helper not built yet -> explicit not-implemented, never a silent fallback.
const win = describePlatform("win32", {}, { fileExists: () => false });
assert.equal(win.sessionType, "win32");
assert.equal(win.nativeBackend, "windows-uia");
assert.equal(win.backendStatus, "not-implemented");
assert.equal(win.helperPresent, false);
assert.match(win.helper, /computer-use-helper\.exe$/);
assert.equal(win.platformDefaults.backgroundAvailable, false);
assert.equal(win.platformDefaults.consentRequired, true);
checks.push("win32 -> windows-uia / not-implemented / windows helper path");

// Linux Wayland: portal backend.
const wl = describePlatform("linux", { XDG_SESSION_TYPE: "wayland", WAYLAND_DISPLAY: "wayland-0" }, { fileExists: () => false });
assert.equal(wl.sessionType, "wayland");
assert.equal(wl.nativeBackend, "wayland-portal");
assert.equal(wl.backendStatus, "not-implemented");
assert.match(wl.helper, /build\/linux\/computer-use-helper$/);
assert.equal(wl.platformDefaults.windowTargetedInput, false);
assert.equal(wl.platformDefaults.inputMode, "foreground-only");
checks.push("linux wayland -> wayland-portal / foreground-only / no targeted input");

// Linux X11 fallback and WAYLAND_DISPLAY-only detection.
const x11 = describePlatform("linux", { DISPLAY: ":0" }, { fileExists: () => false });
assert.equal(x11.sessionType, "x11");
assert.equal(x11.nativeBackend, "linux-x11");
const wlImplicit = describePlatform("linux", { WAYLAND_DISPLAY: "wayland-1" }, { fileExists: () => false });
assert.equal(wlImplicit.sessionType, "wayland");
const unknownSession = describePlatform("linux", {}, { fileExists: () => false });
assert.equal(unknownSession.sessionType, "unknown");
checks.push("linux x11 / implicit wayland / unknown session detection");

// Explicit override wins and is reported as ready when it exists.
const override = "/tmp/custom-helper";
const ov = describePlatform("linux", { COMPUTER_USE_HELPER: override, XDG_SESSION_TYPE: "wayland" }, { fileExists: p => p === override });
assert.equal(ov.helper, override);
assert.equal(ov.backendStatus, "ready");
assert.equal(ov.helperCandidates[0], override);
checks.push("COMPUTER_USE_HELPER override takes precedence");

// Unsupported platform is explicit.
const other = describePlatform("freebsd", {}, { fileExists: () => false });
assert.equal(other.backendStatus, "unsupported-platform");
assert.equal(other.nativeBackend, "none");
assert.equal(other.helper, null);
checks.push("unsupported platform -> explicit unsupported-platform");

console.log(JSON.stringify({ passed: true, checks }, null, 2));
