# Porting research: Windows and Linux Wayland

**Status:** research + design + **implemented helpers**, 2026-11-10. The
Windows and Linux helpers described below now exist as
[`native/crossplatform/computer_use_helper.py`](../native/crossplatform/computer_use_helper.py)
and are wired into the skill. **Companion:**
[BACKEND-CONTRACT.md](BACKEND-CONTRACT.md) is the exact interface they
implement. **Subject:** [`portable-computer-use/`](../README.md), the clean
macOS skill (commit `ef0ca34`).

Sources were fetched from vendor/standards documentation (HTTP 200) and are
cited inline as markdown links; a numbered list is at the end. Local prior art
comes from the recovered `@oai/sky` sources already in this repository, with
file paths given. Claims about what the code does were checked against the
actual files; claims about OS APIs were checked against the linked docs.
Estimates are labelled as estimates.

---

## 0. Verdict

The port is **a replacement of the native helper process**, not a rewrite of
the skill. The MCP server, four tools, `js` runtime, `cua` API, CLI, installer
and SKILL.md are platform-neutral already. Only
[`src/helper.mjs`](../src/helper.mjs)'s child process and
[`src/config.mjs`](../src/config.mjs)'s helper path are macOS-specific.

| Target | Status | Hard part | Parity with macOS |
| --- | --- | --- | --- |
| **Windows 10/11** | **Implemented** (Python helper: Win32 ctypes + PowerShell UIA) | UIPI/integrity levels, UIA tree completeness, consent for capture | Near-complete for observation; **background-only input is only partly achievable** |
| **Linux X11 / XWayland** | **Implemented** (xdotool / xwininfo / import / optional pyatspi) | synthetic XSendEvent input is ignored by some toolkits | window-targeted input approximated via `xdotool --window` |
| **Linux Wayland** | **Implemented with explicit downgrades** (AT-SPI2, portals, compositor tools, ydotool/wtype) | Portals + PipeWire + libei + per-compositor protocols | Observation is achievable; **background-only, window-targeted input is NOT achievable through standard portals** |

The helpers are **real code**, not stubs: they implement the 19-method contract
on each OS, report capabilities honestly via `permissionStatus`, and return
typed `background_unavailable` refusals where parity is impossible. What could
not be done from this macOS host is *executing the OS APIs themselves* — see
§8 for the verification boundary.

**The single most important finding:** the macOS helper's defining property —
delivering synthetic input to one specific *background* window without
activating it or moving the physical pointer — has no direct equivalent on
Wayland. Standard portals inject input into the compositor's normal input stack
(i.e. to whatever is focused) and require an interactive consent dialog. A
Wayland port must therefore either (a) accept foreground semantics, (b) use
AT-SPI element actions for a subset of "background-ish" operations, or (c)
offer observation-only mode. This must be a documented capability downgrade,
not a silent behaviour change. Windows can get closer via UI Automation control
patterns (which act on elements without focus) but coordinate clicks still need
focus or global `SendInput`.

---

## 1. What is already platform-neutral

| Layer | File | Port work needed |
| --- | --- | --- |
| Skill instructions | [`SKILL.md`](../SKILL.md) | none (add platform capability notes) |
| MCP server + 4 tools | [`src/server.mjs`](../src/server.mjs), [`src/tools.mjs`](../src/tools.mjs) | none |
| Persistent `js` VM | [`src/runtime.mjs`](../src/runtime.mjs) | none |
| Documented `cua` API | [`src/api.mjs`](../src/api.mjs) | none |
| CLI | [`src/cli.mjs`](../src/cli.mjs) | none |
| JSON-lines helper bridge | [`src/helper.mjs`](../src/helper.mjs) | none (protocol is the contract) |
| Helper path / capabilities | [`src/config.mjs`](../src/config.mjs) | **add per-platform helper discovery** |
| Native helper | [`build/Computer Use Helper.app`](../build/native-manifest.json), [`native/*.swift`](../native/README.md) | **replace per OS** |
| Setup / hash check | [`scripts/setup.mjs`](../scripts/setup.mjs) | make platform-aware |

`src/helper.mjs` already defines the 19-method contract and a 30 s timeout,
cancellation, error normalization and a single long-lived child. A new helper
only has to speak `{id, method, params}` → `{id, result|error}`.

---

## 2. Prior art in this repository (strong evidence)

The recovered `@oai/sky` sources in `recovered-source/` contain **real Linux
and Windows implementations** from the original product. They validate the
architecture and give an API/design reference:

