# Recovered Source — Codex Computer Use skill

Generated at: 2026-11-10T02:57:30Z (UTC).

`recovered-source/` is a clean, browsable consolidation of the **source-bearing
text material** for the Codex Computer Use skill. Every file here is a real byte
copy (no symlinks) from one of two roots, recorded with its SHA-256 and absolute
origin in `manifest.json`:

- **Shipped plugin**: `/Applications/ChatGPT.app/Contents/Resources/plugins/openai-bundled/plugins/computer-use/`
  (the original, not previously in this repo).
- **Existing recovery snapshot**: `/Users/t04dj14n9/Code/open-codex-computer-use/scripts/codex-computer-use-source`
  (`scripts/codex-computer-use-source/`), a static recovery of the installed
  Codex/ChatGPT build `26.1023.50603`.

Total size is kept under ~40 MB. Binaries and bulky assets (`.wasm`, `.node`,
`.png`/`.icns`/`.car`, `.app`/`.bundle`/`_CodeSignature` subtrees, compiled
Mach-O, `node_modules` vendor trees, `leveldb/`) are excluded; the only binary
retained is the shipped plugin's `app-icon.png` (see `skill/PROVENANCE.md`).

## What was recovered

| Section | Files | Bytes |
|---|---:|---:|
| `browser` | 25 | 29,004,827 |
| `docs` | 43 | 219,236 |
| `native` | 21 | 637,995 |
| `node-repl` | 10 | 347,057 |
| `packages/browser-desktop` | 103 | 2,872,588 |
| `packages/cua` | 377 | 2,468,380 |
| `packages/cua-repl` | 38 | 30,393 |
| `packages/sky` | 239 | 231,648 |
| `runtime-config` | 3 | 3,937 |
| `skill` | 3 | 938,528 |

Counts cover the copied data files only (not `manifest.json`,
`RECOVERY-REPORT.md`, or `skill/PROVENANCE.md`, which are authored here).

Notable recovered files:

- **Full shipped `SKILL.md`** (`skill/skills/computer-use/SKILL.md`) — the real
  instructions including the *Computer Use Confirmations Policy*, confirmation
  modes, and the `@oai/sky` bootstrap.
- **`@oai/sky`** — TypeScript declarations (`.d.ts`) and JS implementation for
  the macOS computer-use client, approval flow, native-pipe transport and the
  linux/mac/windows targets (`packages/sky/dist/...`), plus API docs.
- **`@oai/cua`** — `.js` + `.d.ts` for the unified CUA API and the browser
  bindings (`packages/cua/dist/lib/js/oai_js_*`), plus the tinysky-alt docs.
- **`@oai/cua-repl`** — `instructions/` markdown (linux/macos/windows browser,
  computer, cloud guidance, reset/server) and the MCP wrapper JS.
- **`@oai/browser-desktop`** — `environment-docs/` cloud/codex-app/orbit/training
  markdown + `api.json`/`documents.json`, and the shipped
  `scripts/browser-client.mjs` / `scripts/browser-service.mjs`.
- **Formatted browser derivatives** — prettified shipped browser JS
  (`browser/format-only-installed/`), decoded source-map chunks and their
  `.js.map`/`.mjs.map` (`browser/embedded/`), and the browser README,
  symbol index and dependency inventory.
- **WASM disassembly** — small `*.headers.txt` and `*.metadata.json`, and
  `zxing_reader.wat` (WAT text) under `browser/wasm/`; the `.wasm` binaries are
  excluded.
- **node_repl embedded kernel** — `kernel.js`, `trusted-worker.js`,
  `worker-runtime.js`, `privileged-node-repl.js`, `realmChecks.js`, Meriyah, etc.
  (`node-repl/`), JavaScript extracted from the native `node_repl` Mach-O.
- **runtime config** — `plugin.json`, `.mcp.json`,
  `require-browser-access.mjs` (`runtime-config/`).
- **original API/skill docs** — `docs/sky/`, `docs/cua/`, `docs/cua-repl/`.

