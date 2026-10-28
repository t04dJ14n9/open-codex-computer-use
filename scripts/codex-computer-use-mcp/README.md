# Codex Computer Use For Claude

Working macOS MCP server and CLI for Claude Code and other MCP clients. The
default implementation combines the recovered Codex CUA JavaScript API with a
source-built Swift accessibility/input helper. It runs under ordinary Node.js
and does not require the original Codex native service or an active Codex chat.

This is a functional reconstruction, not the original complete OpenAI source
repository. See `../codex-computer-use-source/README.md` for recovery scope.

## Runtime Model

- Input is background-only. The helper does not activate, raise, or globally
  drive the target window.
- An exact native `window_id` binds observation and actions to one AX window.
- The `computer` and persistent `js` tools share one helper process, state map,
  cursor, and animation sequence.
- A click-through teal `AI` cursor shows the intended pointer path without
  moving the physical cursor. It cannot become key and hides after eight
  seconds of inactivity. Set `CODEX_CUA_VISUAL_CURSOR=0` to disable it.
- A foreground change stops input. The helper does not restore focus or warp
  the pointer against subsequent user activity.
- Missing apps are not launched implicitly. Start the app without selecting
  this helper as the input path, then bind it by name, bundle ID, or path.

Inputs use a small, capability-checked set of private macOS APIs plus public
Accessibility, AppKit, CoreGraphics, and ScreenCaptureKit APIs. Private ABI is
version-sensitive; missing symbols produce an explicit `background_unavailable`
error. Third-party provenance is in `native/THIRD-PARTY-NOTICES.md`.

## Use

After installation, restart an existing client session to load the MCP tools
and skill:

```text
/open-codex-computer-use List the running apps
```

Tools are `computer`, `js`, `js_reset`, and `status`. An MCP prompt named
`computer-use` is also included.

```sh
claude mcp get codex-computer-use
claude -p '/open-codex-computer-use Read Finder state and take a screenshot.'
```

## CLI

```sh
./bin/codex-computer-use list-apps
./bin/codex-computer-use state Finder
./bin/codex-computer-use screenshot Finder finder.png
./bin/codex-computer-use status
./bin/codex-computer-use permissions
./bin/codex-computer-use computer '{"action":"get_app_state","app":"com.apple.finder"}'
./bin/codex-computer-use js 'nodeRepl.write(await cua.listApps({emit:false}));'
```

`list_apps` includes native window IDs. Pass `window_id` to every state and
action when the app has more than one window. Coordinates refer to the returned
window screenshot and resolve only supported Accessibility controls; there is
no raw global-pixel fallback.

Supported input is intentionally narrower than a desktop automation framework:

- Plain single left clicks on AX buttons, checkboxes, radio buttons, and text
  editors.
- `Super_L+a` in a focused editor, plus unmodified keys such as `Return` and
  `Tab`.
- Unicode text entry, AX `set_value`, verified `select_text`, and the
  `AXPress`/`AXIncrement`/`AXDecrement` secondary actions.
- AX page scrolling when the bound control implements the requested
  `AXScroll*ByPage` action.

Drag, shared-clipboard paste, global HID pointer delivery, raw canvas clicks,
window-raising actions, and other command/modifier shortcuts currently refuse.
A scroll refusal is expected on controls such as an otherwise ordinary AppKit
`NSScrollView` that advertises an AX action but returns `AXError.cannotComplete`.

Each CLI command starts a new process/session. Use MCP or one `js --file`
invocation when state indices and follow-up actions must remain in the same
runtime.

## Rebuild And Install

Requirements are macOS 14+, Node.js 24.11+, and Xcode Command Line Tools for a
rebuild. Apple Silicon is tested; the build script also accepts
`CUA_NATIVE_ARCH=x86_64`.

Keep this directory beside `codex-computer-use-source` when extracting the
complete skill.

```sh
npm ci --ignore-scripts
npm run build:native
./install.sh
./bin/codex-computer-use permissions --request
```

Enable **Codex Computer Use Standalone** in Accessibility and Screen Recording
when macOS prompts. Permissions are local to each Mac and are not included in
the repository. An ad-hoc signature with a stable designated requirement
preserves the helper identity across rebuilds.

The installer adds the server, skill, and four tool-specific permission grants.
`CUA_CLAUDE_CONFIG_DIR` and `CUA_CLAUDE_CONFIG_FILE` select a custom Claude
profile; `CLAUDE_CLI` selects an alternate executable path.

## Source Layout

- `src/server.mjs`, `src/tools.mjs`: MCP interface, validation, and result
  shaping.
- `src/kernel-host.mjs`: reconstructed persistent JavaScript supervisor.
- `src/standalone-sky.mjs`: trusted service bridge and helper lifecycle.
- `native/ComputerUse.swift`: app/window observation, screenshots, and actions.
- `native/BackgroundInput.swift`: private target-window focus/input bridge.
- `native/AgentCursor.swift`: click-through animation overlay.
- `../codex-computer-use-source/`: recovered installed JavaScript, embedded
  REPL runtime, browser analysis, native evidence, and original notices.

## Verification

```sh
npm test
npm run test:background
```

`npm test` checks the MCP handshake, tool/prompt discovery, app inventory,
Finder AX observation, screenshots, persistent JavaScript, error recovery, and
reset. `npm run test:background` uses separate scratch and guard apps to verify
exact-window binding, shared `computer`/`js` state, indexed and coordinate
actions, selection verification, cancellation cleanup, stale-window refusal,
foreground-change refusal, unsupported-action refusals, cursor animation and
click-through behavior, and absence of target/helper focus theft.

## Limits

This is not full original-service parity. Exact original Swift/Rust source,
native async internals, audio attachment, lock-screen control, Codex policy and
telemetry integration, and the original browser DOM/CDP backend are not
recovered. Browser windows can be operated only through their native AX surface.
Private APIs can change between macOS releases. Arbitrary AX actions can have
app-defined semantic focus effects that the helper cannot infer.

The original `codex` and `source` investigation backends remain selectable with
`CODEX_CUA_BACKEND`, but they are not the verified default and can fail the
original service authentication checks.
