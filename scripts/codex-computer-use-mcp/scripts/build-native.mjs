#!/usr/bin/env node
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import { access, chmod, copyFile, mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../", import.meta.url));
const sourcePath = path.join(packageRoot, "native", "ComputerUse.swift");
const sourcePaths = [sourcePath, "BackgroundInput.swift", "AgentCursor.swift"].map(file => path.isAbsolute(file) ? file : path.join(packageRoot, "native", file));
const plistPath = path.join(packageRoot, "native", "Info.plist");
const buildRoot = path.join(packageRoot, "build");
const appName = "Codex Computer Use Standalone.app";
const appPath = path.join(buildRoot, appName);
const executablePath = path.join(appPath, "Contents", "MacOS", "ComputerUse");
const manifestPath = path.join(buildRoot, "native-manifest.json");

function run(command, args, { capture = false, allowFailure = false } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: packageRoot,
      env: process.env,
      stdio: ["ignore", capture ? "pipe" : "inherit", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.setEncoding("utf8").on("data", (chunk) => { stdout += chunk; });
    child.stderr.setEncoding("utf8").on("data", (chunk) => {
      stderr += chunk;
      if (!capture) process.stderr.write(chunk);
    });
    child.once("error", reject);
    child.once("close", (code, signal) => {
      if (code === 0 || allowFailure) resolve({ code, stdout, stderr, signal });
      else reject(new Error(`${path.basename(command)} failed (${signal || code}): ${stderr.trim()}`));
    });
  });
}

async function exists(target) {
  try { await access(target); return true; }
  catch (error) { if (error.code === "ENOENT") return false; throw error; }
}

