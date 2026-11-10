# Porting

The `portable-computer-use` skill now ships **three** native backends:

| Backend | Helper | Status |
| --- | --- | --- |
| macOS | `build/Computer Use Helper.app` (Swift, ad-hoc signed) | shipped, runtime-verified on macOS |
| Windows | `build/windows/computer_use_helper.py` (Python 3, Win32 ctypes + PowerShell UIA) | implemented, OS APIs unverified from macOS |
| Linux X11 / Wayland | `build/linux/computer_use_helper.py` (Python 3, xdotool / portals / AT-SPI) | implemented, OS APIs unverified from macOS |

| Document | Contents |
| --- | --- |
| [PORTING-RESEARCH.md](PORTING-RESEARCH.md) | Windows/Wayland API mappings, permissions, compositor support matrix, prior art, capability matrix, phased plan, verification boundary, 19 cited sources |
| [BACKEND-CONTRACT.md](BACKEND-CONTRACT.md) | The JSON-lines helper protocol all three backends implement |
| [native/crossplatform/README.md](../native/crossplatform/README.md) | Helper install, optional OS dependencies, capability honesty, target-OS verification checklist |

The JS/MCP layers are unchanged across platforms.
[`src/backend.mjs`](../src/backend.mjs) detects platform/session and returns a
helper spec `{ command, args }` (native binary on macOS, Python interpreter +
script on Windows/Linux). `npm test` runs 4 suites: backend detection, a
mock-helper seam test driving the unchanged MCP server, the real Python helper
with stubbed OS tools for Windows/X11/Wayland, and the live macOS protocol test.

**Verification boundary:** this workspace is macOS. Win32/UIA/portal/PipeWire/
AT-SPI API behaviour cannot be executed here; validate on real Windows and
Linux desktops using the checklist in the helper README and §7 of the research
document. No fake backend is shipped — the helpers are real implementations
with typed refusals where macOS parity is impossible (notably Wayland
background-only, window-targeted input).