- **Linux helper:** `recovered-source/readable/packages/sky/dist/project/cua/sky_js/src/targets/linux/sky_linux.js`
  resolves `bin/linux/sky_linux_<process.arch>` (env override
  `OAI_SKY_LINUX_BIN`), spawns it with the `server` argument, and
  `sky_linux_transport.js` sends JSON lines
  `{"id":N,"command":"get_window_state","input":{...}}` over stdio with a
  pending-request `Map` — the same pattern as our `helper.mjs`.
- **Linux API:** `recovered-source/readable/packages/sky/docs/sky-full-desktop-api.md`
  and `.../docs/skills/oai_sky_lib/linux/SKILL.md` describe a full-desktop
  API: `list_apps`, `launch_app`, `list_windows`, `activate_window`,
  `get_window_state`, `get_screenshot`, `click`, `drag`, `drag_handle`, `move`,
  `move_relative`, `press_key`, `scroll`, `type_text`, `type_characters`,
  `clipboard_read/write/release`, `key_down/up`, `perform_secondary_action`.
  Critically: *"supplying `window` sends input to that window without activating
  it or moving the desktop pointer … Targeted input never falls back to
  activating the window."* Trees come from AT-SPI with an X11 fallback
  (`ax_tree_source: "at_spi" | "x11"`), and windows have **stable X11 window
  IDs**. So OpenAI's Linux path was X11/XWayland-oriented, not pure-Wayland.
- **Windows helper:** `.../targets/windows/internal/helper_transport.js`
  spawns `codex-computer-use.exe` over stdio JSON lines;
  `computer_use_client_base.js` exposes `list_apps`, `list_windows`,
  `get_window`, `activate_window`, `get_window_state`, `click`, `drag`,
  `press_key`, `type_text`, `scroll`, `set_value`,
  `perform_secondary_action`, `start/stop_audio_recording`.
  `.../docs/skills/oai_sky_lib/windows/SKILL.md` states: *"Automates apps via
  SendInput and UI Automation, and takes screenshots of app windows via
  Windows.Graphics.Capture that works even if they are occluded."*
- **Newer build (installed):** `recovered-source/installed-newer/sky/docs/skills/oai_sky_lib/windows-desktop/SKILL.md`
  describes a second, simpler Windows client (`create_client({target:"windows",
  api:"desktop"})`) that is **screenshot + input only**, with no AX tree,
  coordinates relative to the latest combined-monitor screenshot, and
  `drag_handle`. This is a useful minimal fallback tier.

Conclusion: the JSON-lines helper seam, the method set, and the "AX tree +
screenshot + targeted input" model are all proven designs. A port should reuse
them rather than invent a new protocol.

---

## 3. Windows port

### 3.1 API mapping

| Contract method | Windows API | Notes / evidence |
| --- | --- | --- |
| `list_apps`, window list | `EnumWindows` + `GetWindowThreadProcessId` + `QueryFullProcessImageName`; or `IUIAutomation` root `FindAll(TreeScope_Children)` | UIA is the accessibility framework for desktop apps [S1][S5] |
| `get_app_state` (numbered tree) | `IUIAutomation` `TreeWalker` / `FindAll`, `CurrentName`, `CurrentControlType`, `CurrentAutomationId`, `CurrentBoundingRectangle`, `CurrentIsEnabled`, `CurrentIsOffscreen`; control patterns (`Invoke`, `Value`, `SelectionItem`, `ScrollItem`, `ExpandCollapse`, `Text`, `LegacyIAccessible`, `Toggle`) | [S1][S5]; UIA client guide covers obtaining elements, properties, caching and events |
| `set_value` / `select_text` | `IUIValuePattern::SetValue`, `IUIValuePattern::CurrentValue`, `IUITextPattern` | UIA patterns act on the element directly, no focus needed |
| `perform_secondary_action` | UIA `InvokePattern`, `ExpandCollapsePattern`, `TogglePattern`, `SelectionItemPattern` | map the tree's displayed action names to patterns |
| `screenshot` / `get_app_state.screenshot` | `Windows.Graphics.Capture`: `GraphicsCapturePicker.PickSingleItemAsync()` → `GraphicsCaptureItem` → `Direct3D11CaptureFramePool.Create(...)` → `CreateCaptureSession` → `StartCapture` → `TryGetNextFrame` → encode PNG | [S2]: picker is *secure system UI*, user picks the window/monitor, a **yellow border** marks capture; HD color may need `R16G16B16A16_FLOAT`; WinUI 3 needs `InitializeWithWindow` with an HWND |
| `click`, `drag`, `press_key`, `type_text`, `scroll` | `SendInput` with `INPUT_MOUSE` / `INPUT_KEYBOARD` (`KEYEVENTF_UNICODE` for text) / wheel; or UIA patterns for element-level actions | [S3]: *"This function is subject to UIPI. Applications are permitted to inject input only into applications that are at an equal or lesser integrity level."* It also *"does not reset the keyboard's current state"* |
| window activation | `SetForegroundWindow` | [S6]: heavily restricted — *"An application cannot force a window to the foreground while the user is working with another window. Instead, Windows flashes the taskbar button"* |
| `permissionStatus` | UIA availability + `GraphicsCaptureSession.IsSupported()` + integrity level | [S2] `IsSupported` must be checked |
| Clipboard / `paste` | `OpenClipboard` / `SetClipboardData` + Ctrl+V | the portable skill currently refuses `paste`; keep that refusal unless verified |