## Nature of the material (three distinct tiers)

1. **Original readable JS/TS shipped inside the npm packages.** The `@oai/*`
   packages distribute compiled-but-readable `.js` plus generated `.d.ts`
   TypeScript declarations, real `.md` docs and `package.json`. These are the
   closest thing to author source that was actually present in the shipped
   product; most are OpenAI-authored source artifacts, not decompilation.
   Exception: `packages/cua/dist/_virtual/` holds 63 rollup/Statsig third-party
   vendor virtual modules that were kept because they sit outside a nested
   `node_modules` segment — they are not OpenAI author source.
2. **Minified / derived browser JS.** The browser service/client bundles ship
   minified. `browser/format-only-installed/` is a prettified reprint,
   `browser/embedded/*.decoded.*` are decoded programs recovered from embedded
   source maps, and the `*.js.map`/`*.mjs.map` are generated maps. Formatting
   and decoding restore *readability*, not original identifiers, comments, or
   module boundaries. No original author source maps were present in the build.
3. **Static-analysis-only native evidence (`native/`).** `REPORT.md`, bounded
   type signatures (`*-signature.txt`), imports (`service-imports.raw.txt`),
   bounded ARM64 assembly (`service-auth-*.asm.txt`), the
   `calls/*.json` call/dispatch records, and the derived
   `symbol-index-compact.txt` / `DERIVATIVES.md` are *observations produced by
   static analysis of the shipped Mach-O binaries*. The six full
   `*-symbols.*.txt` dumps were omitted by the 2 MB per-file cap; a bounded
   derivative is provided instead (see "Bounded derivatives" below).
   **This is evidence about the binaries, NOT original Swift/Rust source.**

### What is explicitly NOT recovered

- The exact original Swift (`SkyComputerUseService`) and Rust (`node_repl`)
  source is **not recoverable** from the shipped Mach-O binaries. Original
  comments, local names, types and pre-minification identifiers are gone.
- Reverse-engineering (Hopper) produced **no pseudocode** for the native
  targets; only symbols, signatures, imports and bounded assembly were
  obtained. No C/Swift pseudocode file exists in the snapshot.
- The workspace's `scripts/codex-computer-use-mcp/src/*.mjs` and
  `scripts/codex-computer-use-mcp/native/*.swift` (e.g. `server.mjs`,
  `tools.mjs`, `ComputerUse.swift`, `BackgroundInput.swift`) are a **newly
  authored reconstruction** built to re-implement the interface. They are not
  recovered OpenAI source and are deliberately kept out of this tree.

## REA evidence

All IDs below were produced in this session by REA 6.7.0 against the shipped
artifacts. The complete canonical Evidence bundle (16 records, 0 residual
unknowns; 130 MB because the JavaScript application graphs are large) is
exported to `.local/rea-evidence-bundle.json` (gitignored). A compact ID index
is [REA-EVIDENCE.md](REA-EVIDENCE.md).

### Shipped native service (installed build)

The currently installed
`~/.codex/computer-use/Codex Computer Use.app/Contents/MacOS/SkyComputerUseService`
is **a newer build than the October snapshot**: SHA-256
`469500545c940ecb20541d71a979461ea6bd22e92b513a87fa57eab90cd1061a`,
21,633,216 bytes, UUID `6B24ECFC-AD72-3AAF-93F3-7CE459EE0D4D`, versus the
archived `e798d6a2…` (25,117,232 bytes, `AD22C18C-…`). The evidence below
describes the installed build, not the archived one.

- `ev_900441182d0b9c5d93bcbe32cb4a17716b20e0081d650a26eb03aa3ef54293bd` —
  `inspect_macho`: arm64 thin, 90 load commands, 70 dylib dependencies,
  4,692 imports and 43,876 exports (non-exhaustive), 5 segments. Summary view
  `ev_873dc105135d3482041ea862bd2ea16cb2595b3fde1166399f544e81ca61b8b0`.
