# Operations

For MCP, pass the object below to `computer`. For CLI, pass the same object as
one JSON argument to `scripts/computer-use computer`. State and indexed actions
must share one runtime session: use MCP or a single `js --file` invocation.

```json
{ "action": "get_app_state", "app": "com.apple.TextEdit", "window_id": 123 }
```

Actions and additional arguments:

- `list_apps`: no app needed.
- `get_app_state`, `screenshot`: `app`.
- `click`: `app`, `element_index` or `x` and `y`; optional `mouse_button`, `click_count`.
- `press_key`: `app`, `key` (for example `Super_L+a`).
- `type_text`: `app`, `text`.
- `paste`: currently refuses shared-clipboard mutation; use `type_text` or `set_value`.
- `scroll`: `app`, `direction`, `element_index` or `x` and `y`; optional positive `pages`.
- `drag`: currently refuses; no verified background drag or global fallback.
- `set_value`: `app`, `element_index`, `value`.
- `select_text`: `app`, `element_index`, `text`; optional `prefix`, `suffix`, `selection_type`.
- `perform_secondary_action`: `app`, `element_index`, `secondary_action` from the AX tree.

`app` accepts a name, bundle ID, or absolute app path. Coordinates are relative
to the returned window screenshot. Reject out-of-window coordinates; observe
again when the selected window changes. Native state is a full tree rather
than a diff. Some app controls do not support all AX actions.

Input is background-only. Choose `window_id` from `list_apps` and pass it to
`computer` state/actions. In JS, pass `APP#window=ID` as the `app` argument to
the matching `cua.computer.*` operation.
If the target is frontmost, move user focus elsewhere; the helper will not do
that itself. It refuses hidden/minimized/moved windows and expired snapshots.
Coordinate clicks select exposed AX buttons/editors, not a global pixel click.
The independent teal AI cursor animates above the target, stays click-through,
and hides after inactivity or reset. `CODEX_CUA_VISUAL_CURSOR=0` disables it at
launch without changing input delivery.

Supported secondary actions are `AXPress`, `AXIncrement`, and `AXDecrement`.
`press_key` supports unmodified editor keys and AX select-all (`Super_L+a`);
other command/modifier shortcuts refuse to avoid window activation. Scroll
uses the requested `AXScroll*ByPage` action and succeeds only if the app
implements it. An advertised action that returns `AXError.cannotComplete`
becomes an explicit `background_unavailable` refusal; there is no global wheel
fallback. Browser canvas/game controls with no AX representation,
file-manager drag, and rich clipboard imports are not established by the
AppKit fixture.

MCP `computer` calls and the persistent `js` tool share one helper process, so
an index returned by one can be used immediately by the other. Refresh state
after any UI change. A `js_reset` intentionally stops that helper and clears
both the JavaScript bindings and AX index map.

## CLI Batching

Prepare a JavaScript file for the user's task and execute it with
`scripts/computer-use js --file /absolute/path/task.mjs`. The following pattern
reads state and selects the target by its current accessibility identifier,
all within one invocation. Substitute only a target and identifier observed
in that app's fresh state:

```javascript
var app = await cua.getApp("local.codex.cua.verification");
var state = await app.getAXState({ emit: false, disableDiffing: true });
var line = state.split("\n").find(line => line.includes("ID: verification-input"));
if (!line) throw new Error("Target input is not present");
var match = /^\s*(\d+)/.exec(line);
if (!match) throw new Error("Target has no accessibility index");
await app.click(Number(match[1]));
await app.pressKey("Super_L+a");
await app.typeText("requested text");
await app.getAXState();
```

App methods also include `getScreenshot()`, `paste(text)`,
`scroll(index or [x,y], direction, pages)`, `setValue(index,value)`,
`selectText(index,text)`, and `performSecondaryAction(index,action)`.
`selectText` accepts `{ prefix, suffix, selectionType }` to disambiguate text
or position a cursor. `paste(text, { format: "html" })` supplies HTML to an app
that supports rich paste; `md` pastes Markdown source, not rendered rich text.
The current background-only backend refuses paste instead of changing the
shared clipboard. Those methods remain in the recovered interface but do not
imply support in the replacement native helper.
`nodeRepl.write(value)` emits text. CLI `screenshot APP PATH` saves a PNG;
CLI `js` reports image metadata rather than rendering images inline, so use
the dedicated screenshot command and the agent's image-viewing tool when needed.

MCP `js` supports `{ "code": "...", "timeout_ms": 45000 }`; the runtime is
persistent. Use `var` for bindings you may redeclare, and `js_reset` when a
clean runtime is necessary. An exception does not automatically clear
bindings. Cancellation or timeout stops the helper and may require fresh state
after the runtime restarts.

## Shipped Guidance

The workflow is adapted from the recovered installed Mac computer-use skill
at `../scripts/codex-computer-use-source/sky/docs/skills/oai_sky_lib/macos/SKILL.md`
and the CUA runtime guidance at
`../scripts/codex-computer-use-source/cua/docs/tinysky-alt-core-cua-repl-mac.md`.
Those originals remain unchanged as evidence. This skill uses the reconstructed
standalone MCP/CLI instead of original `cua_repl`/`node_repl` tools, always
returns full trees, and does not advertise host-only browser DOM methods.