### 3.2 Permissions and signing (the real Windows constraint)

[UIA security][S7]: assistive-technology processes run at medium integrity
level (IL) by default and **cannot** inspect or drive elevated ("high" IL)
processes. To cross that boundary an app must set `uiAccess="true"` in its
manifest, be **Authenticode-signed**, and be installed in a secure location
(e.g. Program Files) that required a UAC prompt. Even then:

- no `uiAccess` → medium IL, no access to elevated UI;
- `uiAccess` + non-admin user → "medium+" IL, still no access to high-IL apps;
- `uiAccess` + admin → high IL, can access elevated UI;
- **nothing** grants access to the system-IL UAC/secure desktop.

Practical consequences for the skill:

1. Ship a **signed** `computer-use-helper.exe` with a manifest declaring
   `requestedExecutionLevel level="asInvoker" uiAccess="true"` (or
   `highestAvailable`), installed under Program Files. Without this, driving
   elevated apps fails silently.
2. `SendInput` is additionally blocked by UIPI against higher-IL targets [S3].
3. `Windows.Graphics.Capture` requires a one-time **interactive** picker
   consent [S2]. A headless agent cannot obtain it silently; the first
   screenshot must be user-approved, and the yellow capture border is visible.
4. Protected/HDCP content may produce black frames; WGC is not guaranteed on
   non-desktop devices [S2].

### 3.3 Implementation options

| Option | Pros | Cons |
| --- | --- | --- |
| **C# / .NET 8** with `UIAutomationClient` + WinRT/`CsWinRT` for WGC | fastest to implement, rich UIA bindings, easy PNG encoding | requires .NET runtime (or self-contained publish); WinRT interop boilerplate |
| **Rust** with `windows-rs` (UIA COM, `SendInput`, WGC) | single static binary, no runtime, matches the "one helper" model | more COM/Direct3D boilerplate |
| **C++ COM** | no runtime | most code |
| Python `pywinauto` subprocess | quick prototype | adds Python dependency; weaker WGC support |

Recommendation: **Rust or C#**, one self-contained exe, spawned by
`src/helper.mjs` unchanged. Keep the macOS `.app` and the Windows `.exe` side
by side under `build/<platform>/`.

### 3.4 Windows-specific risks

- **UIA tree completeness.** Custom-drawn, Electron and Chromium apps often
  expose poor trees; Chromium needs `--force-renderer-accessibility`. Provide a
  screenshot + coordinate fallback (as the recovered Windows SKILL.md does with
  `screenshotId`).
