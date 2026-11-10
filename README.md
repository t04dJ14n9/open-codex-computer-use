# Open Codex Computer Use

A self-contained macOS agent skill with a CLI and stdio MCP server for Claude
Code and other MCP clients. The repository root is the skill folder; runtime
sources and binaries live under `scripts/`.

The default runtime is a functional reconstruction. It preserves the recovered
Codex CUA JavaScript API while replacing the unavailable original native
service with a source-built Swift helper.

## Behavior

- Input is background-only: no target activation, window raising, global HID
  pointer delivery, or physical cursor warping.
- State and actions bind to an exact native `window_id`, with no largest-window
  fallback.
- `computer` and persistent `js` share one helper, AX state map, and cursor
  sequence.
- A click-through teal `AI` cursor animates the intended agent pointer path.
  It never becomes key.
- Foreground changes stop input. The helper does not fight back or restore
  focus against the user.
- Missing apps are not launched implicitly.

Clicks resolve supported AX controls. Plain single left clicks, unmodified keys,
editor select-all, Unicode text entry, `set_value`, verified `select_text`, and
press/increment/decrement secondary actions are supported. AX page scrolling is
used where the target implements it. Drag, shared-clipboard paste, raw canvas
clicks, window-raising actions, and other command shortcuts return explicit
refusals.

## Install

Requirements are macOS 14+ and Node.js 24.11+. The included helper targets Apple
Silicon. Xcode Command Line Tools are needed only for a rebuild, including an
Intel build. Git LFS is needed for the complete accessibility WAT disassembly;
the runtime does not use that file.

```sh
git lfs install
git clone git@github.com:t04dJ14n9/open-codex-computer-use.git
cd open-codex-computer-use
node scripts/setup.mjs
node scripts/install.mjs --claude claude --codex
./scripts/computer-use permissions --request
```

The installer links the complete folder into selected clients' skill
directories, registers `codex-computer-use` in Claude's user MCP configuration,
and adds only its four tool grants. Existing configuration is backed up under
`.local/installation-backup/`. Keep the checkout at its installed path and
restart existing client sessions.

## DeepSeek Harness (DSH)

`node scripts/install.mjs --dsh` also links this skill into
`~/.agents/skills/open-codex-computer-use` and appends one `codex-computer-use`
stdio MCP client entry to `~/.dsh/cordis.patch.yml`, backing up the previous
file under `.local/installation-backup/`. Start a new DSH session afterwards so
the skill and tools are discovered; the tools are named
`mcp__codex-computer-use__computer`, `__js`, `__js_reset`, and `__status`.
The CLI remains the fallback. `node scripts/verify-dsh.mjs` checks the link,
patch YAML, and live MCP tool list in one read-only command. See
[references/dsh.md](references/dsh.md) for the exact registration,
verification commands, and DSH-specific limits.

Enable **Codex Computer Use Standalone** in macOS Accessibility and Screen
Recording when prompted. The bundled app is ad-hoc signed, not notarized.
Verify the included hashes or rebuild from source before trusting the binary.

```sh
claude -p '/open-codex-computer-use List the running apps.'
./scripts/computer-use state Finder
./scripts/computer-use screenshot Finder finder.png
./scripts/computer-use status
```

Codex can discover `$open-codex-computer-use` and use the bundled CLI without a
separate MCP registration. Read [SKILL.md](SKILL.md) for operations,
[setup](references/setup.md) for configuration and rebuilds, and
[operations](references/operations.md) for schemas.

## Contents And Provenance

- `SKILL.md`, `agents/openai.yaml`: portable skill instructions and metadata.
- `references/dsh.md`: DeepSeek Harness installation, tools, and verification.
- `recovered-source/`: consolidated readable recovery of the shipped skill,
  `@oai/*` packages, browser derivatives, WAT, and native static evidence,
  with `manifest.json`, `RECOVERY-REPORT.md`, and `REA-EVIDENCE.md`.
  `recovered-source/readable/` holds prettier-formatted implementation JS plus
  three AST-verified browser views; `recovered-source/ARCHITECTURE.md` and
  `architecture/KEY-MODULES.md` document the full system and annotate the three
  key minified modules. `installed-newer/` covers the 44 source files added by
  the newer `@oai` packages in the installed ChatGPT.app (both builds are kept
  separate).
- `scripts/computer-use`: relocatable CLI/MCP launcher.
- `scripts/codex-computer-use-mcp/`: authored MCP/CLI, reconstructed supervisor,
  Swift native source, signed helper app, tests, and lockfile.
- `scripts/codex-computer-use-source/`: recovered shipped packages, embedded
  REPL JavaScript, browser derivatives, WASM disassembly, native analysis,
  original binaries, hashes, and retained notices.

This is not the complete original OpenAI source repository or an official
OpenAI project. Exact original Rust/Swift source and pre-minification browser
names remain unavailable. The working backend is `standalone`; original
`codex`/`source` investigation routes are not the verified default. See
[recovery status](scripts/codex-computer-use-mcp/RECOVERY-STATUS.md).

The name does not grant redistribution rights. No blanket open-source license
is applied to recovered artifacts; original notices remain attached. Keep this
repository private unless redistribution rights are established.

## Verify

```sh
node scripts/setup.mjs --check
cd scripts/codex-computer-use-mcp
npm test
npm run test:background
```

The protocol test is read-only apart from a Finder screenshot. The concurrent
background suite launches isolated scratch apps and verifies exact-window
state/actions, shared `computer`/`js` bindings, AX selection, cancellation,
stale windows, foreground changes, unsupported-action refusals, cursor
animation, and focus/pointer preservation. It needs an unlocked desktop and
the helper's macOS permissions.

The client-level result is summarized in
[references/verification.json](references/verification.json), with the verified
window and animated-cursor PNGs beside it. Local client transcripts, profile
paths, and unrelated app inventory are excluded.

## Limits

This is a finite reconstruction, not full original-service parity. Native
audio, lock-screen, policy/telemetry, and browser DOM/CDP integrations are not
implemented. Browser windows are controlled through their native AX surface.
Private macOS ABI is capability-checked but remains version-sensitive.
App-defined AX actions can have semantic focus effects that cannot be inferred
universally. The included fixture proves the tested action set, not parity for
every application.
