# Key-module reading guide

Companion to [`ARCHITECTURE.md`](../ARCHITECTURE.md) and
[`readable/MANIFEST.md`](../readable/MANIFEST.md). It annotates the three
minified shipped implementation files the recovery was asked to make readable:

| File | Original | Readable derivative |
| --- | --- | --- |
| `@oai/sky/sky.js` | `packages/sky/dist/project/cua/sky_js/src/sky.js` (1 line, 10,770 chars) | `readable/packages/sky/dist/project/cua/sky_js/src/sky.js` (101 lines) |
| `@oai/cua/cua.js` | `packages/cua/dist/lib/js/oai_js_cua/src/cua.js` (1 line) | `readable/packages/cua/dist/lib/js/oai_js_cua/src/cua.js` (21 lines) |
| `browser-service.mjs` | `packages/browser-desktop/scripts/browser-service.mjs` (9,373 lines, minified) | `readable/ast-verified/browser-service.mjs` (AST-verified) and `readable/packages/browser-desktop/scripts/browser-service.mjs` (80,883 lines, prettier) |

> **Analyst inference — original identifiers are not recoverable.** Every name
> in the glossary tables below is inferred from usage in the shipped bytes. The
> code itself retains the shipped mangled tokens (`e`, `t`, `r`, `o`, …); no
> identifier was renamed, and no comment was reconstructed.

---

## 1. `@oai/sky/sky.js` — the `sky` Proxy client

Role: the object imported by the shipped skill
(`globalThis.sky = (await import("@oai/sky")).sky`). It is a lazy Proxy that
turns property access into RPCs against a trusted `node_repl` service.

### Binding glossary (inferred)

| Token | Inferred role | Evidence (formatted derivative) |
| --- | --- | --- |
| `e` (import) | tslib `__awaiter` generator wrapper | `import { __awaiter as e } from "…/tslib.es6.js"` |
| `t` (import) | `create_client` — direct (no-REPL) fallback client | `import { create_client as t }` |
| `r` (import) | `load_options` — reads `OAI_SKY_CONFIG_PATH` or picks target by `process.platform` | `import { load_options as r }` |
| `o` (import) | Linux `accessibility_tree` post-processor | `import { accessibility_tree as o }` |
| `n` | `globalThis.nodeRepl` — the privileged REPL bridge | `const n = globalThis.nodeRepl;` |
| `i` | result of the `setup` RPC (`{ target, methods }`) | `i = await a({ type: "setup" })` |
| `s` | retained setup error, replayed on later property access | `catch (e) { s = e }` in the Proxy `get` trap |
| `d` | cached client instance | `if (null != d) return d;` |
| `l` | exported `sky` Proxy | `export { l as sky }` |
| `c()` | lazy client factory | builds `{ target }` plus one closure per `methods` entry |
| `a(request)` | RPC dispatcher | `n.rpc("sky", t)` wrapped in `__awaiter` |
| `u(e)` | screenshot decoder | `data_url.split(",")[1]` → `Buffer.from(...,"base64")` → `Uint8Array` |

### Control flow

1. **Setup (top-level await).** If `n.rpc` is a function, immediately
   `await a({ type: "setup" })`; failures are stored in `s`.

2. **Proxy construction.** `l = new Proxy({}, { get, getOwnPropertyDescriptor,
   has, ownKeys })`. `get` resolves `c()`, `Reflect.get`s the property, binds
   functions to the client, and — when the property is absent and a setup error
   exists — returns `() => Promise.reject(s)` so errors surface on use rather
   than at module load.

3. **Client factory `c()`.**
   - Without `nodeRepl`: `d = create_client(load_options())`.
   - With `nodeRepl.rpc`: `o = { target: i?.target }`, then for each method name
     in `i.methods` install
     ```js
     const e = (...e) => a({ type: "execute", method: t, args: e });
     Reflect.set(o, t, e);
     ```
   - Linux-only `drag_handle`: when `i.methods.includes("drag_handle")`, add a
     factory returning `start` / `move_to` / `end` closures over a
     `crypto.randomUUID()` handle (`drag_start`, `drag_move`, `drag_end`).

