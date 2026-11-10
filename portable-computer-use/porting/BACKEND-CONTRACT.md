# Native helper backend contract

This is the **only** platform-specific interface in `portable-computer-use`. A
port to Windows or Linux is a new native helper process that speaks this
JSON-lines protocol; the MCP server, tools, `js` runtime, CLI and skill
instructions stay unchanged.

Source of truth: [`src/helper.mjs`](../src/helper.mjs) (`METHODS`) and
[`src/tools.mjs`](../src/tools.mjs) (parameter shapes).

## Transport

- The Node parent spawns the helper once (`spawn(helperPath, [], {stdio: pipe})`).
- Request (one JSON object per line on the helper's stdin):
  `{"id": 1, "method": "click", "params": {...}}`
- Response (one JSON object per line on stdout):
  `{"id": 1, "result": {...}}` or `{"id": 1, "error": {"message": "..."}}`
- Cancellation: `{"method": "cancel", "params": {"id": 1}}`. The helper should
  abort that request; the parent also has a 30 s per-request timeout.
- `stderr` is diagnostics only. A helper exit rejects all pending requests.
- No socket, no XPC, no D-Bus service exposed to the agent: only this private
  parent/child pipe.

## Methods

| Method | Params (subset) | Result | Notes |
| --- | --- | --- | --- |
| `list_apps` | — | `[{id, displayName, isRunning, pid, windows:[{id, title, app}]}]` | running GUI apps + their windows |
| `get_app_state` | `{app, disableDiff?}` | `{app, text, screenshot: {url} \| null}` | numbered AX/UIA tree text; `app` may be `name#window=ID` |
| `screenshot` | `{app}` | `{url}` | `file://` or `data:image/png;base64,…` |
| `click` | `{app, element_index? or x,y, mouse_button?, click_count?, key?, duration?}` | `void` | plain single left click is the verified core |
| `drag` | `{app, from_x, from_y, to_x, to_y}` | `void` | may refuse |
| `paste` | `{app, text, format}` | `void` | may refuse |
| `press_key` | `{app, key, duration?}` | `void` | unmodified keys / Return / Tab / Super_L+a |
| `scroll` | `{app, element_index? or x,y, direction, pages?}` | `void` | AX/UIA page scroll only |
| `set_value` | `{app, element_index, value}` | `void` | replace an editable element's value |
| `select_text` | `{app, element_index, text, prefix?, suffix?, selection_type?}` | `void` | editor selection |
| `type_text` | `{app, text}` | `void` | Unicode text at focused editor |
| `perform_secondary_action` | `{app, element_index, action}` | `void` | named accessibility action |
| `permissionStatus` | — | `{accessibility, screenRecording, backgroundAvailable, inputMode, globalInput, helper, missingSymbols, cursor:{...}, pid}` | capability/permission probe |
| `requestPermissions` | — | same as `permissionStatus` | opens OS consent UI |
| `cursorStatus` | — | `{enabled, visible, phase, moves, frames, ...}` | agent cursor overlay |
| `cursorImage` | — | `{url: "data:image/png;base64,…"}` | overlay image |
| `hideCursor` | — | `null` | hide overlay |
| `test_move_window` | — | — | test-only (test hooks) |
| `test_activate_app` | — | — | test-only (test hooks) |

## Capability negotiation (proposed for ports)

`permissionStatus` should return a `capabilities` object so the JS layer can
degrade gracefully instead of failing:

```json
{
  "accessibility": true,
  "screenRecording": true,
  "backgroundAvailable": false,
  "inputMode": "foreground-only",
  "globalInput": false,
  "windowTargetedInput": false,
  "axTree": true,
  "screenshot": true,
  "consentRequired": true,
  "compositor": "gnome",
  "missingSymbols": []
}
```

Semantics the macOS helper provides but a port may not:

- **Background-only input** — synthetic events to one specific window without
  activating it or moving the physical pointer (`backgroundAvailable: true`).
- **Exact-window binding** — `app#window=ID`, no largest-window fallback.
- **Explicit refusals** — unsupported actions return a typed error rather than
  silently falling back to global input.

Any method that cannot be honoured must return an `error.message` prefixed with
`background_unavailable:` (or a documented capability code), matching the
existing refusal contract in `SKILL.md`.

## Helper discovery

[`src/config.mjs`](../src/config.mjs) resolves, in order:

1. `COMPUTER_USE_HELPER` (explicit override)
2. `build/Computer Use Helper.app/Contents/MacOS/ComputerUse` (darwin)
3. `build/windows/computer-use-helper.exe` (win32, proposed)
4. `build/linux/computer-use-helper` (linux, proposed)

`runtimeStatus()` reports `platform`, `backend`, `helper`, `helperPresent` and
the negotiated `capabilities`. A missing helper produces a clear error, never a
silent fallback to another runtime.

## Why this contract is the right seam (evidence)

The recovered `@oai/sky` package already used exactly this design for its other
platforms:

- Linux: `targets/linux/sky_linux.js` spawns `bin/linux/sky_linux_<arch> server`
  and `targets/linux/sky_linux_transport.js` speaks JSON lines
  `{"id":N,"command":"get_window_state","input":{...}}` over stdio.
- Windows: `targets/windows/internal/helper_transport.js` spawns
  `codex-computer-use.exe` over the same stdio JSON-lines pattern.

So a port does not need to invent a new IPC architecture — it needs to
implement the same method set against the target OS's APIs. See
[`PORTING-RESEARCH.md`](PORTING-RESEARCH.md) for the API mapping.
