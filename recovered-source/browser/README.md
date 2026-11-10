# Readable Shipped Browser Sources

This directory contains derived readable copies. The source snapshot is unchanged. Nothing from the target application was executed, and no native REA target was opened or closed.

## Start Here

- [browser-desktop/scripts/browser-client.mjs](browser-desktop/scripts/browser-client.mjs) provides a readable view mapped to the supplied snapshot. [Exact installed view](installed-shipped/browser-desktop/scripts/browser-client.mjs) maps to an untouched [shipped-byte copy](shipped-originals/browser-desktop/scripts/browser-client.mjs). [Format-only snapshot copy](format-only/browser-desktop/scripts/browser-client.mjs) and [format-only installed copy](format-only-installed/browser-desktop/scripts/browser-client.mjs) pass normalized AST identity checks.
- [browser-desktop/scripts/browser-service.mjs](browser-desktop/scripts/browser-service.mjs) provides a readable view mapped to the supplied snapshot. [Exact installed view](installed-shipped/browser-desktop/scripts/browser-service.mjs) maps to an untouched [shipped-byte copy](shipped-originals/browser-desktop/scripts/browser-service.mjs). [Format-only snapshot copy](format-only/browser-desktop/scripts/browser-service.mjs) and [format-only installed copy](format-only-installed/browser-desktop/scripts/browser-service.mjs) pass normalized AST identity checks.
- [cua/dist/lib/js/oai_js_browser/dist/skill/scripts/browser-client.js](cua/dist/lib/js/oai_js_browser/dist/skill/scripts/browser-client.js) provides a readable view mapped to the supplied snapshot. [Exact installed view](installed-shipped/cua/dist/lib/js/oai_js_browser/dist/skill/scripts/browser-client.js) maps to an untouched [shipped-byte copy](shipped-originals/cua/dist/lib/js/oai_js_browser/dist/skill/scripts/browser-client.js). [Format-only snapshot copy](format-only/cua/dist/lib/js/oai_js_browser/dist/skill/scripts/browser-client.js) and [format-only installed copy](format-only-installed/cua/dist/lib/js/oai_js_browser/dist/skill/scripts/browser-client.js) pass normalized AST identity checks.
- [symbol-index.json](symbol-index.json) lists shipped top-level bindings, named functions/methods, exports, and literal loader sites with exact original ranges.
- Adjacent `.source-ranges.json` files preserve original byte and UTF-16 ranges for each shipped top-level statement. Adjacent generated `.map` files map the readable view back to the shipped bundle, not to missing author source.
- [dependency-inventory.json](dependency-inventory.json) inventories every regular file and package manifest in the installed `cua_node/lib/node_modules` tree read-only, including nested copies, SHA-256 digests, dependency resolution, and package-manager metadata.

## Embedded Programs

- [q5](embedded/browser-service.mjs.31601.q5.js): Static JavaScript template literal, cooked value from Babel parser; carrier `browser-desktop/scripts/browser-service.mjs` line 31601; shipped binding `q5`. The adjacent `.decoded` file is the exact decoded text; `.provenance.json` links it to literal bytes.
- [webMcp](embedded/browser-service.mjs.53666.webMcp.js): Static JavaScript template literal, cooked value from Babel parser; carrier `browser-desktop/scripts/browser-service.mjs` line 53666; shipped binding `T0`. The adjacent `.decoded` file is the exact decoded text; `.provenance.json` links it to literal bytes.
- [standalone-helper](embedded/browser-service.mjs.59699.standalone-helper.js): JavaScript string literal, escape-decoded by Babel parser; carrier `browser-desktop/scripts/browser-service.mjs` line 59699; shipped binding `none`. The adjacent `.decoded` file is the exact decoded text; `.provenance.json` links it to literal bytes.
- [PlaywrightInjected](embedded/browser-service.mjs.61114.PlaywrightInjected.js): JavaScript string literal, escape-decoded by Babel parser; carrier `browser-desktop/scripts/browser-service.mjs` line 61114; shipped binding `hF`. The adjacent `.decoded` file is the exact decoded text; `.provenance.json` links it to literal bytes.
- [functionDeclaration](embedded/browser-service.mjs.62151.functionDeclaration.js): Static JavaScript template literal, cooked value from Babel parser; carrier `browser-desktop/scripts/browser-service.mjs` line 62151; shipped binding `functionDeclaration`. The adjacent `.decoded` file is the exact decoded text; `.provenance.json` links it to literal bytes.
- [querySelectorStrictWithVisibleFallback](embedded/browser-service.mjs.63061.querySelectorStrictWithVisibleFallback.js): Static JavaScript template literal, cooked value from Babel parser; carrier `browser-desktop/scripts/browser-service.mjs` line 63061; shipped binding `al`. The adjacent `.decoded` file is the exact decoded text; `.provenance.json` links it to literal bytes.
- [n](embedded/browser-service.mjs.79094.n.mjs): Base64 decoded from a JavaScript string literal; carrier `browser-desktop/scripts/browser-service.mjs` line 79094; shipped binding `jme`. The adjacent `.decoded` file is the exact decoded text; `.provenance.json` links it to literal bytes.

