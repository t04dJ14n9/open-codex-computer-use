# Setup And Permissions

Resolve all commands relative to the directory containing this skill's
`SKILL.md`, not the user's current project.

`node scripts/setup.mjs --check` checks the local prerequisites, native binary
hash, recovered runtime entrypoints, and npm dependencies without installing
anything. `node scripts/setup.mjs` installs the locked MCP dependencies with
`npm ci --ignore-scripts`. It does not request macOS permissions or change agent
configuration.

`node scripts/install.mjs --claude claude --codex` installs both skill links
and the Claude MCP registration. Select just one flag to install for one client.
Existing nonmatching skill paths are not overwritten.
`CUA_CLAUDE_CONFIG_DIR` selects a nondefault Claude profile directory;
`CUA_CLAUDE_CONFIG_FILE` selects its MCP user configuration file. Codex uses
`CODEX_HOME`, or `~/.codex` when unset. This installation does not add an MCP
server to Codex's configuration: Codex uses the CLI fallback.

## Manual MCP

Register an absolute path to this checkout's `scripts/computer-use` executable
with the argument `mcp`. Example Claude MCP server entry:

```json
{
  "mcpServers": {
    "codex-computer-use": {
      "type": "stdio",
      "command": "/absolute/path/open-codex-computer-use/scripts/computer-use",
      "args": ["mcp"],
      "env": { "CODEX_CUA_BACKEND": "standalone" }
    }
  }
}
```

The server exports `computer`, `js`, `js_reset`, and `status`. Claude tool IDs
start with `mcp__codex-computer-use__`. A skill is instructions plus resources;
MCP tools appear only after registration and a new client session.

## Native Helper

The bundled helper is
`scripts/codex-computer-use-mcp/build/Codex Computer Use Standalone.app`.
Check permissions with `scripts/computer-use permissions`; request them with
`scripts/computer-use permissions --request` only when the user needs setup.
macOS TCC permission dialogs require the user's interaction. Do not edit the
TCC database, weaken system protections, or retry a denied operation in a loop.
The desktop must be unlocked for meaningful AX window inspection and screen
capture. A locked console can expose only menus and fail capture even when
both permissions are granted. Ask the user to unlock it; this skill does not
implement lock-screen control.

To rebuild:

```sh
node scripts/codex-computer-use-mcp/scripts/build-native.mjs
# Intel target, built on macOS:
CUA_NATIVE_ARCH=x86_64 node scripts/codex-computer-use-mcp/scripts/build-native.mjs
```

Native source is split across `native/ComputerUse.swift`,
`native/BackgroundInput.swift`, and `native/AgentCursor.swift`. The build script
compiles and signs all three, then writes compiler, source, executable, and
plist hashes to `build/native-manifest.json`. It uses public AppKit,
Accessibility, CoreGraphics, and ScreenCaptureKit APIs plus a small,
capability-checked bridge to private SkyLight/ApplicationServices symbols for
target-window focus and event delivery. Missing symbols produce explicit
`background_unavailable` errors.

The stable designated requirement keeps the helper identity consistent across
builds. Verify permissions after moving or rebuilding the app; grants on one
Mac are not included in the skill. `scripts/setup.mjs --check` verifies every
native source hash, not only the executable.

Do not set `CODEX_CUA_BACKEND=codex` or `source` for ordinary tasks. Those are
preserved investigative routes and can fail original host authentication.
Do not set `CODEX_CUA_HELPER` unless selecting a verified alternate helper.
`CODEX_CUA_VISUAL_CURSOR=0` hides the independent animated agent cursor; it does
not change input delivery.

Background mode does not launch an app that is not running. Start it through
the user's normal app launch flow, then bind it by name, bundle ID, or path.
Do not substitute AppleScript, System Events, or global HID input to bypass a
`background_unavailable` refusal.