async function plistValue(file, key) {
  const result = await run("/usr/bin/plutil", ["-extract", key, "raw", "-o", "-", file], { capture: true });
  return result.stdout.trim();
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function publishablePath(value, stagingRoot) {
  return value.replaceAll(stagingRoot, "${BUILD_DIR}").replaceAll(packageRoot.replace(/\/$/, ""), ".");
}

async function removeFinderInfo(file) {
  const result = await run("/usr/bin/xattr", ["-d", "com.apple.FinderInfo", file], {
    capture: true, allowFailure: true,
  });
  if (result.code !== 0 && !/No such xattr|No such attribute/i.test(result.stderr)) {
    throw new Error(`Cannot remove FinderInfo from new build file ${file}: ${result.stderr.trim()}`);
  }
}

async function build() {
  if (process.platform !== "darwin") throw new Error("The native helper must be built on macOS with Xcode Command Line Tools.");
  if (!await exists(sourcePath)) throw new Error(`Native source is not present yet: ${sourcePath}. Run this build again after the source has been written.`);

  const sourceBytes = await readFile(sourcePath);
  const sourceFiles = [];
  for (const file of sourcePaths) sourceFiles.push({ path: path.relative(packageRoot, file), sha256: sha256(await readFile(file)) });
  const plistBytes = await readFile(plistPath);
  await run("/usr/bin/plutil", ["-lint", plistPath], { capture: true });
  const bundleIdentifier = await plistValue(plistPath, "CFBundleIdentifier");
  const minimumSystemVersion = await plistValue(plistPath, "LSMinimumSystemVersion");
  const bundleExecutable = await plistValue(plistPath, "CFBundleExecutable");
  if (!/^[A-Za-z0-9][A-Za-z0-9.-]+$/.test(bundleIdentifier)) throw new Error("Info.plist has an invalid bundle identifier.");
  if (!/^\d+\.\d+(?:\.\d+)?$/.test(minimumSystemVersion)) throw new Error("Info.plist has an invalid minimum macOS version.");
  if (bundleExecutable !== "ComputerUse") throw new Error("Info.plist CFBundleExecutable must be ComputerUse.");

  const architecture = process.env.CUA_NATIVE_ARCH || ({ arm64: "arm64", x64: "x86_64" })[process.arch];
  if (!["arm64", "x86_64"].includes(architecture)) throw new Error("CUA_NATIVE_ARCH must be arm64 or x86_64.");
  const swiftVersion = process.env.CUA_NATIVE_SWIFT_VERSION || "5";
  if (!["5", "6"].includes(swiftVersion)) throw new Error("CUA_NATIVE_SWIFT_VERSION must be 5 or 6.");
  if (await exists(appPath)) {
    const previousIdentifier = await plistValue(path.join(appPath, "Contents", "Info.plist"), "CFBundleIdentifier");
    if (previousIdentifier !== bundleIdentifier) throw new Error(`Refusing to replace a different application's bundle at ${appPath}.`);
  }

  await mkdir(buildRoot, { recursive: true });
  const stagingRoot = await mkdtemp(path.join(tmpdir(), "codex-cua-native-build-"));
  const stagedApp = path.join(stagingRoot, appName);
  const stagedContents = path.join(stagedApp, "Contents");
  const stagedExecutable = path.join(stagedContents, "MacOS", "ComputerUse");
  const stagedPlist = path.join(stagedContents, "Info.plist");
  const previousApp = path.join(stagingRoot, "previous.app");
  let previousMoved = false;
  let published = false;
  try {
    await mkdir(path.dirname(stagedExecutable), { recursive: true });
    await copyFile(plistPath, stagedPlist);
    const compiler = await run("/usr/bin/xcrun", ["swiftc", "--version"], { capture: true });
    const sdk = await run("/usr/bin/xcrun", ["--sdk", "macosx", "--show-sdk-path"], { capture: true });
    const target = `${architecture}-apple-macosx${minimumSystemVersion}`;
    const swiftArgs = [
      "swiftc", "-O", "-swift-version", swiftVersion,
      "-target", target, "-sdk", sdk.stdout.trim(),
      "-module-cache-path", path.join(stagingRoot, "module-cache"),
      "-framework", "Foundation", "-framework", "AppKit",
      "-framework", "ApplicationServices", "-framework", "ScreenCaptureKit",
      "-framework", "QuartzCore",
    ];
    if (/^\s*@main\b/m.test(sourceBytes.toString("utf8"))) swiftArgs.push("-parse-as-library");
    swiftArgs.push(...sourcePaths, "-o", stagedExecutable);
    process.stderr.write(`Compiling ${sourcePath}\nTarget: ${target}\n`);
    await run("/usr/bin/xcrun", swiftArgs);
    if (sha256(await readFile(sourcePath)) !== sha256(sourceBytes) || sha256(await readFile(plistPath)) !== sha256(plistBytes)) {
      throw new Error("Native source or Info.plist changed during compilation. Run the build again to publish a consistent artifact.");
    }
    for (const file of sourceFiles) {
      if (sha256(await readFile(path.join(packageRoot, file.path))) !== file.sha256) throw new Error("Native source changed during compilation");
    }
    await chmod(stagedExecutable, 0o755);
    // File Provider can add FinderInfo to new bundle directories as well as files.
    for (const generated of [stagedApp, stagedContents, path.dirname(stagedExecutable), stagedPlist, stagedExecutable]) {
      await removeFinderInfo(generated);
    }

    const designatedRequirement = `designated => identifier "${bundleIdentifier}"`;
    await run("/usr/bin/codesign", [
      "--force", "--sign", "-", "--timestamp=none",
      "--identifier", bundleIdentifier,
      "--requirements", `=${designatedRequirement}`, stagedApp,
    ]);
    await run("/usr/bin/codesign", ["--verify", "--strict", "--verbose=2", stagedApp]);
    const signature = await run("/usr/bin/codesign", ["--display", "--requirements", "-", "--verbose=2", stagedApp], { capture: true });
    const manifest = {
      schemaVersion: 1,
      backend: "standalone",
      builtAt: new Date().toISOString(),
      bundleIdentifier,
      appPath: path.relative(packageRoot, appPath),
      executablePath: path.relative(packageRoot, executablePath),
      sourcePath: path.relative(packageRoot, sourcePath),
      sourceFiles,
      infoPlistPath: path.relative(packageRoot, plistPath),
      architecture,
      target,
      minimumSystemVersion,
      swiftVersion,
      compilerVersion: compiler.stdout.trim(),
      signing: { identity: "ad-hoc", designatedRequirement, details: publishablePath(`${signature.stdout}${signature.stderr}`.trim(), stagingRoot) },
      sha256: {
        source: sha256(sourceBytes),
        infoPlist: sha256(plistBytes),
        executable: sha256(await readFile(stagedExecutable)),
      },
      buildCommand: { executable: "/usr/bin/xcrun", arguments: swiftArgs.map(arg => publishablePath(arg, stagingRoot)) },
    };
    const stagedManifest = path.join(stagingRoot, "native-manifest.json");
    await writeFile(stagedManifest, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
    if (await exists(appPath)) {
      await rename(appPath, previousApp);
      previousMoved = true;
    }
    try {
      await rename(stagedApp, appPath);
      published = true;
      for (const generated of [appPath, path.join(appPath, "Contents"), path.dirname(executablePath), path.join(appPath, "Contents/Info.plist"), executablePath]) {
        await removeFinderInfo(generated);
      }
      // File Provider can race the rename and reattach FinderInfo. Only retry
      // that exact publication-metadata error, never a signature mismatch.
      for (let attempt = 0; attempt < 4; attempt++) {
        const verified = await run("/usr/bin/codesign", ["--verify", "--strict", "--verbose=2", appPath], { capture: true, allowFailure: true });
        if (verified.code === 0) break;
        if (attempt === 3 || !/FinderInfo|resource fork/.test(verified.stderr)) throw new Error(verified.stderr.trim());
        await new Promise(resolve => setTimeout(resolve, 250));
        await removeFinderInfo(appPath);
      }
      await rename(stagedManifest, manifestPath);
    } catch (error) {
      if (published) await rename(appPath, stagedApp);
      if (previousMoved) await rename(previousApp, appPath);
      throw error;
    }
    process.stdout.write(`${JSON.stringify({ appPath, executablePath, manifestPath, bundleIdentifier, architecture, status: "built" }, null, 2)}\n`);
  } finally {
    await rm(stagingRoot, { recursive: true, force: true });
  }
}

build().catch((error) => {
  process.stderr.write(`Native build failed: ${error.message}\n`);
  process.exitCode = 1;
});
