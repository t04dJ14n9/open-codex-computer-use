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
original JavaScript workers. `native/ComputerUse.swift` implements native
app/AX observation, selected-window capture, and input through public macOS APIs.
`src/standalone-sky.mjs` exposes this helper as the trusted Sky service, allowing
the recovered `cua` API to run under ordinary Node.js. MCP and CLI source are
provided without requiring an active Codex chat or original native daemon.

This source is newly authored from the observed interface. It is not a decompiled
copy of the original Swift/Rust implementation, nor proof of full parity.

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

## Remaining Original-Source Gaps

Exact original Rust/Swift source, original comments and pre-minification names,
complete native asynchronous/indirect control flow, original audio/lock-screen
and product-host integrations, and the unshipped CDP backend remain unavailable.
Hopper's provider failed to produce pseudocode and reported incomplete retained
document cleanup; the exact diagnostics remain in native-analysis/calls.

Only the advertised basic app operations are reconstructed. Full native trees
replace diffs. Native browser app control is supported; Codex browser DOM and
audio attachment features are not independently implemented.