Embedded-program discovery considers static, code-shaped strings/templates of at least 160 characters and canonical base64 strings of at least 256 characters. Anonymous function literals are retained exactly in `.decoded.js` and given a separately recorded expression wrapper for parsing; their maps address that expression view. Dynamic template construction, short fragments, and unrelated encodings are not completely recovered. Extracted files are standalone inspection views, not inferred original modules.

## WASM

- [browser-accessibility.wasm.br](wasm/original/browser-accessibility.wasm.br) is byte-identical to the original; [decoded bytes](wasm/browser-accessibility.wasm) and [WAT](wasm/browser-accessibility.wat). Validation: passed; canonical WAT round-trip: unavailable. [Metadata](wasm/browser-accessibility.wasm.metadata.json) includes section offsets, retained custom names, imports/exports, hashes, and limitations.
- [zxing_reader.wasm](wasm/original/zxing_reader.wasm) is byte-identical to the original; [decoded bytes](wasm/original/zxing_reader.wasm) and [WAT](wasm/zxing_reader.wat). Validation: passed; canonical WAT round-trip: identical. [Metadata](wasm/zxing_reader.wasm.metadata.json) includes section offsets, retained custom names, imports/exports, hashes, and limitations.

WABT text is disassembled compiled code. It does not restore original C/C++/Rust/Swift/TypeScript files or discarded identifiers. WAT verification compares original core section payloads with reassembled payloads; original custom sections remain preserved in the untouched WASM copies. ZXing reassembly is byte-identical to the original file. Accessibility reassembly failed inside the JS WABT toolkit with a memory-access error; its binary validates and its complete WAT is delivered.

## Verification And Provenance

Original snapshot: 490 regular files, 10055850 bytes, 97 directories, 0 symlinks. Original tree SHA-256: `440f17efd7dbb8a9babde71dca968e5845831b4e00e4f0f18e2bfd83c7f9bbe3`. Post-recovery tree SHA-256: `440f17efd7dbb8a9babde71dca968e5845831b4e00e4f0f18e2bfd83c7f9bbe3`.

Each format-only copy passes normalized AST comparison against its input. Each expanded readable copy reparses to the same normalized AST used to generate it. Canonical comparison ignores source locations/comments/raw spellings, sorts regex flags, and flattens same-operator `&&`/`||` grouping while preserving operand order. These adjustments are necessary because printers change flag order and associative parentheses. The supplied snapshot and exact installed bytes have matching normalized ASTs but different byte hashes.

The readable transformations expand `!0`/`!1`, separate declarations outside loop headers, separate statement-position comma sequences, and explicitly add the same consequent braces Babel would print to preserve else binding. Identifiers are never renamed. Every executable inspection view passes `node --check`; the exact anonymous-function literal passes after its recorded expression wrapper is applied. Static checks are not runtime behavioral tests.

Babel generator maps retain exact shipped/decoded text in `sourcesContent`. Byte ranges, UTF-16 ranges and SHA-256 digests distinguish original carriers from decoded and formatted outputs. Minified binding names are preserved, not guessed.

## Genuine Gaps

- No `.map` files were found in the original snapshot, and the three selected bundles contain no source-map directives. Exact pre-minification identifiers, original module boundaries, missing comments, and high-level source files are not recovered.
- The installed dependency inventory does not identify every library already flattened into a bundle. Metadata declarations do not prove installed files or runtime loading.
- `@oai/cdp-browser-backend@0.6.7` appears in package-manager metadata, but no installed package manifest/directory was found beneath the inventoried root. Its source is not recovered here.
- Native supervisor/service source and native REA analysis are outside this browser recovery; the existing native target was not touched.
- Runtime connectivity, permissions, browser behavior, and target execution were not tested. The derived tree is an inspection deliverable, not a drop-in installation.
- WAT reassembly verification for `browser-desktop/scripts/browser-accessibility.wasm.br` is unavailable: RuntimeError: memory access out of bounds. Original bytes, binary validation and disassembly remain available.

## Installed Package Instances

31 top-level and 9 nested instances, 31 distinct name/version pairs. Complete per-file identity and declarations are in the JSON inventory.

