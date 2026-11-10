# Version skew: October snapshot vs installed `@oai` packages

A coverage audit found that the currently installed ChatGPT.app ships **newer
`@oai/*` npm packages** than the October recovery snapshot that
`packages/` was copied from. This directory recovers the source-bearing files
added in that newer build so the consolidation covers both builds.

| Package | October snapshot (`packages/`, build `26.1023.50603`) | Installed ChatGPT.app `cua_node/lib/node_modules/@oai/` |
| --- | --- | --- |
| `@oai/sky` | `0.7.13` | `0.7.17` |
| `@oai/cua` | `0.2.6` | `0.2.6` (different bytes for some files) |
| `@oai/cua-repl` | `0.1.2` | `0.1.3` |
| `@oai/browser-desktop` | `0.1.1` | `0.1.1` (identical source set) |

Source root for this directory:
`/Applications/ChatGPT.app/Contents/Resources/cua_node/lib/node_modules/@oai/`.

## Added in the installed build (44 files, 57,612 bytes)

Byte-for-byte copies, preserving each package's relative layout. Exact
SHA-256 digests, sizes and absolute sources are in
[`FILES.json`](FILES.json). Prettier-formatted copies of the six `.js` files
are in [`../readable/installed-newer/`](../readable/installed-newer/) (all six
pass `node --input-type=module --check`).

**`@oai/sky` (17)** — a new Windows *full-desktop* client and its API:

- `dist/project/cua/sky_js/src/client.js`, `client.d.ts`
- `dist/project/cua/sky_js/src/sky_service_rpc.js`, `sky_service_rpc.d.ts`
- `dist/project/cua/sky_js/src/targets/windows/desktop_client.js`, `desktop_client.d.ts`
- `dist/project/cua/sky_js/src/types/Desktop.d.ts`
- `dist/project/cua/sky_js/src/types/desktop/{Click,Close,Drag,Move,Paste,PressKey,Scroll,TypeText}.d.ts`
- `docs/skills/oai_sky_lib/windows-desktop/{SKILL.md,api.md}`

**`@oai/cua` (14)** — a `siwc.md` browser-capability reference, plus the same
Windows desktop client files duplicated into this package:

- `dist/lib/js/oai_js_browser/dist/skill/references/capabilities/tab/siwc.md`
- `dist/project/cua/sky_js/src/sky_service_rpc.{js,d.ts}`
- `dist/project/cua/sky_js/src/targets/windows/desktop_client.{js,d.ts}`
- `dist/project/cua/sky_js/src/types/Desktop.d.ts`
- `dist/project/cua/sky_js/src/types/desktop/{Click,Close,Drag,Move,Paste,PressKey,Scroll,TypeText}.d.ts`

**`@oai/cua-repl` (6)** — environment plumbing and new instruction prompts:

- `dist/lib/js/oai_js_cua_repl/src/environment.js`, `environment.d.ts`
- `instructions/{audio.md,completion-summary.md,task-completion.md,title.md}`

**`@oai/browser-desktop` (7)** — the `siwc.md` capability docs across four
deployment variants:

- `environment-docs/{cloud,codex-app,orbit}/siwc.md`
- `environment-docs/{cloud,codex-app,orbit,training}/capabilities/tab/siwc.md`

## Present only in the older snapshot (2 files)

Retained in `packages/` and deliberately **not** removed, so both builds are
recoverable:

- `packages/cua/dist/project/cua/sky_js/src/require_audio_model_support.js`
- `packages/cua-repl/instructions/audio-attachments.md`

## Why this is a separate tree

Mixing the two builds into `packages/` would silently change the identity of
the October snapshot that the REA evidence and the shipped-runtime manifest
describe. Keeping `installed-newer/` separate makes the provenance of every
file explicit. `packages/` remains the byte-faithful October build; this tree
is the byte-faithful delta from the installed build.

## Remaining limits

- These are still shipped, compiled/minified JS + generated `.d.ts` + docs —
  **not** original author TypeScript with comments and pre-minification names.
- Only source-bearing text files were copied; binaries, `.app`/`.bundle`
  subtrees, nested `node_modules` and `leveldb` remain excluded.
- The newer installed *native* service is described in
  [`../RECOVERY-REPORT.md`](../RECOVERY-REPORT.md) and
  [`../ARCHITECTURE.md`](../ARCHITECTURE.md); no native source is recoverable
  from either build.