4. **Dispatcher `a(request)`.** Requires `n.rpc`, calls
   `n.rpc("sky", request)`, then post-processes three methods:
   - `get_screenshot` → `e.map(u)` (decode every screenshot);
   - `get_window_state` on Linux →
     `ax_tree: accessibility_tree(t.ax_tree, t.focused_modal)` and
     `screenshots: t.screenshots.map(u)`;
   - `stop_audio_recording` → `u(e)`.
   - Returns `undefined` for null results.

5. **Screenshot decoder `u`** returns
   `{ filepath, bytes: Uint8Array.from(Buffer), data_url }`.

### Literal strings / RPC names

`"setup"`, `"execute"`, `"get_screenshot"`, `"get_window_state"`,
`"stop_audio_recording"`, `"drag_start"`, `"drag_move"`, `"drag_end"`,
`"drag_handle"`, `"linux"`, `"mac"` (via `load_options.js`),
`"sky requires node_repl; configure NODE_REPL_TRUSTED_SERVICES"`,
`"Computer Use requires a trusted Node REPL Sky service"`,
`OAI_SKY_CONFIG_PATH` (in `load_options.js`).

### Neighbours

- `create_client.js` dispatches on `options.target` to
  `targets/{linux,mac,windows}/create_client.js` and throws
  `UnreachableCaseError` otherwise.
- `load_options.js` reads `OAI_SKY_CONFIG_PATH` as JSON if set, else maps
  `process.platform` → `{ target: "mac" | "linux" | "windows" }`.
- `index.js` is `export { sky } from "./sky";`; `index.d.ts` additionally
  exports `type { SkyClient } from "./types"`.

### Unknowns

The concrete method list returned by `setup`, the native-side implementation of
each method, and the exact `create_client` platform client bodies are not
established by this file alone.

---

## 2. `@oai/cua/cua.js` — the unified `cua` facade

Role: couples the desktop `sky` client with the browser runtime and the
generated tinysky documentation.

```js
import { __awaiter as o } from "../../oai_js/node_modules/tslib/tslib.es6.js";
import { setupBrowserRuntime as s } from "../../oai_js_browser/dist/skill/scripts/browser-client.js";
import { sky as r } from "../../../../project/cua/sky_js/src/sky.js";
import { get_state as t } from "./get_state.js";
const e = {
  initialize: function () {
    return o(this, void 0, void 0, function* () {
      const o = yield s({ undocumentedApiMembers: ["Tab.ax"] });
      return (
        (e.computer = r),
        (e.browsers = o.browsers),
        (e.documentation = o.documentation),
        t({ browsers: o.browsers, computer: r })
      );
    });
  },
  computer: null,
  browsers: null,
  documentation: null,
};
export { e as cua };
```

| Token | Inferred role |
| --- | --- |
| `o` (import) | tslib `__awaiter` |
| `s` | `setupBrowserRuntime` from the `oai_js_browser` skill script |
| `r` | the `sky` Proxy from `@oai/sky` |
| `t` | `get_state` (unified state installer) |
| `e` | the exported `cua` object |
| `o` (local) | result of `setupBrowserRuntime`, holding `browsers` and `documentation` |

`initialize()` returns a generator-wrapped promise: call
`setupBrowserRuntime({ undocumentedApiMembers: ["Tab.ax"] })`, assign
`cua.computer = sky`, `cua.browsers`, `cua.documentation`, then call
`get_state({ browsers, computer })`.

Literals: `undocumentedApiMembers`, `Tab.ax`, `computer`, `browsers`,
`documentation`. Unknown: what `get_state` installs into the REPL globals and
how the browser runtime enumerates tabs.

---

