# Portable Computer Use — Native Helper

This directory holds the Swift sources and the pre-built, ad-hoc–signed macOS
helper application used by the portable computer-use skill. The shipped helper
is `../build/Computer Use Helper.app`; `build/native-manifest.json` records its
identity and content hashes.

## Newly authored reconstruction

The helper is **newly authored code**, not recovered or extracted OpenAI / Codex
source. It is a clean-room reconstruction written against public Apple
frameworks — AppKit, Accessibility (`ApplicationServices` / `AXUIElement`),
CoreGraphics, QuartzCore, and ScreenCaptureKit — plus a small, isolated set of
capability-checked private macOS ABI declarations. It is a functional
reconstruction, not original-source parity. Third-party provenance for the
private-ABI adaptations is recorded in `THIRD-PARTY-NOTICES.md`.

## Design

- **Background-only input.** The helper never activates, raises, or globally
  drives the target process or window. It delivers synthetic events to one
  specific window without stealing focus, warping the physical pointer, or
  restoring focus behind the user's back. A foreground change stops input.
- **Exact-window binding.** Observation and actions are bound to a single AX
  window by its native `window_id`. Coordinates are window-relative and resolve
  only supported accessibility controls; there is no raw global-pixel fallback.
- **Click-through AI cursor.** A teal, non-activating, click-through overlay
  panel animates the intended pointer path without becoming key or moving the
  real cursor, and hides after inactivity. Set `CODEX_CUA_VISUAL_CURSOR=0` to
  disable it.
- **Capability-checked private ABI.** Background input uses a few undocumented
  SkyLight / ApplicationServices symbols (`dlsym`-resolved at runtime). If any
  required symbol is missing, the helper fails closed with an explicit
  `background_unavailable` error rather than crashing or falling back to global
  input. Private ABI is version-sensitive and can change between macOS releases.
- **Ad-hoc signature, stable identity.** The helper is ad-hoc signed with a
  stable designated requirement keyed to the bundle identifier
  `local.codex.computer-use.standalone`. The pre-built bundle was copied
  **byte-for-byte with its code signature intact** and its `Info.plist` (and
  therefore its bundle identifier) unchanged, so it keeps the exact same code
  identity. Do not rename, re-sign, or edit the copied `Info.plist`.

## Required macOS permissions (TCC)

macOS privacy grants are per-Mac, per-application and are **not** included in
this repository. The user must grant:

- **Accessibility** — System Settings → Privacy & Security → Accessibility, to
  read and operate accessibility elements.
- **Screen Recording** — System Settings → Privacy & Security → Screen
  Recording, for ScreenCaptureKit window screenshots.

The helper is an `LSUIElement` (no Dock icon). macOS prompts on first use, or
the grants can be requested through the CLI's `permissions --request`.

## Rebuilding from source

Requirements: macOS 14+, Node.js 18+, and the Xcode Command Line Tools
(`xcode-select --install`) so `swiftc` is available.

```sh
cd portable-computer-use
node scripts/build-native.mjs
```

The build compiles `ComputerUse.swift`, `BackgroundInput.swift`, and
`AgentCursor.swift` for arm64 (minimum macOS 14), re-signs the bundle ad hoc,
and refreshes `build/native-manifest.json`.

> **Important — rebuilding invalidates the TCC grants.** A rebuild produces a
> **new** ad-hoc code signature (a new code-directory hash). macOS TCC ties the
> Accessibility and Screen Recording grants to that code identity, so after a
> rebuild you must **re-grant** both permissions (remove and re-add the helper,
> or toggle the grants). The existing grant for the copied, pre-signed bundle
> will no longer apply. This is precisely why the shipped helper is copied
> byte-for-byte rather than rebuilt: doing so preserves the already-granted
> Accessibility permission without requiring the user to re-authorize it.

## Legacy identifiers (inert)

Because the shipped helper is a byte-for-byte copy of an earlier build, its
compiled code still carries three harmless leftovers from that earlier naming.
None of them is a dependency, and no product host is consulted:

- The bundle identifier `local.codex.computer-use.standalone` and the two
  `CFBundleName` strings in `Info.plist`. Changing them would change the code
  identity and invalidate the macOS TCC grants, so they are deliberately kept.
- Two optional environment toggles, `CODEX_CUA_VISUAL_CURSOR` (cursor overlay,
  on unless set to `0`) and `CODEX_CUA_ENABLE_TEST_HOOKS` (test-only, off
  unless set to `1`). `src/helper.mjs` sets neither, so both use their safe
  defaults. They are not read by the skill's JavaScript runtime.
- Two permission-error strings mentioning the old helper name. `src/helper.mjs`
  rewrites them to "the bundled Computer Use Helper" before they reach any
  agent, so callers never see the old name.

The skill's own `src/`, `SKILL.md`, `README.md`, installer and MCP protocol
contain no such names. If you rebuild from `native/`, you may rename these
identifiers — but you must then re-grant Accessibility and Screen Recording.
