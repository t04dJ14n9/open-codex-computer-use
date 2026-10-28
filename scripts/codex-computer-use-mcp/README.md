# Codex Computer Use For Claude

Working macOS MCP and CLI for Claude Code, verified October 28, 2026.
The default implementation combines the recovered Codex CUA JavaScript API
and REPL kernel with a source-built Swift accessibility/input helper and a
source JavaScript supervisor. It runs under ordinary Node.js and does not
require the original Codex service, compiled `node_repl`, or an active Codex chat.

This is a functional reconstruction, not the original complete OpenAI source
repository. See `../codex-computer-use-source/README.md` for recovery scope.

## Use Now

After installation, restart an existing Claude Code session to load the MCP
tools and skill, then enter:

```text
/open-codex-computer-use List the running apps
```

Natural-language computer tasks also work without the slash command.
`/mcp` lists the connected server. Tools are `computer`, `js`, `js_reset`,
and `status`; an MCP prompt named `computer-use` is included too.

```sh
claude mcp get codex-computer-use
claude -p '/open-codex-computer-use Read Finder state and take a screenshot.'
```

## CLI

From this directory:

```sh
./bin/codex-computer-use list-apps
./bin/codex-computer-use state Finder
./bin/codex-computer-use screenshot Finder finder.png
./bin/codex-computer-use status
./bin/codex-computer-use permissions
./bin/codex-computer-use js 'nodeRepl.write(await cua.listApps({emit:false}));'
```

`computer` accepts a JSON object with `action` and its arguments. Supported
actions: `list_apps`, `get_app_state`, `screenshot`, `click`, `press_key`,
`type_text`, `paste`, `scroll`, `drag`, `set_value`, `select_text`, and
`perform_secondary_action`. Every action except `list_apps` requires `app`.
Use fresh `element_index` values from app state, or coordinates in the returned
window screenshot. Keyboard chords include `Super_L+a`, `Return`, and `Tab`.
Each CLI invocation starts a fresh session; use `js --file` to batch state and
indexed actions. MCP keeps the session and element bindings between tool calls.

## Rebuild And Install

Requires macOS 14+, Node.js 24.11+ or 26+, and Xcode Command Line Tools to rebuild.
Apple Silicon is tested; the build script also accepts `CUA_NATIVE_ARCH=x86_64`.
Keep this directory beside `codex-computer-use-source` when extracting archives.

```sh
npm ci --ignore-scripts
npm run build:native
./install.sh
./bin/codex-computer-use permissions --request
```

Enable **Codex Computer Use Standalone** in Accessibility and Screen Recording
when macOS prompts. Permissions must be granted on each Mac.
An ad-hoc signature with a stable designated requirement preserves the app
identity across rebuilds. Native source and build hashes are in
`native/ComputerUse.swift` and `build/native-manifest.json`.

The installer adds this server, the `/open-codex-computer-use` skill, and four
tool-specific permission grants under `~/.claude`. Existing files are backed
up beneath the repository's `.local/installation-backup/` directory.
`CUA_CLAUDE_CONFIG_DIR` and `CUA_CLAUDE_CONFIG_FILE` select a custom profile;
`CLAUDE_CLI` selects an alternate executable path.

`npm run recover` makes another byte-preserving copy of the installed
ChatGPT `cua_node` packages; the supplied snapshot is already included.

## Source Layout

- `src/server.mjs`, `src/tools.mjs`: MCP interface and action validation.
- `src/kernel-host.mjs`: reconstructed persistent REPL supervisor.
- `src/standalone-sky.mjs`: native JSONL bridge behind the recovered `cua` API.
- `native/ComputerUse.swift`: source for native app inventory, AX trees,
  screenshots, keyboard/mouse input, selection, and clipboard handling.
- `scripts/build-native.mjs`: reproducible compiler/signing pipeline.
- `../codex-computer-use-source/node-repl-embedded`: recovered original kernel.
- `../codex-computer-use-source/shipped-runtime/node_modules`: complete installed
  package snapshot, including the dependencies missing from the earlier recovery.

## Verification

`npm test` passed the MCP handshake, tool/prompt discovery, app inventory,
Finder accessibility, screenshots, persistent bindings, error recovery, and reset.
`./bin/codex-computer-use test/actions.mjs` passed keyboard, text entry,
selection, set-value, paste, secondary actions, coordinate clicks, and image checks
against the dedicated CUA Verification fixture. `test/protocol-result.json`
and `test/actions-result.json` retain the results.

Claude Code loaded the packaged skill, clicked the fixture input, selected its
contents, typed an exact marker, clicked Verify, read the resulting state, and
received a full 520x272 screenshot. See `../../references/verification.json`
and `../../references/verified-skill-window.png`. Local client transcripts
are deliberately excluded.

## Limits

The standalone helper covers the basic macOS computer API, not every behavior
of the original native service. It returns full trees rather than diffs and
chooses the largest visible window of an app. It does not implement original
audio attachment, lock-screen, policy, telemetry, calendar, messaging, or
Codex-host browser DOM features. Browser windows can be operated as native apps.
Scroll and drag are implemented; they have not been tested across arbitrary apps.

The original-source `codex`/`source` backends are preserved for investigation
through `CODEX_CUA_BACKEND`, but the original service rejected later direct
launches with **Sender process is not authenticated**. They are not the verified
default. The working default is `standalone`.
