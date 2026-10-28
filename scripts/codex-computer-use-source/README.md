# Codex Computer Use Source Snapshot

Recovered from the installed Codex/ChatGPT build `26.1023.50603` on this machine.
The initial snapshot was collected statically; runtime interoperability and the
standalone reconstruction were then tested with Claude Code on October 28, 2026.
This includes all regular files in the installed `cua_node` package tree, readable
browser bundles, extracted REPL JavaScript, WASM disassembly, and bounded native
analysis. It is not the complete original OpenAI source repository.

The working MCP/CLI and rebuildable Swift implementation are in
`../codex-computer-use-mcp`. That package provides a Claude Code skill and
was verified with app inventory, accessibility, screenshots,
keyboard/mouse input, and a scratch-window interaction.

## Layout

- `runtime-config/` - the generated plugin manifest and MCP launch configuration for `cua_repl`.
- `cua-repl/` - `@oai/cua-repl` `0.1.2`, the MCP entry wrapper that validates enabled surfaces and spawns `node_repl`.
- `node-repl-embedded/` - JavaScript assets extracted from the native `node_repl` binary, including `kernel.js`, `trusted-worker.js`, `worker-runtime.js`, the privileged Node REPL bridge, tracing, diagnostics, and Meriyah.
- `cua/` - `@oai/cua` `0.2.6` source and documentation, including the unified CUA API and browser bindings.
- `sky/` - `@oai/sky` `0.7.13` source and documentation, including the macOS computer-use client, approval flow, native-pipe transport, and platform targets.
- `browser-desktop/` - `@oai/browser-desktop` `0.1.1`, including the browser client/service bundles, WebAssembly runtime assets, and environment documentation.
- `shipped-runtime/` - a byte-preserving copy of the complete installed package
  tree plus the original `node_repl` executable: 2,540 files, 160,082,087 bytes.
  Includes 681 `@oai/cua` package files omitted by the first snapshot.
- `readable-browser/` - readable bundle derivatives, original bytes, seven
  decoded embedded programs, source/range indexes, and WAT for both WASM assets.
- `native-analysis/` - retained REA evidence, symbols, signatures, and bounded
  ARM64 assembly around native sender authorization. See `REPORT.md`.
- `SHIPPED-RUNTIME-MANIFEST.json` and `RECOVERY-MANIFEST.json` - identity,
  provenance, output hashes, and exact recovery/test limitations.
- `PUBLICATION-MANIFEST.json` - current hashes for metadata with local paths
  redacted. Original capture IDs/hashes remain historical provenance, not proof
  that the redacted metadata is an unchanged authenticated evidence record.

## Runtime Flow

1. `runtime-config/.mcp.json` launches the bundled Node runtime with `require-browser-access.mjs` and `cua-repl.mjs`.
2. `cua-repl/bin/cua-repl.mjs` validates `CUA_REPL_ENABLED_SURFACES`, builds the tool descriptions, configures trusted services, and spawns `cua_node/bin/node_repl`.
3. The native `node_repl` supervisor provides the MCP tools `js`, `js_reset`, and `turn_ended`; its embedded JavaScript kernel is in `node-repl-embedded/`.
4. The trusted worker loads `@oai/browser-desktop/service` and `@oai/sky/service` through `NODE_REPL_TRUSTED_SERVICES`.
5. `@oai/sky` talks to the native `SkyComputerUseService` through a JSON-RPC native pipe and enforces the macOS app approval flow.
6. `@oai/browser-desktop` exposes the browser client/service API used by `@oai/cua`.

## Recovery Notes

- The `node-repl-embedded` files were extracted directly from readable embedded assets in the Mach-O `node_repl` binary. Every extracted JavaScript file passes `node --check`.
- REA analyzed the wrapper, CUA API, Sky macOS service, browser bundle, and recovered Node REPL JavaScript without executing the target. Evidence IDs: `ev_0a0441f4cd06c745264067e5af23c9115a978a953eeea2741cecda9680ad27c5`, `ev_c1404d39dd310fdde333c613f8bbcd3d0d5da501e8f084295c23e7dfa102788f`, `ev_0e265ab4a180bfece31bc854c2b6b5953b09c615e24f770d0d52861f889eaae2`, `ev_82d8e45bc15cbc09af15c4a827560486aa1c1bfff33d63561c78746c4236b89c`, and `ev_8305e9be27449e5487e38da7afa69b8272c724a68528fa4d2007ac7baa126685`.
- No source maps were present. The browser service and several package files are minified; formatting them does not restore original identifiers or module boundaries.
- The exact Rust `node_repl` and Swift `SkyComputerUseService` source remains
  unavailable. Native REA analysis recovered metadata and authentication
  assembly; Hopper did not produce complete pseudocode. No original-source
  equivalence is claimed. A new source JavaScript supervisor and Swift helper
  reconstruct the basic interface in the neighboring MCP package.
- Browser identifiers, pre-minification module boundaries, and original source
  maps are absent. Generated maps connect readable derivatives to the shipped
  bundles; they do not recreate missing author sources. ZXing WAT reassembly is
  byte-identical. Accessibility WASM validates and disassembles, but its WAT
  reassembly failed in the WABT toolkit. A metadata-only `@oai/cdp-browser-backend`
  dependency has no installed source in this artifact tree.
