# Bounded derivatives of large artifacts

`recovered-source/` deliberately excluded seven very large artifacts from the
earlier consolidation to keep the tree under a ~40 MB budget (and a 2 MB
per-file cap for native evidence). This step adds **compact, bounded
derivatives** of those artifacts so the recovery is more complete without
re-introducing the bulk. The three new files are:

- `browser/wasm/browser-accessibility.wat.summary.md` — a <300 KB structural
  summary of the 202,768,105-byte WAT disassembly: source SHA-256, its first
  ~120 lines, literal `(func`/`(export`/`(import`/`(type`/`(memory`/
  `(table`/`(global`/`(elem`/`(data` token counts, and deduplicated/sorted
  export + import lists.
- `native/symbol-index-compact.txt` — a <600 KB filtered, deduplicated,
  sorted and byte-bounded index of symbol lines from the five `*-symbols*.txt`
  dumps, plus a bounded header for `rea-service-preflight.json` (SHA-256, byte
  size, top-level keys, near-top `evidence_id`/`operation` values).
- `native/DERIVATIVES.md` — this file.

## Why the full dumps were skipped

The originals are large: the five symbol dumps are 5.4–13.7 MB each and
`rea-service-preflight.json` is 11.5 MB, all above the 2 MB per-file cap for
native evidence; `browser-accessibility.wat` alone is ~202 MB, roughly 5x the
entire ~40 MB tree budget. Including them verbatim would have blown the budget,
so the earlier "Deliberately skipped — too large" list omitted them.

## Where the full originals live

All full originals remain in the existing recovery snapshot, unmodified:

- `scripts/codex-computer-use-source/native-analysis/client-symbols.demangled.txt`
- `scripts/codex-computer-use-source/native-analysis/client-symbols.raw.txt`
- `scripts/codex-computer-use-source/native-analysis/node-repl-symbols.raw.txt`
- `scripts/codex-computer-use-source/native-analysis/service-symbols.demangled.txt`
- `scripts/codex-computer-use-source/native-analysis/service-symbols.raw.txt`
- `scripts/codex-computer-use-source/native-analysis/rea-service-preflight.json`
- `scripts/codex-computer-use-source/readable-browser/wasm/browser-accessibility.wat`

## What these are NOT

These are **bounded summaries / distilled indexes**, not original Swift/Rust
source, not WAT author source, and **not a complete symbol inventory**. They are
filtered and capped to stay small: the WAT summary keeps only the first 120
lines and structural counts, and the symbol index keeps only lines matching a
fixed set of substrings, capped at 6000 lines and a <600 KB byte bound. For
completeness, consult the full originals at the paths above.