## 3. `browser-service.mjs` — the browser automation bundle

The 2.1 MB shipped bundle is a single minified ESM module. The earlier Babel
recovery produced a **readable view that reparses to the same normalized AST**
(`readable/ast-verified/browser-service.mjs`, 2,646,389 bytes) with a generated
`browser-service.mjs.map` and `browser-service.mjs.source-ranges.json` (both at
their original paths). Those maps address **shipped bundle text**, not author
source. `symbol-index.json` (7.8 MB) lists shipped top-level bindings, named
functions/methods, exports, and literal loader sites with exact original
ranges.

### Embedded programs (from `readable-browser/README.md`)

| Name | Carrier line | Shipped binding | Decoded view |
| --- | --- | --- | --- |
| `q5` | 31601 | `q5` | `browser/embedded/browser-service.mjs.31601.q5.decoded.js` |
| `webMcp` | 53666 | `T0` | `…53666.webMcp.decoded.js` |
| `standalone-helper` | 59699 | none | `…59699.standalone-helper.decoded.js` |
| `PlaywrightInjected` | 61114 | `hF` | `…61114.PlaywrightInjected.decoded.js` |
| `functionDeclaration` | 62151 | `functionDeclaration` | `…62151.functionDeclaration.decoded.js` |
| `querySelectorStrictWithVisibleFallback` | 63061 | `al` | `…63061.querySelectorStrictWithVisibleFallback.decoded.js` |
| `n` | 79094 | `jme` (base64) | `…79094.n.decoded.mjs` |

Discovery considered static, code-shaped strings/templates ≥160 chars and
canonical base64 strings ≥256 chars. Anonymous function literals are retained
exactly with a separately recorded expression wrapper. Dynamic template
construction, short fragments and unrelated encodings are not fully recovered.
The decoded files are standalone inspection views, **not inferred original
modules**.

### Subsystems visible in the bundle and its derivatives

- **WebMCP** (`webMcp` program, `T0`) — page-declared WebMCP tool registration.
- **Playwright injection** (`PlaywrightInjected`, `hF`) — injected browser-side
  automation code (154 KB decoded).
- **DOM helpers** — `q5` (focused-frame resolution through shadow roots and
  iframes), `querySelectorStrictWithVisibleFallback` (`al`).
- **WASM** — `browser-accessibility.wasm.br` (Brotli-compressed) and
  `zxing_reader.wasm`. The bounded WAT summary reports `(func` 81,447 textual
  occurrences, `(type` 133,150, `(global` 5,163, 11 exports and 34 import
  pairs. WAT is generated disassembly, not author source.
- **Environment docs** — `cloud/`, `codex-app/`, `orbit/`, `training/` variants
  covering CDP, WebMCP, `browserAuth`, `pageAssets`, `botDetection`,
  screenshots, uploads and confirmations.

### Unknowns

Original module boundaries, author identifiers, comments and source files are
not recovered; the generated `.map` files do not restore them. The flattened
dependency inventory does not identify every library already inlined into the
bundle. `@oai/cdp-browser-backend@0.6.7` is metadata-only — no installed source.

---

## What readability was actually recovered

- **Structure, not names.** Prettier 3.9.10 restored line structure across 227
  shipped `.js`/`.mjs` files (230 outputs including three AST-verified views);
  all 230 pass `node --input-type=module --check`.
- **Verified equivalence only for the browser bundles.** The three
  `readable/ast-verified/` views passed normalized AST comparison (comments,
  source locations, raw spellings ignored; `!0`/`!1` expanded, declarations
  separated, else-binding braces added) and `node --check`. Identifiers were
  never renamed.
- **Not recoverable:** original comments, pre-minification identifiers, author
  TypeScript modules, original source maps. The shipped `@oai/*` packages
  contain compiled/minified JS plus generated `.d.ts`.
- These are **derivative inspection views**, not buildable original source, and
  the shipped plugin/package license is Proprietary (reference-only).
