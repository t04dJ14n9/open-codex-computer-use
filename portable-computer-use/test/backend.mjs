#!/usr/bin/env node
// Pure unit test for platform detection / helper discovery. No OS calls needed:
// describePlatform() takes a platform string, an env object and an injectable
// fileExists predicate.
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describePlatform, root } from "../src/backend.mjs";

const rootPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
assert.equal(path.resolve(root), rootPath, "skill root resolves correctly");
const checks = [];

// macOS: shipped native binary, spawned directly.
const mac = describePlatform("darwin", {}, { fileExists: p => p.includes("Computer Use Helper.app") });
assert.equal(mac.platform, "darwin");
assert.equal(mac.sessionType, "quartz");
assert.equal(mac.nativeBackend, "macos-ax");
assert.equal(mac.backendStatus, "ready");
assert.equal(mac.helperPresent, true);
assert.equal(mac.helperSpec.command, mac.helper);
assert.deepEqual(mac.helperSpec.args, []);
assert.equal(mac.platformDefaults.backgroundAvailable, true);
assert.equal(mac.platformDefaults.windowTargetedInput, true);
assert.equal(mac.platformDefaults.inputMode, "background-only");
checks.push("darwin -> macos-ax / ready / native binary helperSpec");

// Windows: Python script helper, spawned by an interpreter.
const winMissing = describePlatform("win32", {}, { fileExists: () => false, interpreterExists: () => false });
assert.equal(winMissing.sessionType, "win32");
assert.equal(winMissing.nativeBackend, "windows-uia");
assert.equal(winMissing.backendStatus, "not-implemented");
assert.equal(winMissing.helperPresent, false);
assert.match(winMissing.helper, /build\/windows\/computer_use_helper\.py$/);
assert.equal(winMissing.helperSpec.command, "python");
assert.equal(winMissing.helperSpec.args[0], winMissing.helper);
assert.equal(winMissing.platformDefaults.backgroundAvailable, false);
const winReady = describePlatform("win32", {}, { fileExists: () => true, interpreterExists: () => false });
assert.equal(winReady.backendStatus, "ready");
assert.equal(winReady.helperPresent, true);
checks.push("win32 -> windows-uia / python helperSpec / ready when built");

// Linux Wayland: portal backend, python3 helper.
const wlMissing = describePlatform("linux", { XDG_SESSION_TYPE: "wayland", WAYLAND_DISPLAY: "wayland-0" }, { fileExists: () => false, interpreterExists: c => c === "python3" });
assert.equal(wlMissing.sessionType, "wayland");
assert.equal(wlMissing.nativeBackend, "wayland-portal");
assert.equal(wlMissing.backendStatus, "not-implemented");
assert.match(wlMissing.helper, /build\/linux\/computer_use_helper\.py$/);
assert.equal(wlMissing.helperSpec.command, "python3");
assert.equal(wlMissing.helperSpec.args[0], wlMissing.helper);
assert.equal(wlMissing.platformDefaults.windowTargetedInput, false);
assert.equal(wlMissing.platformDefaults.inputMode, "foreground-only");
const wlReady = describePlatform("linux", { XDG_SESSION_TYPE: "wayland" }, { fileExists: () => true, interpreterExists: c => c === "python3" });
assert.equal(wlReady.backendStatus, "ready");
checks.push("linux wayland -> wayland-portal / python3 helperSpec / capability downgrade");

// Linux X11 fallback and WAYLAND_DISPLAY-only detection.
const x11 = describePlatform("linux", { DISPLAY: ":0" }, { fileExists: () => false, interpreterExists: c => c === "python3" });
assert.equal(x11.sessionType, "x11");
assert.equal(x11.nativeBackend, "linux-x11");
const wlImplicit = describePlatform("linux", { WAYLAND_DISPLAY: "wayland-1" }, { fileExists: () => false, interpreterExists: c => c === "python3" });
assert.equal(wlImplicit.sessionType, "wayland");
const unknownSession = describePlatform("linux", {}, { fileExists: () => false, interpreterExists: c => c === "python3" });
assert.equal(unknownSession.sessionType, "unknown");
checks.push("linux x11 / implicit wayland / unknown session detection");

// Explicit override wins; COMPUTER_USE_PYTHON overrides the interpreter.
const override = "/tmp/custom-helper";
const ov = describePlatform("linux", { COMPUTER_USE_HELPER: override, XDG_SESSION_TYPE: "wayland" }, { fileExists: p => p === override, interpreterExists: () => false });
assert.equal(ov.helper, override);
assert.equal(ov.backendStatus, "ready");
assert.equal(ov.helperCandidates[0], override);
assert.equal(ov.helperSpec.command, override);
assert.deepEqual(ov.helperSpec.args, []);
const pyOverride = describePlatform("linux", { COMPUTER_USE_PYTHON: "/usr/bin/python3.12" }, { fileExists: () => false, interpreterExists: () => false });
assert.equal(pyOverride.helperSpec.command, "/usr/bin/python3.12");
checks.push("COMPUTER_USE_HELPER / COMPUTER_USE_PYTHON overrides take precedence");

// Unsupported platform is explicit.
const other = describePlatform("freebsd", {}, { fileExists: () => false, interpreterExists: () => false });
assert.equal(other.backendStatus, "unsupported-platform");
assert.equal(other.nativeBackend, "none");
assert.equal(other.helper, null);
assert.equal(other.helperSpec, null);
checks.push("unsupported platform -> explicit unsupported-platform");

console.log(JSON.stringify({ passed: true, checks }, null, 2));