- `ev_c51b0b6da05020ac8d4718404efb1270f55e0b76fa1cc16b50d0b9b20eb973b8` —
  `inspect_signature`: signed `com.openai.sky.CUAService`, team `2DC432GLL2`,
  hardened runtime, Developer ID Application: OpenAI OpCo, LLC; entitlements
  include Apple Events automation and addressbook/calendar access; timestamp
  3 Nov 2026.
- `ev_79f9c5b9c775ec93cc8d5acbf08c66dd01133c4ed2a8764f7a82f27855b81f14` —
  `inspect_plist` (Info.plist): version `26.1102.1001824`, macOS 26.1 SDK,
  minimum macOS 14.4, Sparkle auto-update feed.
- `ev_874ed2261ad9279096e77bd074ea73138674d5c32c50b8e644cedebfd2510393` —
  `inspect_native_dispatch_metadata` (300-record budget, macOS metadata
  reader): decoded Objective-C/XPC protocol declarations such as
  `SAIComputerUseIPCXPCProtocol.sendRequestWithTypeName:requestData:codexMetadataData:fileDescriptors:withReply:`,
  `SAILockScreenGuardianXPCProtocol`, and
  `SAIRemoteHostedPIPContentHostXPCProtocol`. Class bodies, Swift witness/vtable
  and ivar coverage remain partial or unsupported.

### JavaScript application graphs (static, inert parsing)

- `ev_b4429454a8a74f2d8958b9e4fb2f38ac626dc74c0f2b7d3777cc3862b614711f` —
  shipped `@oai/*` packages: 13 selected entry modules, 47,685 AST nodes, 76
  findings; 788 inventoried files deliberately outside analysis scope. Views:
  `ev_10ba0c2b9961aad79acf9a404f61bd08d592feb691f3f83231fa269fbe06a405`
  (summary), `ev_c6c25ae8c333cb6e69c2f53b5f9346d146ee35e6e5913d0cff500085ef8de96a`
  (module page). `ev_bcd4c4ebf782e83ba6517e5598878cdcbf436a228854e0df0a3ea2ff05919aee`
  is the retained `trace_application_feature` result for the `get_app_state`
  seed; its complete response exceeded the MCP transport budget and is preserved
  in the exported bundle.
- `ev_65bfffccc50fdb82d6774ac89d511d0bc97f54588f07ea75c60bae61ad295533` —
  `node-repl-embedded` kernel/worker JS: 8 files, 14,693 AST nodes, 93 findings.
  Summary view `ev_ad5a666390b730d7add764541f4737bd0ad99e042134a47d1d561cd004f2f721`.
- `ev_7c1200d29e069eb09471a05270a9fb826338c1743fad5750d0ad6f7f798d680f` —
  source-map-decoded browser chunks: 7 files, 45,669 AST nodes, 16 findings,
  1 parse failure. Summary view
  `ev_5b32f6be4329d321762fcfa160cfcc3d077ac7356f314f46cdd6013bdf48f19f`.

These graphs contain static syntax observations and conservative relationship
candidates; they do not establish runtime execution, module loading, or
behavioral equivalence. Coverage is explicitly partial in each record.

### Shipped skill plugin inventory

- `ev_8d7337700494ae410ba7562be5c2eecb14e3e7b488f32177ad3f7aa19f920d12` —
  `inspect_artifact` of a byte-for-byte ZIP of the shipped `computer-use` plugin
  (SHA-256 `3a6ccb633f4aec2cdd422ee0a50e6dece864b8faee1dcc1432b5ab7cff8c59dc`):
  8 nodes, 8 occurrences, 7 edges, 4 files + 4 directories,
  `source_complete: true`, 0 integrity contradictions. Inventory record
  `ev_b25f3429efb255ba54ebd8d6cbe858ecc5b7b41d3097aff020bedb7780ce8a7d`;
  summary view `ev_62e11feed242252827873b3e719c66f1894e6dc9548a963e8ad5f7047a11a150`.

### Earlier (October 2026) evidence, carried as context

