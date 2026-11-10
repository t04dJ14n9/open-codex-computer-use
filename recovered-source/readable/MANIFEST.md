# Readable derivative views of the shipped implementation JavaScript

> **READ THIS FIRST — HONEST LIMITS**
>
> These are **derivative inspection views**, **not original OpenAI source**.
>
> - **Identifiers remain mangled.** The shipped bundles were minified: locals are
>   `e`, `t`, `r`, `o`, `n`, `i`, `s`, … . Prettier only added whitespace, line
>   breaks, and indentation. **No identifier was renamed.**
> - **Original comments and pre-minification names were NEVER shipped** and are
>   **NOT recovered here**. Nothing in this tree reconstructs author intent,
>   variable meaning, or function naming.
> - **This is formatting only.** Prettier's parse/print cycle is designed to
>   preserve program semantics, but the output here was **NOT independently
>   re-verified by normalized-AST comparison**. The only exception is the three
>   files in `ast-verified/`, which came from an earlier Babel-based recovery
>   that **did** pass normalized-AST equivalence checks plus `node --check`.
>   Those are higher-assurance than the Prettier output in `packages/`.
> - **Generated source maps map back to shipped bundle text, not author
>   source.** Any `.map` in the wider recovery maps minified positions onto the
>   shipped minified text; there is no original source map to author code.
> - **Do not treat these files as buildable source.** Syntax parses, but module
>   resolution, imports, and runtime behaviour of the copies are unverified.
> - The shipped plugin/package license is **Proprietary**. These copies are
>   **reference-only**; they grant no redistribution rights.

---

## Purpose

The shipped implementation JavaScript in `recovered-source/packages/` is
minified to one line per file (some are multi-megabyte single lines). A human
cannot read it. This directory provides **readable, structured derivative
views**: the same shipped bytes re-printed with indentation and line breaks,
plus three earlier AST-verified readable browser views copied verbatim.

Nothing outside `recovered-source/readable/` was created or modified.

## Exact commands and versions

Working directory for every command:
`/Users/t04dj14n9/Code/open-codex-computer-use`

Versions (reported by the tools):

```
$ node --version
v26.5.0
$ npx --no-install prettier --version
3.9.10
```

Commands used, in order:

```sh
# 1. Create output directories
mkdir -p recovered-source/readable/packages recovered-source/readable/ast-verified

# 2. Copy the four source trees, preserving relative structure (byte-identical)
cp -R recovered-source/packages/sky             recovered-source/readable/packages/sky
cp -R recovered-source/packages/cua             recovered-source/readable/packages/cua
cp -R recovered-source/packages/cua-repl        recovered-source/readable/packages/cua-repl
cp -R recovered-source/packages/browser-desktop recovered-source/readable/packages/browser-desktop

# 3. ONE Prettier invocation for ALL .js/.mjs (glob quoted so Prettier expands it)
cd /Users/t04dj14n9/Code/open-codex-computer-use
npx --no-install prettier --write --parser babel \
  "recovered-source/readable/packages/**/*.{js,mjs}" --log-level warn
# exit code 0, no warnings/errors emitted; no individual file failed.

# 4. Copy the three earlier AST-verified readable browser views, byte-for-byte
SRC=scripts/codex-computer-use-source/readable-browser
DST=recovered-source/readable/ast-verified
cp "$SRC/browser-desktop/scripts/browser-service.mjs" "$DST/browser-service.mjs"
cp "$SRC/browser-desktop/scripts/browser-client.mjs"  "$DST/browser-client.mjs"
cp "$SRC/cua/dist/lib/js/oai_js_browser/dist/skill/scripts/browser-client.js" \
   "$DST/browser-client.js"

# 5. Parse-check every output (stdin redirection; no files written)
while IFS= read -r f; do
  node --input-type=module --check < "$f" || echo "FAIL $f"
done < <(find recovered-source/readable -type f \( -name '*.js' -o -name '*.mjs' \) | sort)
```

