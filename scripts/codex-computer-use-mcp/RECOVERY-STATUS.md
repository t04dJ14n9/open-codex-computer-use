# Recovery And Interoperability Status

Verified October 28, 2026. The practical Claude Code objective is met by the
standalone MCP/CLI; recovering all exact original native source is not met.

## Recovered Shipped Material

The package snapshot contains every regular file in the installed `cua_node`
node_modules tree and the original supervisor, with per-file SHA-256 hashes.
The original readable JS/type declarations, embedded REPL kernel/runtime,
browser bundles, resources, and dependencies are preserved. Readable browser
derivatives and complete WAT are provided with provenance and coverage limits.

REA recorded native Mach-O, dispatch metadata, and signature evidence:
`ev_6bf4ad38748e942470dd3b1291d9d909d4b4b2c9b40c2098de2fc29b608cabc3`,
`ev_c273ddb9e0720fc839e2fb23d4e9e13ede659e16c48554898fb127f9911b8810`,
`ev_3a1c921fede34d813d260e2121dab79b9062ce414cb812f04e9d60a5f3ff0f87`.
Native symbols and auth assembly are retained in the source snapshot.

## Reconstructed Source

`src/kernel-host.mjs` replaces the compiled supervisor using the recovered
original JavaScript workers. `native/ComputerUse.swift`,
`native/BackgroundInput.swift`, and `native/AgentCursor.swift` implement
exact-window AX observation, selected-window capture, background-only input, and
an independent animated cursor. `src/standalone-sky.mjs` exposes this helper as
the trusted Sky service, allowing the recovered `cua` API to run under ordinary
Node.js. MCP `computer` and `js` calls share the same helper process and window
state map. MCP and CLI source are provided without requiring an active Codex
chat or original native daemon.

This source is newly authored from the observed interface. It is not a decompiled
copy of the original Swift/Rust implementation, nor proof of full parity.

The background bridge dynamically loads and capability-checks
`_AXUIElementGetWindow`, `GetProcessForPID`, and `SLPSPostEventRecordTo`. It
targets synthetic active/key-window records inside the selected app without
activating that app at the WindowServer frontmost layer. Missing private
symbols disable input explicitly rather than falling back to global HID.

## Runtime Evidence

Early calls through the shipped Codex runtime listed apps and read Finder.
Later launches were rejected by the original service, including its native MCP
client, with `-10000: Sender process is not authenticated`. Static analysis
found process identity and ancestry predicates but did not fully establish the
runtime condition causing the rejection. The working standalone helper avoids
that product-host dependency and uses its own macOS TCC grants.

The final Claude Code run discovered the packaged skill and all four tools,
operated the scratch fixture, read back the exact verified marker, and received
a 520x272 PNG containing the whole window. No tool permission denials were
reported. `../../references/verification.json` retains a client-neutral summary;
`../../references/verified-skill-window.png` is the screenshot returned to Claude.
Local client transcripts and profile-specific metadata are excluded.

The concurrent-input fixture additionally verifies exact native-window binding,
shared `computer`/`js` state, coordinate and indexed clicks, verified selection,
cancellation cleanup, moved-window refusal, foreground-change refusal,
unsupported drag/paste/command-shortcut/scroll refusals, cursor animation and
click-through behavior, and absence of target/helper focus theft. Its AppKit
scroll view advertises an AX page action but returns `AXError.cannotComplete`;
the helper now reports `background_unavailable` instead of issuing a global
wheel event.

## Remaining Original-Source Gaps

Exact original Rust/Swift source, original comments and pre-minification names,
complete native asynchronous/indirect control flow, original audio/lock-screen
and product-host integrations, and the unshipped CDP backend remain unavailable.
Hopper's provider failed to produce pseudocode and reported incomplete retained
document cleanup; the exact diagnostics remain in native-analysis/calls.

Only the advertised basic app operations are reconstructed. Full native trees
replace diffs. Native browser app control is supported; Codex browser DOM and
audio attachment features are not independently implemented. Drag, shared
clipboard paste, raw canvas input, and universal scroll behavior remain
unverified and refuse. Private ABI and app-defined AX semantics remain
version- and application-dependent.

## 2026-11-10 addendum — fresh REA pass and DSH support

A second REA pass (6.7.0) ran against the currently installed
`~/.codex/computer-use/Codex Computer Use.app`. The installed service is a
**newer build** than the one analyzed in October: SHA-256
`469500545c940ecb20541d71a979461ea6bd22e92b513a87fa57eab90cd1061a`,
21,633,216 bytes, UUID `6B24ECFC-AD72-3AAF-93F3-7CE459EE0D4D`, Info.plist
version `26.1102.1001824` (macOS 26.1 SDK), versus `e798d6a2…` / `AD22C18C-…`
in the archived snapshot. Evidence IDs are indexed in
`../../recovered-source/REA-EVIDENCE.md`; the complete canonical bundle is
`../../.local/rea-evidence-bundle.json` (gitignored, 130 MB).

`../../recovered-source/` now consolidates all source-bearing shipped material
(865 files, ~38 MB): the byte-for-byte shipped `computer-use` plugin including
the full SKILL.md and Computer Use Confirmations Policy, the `@oai/*` packages'
JS/TS declarations, cua-repl instructions, browser-desktop scripts and
formatted derivatives, source-map-decoded chunks, WAT disassembly, the
`node_repl` embedded kernel, runtime config, and bounded native static-analysis
evidence. Hopper remains blocked by a macOS Automation permission denial; no
native pseudocode was produced, so exact Swift/Rust source is still unavailable.

The reconstruction was made usable on DeepSeek Harness:
`node scripts/install.mjs --dsh` links the skill into `~/.agents/skills/` and
appends one `codex-computer-use` stdio MCP entry to `~/.dsh/cordis.patch.yml`
(backed up and idempotent). See `../../references/dsh.md`. Verified: the patch
YAML parses to three inserts with existing entries intact; the MCP stdio
handshake exposes `computer`, `js`, `js_reset`, `status`; `list_apps` returns
real running apps; and CLI `status` now reports permissions without a spurious
error. A new DSH session is required before the MCP tools attach. macOS
Accessibility and Screen Recording remain ungranted on this Mac, so AX trees,
screenshots, clicks and typing still require the user to grant those
permissions.

### Readable source, architecture documentation and version skew

`recovered-source/readable/` now holds prettier-formatted implementation JS
(230 JS/MJS outputs, all parse-checked) plus three earlier Babel-based,
normalized-AST-verified browser views. `recovered-source/ARCHITECTURE.md`
(570 lines) documents the full shipped system and reconstruction;
`architecture/KEY-MODULES.md` annotates `sky.js`, `cua.js` and
`browser-service.mjs` with inferred binding glossaries. A read-only coverage
audit found the installed ChatGPT.app ships newer `@oai` packages
(`@oai/sky` 0.7.17, `@oai/cua-repl` 0.1.3) adding 44 source-bearing files;
these are recovered byte-for-byte in `recovered-source/installed-newer/`
(with formatted copies) so both builds are covered. `packages/` remains the
byte-faithful October snapshot. See
`../../recovered-source/installed-newer/VERSION-SKEW.md`.