`RECOVERY-STATUS.md` cites
`ev_6bf4ad38748e942470dd3b1291d9d909d4b4b2c9b40c2098de2fc29b608cabc3`
(Mach-O identity/layout), `ev_c273ddb9e0720fc839e2fb23d4e9e13ede659e16c48554898fb127f9911b8810`
(400-record dispatch metadata) and `ev_3a1c921fede34d813d260e2121dab79b9062ce414cb812f04e9d60a5f3ff0f87`
(signature/entitlements). They describe the older `e798d6a2…` binary. The
snapshot's own `README.md` also cites five wrapper/CUA/Sky/browser/node-REPL
IDs; those are provenance references from that earlier run.

### Blocked capability

`binary_overview` and `get_objc_classes` failed with `provider_unavailable`:
macOS denied sending Apple Events to Hopper Disassembler. No native pseudocode
was produced. Grant Automation permission to the process that starts REA under
System Settings > Privacy & Security > Automation to retry; until then, exact
Swift/Rust source remains unavailable, consistent with the October finding.

## Coverage / unknowns

- Full original Swift/Rust source, author comments, and original source maps are
  unavailable and cannot be reconstructed from the shipped binaries.
- Browser minified bundles retain their original (mangled) identifiers; only a
  formatted/decoded *derivative* exists, not pre-minification source.
- The large native symbol dumps (`*-symbols.*.txt`, 5–14 MB each) and
  `rea-service-preflight.json` (11 MB) were omitted by the 2 MB per-file cap;
  `service-symbols.raw.txt`-level completeness of the symbol inventory is not
  reproduced here.
- `browser-accessibility.wat` (a ~202 MB WAT disassembly) was omitted because a
  single file that large would exceed the ~40 MB total budget by ~5x; only its
  headers/metadata and the smaller `zxing_reader.wat` are retained. WAT is
  generated text disassembly, not author source.
- `@oai/cdp-browser-backend` is a metadata-only dependency with no installed
  source in the artifact tree.
- This is a static consolidation; no runtime behavior, interoperability, or
  source equivalence is claimed or tested here.

## Deliberately skipped — too large

- `native-analysis/client-symbols.demangled.txt` — 10,078,116 bytes (native per-file 2 MB cap).
- `native-analysis/client-symbols.raw.txt` — 8,480,623 bytes (native per-file 2 MB cap).
- `native-analysis/node-repl-symbols.raw.txt` — 5,416,447 bytes (native per-file 2 MB cap).
- `native-analysis/rea-service-preflight.json` — 11,453,075 bytes (native per-file 2 MB cap).
- `native-analysis/service-symbols.demangled.txt` — 13,681,020 bytes (native per-file 2 MB cap).
- `native-analysis/service-symbols.raw.txt` — 11,501,232 bytes (native per-file 2 MB cap).
- `readable-browser/wasm/browser-accessibility.wat` — 202,768,105 bytes (WAT exceeds ~40 MB total budget).

## Bounded derivatives of large artifacts

The seven artifacts in the "Deliberately skipped — too large" list above now
have **bounded derivatives** in this tree, added without exceeding the ~40 MB
budget (total new bytes kept under 1.5 MB):

- `browser/wasm/browser-accessibility.wat.summary.md` — a <300 KB structural
  summary of the ~202 MB `browser-accessibility.wat`: source SHA-256, byte size,
  first ~120 lines (verbatim, truncated at 300 chars), literal WAT token
  occurrence counts, and deduplicated/sorted export + import lists. It is
  generated WAT disassembly, not author source.
- `native/symbol-index-compact.txt` — a <600 KB filtered, deduplicated, sorted
  and byte-bounded index of symbol lines from the five `*-symbols*.txt` dumps,
  plus a bounded `rea-service-preflight.json` header (SHA-256, byte size,
  top-level keys, near-top `evidence_id`/`operation` values).