Only `.js` and `.mjs` were formatted. `.d.ts`, `.md`, and `.json` were
**not** formatted (already readable) — they were carried over unchanged by the
`cp -R`. The `cp -R` copies were verified byte-identical to the sources before
formatting (0 mismatches across all 757 files).

## Counts and sizes

| Item | Count |
| --- | --- |
| `.js` / `.mjs` files passed to Prettier (`readable/packages/`) | **227** |
| … of those, actually rewritten by Prettier | 225 |
| … of those, left byte-identical (already trivially formatted) | 2 |
| AST-verified files copied verbatim (`readable/ast-verified/`) | **3** |
| Total `.js` / `.mjs` outputs in `readable/` | **230** |
| Total files in `readable/` (incl. carried-over `.d.ts`, `.md`, `.json`, this manifest) | 760 |

The 2 files Prettier left unchanged:
`readable/packages/cua-repl/bin/cua-repl.mjs` (284 B) and
`readable/packages/cua-repl/instructions/banner.js` (37 B).

Sizes (`du -sh`):

```
12M     recovered-source/readable/
9.4M    recovered-source/readable/packages/
3.0M    recovered-source/readable/ast-verified/
```

Per package:

```
3.8M    recovered-source/readable/packages/browser-desktop/
4.4M    recovered-source/readable/packages/cua/
156K    recovered-source/readable/packages/cua-repl/
1.1M    recovered-source/readable/packages/sky/
```

## SHA-256 of three key originals and their formatted outputs

Hashed with `shasum -a 256`. "Original" is the shipped minified file under
`recovered-source/packages/`; "formatted" is the Prettier output under
`recovered-source/readable/packages/` at the same relative path.

| Relative path (under `packages/`) | Role | SHA-256 |
| --- | --- | --- |
| `sky/dist/project/cua/sky_js/src/sky.js` | original  | `1a433cd5ffb9b91bdfa6fff003938b80dea0890cd8a80e7bca4132b381072c3a` |
| `sky/dist/project/cua/sky_js/src/sky.js` | formatted | `f9111d706b4264b88660583847b78e20df4ff0567d56e4fed9eb746e09ccbdc0` |
| `cua/dist/lib/js/oai_js_cua/src/cua.js` | original  | `4723fddd6ab6ebea521b5bd9b1e1635ef57845fd26cd84140a5b16a26c1e7529` |
| `cua/dist/lib/js/oai_js_cua/src/cua.js` | formatted | `59d5c21fefd7fb6dead34cea2c88197aa111b9324b30c96e7fc0fbcb327129db` |
| `browser-desktop/scripts/browser-service.mjs` | original  | `0c1cb5b13bbe6ae70cea751740e537885a12d53cd076c864cd9154ef6e86e3bb` |
| `browser-desktop/scripts/browser-service.mjs` | formatted | `1d7620b013b63512714215a682f9cbd3421f6a59c2c39bc72f39054d3674fc2b` |

Illustrative readability gain (line counts, `wc -l`):

- `sky/.../sky.js`: 1 line (2,093 B) → 101 lines (2,900 B)
- `cua/.../cua.js`: 1 line (581 B) → 21 lines (730 B)
- `browser-desktop/scripts/browser-service.mjs`: 9,373 lines (2,110,036 B)
  → 80,883 lines (2,860,518 B) — the original uses extremely long minified
  lines, so line count alone understates the gain.

## Parse verification

Every `.js`/`.mjs` output in `readable/` was checked with
`node --input-type=module --check < "$f"` (Node `v26.5.0`):

```
PASS = 230    FAIL = 0    TOTAL = 230
```

Breakdown: 227 under `readable/packages/`, 3 under `readable/ast-verified/`.
**No files failed and none were deleted.** Failed files would have been left in
place and listed here by path; there were none.

Note: this is a **syntax-only** check. It does not resolve imports, execute
code, or prove semantic equivalence to the shipped originals.

## The `ast-verified/` copies (higher assurance)

