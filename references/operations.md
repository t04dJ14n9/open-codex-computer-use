# Operations

For MCP, pass the object below to `computer`. For CLI, pass the same object as
one JSON argument to `scripts/computer-use computer`. State and indexed actions
must share one runtime session: use MCP or a single `js --file` invocation.

```json
{ "action": "get_app_state", "app": "com.apple.TextEdit" }
```

Actions and additional arguments:

- `list_apps`: no app needed.
- `get_app_state`, `screenshot`: `app`.
- `click`: `app`, `element_index` or `x` and `y`; optional `mouse_button`, `click_count`.
- `press_key`: `app`, `key` (for example `Super_L+a`).
- `type_text`: `app`, `text`.
- `paste`: `app`, `text`; optional `format` (`text`, `md`, or `html`).
- `scroll`: `app`, `direction`, `element_index` or `x` and `y`; optional positive `pages`.
- `drag`: `app`, `from_x`, `from_y`, `to_x`, `to_y`; optional `duration`.
- `set_value`: `app`, `element_index`, `value`.
- `select_text`: `app`, `element_index`, `text`; optional `prefix`, `suffix`, `selection_type`.
- `perform_secondary_action`: `app`, `element_index`, `secondary_action` from the AX tree.

`app` accepts a name, bundle ID, or absolute app path. Coordinates are relative
to the returned window screenshot. Reject out-of-window coordinates; observe
again when the selected window changes. Native state is a full tree rather
than a diff. Some app controls do not support all AX actions.

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
The native helper restores the prior pasteboard after paste unless another
process changes it during the operation. Verify rich imports visually because
support varies by app.
`nodeRepl.write(value)` emits text. CLI `screenshot APP PATH` saves a PNG;
CLI `js` reports image metadata rather than rendering images inline, so use
the dedicated screenshot command and the agent's image-viewing tool when needed.

MCP `js` supports `{ "code": "...", "timeout_ms": 45000 }`; the runtime is
persistent. Use `var` for bindings you may redeclare, and `js_reset` when a
clean runtime is necessary. An exception does not automatically clear bindings.

## Shipped Guidance

The workflow is adapted from the recovered installed Mac computer-use skill
at `../scripts/codex-computer-use-source/sky/docs/skills/oai_sky_lib/macos/SKILL.md`
and the CUA runtime guidance at
`../scripts/codex-computer-use-source/cua/docs/tinysky-alt-core-cua-repl-mac.md`.
Those originals remain unchanged as evidence. This skill uses the reconstructed
standalone MCP/CLI instead of original `cua_repl`/`node_repl` tools, always
returns full trees, and does not advertise host-only browser DOM methods.