- `native/DERIVATIVES.md` — notes on scope, the size-budget rationale, the full
  original paths, and the fact that these are bounded derivatives, NOT original
  Swift/Rust source or a complete symbol inventory.

These are compact derivatives only; the full originals remain at their paths in
`scripts/codex-computer-use-source/` and are not byte-copied here. The earlier
"Deliberately skipped" list is therefore now covered by bounded summaries.

## Readable implementation JS and architecture documentation

The shipped `@oai/*` packages contain compiled/minified JavaScript, not author
source. To make the three named implementation files readable, a second
derivative layer was added:

- [`readable/`](readable/MANIFEST.md) — 761 files / 12 MB. Prettier 3.9.10
  formatted 227 `.js`/`.mjs` files under `readable/packages/` (all 230 JS/MJS
  outputs pass `node --input-type=module --check`), and three earlier
  Babel-based, **normalized-AST-verified** browser views were copied byte-for-
  byte into `readable/ast-verified/` (`browser-service.mjs`,
  `browser-client.mjs`, `browser-client.js`). Examples: `sky.js` 1 → 101 lines,
  `cua.js` 1 → 21 lines, `browser-service.mjs` 9,373 → 80,883 lines.
- [`architecture/KEY-MODULES.md`](architecture/KEY-MODULES.md) — annotated
  reading guide with inferred binding glossaries for `sky.js`, `cua.js`, and
  the `browser-service.mjs` bundle (seven embedded programs, WebMCP,
  Playwright injection, DOM helpers, WASM). Every inferred name is labelled as
  analyst inference.
- [`ARCHITECTURE.md`](ARCHITECTURE.md) — full architecture documentation:
  layered Mermaid overview, boot/RPC sequence, `@oai/sky` / `@oai/cua` /
  `@oai/cua-repl` / `node_repl` / `@oai/browser-desktop` internals, native
  service identity and XPC protocols, the sender-authorization gate, the
  reconstruction and its DSH adapter, reference tables, and explicit unknowns.

**What was recovered is readability, not original source.** Prettier restores
structure while preserving the shipped mangled identifiers (`e`, `t`, `r`,
`o`, …). Only the three `ast-verified/` browser views additionally passed
normalized AST equivalence. Original comments, author identifiers, pre-
minification module boundaries and author source maps were never shipped and
remain unavailable. These are derivative inspection views, not buildable
original source; the shipped plugin/package license is Proprietary
(reference-only).

## Version skew: October snapshot vs installed `@oai` packages

A read-only coverage audit compared `packages/` against the **currently
installed** ChatGPT.app packages
(`/Applications/ChatGPT.app/Contents/Resources/cua_node/lib/node_modules/@oai/`)
and found a newer build: `@oai/sky` `0.7.17` (snapshot `0.7.13`),
`@oai/cua-repl` `0.1.3` (snapshot `0.1.2`), `@oai/cua` `0.2.6` with differing
bytes, and `@oai/browser-desktop` `0.1.1` with an identical source set. The
newer build adds **44 OpenAI-authored source-bearing files (57,612 bytes)** —
a Windows full-desktop client and API, a `siwc.md` browser-capability
reference, `cua-repl` environment plumbing and four new instruction prompts.

Those 44 files are recovered byte-for-byte in
[`installed-newer/`](installed-newer/VERSION-SKEW.md) (with
[`FILES.json`](installed-newer/FILES.json) digests and sources) and formatted
in [`readable/installed-newer/`](readable/installed-newer/), so this
consolidation now covers both builds. Two files present only in the older
snapshot (`cua/.../require_audio_model_support.js` and
`cua-repl/instructions/audio-attachments.md`) are retained in `packages/`.

Relative to the two *stated* originals (the shipped plugin and the October
`scripts/codex-computer-use-source/` snapshot) the audit found **zero missing
source-bearing files**, 3/3 byte-identical skill files, and all key files
present. The 44-file gap was a version-skew disclosure issue, not a copy
error; it is now closed. `packages/` intentionally remains the byte-faithful
October build rather than a mixture of the two.