- **DPI / multi-monitor.** UIA `BoundingRectangle` is in physical pixels;
  process must be DPI-aware (the UIA client guide lists [S5] "Understanding
  Screen Scaling Issues"). Coordinates in `computer` actions must be normalized.
- **Background-only parity is partial.** UIA patterns give element-level actions
  without focus, but coordinate clicks need `SetCursorPos` + `SendInput` and are
  global. Document `backgroundAvailable: false` for coordinate actions and
  prefer `element_index` actions on Windows.
- **Occluded windows.** WGC can capture occluded windows [S2] — a genuine
  advantage over macOS ScreenCaptureKit; but the picker is per-item and
  interactive.

---

## 4. Linux Wayland port

### 4.1 Why Wayland is fundamentally different

Wayland deliberately gives ordinary clients **no global screen capture and no
global input injection**. The XDG portal documentation states that *"the
primary way of capturing screens and windows on Wayland desktops is through the
ScreenCast portal, and some desktop environments don't even expose other means
to capture the screen or windows"* [S8]. Portals also provide the permission
system: access is *"granted, revoked, and controlled individually by the end
user"* [S8]. The portal frontend/backend split means each desktop environment
implements the host side (GNOME Shell/Mutter, KWin, `xdg-desktop-portal-wlr`,
Hyprland, COSMIC), so behaviour varies by compositor [S9].

### 4.2 API mapping

| Contract method | Wayland API | Notes / evidence |
| --- | --- | --- |
| `list_apps`, window list | `ext-foreign-toplevel-list-v1` (staging) → handles with `title`, `app_id`, `identifier`, `done`, `closed`; or `wlr-foreign-toplevel-management-unstable-v1` on wlroots; or AT-SPI2 application tree; or `/proc` scan | [S14]: *"The compositor may choose to restrict this protocol to a special client … or expose it to all clients, this is compositor policy."* `identifier` is a string ≤32 printable ASCII bytes, unique while mapped. See compositor matrix in §4.4 |
| `get_app_state` (AX tree) | **AT-SPI2** over D-Bus (`at-spi2-core`, `libatspi`, `pyatspi2`); each application is a sender whose widget tree is a tree of D-Bus object paths | [S13]: *"The protocol essentially consists in dbus RPCs and notifications … Works just the same :D"* under Wayland. Enable with `org.a11y.Status.IsEnabled`, `QT_ACCESSIBILITY=1`, `GTK_MODULES=gail:atk-bridge`, `GNOME_ACCESSIBILITY=1` |
| `screenshot` | **`org.freedesktop.portal.ScreenCast`**: `CreateSession` → `SelectSources` → `Start` → `OpenPipeWireRemote`; consume PipeWire streams | [S10] (v6): source types `MONITOR=1`, `WINDOW=2`, `VIRTUAL=4`; cursor modes `Hidden=1`, `Embedded=2`, `Metadata=4`; `Start` returns streams with `position`, `size`, `source_type`, `mapping_id`, `pipewire-serial`; prefer the serial + `PW_KEY_TARGET_OBJECT` over the deprecated node ID. A user dialog is presented on `Start` |
| `screenshot` (fallbacks) | `org.freedesktop.portal.Screenshot` (interactive, whole screen); `zwlr_screencopy_manager_v1` (wlroots, **deprecated** in favour of `ext-image-copy-capture-v1`) [S11]; `ext-image-capture-source-v1` + `ext-image-copy-capture-v1` (staging) [S12]; compositor-specific: KDE `kde-zkde-screencast-unstable-v1`, Hyprland `hyprland-toplevel-export-v1`, COSMIC `cosmic-screencopy` | [S12]: session emits `shm_format` / `dmabuf_format` / `dmabuf_device` / `buffer_size` / `done` constraints, then `create_frame`; `paint_cursors` option |
| `click`, `drag`, `press_key`, `type_text`, `scroll` | **`org.freedesktop.portal.RemoteDesktop`** + **libei** (EIS): `CreateSession` → `SelectDevices` → `Start` → `ConnectToEIS` → libei sender; alternatively the D-Bus `Notify*` methods | [S15] (v2): device types `KEYBOARD=1`, `POINTER=2`, `TOUCHSCREEN=4`; *"EIS (recommended)"*; once EIS is connected the `Notify*` methods must not be used. `NotifyPointerMotionAbsolute(stream,x,y)`, `NotifyPointerButton(button,state)`, `NotifyKeyboardKeycode/Keysym`, `NotifyPointerAxis`, `NotifyTouchDown/Motion/Up` are available as the simpler v1 path. Combine with ScreenCast on the same session for coordinate mapping via `mapping_id` ↔ libei region |
| input transport | **libei / EIS** over a UNIX socket | [S16]: *"libei is a library for Emulated Input … EI client / EIS Implementation … events feed into the normal input stack … To Wayland clients, they are indistinguishable from real devices."* `liboeffis` is the helper for the RemoteDesktop portal's D-Bus setup |
| `permissionStatus` | portal `version` properties, `AvailableSourceTypes`, `AvailableDeviceTypes`, `SupportedCapabilities`, compositor detection | see §4.5 capability negotiation |
| clipboard / `paste` | `org.freedesktop.portal.Clipboard` (integrates with RemoteDesktop `Start`'s `clipboard_enabled`); or `wlr-data-control-unstable-v1` / `ext-data-control-v1` | [S15] cross-portal integration |
| `test_*`, cursor overlay | compositor-specific; not portable | keep as refusals |

An additional, related portal is [`org.freedesktop.portal.InputCapture`][S17]
(v2): it lets an app **capture** physical input (via EIS, pointer barriers,
zones, `Enable`/`Activated`/`Deactivated`) rather than inject it. It is the
right primitive for remote-desktop-style *input interception*, not for driving
UI; the compositor always decides when capture is active. Worth noting but not
the primary path for this skill.

Non-portal Linux fallbacks (privileged, compositor-specific):

- **ydotool / ydotoold** [S18]: a C99 daemon that emulates a virtual input
  device via `/dev/uinput`; *"ydotoold (daemon) requires access to /dev/uinput.
  This usually requires root permissions"*, and *"not limited to Wayland"*.
  Since v1.0.0 the daemon is mandatory because udev needs time to recognize the
  virtual device. `key` takes raw Linux keycodes, so custom keyboard layouts
  need per-device config.
- **wlroots protocols**: `zwlr_virtual_pointer_v1` [S19] (`create_virtual_pointer(seat)`, then `motion`, `motion_absolute`, `button`, `axis`, `frame`) and `virtual-keyboard-unstable-v1`. These are privileged globals, typically exposed only to compositor-trusted clients.
- **XWayland / X11**: XTest + X11 window IDs + AT-SPI. This is exactly the model the recovered `@oai/sky` Linux target used (`Window.id` = *"Stable X11 window identifier"*). It is the most complete fallback but only works where XWayland is present.

### 4.3 The PipeWire step

ScreenCast does not return pixels — it returns a **file descriptor** to a
PipeWire remote via `OpenPipeWireRemote()`, to be opened with
`pw_context_connect_fd` [S10]. Only the screencast stream nodes are visible on
that connection. XDG portal installs a PipeWire module and WirePlumber plugin
that grant `PW_KEY_ACCESS = "xdg-desktop-portal"` to the portal's own PID and
enforce per-node access control at the session manager [S20]. A helper therefore
needs a PipeWire client (libpipewire, or GStreamer's `pipewiresrc`) to pull a
frame and encode PNG.

### 4.4 Compositor support matrix (measured, not assumed)

From the Wayland Explorer support table for `ext-foreign-toplevel-list-v1`
[S14] (versions as published there):

| Compositor | Version | Support |
| --- | --- | --- |
| Sway | 1.11 | ✅ 1 |
| Hyprland | 0.52.1 | ✅ 1 |
| Labwc | 0.20.2 | ✅ 1 |
| niri | 26.04 | ✅ 1 |
| river | 0.5.0 | ✅ 1 |
| COSMIC | 1.0.0~beta.8 | ✅ 1 |
| Jay / Louvre / Mango / Mir / phoc / Treeland | various | ✅ 1 |
| **GNOME Mutter** | 51 | ❌ x |
| **KDE KWin** | 6.7 | ❌ x |
| Cage / GameScope / Muffin / Qtile / Wayfire / Weston | various | ❌ x |

**Consequence:** on GNOME and KDE — the two largest desktops — a helper cannot
enumerate toplevels with this staging protocol. It must use the **portals**
(which those desktops implement via their own backends [S9]) plus AT-SPI2 for
the application/window inventory. On wlroots-based compositors the protocol
gives a cleaner, low-level path. This fragmentation is the main engineering
cost of the Wayland port, and it argues for a capability-negotiating helper
with multiple backends.

### 4.5 Consent, persistence, and the "background-only" problem

- Every `ScreenCast.Start` / `RemoteDesktop.Start` / `InputCapture.Start`
  presents a **user dialog** [S10][S15][S17]. There is no silent grant.
- Portals support persistence: `persist_mode` `0` (none), `1` (while the app
  runs), `2` (until revoked); `Start` returns a **single-use `restore_token`**,
  and each new session must use the token from the previous one [S10][S15].
  Combined RemoteDesktop + ScreenCast persistence is managed exclusively by
  RemoteDesktop [S15]. This reduces, but does not eliminate, dialogs.
- Input goes through the compositor's normal input stack [S16] — i.e. to the
  focused surface. `NotifyPointerMotionAbsolute` coordinates are relative to a
  screen-cast stream's logical space, not to a target window [S15]. **There is
  no per-window synthetic event delivery equivalent to the macOS helper's
  private SkyLight/ApplicationServices bridge.** Activation is controlled by
  the compositor (`xdg-activation-v1`), and `InputCapture` explicitly states
  *"the compositor is always in control … There is currently no way for an
  application to activate immediate input capture"* [S17].

Therefore a Wayland backend must declare in `permissionStatus`:

```json
{
  "backgroundAvailable": false,
  "windowTargetedInput": false,
  "inputMode": "foreground-only",
  "consentRequired": true,
  "axTree": true,
  "screenshot": true,
  "compositor": "gnome | kde | wlroots | hyprland | cosmic | unknown"
}
```

and the JS layer must degrade: prefer `element_index` actions implemented via
AT-SPI (which can act on an element without pointer focus), refuse
`background_unavailable` for coordinate clicks when the target window is not
focused, and never claim parity. This mirrors the portable skill's existing
"explicit refusals, no global fallback" design.

### 4.6 Implementation options

| Option | Stack | Notes |
| --- | --- | --- |
| **Rust** (recommended) | `ashpd` (portals over zbus), `pipewire`/`libspa` bindings, `libei` or `ei` crate, `atspi` crate, `wayland-client` + `wayland-protocols` for wlroots/staging protocols | single static binary; matches the one-helper model; good D-Bus/PipeWire support |
| **C / GLib** | `liboeffis` + `libei` + `libatspi` + `libpipewire` + GStreamer | closest to the reference implementations [S16][S20] |
| Python | `pyatspi2`, `dbus-python`, `gi` (GStreamer/PipeWire), `python-libei` | fastest prototype, heavyweight runtime dependency |
| X11 fallback | XTest, Xlib window enumeration, AT-SPI | works under XWayland; reuse the recovered `@oai/sky` Linux API shape |

### 4.7 Phased plan — original estimates vs delivered

| Phase | Deliverable | Original estimate | Delivered |
| --- | --- | --- | --- |
| 0 | Backend contract + platform detection + capability negotiation | done | done ([BACKEND-CONTRACT.md](BACKEND-CONTRACT.md), `src/backend.mjs`) |
| 1 | Windows helper: UIA tree, screenshot, UIA-pattern actions, `SendInput` | 2–3 dev-weeks | implemented (Python helper; `PrintWindow` instead of WGC, no signing) |
| 2 | Linux helper, portal-first, AT-SPI2 tree, PipeWire frame decode | 3–5 dev-weeks | partially implemented (AT-SPI2 + portal Screenshot + compositor tools; **no PipeWire/libei decode** — see §7) |
| 3 | wlroots fast path: foreign-toplevel-list, image-copy-capture, virtual pointer | 1–2 dev-weeks | not implemented; helper uses compositor tools instead |
| 4 | Mock-backend harness so `npm test` runs on all three OSes | 1 dev-week | done (`test/mock-helper.mjs`, `test/portable-seam.mjs`, `test/cross-platform-helper.mjs`) |

The delivered Python helper deliberately favours **zero mandatory third-party
packages** over using `ashpd`/`liboeffis`/PipeWire bindings directly. Screenshots
come from compositor tools or the Screenshot portal; RemoteDesktop/libei input
and PipeWire streams remain the main functional gap on Wayland (§7). macOS-like
background-only input is still not achievable there.

---

## 5. Implemented cross-platform design

- [`src/backend.mjs`](../src/backend.mjs) — platform detection (`darwin` /
  `win32` / `linux`), session type (`wayland` / `x11` / unknown, from
  `XDG_SESSION_TYPE` / `WAYLAND_DISPLAY` / `DISPLAY`), and a **helper spec**
  `{ command, args }`. macOS spawns the Swift binary; Windows/Linux spawn a
  Python 3 interpreter with the helper script. `COMPUTER_USE_HELPER` overrides
  the helper, `COMPUTER_USE_PYTHON` overrides the interpreter (auto-detected
  from `python` / `py` / `python3`). Missing helpers are reported explicitly.
- [`native/crossplatform/computer_use_helper.py`](../native/crossplatform/computer_use_helper.py)
  — one real helper implementing the contract on Windows (Win32 `ctypes` for
  `EnumWindows` / `SendInput` / `PrintWindow` + PNG encoding, PowerShell and
  .NET `UIAutomationClient` for the tree and control patterns), Linux X11
  (`xdotool --window`, `xwininfo`, `import`/`scrot`, optional `pyatspi`), and
  Linux Wayland (AT-SPI2, `grim`/`spectacle`/`gnome-screenshot`, the
  `org.freedesktop.portal.Screenshot` D-Bus API via Gio, `wtype`/`ydotool`).
  It uses only the Python standard library plus OS tools probed at runtime.
- [`scripts/build-cross-platform.mjs`](../scripts/build-cross-platform.mjs)
  copies that source into `build/windows/` and `build/linux/` and records
  SHA-256 hashes; `--check` verifies them.
- [`src/config.mjs`](../src/config.mjs) exposes `nativeBackend`,
  `backendStatus`, `sessionType`, `helperSpec` and `platformDefaults` through
  the `status` tool. `setup.mjs --check` is platform-aware: macOS keeps its
  strict OS/signature/source-hash checks; Windows/Linux verify the Python
  interpreter, helper presence and hash.
- The MCP tools, `js` runtime, `cua` API, CLI and installer are unchanged.

**Verification harness:** [`test/mock-helper.mjs`](../test/mock-helper.mjs) +
[`test/portable-seam.mjs`](../test/portable-seam.mjs) drive the unchanged MCP
server against a fake helper (8 checks).
[`test/cross-platform-helper.mjs`](../test/cross-platform-helper.mjs) runs the
real Python helper with `sys.platform` overridden and stubbed OS tools, covering
the protocol core, Linux X11, Linux Wayland and Windows UIA paths. `npm test`
runs 4 suites. The mock/stubs live only under `test/`.

---

## 6. Capability matrix (what the implemented helpers actually do)

| Contract method | macOS (Swift) | Windows (Python) | Linux X11 (Python) | Linux Wayland (Python) |
| --- | --- | --- | --- | --- |
| `list_apps` | NSWorkspace | `EnumWindows` | `xdotool search` | `/proc` scan |
| `get_app_state` | AX tree | UIA tree (PowerShell `-File`) | `xwininfo -tree` / AT-SPI | AT-SPI2 (else refusal) |
| `screenshot` | ScreenCaptureKit | `PrintWindow` (window-scoped) | `import -window <id>` only | **refusal** unless `allow_fullscreen: true`, then tagged full-screen |
| `click` (element) | AX action | UIA `InvokePattern` | refusal | refusal |
| `click` (coordinate) | window-relative | `SetCursorPos`+`SendInput` | `xdotool --window <id>` | **refusal** |
| `press_key` / `type_text` | CGEvent | `SendInput` unicode | `xdotool --window <id>` | `wtype`/`ydotool` (foreground) |
| `scroll` | AX page scroll | `SendInput` wheel | `xdotool click 4/5 --window <id>` | refusal |
| `set_value` / `select_text` / secondary action | AX | UIA patterns | refusal | refusal |
| `paste` / `drag` | refusal | refusal | refusal | refusal |
| `permissionStatus` | real grants | dependency-derived | dependency-derived | dependency-derived |

All Windows/X11 targeted operations require exact-window binding: a bare app
name is resolved through the window inventory or refused. No `xdotool` command
is issued without `--window <id>`. X11 screenshots never fall back to focused-
window or full-screen tools; Wayland screenshots never silently return a
full-screen image.

`backgroundAvailable` / `windowTargetedInput` are `true` only on macOS (and
approximated on X11 when `xdotool` is present); Wayland reports `false` and
refuses coordinate clicks. `globalInput` is reported truthfully (true on
Windows and on Wayland when `wtype`/`ydotool` exist). Every unsupported
operation returns `background_unavailable: …` rather than silently using
global input.

---

## 7. Verification boundary (important)

This workspace is **macOS**. The Windows and Linux helpers are real code, but
the OS APIs they call cannot be executed here. What was verified on this host:

- Python syntax (`python3 -m py_compile`), helper integrity hashes, and the
  full JSON-lines protocol against stubbed OS tools for four platform/session
  combinations (see `test/cross-platform-helper.mjs`).
- `setup.mjs --check` under simulated `win32` and `linux` platforms (all 8
  checks pass), the mock-helper seam test, the backend unit test, and the live
  macOS protocol test — `npm test` passes 4 suites.

What still requires a real Windows / Linux desktop:

1. `ctypes.WinDLL` Win32 calls (`EnumWindows`, `SendInput`, `PrintWindow`) and
   PowerShell `UIAutomationClient` assemblies — Windows-only [S1][S3][S6].
2. UIPI / integrity-level behaviour against elevated applications [S3][S7].
3. AT-SPI2 bus availability for Chromium/Electron apps on Wayland [S13].
4. XDG portal dialogs, `ScreenCast`/`RemoteDesktop` versions, PipeWire frame
   delivery and libei input on GNOME/KDE/wlroots [S10][S15][S16][S20].
5. Whether `xdotool --window` synthetic events are accepted by the target
   toolkit (X11/XWayland), and whether `ydotool`/`wtype` have `/dev/uinput`
   access [S18].
6. Retaining a `GraphicsCaptureItem` across restarts without re-prompting [S2].
7. Whether a signed UIAccess helper is acceptable in the target deployment
   (Authenticode + Program Files install [S7]).

Recommended validation on each target OS: run `node scripts/setup.mjs --check`,
`npm test`, `./bin/computer-use status`, `./bin/computer-use list-apps`, then
`./bin/computer-use state <app>` and a screenshot. See
[`native/crossplatform/README.md`](../native/crossplatform/README.md).

### Review-driven fixes (landed on the stack tip)

An independent read-only review of the four stacked PRs found four confirmed
runtime/capability defects, all fixed and covered by regression tests:

| Finding | Fix | Regression test |
| --- | --- | --- |
| High: X11 `xdotool` omitted `--window` for a bare app name, injecting into the focused window | `bind_window_id()` requires a numeric window id (resolving bare names through the window inventory) and refuses otherwise; `--window` is unconditional | `test/cross-platform-helper.mjs` asserts every logged `xdotool` invocation carries `--window` and bare names are refused |
| Medium: `runInContext` had no synchronous timeout; `while(true){}` hung the MCP process | `runInContext(context, { timeout })` with a mapped `ERR_SCRIPT_EXECUTION_TIMEOUT` | `test/runtime-timeout.mjs` + `test/protocol.mjs` (200 ms interruption, `status` still responsive) |
| Medium: X11 screenshot fallbacks captured the focused window; Wayland silently returned a full-screen image | X11 uses only `import -window <id>`; Wayland refuses unless `allow_fullscreen: true`, then tags `scope: "full-screen"` and the MCP layer warns | `test/cross-platform-helper.mjs` + `test/portable-seam.mjs` |
| Low–Medium: `permissionStatus` hardcoded four capabilities to `true` | all capabilities derived from probed dependencies, with `capabilityBasis`/`missingTools` | `test/cross-platform-helper.mjs` asserts all-false when no tools exist |

Also hardened: PowerShell UIA scripts are invoked via `-File` (not `-Command`
with trailing named parameters), and Wayland `globalInput` is reported
truthfully when `wtype`/`ydotool` are present. Residual limitation: an
infinite loop that begins **after** an `await` runs in a microtask outside
`runInContext` and cannot be interrupted by Node's VM watchdog (documented in
SKILL.md / README.md / the runtime-timeout test).

---

## 8. Sources

- **[S1]** Microsoft, *UI Automation (Win32)* — <https://learn.microsoft.com/en-us/windows/win32/winauto/entry-uiauto-win32>
- **[S2]** Microsoft, *Screen capture (Windows.Graphics.Capture)* — <https://learn.microsoft.com/en-us/windows/uwp/audio-video-camera/screen-capture>
- **[S3]** Microsoft, *SendInput function* — <https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-sendinput>
- **[S5]** Microsoft, *UI Automation Client Programmer's Guide* — <https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-clientportal>
- **[S6]** Microsoft, *SetForegroundWindow function* — <https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-setforegroundwindow>
- **[S7]** Microsoft, *Security Considerations for Assistive Technologies (UIAccess / integrity levels)* — <https://learn.microsoft.com/en-us/windows/win32/winauto/uiauto-securityoverview>
- **[S8]** XDG Desktop Portal, *Reasons to Use Portals* — <https://flatpak.github.io/xdg-desktop-portal/docs/reasons-to-use-portals.html>
- **[S9]** XDG Desktop Portal, *For Desktop Developers* (frontend/backend split) — <https://flatpak.github.io/xdg-desktop-portal/docs/for-desktop-developers.html>
- **[S10]** XDG Desktop Portal, *org.freedesktop.portal.ScreenCast* (v6) — <https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.ScreenCast.html>
- **[S11]** Wayland Explorer, *wlr-screencopy-unstable-v1* (deprecated) — <https://wayland.app/protocols/wlr-screencopy-unstable-v1>
- **[S12]** Wayland Explorer, *ext-image-copy-capture-v1* (staging) — <https://wayland.app/protocols/ext-image-copy-capture-v1>
- **[S13]** freedesktop.org, *AT-SPI2* (D-Bus protocol, "Works just the same" on Wayland) — <https://www.freedesktop.org/wiki/Accessibility/AT-SPI2/>
- **[S14]** Wayland Explorer, *ext-foreign-toplevel-list-v1* (incl. compositor support matrix) — <https://wayland.app/protocols/ext-foreign-toplevel-list-v1>
- **[S15]** XDG Desktop Portal, *org.freedesktop.portal.RemoteDesktop* (v2) — <https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.RemoteDesktop.html>
- **[S16]** libinput/libei, *EI Protocol documentation* — <https://libinput.pages.freedesktop.org/libei/>
- **[S17]** XDG Desktop Portal, *org.freedesktop.portal.InputCapture* (v2) — <https://flatpak.github.io/xdg-desktop-portal/docs/doc-org.freedesktop.portal.InputCapture.html>
- **[S18]** ydotool README (uinput daemon) — <https://github.com/ReimuNotMoe/ydotool>
- **[S19]** Wayland Explorer, *wlr-virtual-pointer-unstable-v1* — <https://wayland.app/protocols/wlr-virtual-pointer-unstable-v1>
- **[S20]** XDG Desktop Portal, *Architecture: PipeWire* — <https://flatpak.github.io/xdg-desktop-portal/docs/pipewire.html>

(Number S4 is intentionally unused; every other number above matches an
in-text reference exactly.)

Local prior art (this repository): `recovered-source/readable/packages/sky/dist/project/cua/sky_js/src/targets/{linux,windows}/`,
`recovered-source/readable/packages/sky/docs/sky-full-desktop-api.md`,
`recovered-source/readable/packages/sky/docs/skills/oai_sky_lib/{linux,windows}/SKILL.md`,
`recovered-source/installed-newer/sky/docs/skills/oai_sky_lib/windows-desktop/SKILL.md`.
