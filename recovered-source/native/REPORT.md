# Native Computer Use Recovery

Status: bounded static recovery, 2026-10-28. Original Rust/Swift source was not
restored. Hopper returned no pseudocode. No standalone C/Swift pseudocode file
has been authored; retained assembly and this report are the current recovery.

## Critical Sender Gate

- `0x100047dc0`, the named `senderAuthorization` initializer, loads two default
  rule groups initialized at `0x100181d7c` and `0x100181e88`.
- File-backed Swift small-string tables at `0x1014ea818`, `0x1014ea860`, and
  `0x1014ea8a8` contain teams `2DC432GLL2`, `HX7739G8FX`, signing IDs `node`,
  `node_repl`, and basename entries `node`, `node_repl`.
- Four decoded default groups: interpreter (`0x100181d7c`): teams
  `2DC432GLL2` or `HX7739G8FX`, IDs `node` or `node_repl`, basenames `node` or
  `node_repl`; direct trusted (`0x100181e88`): team `2DC432GLL2`, empty ID and
  basename sets; host ancestor (`0x100181f1c`): team `2DC432GLL2`, IDs
  `com.openai.codex`, `com.openai.codex.alpha`, `com.openai.codex.beta`,
  `com.openai.codex.dev`, `com.openai.codex.nightly`, empty basename set;
  alternate ancestor (`0x100181fcc`): team `MQ55VZLNZQ`, ID `codex-acp`, empty
  basename set. The host IDs are in the file-backed array at `0x1014f5130`.
  The identity predicate can compare signing ID or bundle ID; empty ID and
  basename sets impose no corresponding restriction in the inspected helper.
- Classifier `0x100180d50` returns raw states 0, 1, 2, or 3. Call sites
  `0x10018d830` and `0x10018e32c` explicitly compare its result with 3.
  The remaining enum names are not established by a decompiler.
- Raw classifier flow: sender field `+0x30 == 1` returns 0; direct trusted
  rule match returns 3; interpreter rule mismatch returns 1; interpreter match
  returns `2 + ancestor_match`. Direct trusted admission can therefore return
  3 without ancestry. Ancestry alone does not explain every observed failure.
- Its interpreter branch checks the signing-ID set, then a team/identity
  candidate predicate and executable basename. It calls `0x100180e6c` and
  returns `2 + bool` from that helper. Thus matching the interpreter identity
  alone does not guarantee state 3.
- `0x100180e6c` iterates the sender's process-chain array at object offset
  `0x88`, starting with index 1. It tests two ancestor rule groups and returns
  true on a match. Parent and responsible identity fields are independently
  present in native symbols. Which exact ancestor fails in a given launcher
  remains unobserved by this static investigation.
  Nonmatches continue through the loop; no stop-at-first-interpreter rule was
  found in this inspected loop.
- Socket peer reader `0x10019ab90` calls `getsockopt(fd, 0, 6, ...)`, requires
  exactly 32 returned bytes, and obtains the PID using `audit_token_to_pid`.
  Signing extraction calls `SecCodeCopyGuestWithAttributes` with a PID,
  `SecCodeCopyStaticCode`, and `SecCodeCopySigningInformation(..., 2, ...)`.
  These observations are separate from runtime signing/trust validation.

The main agent initially reported successful signed Node and native host tests;
later retests failed authentication, including original-path launches. The
nested SkyComputerUseClient is reported to expose a `cua mcp` CLI with native
tools but also returns error -10000, "Sender process is not authenticated".
These are supplied runtime observations, not executions performed in this
subtask. No currently reliable native fallback is established. Path and
signing-ID matches are insufficient evidence of launcher equivalence. A new
Swift AX/CGEvent helper is an independent reconstruction, not recovered native
source; this subtask has not verified its implementation or test results.

## Identities

- `node_repl`: 19,310,480 bytes, arm64 Mach-O;
  SHA-256 `95b4acccef72ad97526abadb9a96d385c8f13de9b4152d7e225d01c0f42d51f9`.
- `SkyComputerUseService`: 25,117,232 bytes, arm64 Mach-O;
  SHA-256 `e798d6a292fb5d93536ae9f6954e9809f0833bcf38d1ff50624f1e2268723dea`;
  UUID `AD22C18C-5BF8-30E8-A197-CD63389E6DD9`.
- Nested `SkyComputerUseClient`: 15,684,960 bytes, arm64 Mach-O;
  SHA-256 `5efa7ff505fe22110a0a900039c9b47cbf6e720c6da9a69ec1fd983a5ba034b1`.
- Byte-identical analysis copies are retained in `work/native-analysis`.
  Original installed binary bytes were not edited or executed.

## Evidence And Coverage

- `ev_6bf4ad38748e942470dd3b1291d9d909d4b4b2c9b40c2098de2fc29b608cabc3`:
  service Mach-O identity, layout, imports, and exports; complete retained
  record in `rea-service-preflight.json`. Imports/exports are not exhaustive.
- `ev_c273ddb9e0720fc839e2fb23d4e9e13ede659e16c48554898fb127f9911b8810`:
  bounded native dispatch metadata. The 400-record budget yielded protocol
  declarations; class bodies and Swift witness/vtable coverage are incomplete.
- `ev_3a1c921fede34d813d260e2121dab79b9062ce414cb812f04e9d60a5f3ff0f87`:
  service signature and entitlements from a digest-verified copy.
- `calls/` retains successful and failed REA tool responses with local paths
  redacted for publication. Embedded `ev_*` IDs identify original captures;
  redacted records are not newly authenticated REA evidence. The publication
  manifest verifies their current file hashes.
- `*-symbols.raw.txt`, Swift demangled inventories, signature records, and
  bounded `*.asm.txt` files are normal-tool evidence, not fabricated REA IDs.

Hopper 6.6.0 demo completed initial static analysis but its bridge missed REA's
startup deadline. Subsequent launch failed with AppleEvent timeout and a
Documents-folder permission prompt. No permission was changed. Database saving
is disabled in this demo. Ghidra, IDA, and Kuna were not configured. No software
was installed. REA close attempts reported incomplete cleanup for its private
runtime; exact failure records are retained. No further Hopper retries planned.

## Residual Unknowns

Full original source, types, compiler-local names, complete asynchronous Swift
control flow, all native actions, indirect call targets, precise rejected
launcher ancestry, and native-host parity remain unrecovered. The JavaScript
source snapshot covers the public protocol surface; this native pass is a
finite sample of authentication, transport, request handlers, and action/AX
boundaries, not a replacement native implementation.

## Publication Privacy

Local home/workspace paths were replaced with symbolic roots. Original package
and executable bytes remain unchanged. `../PUBLICATION-MANIFEST.json` records
current redacted-file hashes; earlier capture hashes describe the original
evidence and must not be treated as hashes of the redacted publication.