- `@img/colour@1.1.0` (top-level; `@img/colour/package.json`)
- `@img/sharp-darwin-arm64@0.35.5` (top-level; `@img/sharp-darwin-arm64/package.json`)
- `@img/sharp-libvips-darwin-arm64@1.3.4` (top-level; `@img/sharp-libvips-darwin-arm64/package.json`)
- `@oai/browser-desktop@0.1.1` (top-level; `@oai/browser-desktop/package.json`)
- `@oai/cua-repl@0.1.2` (top-level; `@oai/cua-repl/package.json`)
- `abstract-level@3.1.1` (nested; `@oai/cua/dist/lib/js/oai_js_browser/dist/skill/node_modules/abstract-level/package.json`)
- `classic-level@3.0.0` (nested; `@oai/cua/dist/lib/js/oai_js_browser/dist/skill/node_modules/classic-level/package.json`)
- `is-buffer@2.0.5` (nested; `@oai/cua/dist/lib/js/oai_js_browser/dist/skill/node_modules/is-buffer/package.json`)
- `level-supports@6.2.0` (nested; `@oai/cua/dist/lib/js/oai_js_browser/dist/skill/node_modules/level-supports/package.json`)
- `level-transcoder@1.0.1` (nested; `@oai/cua/dist/lib/js/oai_js_browser/dist/skill/node_modules/level-transcoder/package.json`)
- `maybe-combine-errors@1.0.0` (nested; `@oai/cua/dist/lib/js/oai_js_browser/dist/skill/node_modules/maybe-combine-errors/package.json`)
- `module-error@1.0.2` (nested; `@oai/cua/dist/lib/js/oai_js_browser/dist/skill/node_modules/module-error/package.json`)
- `napi-macros@2.2.2` (nested; `@oai/cua/dist/lib/js/oai_js_browser/dist/skill/node_modules/napi-macros/package.json`)
- `node-gyp-build@4.8.4` (nested; `@oai/cua/dist/lib/js/oai_js_browser/dist/skill/node_modules/node-gyp-build/package.json`)
- `@oai/cua@0.2.6` (top-level; `@oai/cua/package.json`)
- `@oai/sky@0.7.13` (top-level; `@oai/sky/package.json`)
- `@statsig/client-core@3.33.3` (top-level; `@statsig/client-core/package.json`)
- `@statsig/js-client@3.33.3` (top-level; `@statsig/js-client/package.json`)
- `abstract-level@3.1.1` (top-level; `abstract-level/package.json`)
- `base64-js@1.5.1` (top-level; `base64-js/package.json`)
- `buffer@6.0.3` (top-level; `buffer/package.json`)
- `classic-level@3.0.0` (top-level; `classic-level/package.json`)
- `corepack@0.36.0` (top-level; `corepack/package.json`)
- `detect-libc@2.1.2` (top-level; `detect-libc/package.json`)
- `fsevents@2.3.2` (top-level; `fsevents/package.json`)
- `ieee754@1.2.1` (top-level; `ieee754/package.json`)
- `is-buffer@2.0.5` (top-level; `is-buffer/package.json`)
- `jpeg-js@0.4.4` (top-level; `jpeg-js/package.json`)
- `level-supports@6.2.0` (top-level; `level-supports/package.json`)
- `level-transcoder@1.0.1` (top-level; `level-transcoder/package.json`)
- `maybe-combine-errors@1.0.0` (top-level; `maybe-combine-errors/package.json`)
- `module-error@1.0.2` (top-level; `module-error/package.json`)
- `napi-macros@2.2.2` (top-level; `napi-macros/package.json`)
- `node-gyp-build@4.8.4` (top-level; `node-gyp-build/package.json`)
- `pixelmatch@7.1.0` (top-level; `pixelmatch/package.json`)
- `playwright-core@1.57.0` (top-level; `playwright-core/package.json`)
- `playwright@1.57.0` (top-level; `playwright/package.json`)
- `pngjs@7.0.0` (top-level; `pngjs/package.json`)
- `semver@7.8.5` (top-level; `semver/package.json`)
- `sharp@0.35.5` (top-level; `sharp/package.json`)

## Reproduce

Pinned tools and scripts are isolated under `work/browser-recovery`. `package-lock.json` records resolved tool versions/integrity. The snapshot baseline is created once, then reused for final verification.

```sh
node work/browser-recovery/recover.mjs javascript
node --max-old-space-size=2048 work/browser-recovery/recover.mjs wasm
node work/browser-recovery/recover.mjs finalize
```

The initial `inventory` phase was run before generating outputs; rerunning it is intentionally rejected when its baseline already exists. All script writes are restricted to the three authorized paths. No application package, original snapshot file, or MCP configuration is modified.
