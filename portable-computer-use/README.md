# Portable Computer Use

A clean, self-contained **cross-platform** computer-use **Agent Skill** for
macOS, Windows and Linux (X11/Wayland). Any MCP-capable agent (Claude Code,
Codex, DeepSeek Harness, Cursor, Windsurf, Gemini CLI, or a custom client) can
use it. There is no OpenAI/Codex product host, no `node_repl`, no `@oai/*`
packages, no `CODEX_*` environment variables, no signed supervisor, no XPC
service and no IPC socket.

The repository root *is* the skill folder. Runtime sources live in `src/`; the
authored Swift helper (macOS) and Python helper (Windows/Linux) live in
`native/` and `build/`.

## What is inside

| Path | Purpose |
| --- | --- |
| `SKILL.md` | Portable skill instructions (standard `name`/`description` frontmatter) |
| `src/server.mjs` | stdio MCP server: `computer`, `js`, `js_reset`, `status` + `computer-use` prompt |
| `src/cli.mjs` | CLI: `mcp`, `status`, `permissions`, `list-apps`, `state`, `screenshot`, `js`, `computer` |
| `src/runtime.mjs` | Persistent Node VM session for `js` (documented `cua` + `nodeRepl` API) |
| `src/api.mjs` | Freshly authored `cua` façade over the helper |
| `src/helper.mjs` | JSON-lines bridge to the bundled helper process |
| `src/config.mjs`, `src/tools.mjs` | Paths, schemas, tool implementations |
| `native/*.swift`, `native/Info.plist` | Authored Swift helper source (public APIs + capability-checked private ABI) |
| `build/Computer Use Helper.app` | Ad-hoc-signed arm64 helper binary |
| `scripts/setup.mjs`, `scripts/verify.mjs` | Dependency/hash check and end-to-end self-check |
| `scripts/build-native.mjs` | Rebuild the helper (Xcode Command Line Tools needed) |
| `scripts/install.mjs`, `references/clients.md` | Registration for any agent |

## Requirements

- macOS 14 or later, Apple Silicon (the bundled helper is arm64; rebuild for Intel).
- Node.js 20 or later.
- macOS **Accessibility** and **Screen Recording** granted to the helper app.
  Grant them in System Settings; `bin/computer-use permissions --request` opens
  the prompts. A TCC change usually requires relaunching the helper/MCP server.
- The desktop must be unlocked for meaningful AX window inspection and capture.

## Setup

```sh
node scripts/setup.mjs          # installs locked npm dependencies
node scripts/setup.mjs --check  # validates platform, helper hashes and deps
node scripts/verify.mjs         # skill link/config + live MCP tool handshake
```

`npm test` runs four suites: platform detection (`test/backend.mjs`), a
contract-compliant mock-helper seam test (`test/portable-seam.mjs`) that proves
the JS/MCP layers are OS-independent, the real Windows/Linux Python helper with
stubbed OS tools (`test/cross-platform-helper.mjs`), and the live macOS protocol
test (`test/protocol.mjs`). `setup.mjs` never changes any agent configuration
or macOS permissions.

## Install into an agent

```sh
node scripts/install.mjs --print-config          # universal MCP JSON snippet
node scripts/install.mjs --claude               # Claude Code
node scripts/install.mjs --codex                # Codex (skill link; CLI fallback)
node scripts/install.mjs --dsh                  # DeepSeek Harness
node scripts/install.mjs --cursor --windsurf --gemini
node scripts/install.mjs --generic /path/to/mcp.json
node scripts/install.mjs --all
```

The installer links this folder into each client's skill directory, merges the
`mcpServers` entry without clobbering existing config, backs up the original
file under `.local/installation-backup/`, and is idempotent. Start a new session
in each client afterwards. See [references/clients.md](references/clients.md)
for exact paths, the universal JSON snippet, and the CLI fallback.

## Universal MCP registration

Any stdio MCP client can register the same entry:

```json
{
  "mcpServers": {
    "portable-computer-use": {
      "type": "stdio",
      "command": "/absolute/path/portable-computer-use/bin/computer-use",
      "args": ["mcp"]
    }
  }
}
```

No environment variables are required. Optional overrides:
`COMPUTER_USE_NODE` (Node binary) and `COMPUTER_USE_HELPER` (alternate helper
executable).

## CLI fallback

```sh
./bin/computer-use status
./bin/computer-use list-apps
./bin/computer-use state Finder
./bin/computer-use screenshot Finder finder.png
./bin/computer-use js 'await cua.listApps()'
./bin/computer-use computer '{"action":"get_app_state","app":"Finder"}'
```

Each CLI invocation starts a new runtime session, so batch indexed actions with
`js --file` or use the MCP `js` tool.

## Design boundaries

- **Background-only input.** No target activation, window raising, global HID
  pointer delivery, or physical cursor warping. Missing apps are not launched.
- **Exact-window binding.** `window_id` from `list_apps`; no largest-window
  fallback.
- **Explicit refusals.** Drag, shared-clipboard paste, raw canvas clicks,
  command shortcuts and failing AX page-scroll actions return a typed refusal
  rather than falling back to global input.
- **Focus preservation.** A foreground change stops input; the helper never
  fights the user for focus.
- **No original source.** The Swift helper and all `src/*.mjs` files are newly
  authored. They reimplement the observed interface; they are not decompiled or
  recovered vendor code.

## Platform support and porting

The JS/MCP layers are platform-neutral. Three native backends ship:

| Platform | Helper | Requirement |
| --- | --- | --- |
| macOS | Swift `build/Computer Use Helper.app` | macOS 14+, Accessibility + Screen Recording |
| Windows | Python `build/windows/computer_use_helper.py` | Python 3.8+ (`python`/`py`), Windows PowerShell 5.1 |
| Linux X11 / Wayland | Python `build/linux/computer_use_helper.py` | Python 3.8+ (`python3`), optional `xdotool`/AT-SPI2/portal tools |

[`src/backend.mjs`](src/backend.mjs) detects platform/session and returns a
helper spec `{ command, args }`; `status` and `setup.mjs --check` report
`backendStatus` and helper-provided capabilities. Run
`node scripts/build-cross-platform.mjs` to (re)materialize the two Python
helpers and their hashes. See:

- [native/crossplatform/README.md](native/crossplatform/README.md) — helper
  install, optional OS tools, capability honesty, target-OS verification checklist.
- [porting/PORTING-RESEARCH.md](porting/PORTING-RESEARCH.md) — API mappings for
  Windows (UI Automation, `SendInput`, `PrintWindow`, UIAccess/UIPI) and Wayland
  (ScreenCast/RemoteDesktop portals, PipeWire, libei, AT-SPI2, compositor
  protocols), capability matrix, and the finding that Wayland cannot reproduce
  macOS background-only window-targeted input.
- [porting/BACKEND-CONTRACT.md](porting/BACKEND-CONTRACT.md) — the exact
  JSON-lines helper protocol all three backends implement.

The Windows/Linux helpers are real code and are protocol-tested with stubbed OS
tools on this macOS host; their native OS APIs must be validated on real
Windows/Linux desktops (see the verification checklist linked above).

## Limits

Native audio recording, lock-screen, policy/telemetry and browser DOM/CDP
integrations are not implemented. Browser windows are controlled through their
native AX surface. Private macOS ABI is capability-checked but
version-sensitive. App-defined AX actions can have semantic focus effects that
cannot be inferred universally. On Windows/Wayland the helper is absent until a
port is built; the `status` tool reports this explicitly.
