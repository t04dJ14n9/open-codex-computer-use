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
`node scripts/install.mjs --dsh` installs the skill into `~/.agents/skills/`
and registers `codex-computer-use` in `~/.dsh/cordis.patch.yml` for DeepSeek
Harness; it backs up the previous patch file, leaves other entries untouched,
and is idempotent. See [dsh.md](dsh.md).
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

## Configurable timeouts

All bridge deadlines default to 30 s. Chromium-based apps (e.g. WeCom) can have
a ~2,000-element AX tree that takes ~40 s to walk, so the default times out.
Set env vars on the MCP server (or CLI) to raise them. `CODEX_CUA_TIMEOUT_MS`
is the master default; layer-specific values override it. Both `CODEX_CUA_*`
and `COMPUTER_USE_*` prefixes work (the latter is shared with the portable
skill), with `CODEX_CUA_*` taking precedence.

| Variable | Applies to | Default |
| --- | --- | --- |
| `CODEX_CUA_TIMEOUT_MS` | master default for native + JS | `30000` |
| `CODEX_CUA_NATIVE_TIMEOUT_MS` | native helper request deadline | master |
| `CODEX_CUA_JS_TIMEOUT_MS` | JavaScript execution deadline | master |
| `CODEX_CUA_STATUS_TIMEOUT_MS` | `status` permission probe | `min(10000, master)` |
| `CODEX_CUA_MAX_TIMEOUT_MS` | ceiling for per-call `timeout_ms` | `max(600000, master)` |
| `CODEX_CUA_CANCEL_GRACE_MS` | grace before closing a cancelled helper | `1000` |

For a slow app, either run `node scripts/install.mjs --dsh --timeout-ms 120000`
(which writes `CODEX_CUA_TIMEOUT_MS` into the MCP server env, and also supports
`--claude` / `CUA_TIMEOUT_MS`), or add
`env: { "CODEX_CUA_TIMEOUT_MS": "120000" }` to the MCP server entry manually.
Then **restart the MCP session** — the helper and kernel workers read the values
at startup, and TCC/session state is tied to the running process. Values are
integer milliseconds, clamped to 1 s..1 h; invalid values fall back with a
stderr warning. No rebuild is needed (rebuilding the ad-hoc-signed helper would
invalidate TCC grants).

There is also a **per-call** `timeout_ms` on both `computer` and `js`, e.g.
`{"action":"screenshot","app":"WeCom#window=17498","timeout_ms":120000}`. It
raises that call's JS deadline and is forwarded to the native bridge; it is
clamped to `CODEX_CUA_MAX_TIMEOUT_MS`. `status` reports the effective values
under `timeouts` with the recognized env var names.

Background mode does not launch an app that is not running. Start it through
the user's normal app launch flow, then bind it by name, bundle ID, or path.
Do not substitute AppleScript, System Events, or global HID input to bypass a
`background_unavailable` refusal.
