# Cross-platform helper (Windows + Linux)

[`computer_use_helper.py`](computer_use_helper.py) is the native helper for
`portable-computer-use` on Windows and Linux. It implements the
[JSON-lines backend contract](../../porting/BACKEND-CONTRACT.md) over stdin/
stdout and needs **only Python 3.8+ and the standard library** for the protocol
core. Platform features use OS-provided tools/libraries probed at runtime.

| Platform | Backend | Window list | AX tree | Screenshot | Input |
| --- | --- | --- | --- | --- | --- |
| Windows | `windows-uia` | `EnumWindows` (ctypes) | PowerShell `-File` + .NET `UIAutomationClient` | `PrintWindow(hwnd)` (window-scoped) + pure-Python PNG encoder | `SendInput` / UIA control patterns, exact-window binding required |
| Linux X11 / XWayland | `linux-x11` | `xdotool search` | `xwininfo -tree`, optional `pyatspi` | `import -window <id>` only (window-scoped) | `xdotool --window <id>` (targeted synthetic events, exact-window binding required) |
| Linux Wayland | `wayland-portal` | `/proc` scan | `pyatspi` (AT-SPI2), else refusal | full-screen only, requires explicit `allow_fullscreen: true` | `wtype` / `ydotool` (foreground keyboard), coordinate clicks refused |

## Install / build

```sh
node scripts/build-cross-platform.mjs          # copies into build/windows + build/linux, writes hashes
node scripts/build-cross-platform.mjs --check # verifies hashes
node scripts/setup.mjs --check               # platform-aware validation
npm test                                     # 4 suites, incl. stubbed platform tests
```

The MCP server selects the helper automatically from
[`src/backend.mjs`](../../src/backend.mjs). Overrides:

| Variable | Meaning |
| --- | --- |
| `COMPUTER_USE_HELPER` | explicit helper executable (overrides discovery) |
| `COMPUTER_USE_PYTHON` | Python interpreter (`python`, `py`, `python3`, or an absolute path) |

`src/backend.mjs` probes `python`, `py`, `python3` on Windows and `python3`,
`python` on Linux, so a standard Python install is normally auto-detected.

## Optional OS dependencies

Install whichever tools your desktop provides. Missing tools produce explicit
`background_unavailable:` refusals, never crashes.

- **Windows:** Python 3 and Windows PowerShell 5.1 (built in) with
  `UIAutomationClient` / `UIAutomationTypes` assemblies (built in). No
  third-party packages. For elevated apps, UIPI/UAC still applies [S3][S7].
- **Linux X11:** `xdotool` (window list, targeted input), `xwininfo`/`xprop`
  (tree), `imagemagick` (`import`) or `scrot` or `gnome-screenshot`
  (screenshot), optional `python3-pyatspi` for a real AT-SPI tree.
- **Linux Wayland:** `python3-pyatspi` (AT-SPI2 tree), `grim` (wlroots) or
  `spectacle` (KDE) or `gnome-screenshot` (GNOME) for screenshots,
  `python3-gi` (Gio) for the Screenshot portal, `wtype` or `ydotool` for
  foreground keyboard input. Enable AT-SPI with
  `org.a11y.Status.IsEnabled` / `QT_ACCESSIBILITY=1` /
  `GTK_MODULES=gail:atk-bridge` [S13].

## Exact-window binding (no silent global fallback)

On Windows and Linux X11, **every targeted action** binds to a numeric window
id first. Accept `app#window=ID` (from `list_apps`) or `window_id`. A bare app
name (e.g. `Firefox`) is resolved through the platform window inventory; if it
matches zero or more than one window, the operation is **refused** with a typed
`background_unavailable:` error. No `xdotool` invocation is ever emitted
without `--window <id>`, so input can never land on an unrelated focused
application.

Wayland has no per-window id. Desktop-wide operations (AT-SPI tree, foreground
keyboard via `wtype`/`ydotool`) keep the raw app spec; window-scoped ones
refuse. Coordinate clicks always refuse.

## Screenshot scope

- **Windows** — `PrintWindow(hwnd)`, window-scoped only.
- **Linux X11** — `import -window <id>` only. Focused-window tools
  (`scrot -u`, `gnome-screenshot -w`) are deliberately **not** used: they can
  capture a different application than the one requested. If ImageMagick is
  missing, the operation refuses rather than silently over-capturing.
- **Linux Wayland** — no window-scoped capture exists. `screenshot` is
  **refused** unless the caller explicitly passes `allow_fullscreen: true`.
  With that opt-in the result is tagged `scope: "full-screen"` and the MCP
  layer surfaces a warning, because the image may include other applications
  and notifications.

`permissionStatus` `screenshotScope` is `window`, `full-screen-opt-in` or
`none`; `fullScreenCaptureRequiresOptIn` is true on Wayland.

## Capability honesty

`permissionStatus` derives every capability from dependencies actually probed
on the host; nothing is hardcoded `true`. It never claims OS consent —
`capabilityBasis: "dependency-probe; no OS consent is claimed"` and
`missingTools` list exactly what is absent.

- Windows: `axTree`/`accessibility` require PowerShell (UIA);
  `screenshot`/`screenRecording` require no external tool (PrintWindow);
  `globalInput: true`, `inputMode: "foreground-only"`.
- Linux X11: `axTree` requires `xwininfo` or `pyatspi`; `screenshot` requires
  `import`; `windowTargetedInput`/`backgroundAvailable` require `xdotool`;
  `globalInput: false`.
- Linux Wayland: `axTree` requires `pyatspi`; `screenshot` requires a capture
  tool; `backgroundAvailable`/`windowTargetedInput` are `false`;
  `globalInput` is true only when `wtype`/`ydotool` are present (they inject
  globally via uinput); `consentRequired: true`.

Unsupported operations (`paste`, `drag`, Wayland coordinate clicks, Linux
`set_value`/`select_text`/secondary actions, unsupported test hooks) return
`{"error":{"message":"background_unavailable: …"}}`, matching the skill's
"explicit refusals, no global fallback" contract.

## Verification boundary

This helper was developed on macOS. Verified there: Python syntax, JSON-lines
protocol, capability reporting, and backend orchestration with stubbed OS tools
for Windows/X11/Wayland (`test/cross-platform-helper.mjs`), plus simulated
`win32`/`linux` `setup.mjs --check`. **Not verified:** the actual Win32/UIA/
portal/PipeWire/AT-SPI API behaviour. On each target OS run:

```sh
node scripts/setup.mjs --check
npm test
./bin/computer-use status
./bin/computer-use list-apps
./bin/computer-use state 'Notepad'          # Windows
./bin/computer-use state 'gnome-terminal'   # Linux
./bin/computer-use screenshot 'Notepad' out.png
```

See [porting/PORTING-RESEARCH.md §7](../../porting/PORTING-RESEARCH.md) for the
full list. Sources [S1]–[S20] are cited there.