These three files were produced by an earlier Babel-based recovery that passed
normalized-AST equivalence checks against the shipped originals **and**
`node --check`. They are copied byte-for-byte (verified with `cmp -s`), so their
hashes equal the originals at their source paths:

| File in `ast-verified/` | Bytes | Source |
| --- | --- | --- |
| `browser-service.mjs` | 2,646,389 | `scripts/codex-computer-use-source/readable-browser/browser-desktop/scripts/browser-service.mjs` |
| `browser-client.mjs` | 228,120 | `scripts/codex-computer-use-source/readable-browser/browser-desktop/scripts/browser-client.mjs` |
| `browser-client.js` | 218,049 | `scripts/codex-computer-use-source/readable-browser/cua/dist/lib/js/oai_js_browser/dist/skill/scripts/browser-client.js` |

**Companion files were deliberately NOT copied** (multi-MB, and they belong with
the earlier recovery). They remain at their original paths:

- `scripts/codex-computer-use-source/readable-browser/browser-desktop/scripts/browser-service.mjs.map` (5.7 MB)
- `scripts/codex-computer-use-source/readable-browser/browser-desktop/scripts/browser-service.mjs.source-ranges.json` (2.9 MB)
- `scripts/codex-computer-use-source/readable-browser/browser-desktop/scripts/browser-client.mjs.map` (639 KB)
- `scripts/codex-computer-use-source/readable-browser/browser-desktop/scripts/browser-client.mjs.source-ranges.json` (504 KB)
- `scripts/codex-computer-use-source/readable-browser/cua/dist/lib/js/oai_js_browser/dist/skill/scripts/browser-client.js.map` (617 KB)
- `scripts/codex-computer-use-source/readable-browser/cua/dist/lib/js/oai_js_browser/dist/skill/scripts/browser-client.js.source-ranges.json` (444 KB)

The **full WAT** disassembly also remains at its original paths and was **not**
copied: `scripts/codex-computer-use-source/readable-browser/wasm/browser-accessibility.wat`
(~203 MB) and `.../wasm/zxing_reader.wat` (~16 MB), alongside their `.wasm`,
`.metadata.json`, and `.headers.txt` companions.

## How to read

Start with [`../architecture/KEY-MODULES.md`](../architecture/KEY-MODULES.md) for
a map of which module does what, then open the formatted file at the same
relative path under `readable/packages/<name>/`. Because identifiers are still
mangled, rely on **file paths, import/export lists, string literals, and control
flow**, not variable names. For the browser bundles, prefer the
`ast-verified/` copies over the Prettier copies where both exist — they carry
the stronger equivalence guarantee.

## Where the originals live / provenance

- Shipped originals for the Prettier views: `recovered-source/packages/`
  (`sky/`, `cua/`, `cua-repl/`, `browser-desktop/`). **Unmodified.**
- Shipped browser originals for the AST-verified views:
  `scripts/codex-computer-use-source/readable-browser/shipped-originals/` and the
  earlier recovery tree rooted at
  `scripts/codex-computer-use-source/readable-browser/`.
- This directory's own `../manifest.json` and `../RECOVERY-REPORT.md` are
  **untouched** by this work.

The shipped plugin/package license is **Proprietary**. Original notices remain
attached to the recovered artifacts; no blanket open-source license is applied.
These derivative views are **reference-only** and confer no redistribution
rights. This is not the complete original OpenAI source repository or an
official OpenAI project.

### Added later: newer installed `@oai` build

`readable/installed-newer/` holds the 44 source-bearing files added by the
newer `@oai` packages in the installed ChatGPT.app (`@oai/sky` 0.7.17,
`@oai/cua-repl` 0.1.3). Six `.js` files there were formatted with the same
prettier command and all six pass `node --input-type=module --check`; the
remaining `.d.ts` / `.md` files are byte copies. Byte-for-byte originals and
their digests are in [`../installed-newer/`](../installed-newer/VERSION-SKEW.md).
The counts above cover the original October-build `readable/packages/` and
`readable/ast-verified/` scope; this tree is additional.
