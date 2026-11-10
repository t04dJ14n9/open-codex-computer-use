#!/usr/bin/env python3
"""Cross-platform computer-use helper (Windows + Linux).

Speaks the JSON-lines contract from porting/BACKEND-CONTRACT.md:

    stdin : {"id": N, "method": "...", "params": {...}}\\n
    stdout: {"id": N, "result": ...}\\n  or  {"id": N, "error": {"message": "..."}}\\n

Design goals, in order:
  * No third-party Python packages are required. Everything uses the standard
    library plus OS-provided tools/libraries that are probed at runtime.
  * Never crash the protocol loop: per-request errors are returned as JSON.
  * Never pretend a capability exists. Unsupported operations return a typed
    ``background_unavailable:`` error, matching the portable skill's refusal
    contract. macOS-style background-only, window-targeted input is only
    approximated on X11 and is explicitly unavailable on Wayland.

Backends:
  * win32  : Win32 (ctypes) for window enumeration / SendInput / PrintWindow,
             PowerShell + .NET UIAutomationClient for the accessibility tree
             and control-pattern actions.
  * linux-x11  : xdotool / xwininfo / import|scrot, optional pyatspi.
  * linux-wayland : AT-SPI2 (pyatspi), xdg-desktop-portal Screenshot via Gio,
             grim/spectacle/gnome-screenshot, ydotool/wtype for input.
             No per-window synthetic input: input goes to the focused window.

Runtime behaviour of the OS APIs cannot be validated from macOS; this file is
syntax-checked and protocol-tested with stubbed platform tools on any host
(see test/cross-platform-helper.mjs).
"""

from __future__ import annotations

import base64
import json
import os
import re
import shutil
import struct
import subprocess
import sys
import tempfile
import traceback
import zlib

VERSION = "1.0.0"
HELPER_NAME = "cross-platform-python"

PLATFORM = "win32" if sys.platform == "win32" else (
    "linux" if sys.platform.startswith("linux") else "unsupported"
)


def session_type() -> str:
    if PLATFORM == "win32":
        return "win32"
    if PLATFORM != "linux":
        return "unknown"
    explicit = os.environ.get("XDG_SESSION_TYPE", "").lower()
    if explicit in ("wayland", "x11"):
        return explicit
    if os.environ.get("WAYLAND_DISPLAY"):
        return "wayland"
    if os.environ.get("DISPLAY"):
        return "x11"
    return "unknown"


SESSION = session_type()
BACKEND = "windows-uia" if PLATFORM == "win32" else (
    "wayland-portal" if SESSION == "wayland" else "linux-x11" if SESSION == "x11" else "none"
)


# ---------------------------------------------------------------------------
# utilities
# ---------------------------------------------------------------------------

def which(name: str) -> str | None:
    """Platform-independent PATH lookup.

    shutil.which() consults platform-specific internals (e.g. _winapi on
    Windows) that do not exist when this helper is protocol-tested on another
    host with sys.platform overridden. A plain PATH scan is sufficient here:
    the helper only needs to know whether an OS tool is callable.
    """
    candidates = [name]
    if PLATFORM == "win32" and not name.lower().endswith((".exe", ".cmd", ".bat", ".ps1")):
        candidates += [name + ext for ext in (".exe", ".cmd", ".bat")]
    for directory in os.environ.get("PATH", "").split(os.pathsep):
        if not directory:
            continue
        for candidate in candidates:
            full = os.path.join(directory, candidate)
            if os.path.isfile(full) and os.access(full, os.X_OK):
                return full
    return None


def run(argv, timeout: float = 12.0, stdin: str | None = None, env=None):
    """Return (returncode, stdout, stderr). Never raises on missing tools."""
    try:
        proc = subprocess.run(
            argv, input=stdin, capture_output=True, text=True,
            timeout=timeout, env=env,
        )
        return proc.returncode, proc.stdout or "", proc.stderr or ""
    except FileNotFoundError:
        return 127, "", f"missing command: {argv[0]}"
    except subprocess.TimeoutExpired:
        return 124, "", f"timeout: {argv[0]}"
    except Exception as exc:  # pragma: no cover - defensive
        return 1, "", f"{type(exc).__name__}: {exc}"


class Refusal(Exception):
    """Typed refusal that becomes an error result with a stable prefix."""


def refuse(reason: str):
    raise Refusal(f"background_unavailable: {reason}")


def data_url_from_file(path: str) -> str:
    with open(path, "rb") as handle:
        return "data:image/png;base64," + base64.b64encode(handle.read()).decode("ascii")


def encode_png_bgra(width: int, height: int, bgra: bytes) -> bytes:
    """Encode a top-down BGRA byte buffer as an RGB PNG, no Pillow needed."""
    def chunk(tag: bytes, payload: bytes) -> bytes:
        return (struct.pack(">I", len(payload)) + tag + payload +
                struct.pack(">I", zlib.crc32(tag + payload) & 0xFFFFFFFF))

    raw = bytearray()
    stride = width * 4
    for y in range(height):
        row = bgra[y * stride:(y + 1) * stride]
        raw.append(0)  # filter type: none
        rgb = bytearray()
        for i in range(0, len(row), 4):
            rgb += bytes((row[i + 2], row[i + 1], row[i]))
        raw.extend(rgb)
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0)
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) +
            chunk(b"IDAT", zlib.compress(bytes(raw), 6)) + chunk(b"IEND", b""))


def numbered_tree(rows) -> str:
    """rows: list of (depth, label). Produces the macOS-style numbered tree."""
    lines = []
    for index, (depth, label) in enumerate(rows):
        lines.append("\t" * depth + f"{index} {label}")
    return "\n".join(lines)


def app_records(windows):
    """Group windows into the list_apps shape the JS layer expects."""
    groups: dict[str, dict] = {}
    for window in windows:
        app_id = window.get("app") or "unknown"
        group = groups.setdefault(app_id, {
            "id": app_id,
            "displayName": window.get("appName") or app_id,
            "isRunning": True,
            "pid": window.get("pid", 0),
            "windows": [],
        })
        group["windows"].append({
            "id": window.get("id"),
            "title": window.get("title", ""),
            "app": f"{app_id}#window={window.get('id')}",
        })
    return list(groups.values())


def resolve_window(params) -> str:
    """Parse an app spec, returning the raw window id or app name."""
    app = params.get("app") or ""
    match = re.search(r"#window=(\d+)$", app)
    if match:
        return match.group(1)
    return app


def bind_window_id(params) -> str:
    """Return a NUMERIC window id, or refuse.

    This deliberately never falls back to the focused window or the global
    pointer. Bare app names are resolved through the platform's own window
    inventory; if resolution is ambiguous or impossible the operation is
    refused with a typed error. This is what prevents an `app="Firefox"` request
    from injecting input into an unrelated foreground application.
    """
    app = params.get("app") or ""
    match = re.search(r"#window=(\d+)$", app)
    if match:
        return match.group(1)
    if app.isdigit():
        return app
    if not app:
        refuse("an exact window target is required; pass app#window=ID from list_apps")

    if PLATFORM != "win32" and SESSION == "wayland":
        refuse("standard Wayland exposes no per-window id; exact window binding "
               "is unavailable (windowTargetedInput=false)")

    try:
        windows = win32_list_windows() if PLATFORM == "win32" else x11_list_windows()
    except Exception:
        windows = []
    name = app.split("#", 1)[0].lower()
    matches = []
    for window in windows:
        fields = (str(window.get("app") or ""), str(window.get("appName") or ""),
                  str(window.get("title") or ""), str(window.get("id") or ""))
        if any(name == field.lower() for field in fields):
            wid = str(window.get("id") or "")
            if wid.isdigit():
                matches.append(wid)
    unique = list(dict.fromkeys(matches))
    if len(unique) == 1:
        return unique[0]
    if len(unique) > 1:
        refuse(f"app {app!r} matches {len(unique)} windows; pass app#window=ID "
               "from list_apps for exact-window binding")
    refuse(f"cannot bind app {app!r} to a window; pass app#window=ID from "
           "list_apps (no silent fallback to the focused window)")


def target_point(params):
    if params.get("element_index") is not None:
        return None  # element-based actions are handled by pattern helpers
    if params.get("x") is None or params.get("y") is None:
        refuse("coordinate actions require both x and y")
    return float(params["x"]), float(params["y"])


# ---------------------------------------------------------------------------
# Windows backend (ctypes Win32 + PowerShell UI Automation)
# ---------------------------------------------------------------------------

PS_UIA_TREE = r'''
param([int]$Hwnd)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$root = [System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]$Hwnd)
if ($null -eq $root) { Write-Output "[]"; exit 0 }
$walker = [System.Windows.Automation.TreeWalker]::ControlViewWalker
$out = New-Object System.Collections.ArrayList
function Walk($el, $depth) {
  if ($depth -gt 12) { return }
  try {
    $name = $el.Current.Name
    $type = $el.Current.ControlType.ProgrammaticName -replace "ControlType.", ""
    $auto = $el.Current.AutomationId
    $rect = $el.Current.BoundingRectangle
    $enabled = $el.Current.IsEnabled
    $label = ($type + ", " + $name).Trim(", ")
    $actions = @()
    foreach ($p in $el.GetSupportedPatterns()) { $actions += $p.ProgrammaticName }
    [void]$out.Add([pscustomobject]@{ depth=$depth; label=$label; id=$auto; x=[int]$rect.X; y=[int]$rect.Y; w=[int]$rect.Width; h=[int]$rect.Height; enabled=$enabled; actions=$actions })
  } catch {}
  $child = $walker.GetFirstChild($el)
  while ($null -ne $child) { Walk $child ($depth + 1); $child = $walker.GetNextSibling($child) }
}
Walk $root 0
$out | ConvertTo-Json -Compress -Depth 6
'''

PS_UIA_ACTION = r'''
param([int]$Hwnd, [int]$Index, [string]$Action, [string]$Value)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$root = [System.Windows.Automation.AutomationElement]::FromHandle([IntPtr]$Hwnd)
$walker = [System.Windows.Automation.TreeWalker]::ControlViewWalker
$items = New-Object System.Collections.ArrayList
function Walk($el, $depth) {
  if ($depth -gt 12) { return }
  [void]$items.Add($el)
  $child = $walker.GetFirstChild($el)
  while ($null -ne $child) { Walk $child ($depth+1); $child = $walker.GetNextSibling($child) }
}
Walk $root 0
if ($Index -lt 0 -or $Index -ge $items.Count) { throw "element_index out of range" }
$el = $items[$Index]
switch -Wildcard ($Action) {
  "invoke*" {
    $p = $el.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern); $p.Invoke()
  }
  "set_value*" {
    $p = $el.GetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern); $p.SetValue($Value)
  }
  "toggle*" {
    $p = $el.GetCurrentPattern([System.Windows.Automation.TogglePattern]::Pattern); $p.Toggle()
  }
  "expand*" {
    $p = $el.GetCurrentPattern([System.Windows.Automation.ExpandCollapsePattern]::Pattern); $p.Expand()
  }
  "collapse*" {
    $p = $el.GetCurrentPattern([System.Windows.Automation.ExpandCollapsePattern]::Pattern); $p.Collapse()
  }
  "select*" {
    $p = $el.GetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern); $p.Select()
  }
  default { throw "unsupported secondary action: $Action" }
}
Write-Output "ok"
'''


def win32_modules():
    import ctypes
    from ctypes import wintypes
    user32 = ctypes.WinDLL("user32", use_last_error=True)
    kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
    return ctypes, wintypes, user32, kernel32


def win32_list_windows():
    ctypes, wintypes, user32, kernel32 = win32_modules()
    EnumWindowsProc = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    user32.EnumWindows.argtypes = [EnumWindowsProc, wintypes.LPARAM]
    user32.GetWindowTextLengthW.argtypes = [wintypes.HWND]
    user32.GetWindowTextW.argtypes = [wintypes.HWND, wintypes.LPWSTR, ctypes.c_int]
    user32.GetClassNameW.argtypes = [wintypes.HWND, wintypes.LPWSTR, ctypes.c_int]
    user32.IsWindowVisible.argtypes = [wintypes.HWND]
    user32.GetWindowThreadProcessId.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.DWORD)]
    user32.GetWindowRect.argtypes = [wintypes.HWND, ctypes.POINTER(ctypes.c_long * 4)]

    windows = []
    def collect(hwnd, _lparam):
        if not user32.IsWindowVisible(hwnd):
            return True
        length = user32.GetWindowTextLengthW(hwnd)
        if length == 0:
            return True
        buf = ctypes.create_unicode_buffer(length + 1)
        user32.GetWindowTextW(hwnd, buf, length + 1)
        cls = ctypes.create_unicode_buffer(256)
        user32.GetClassNameW(hwnd, cls, 256)
        pid = wintypes.DWORD()
        user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        rect = (ctypes.c_long * 4)()
        user32.GetWindowRect(hwnd, ctypes.byref(rect))
        windows.append({
            "id": int(hwnd),
            "title": buf.value,
            "app": cls.value,
            "appName": buf.value,
            "pid": pid.value,
            "x": rect[0], "y": rect[1],
            "width": rect[2] - rect[0], "height": rect[3] - rect[1],
        })
        return True
    user32.EnumWindows(EnumWindowsProc(collect), 0)
    return windows


def win32_powershell(script: str, hwnd: int, extra=None):
    """Invoke a UIA script via `-File`, not `-Command`.

    Passing a multi-line script plus named parameters to `-Command` relies on
    PowerShell appending the trailing tokens to the command text; parameter
    binding and quoting are ambiguous there. A temporary .ps1 with `-File` and
    named parameters is unambiguous and avoids shell-interpolation surprises.
    """
    exe = which("powershell") or which("pwsh")
    if not exe:
        refuse("PowerShell is required for UI Automation actions")
    with tempfile.TemporaryDirectory(prefix="pcu-win32-") as tmp:
        script_path = os.path.join(tmp, "action.ps1")
        with open(script_path, "w", encoding="utf-8") as handle:
            handle.write(script)
        argv = [exe, "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass",
                "-File", script_path, "-Hwnd", str(hwnd)]
        for key, value in (extra or {}).items():
            argv += [f"-{key}", str(value)]
        code, out, err = run(argv, timeout=20.0)
    if code != 0:
        refuse(f"UI Automation call failed: {(err or out).strip()[:300]}")
    return out.strip()


def win32_tree(hwnd: str):
    out = win32_powershell(PS_UIA_TREE, int(hwnd))
    try:
        rows = json.loads(out) if out else []
    except ValueError:
        rows = []
    if isinstance(rows, dict):
        rows = [rows]
    formatted = [(int(r.get("depth", 0)), str(r.get("label", ""))) for r in rows]
    if not formatted:
        formatted = [(0, "window")]
    return {
        "text": numbered_tree(formatted),
        "screenshot": None,
        "elements": rows,
    }


def win32_screenshot(hwnd: str):
    """Capture an (even occluded) window via PrintWindow + GDI, encode PNG."""
    ctypes, wintypes, user32, kernel32 = win32_modules()
    gdi32 = ctypes.WinDLL("gdi32", use_last_error=True)
    hwnd_int = int(hwnd)

    class BITMAPINFOHEADER(ctypes.Structure):
        _fields_ = [("biSize", wintypes.DWORD), ("biWidth", ctypes.c_long),
                    ("biHeight", ctypes.c_long), ("biPlanes", wintypes.WORD),
                    ("biBitCount", wintypes.WORD), ("biCompression", wintypes.DWORD),
                    ("biSizeImage", wintypes.DWORD), ("biXPelsPerMeter", ctypes.c_long),
                    ("biYPelsPerMeter", ctypes.c_long), ("biClrUsed", wintypes.DWORD),
                    ("biClrImportant", wintypes.DWORD)]

    rect = (ctypes.c_long * 4)()
    user32.GetWindowRect.argtypes = [wintypes.HWND, ctypes.POINTER(ctypes.c_long * 4)]
    user32.GetWindowRect(hwnd_int, ctypes.byref(rect))
    width, height = rect[2] - rect[0], rect[3] - rect[1]
    if width <= 0 or height <= 0 or width > 16384 or height > 16384:
        refuse("window has invalid dimensions")

    hdc = user32.GetWindowDC(hwnd_int)
    memdc = gdi32.CreateCompatibleDC(hdc)
    bitmap = gdi32.CreateCompatibleBitmap(hdc, width, height)
    gdi32.SelectObject(memdc, bitmap)
    # PW_RENDERFULLCONTENT = 0x00000002
    ok = user32.PrintWindow(hwnd_int, memdc, 2)
    bi = BITMAPINFOHEADER()
    bi.biSize = ctypes.sizeof(BITMAPINFOHEADER)
    bi.biWidth, bi.biHeight = width, -height  # top-down
    bi.biPlanes, bi.biBitCount, bi.biCompression = 1, 32, 0
    size = width * height * 4
    buf = ctypes.create_string_buffer(size)
    gdi32.GetDIBits.argtypes = [wintypes.HDC, wintypes.HBITMAP, wintypes.UINT,
                                wintypes.UINT, ctypes.c_void_p,
                                ctypes.POINTER(BITMAPINFOHEADER), wintypes.UINT]
    got = gdi32.GetDIBits(memdc, bitmap, 0, height, buf, ctypes.byref(bi), 0)
    gdi32.DeleteObject(bitmap)
    gdi32.DeleteDC(memdc)
    user32.ReleaseDC(hwnd_int, hdc)
    if not ok or not got:
        refuse("PrintWindow capture failed (protected/minimized window)")
    png = encode_png_bgra(width, height, buf.raw[:size])
    return "data:image/png;base64," + base64.b64encode(png).decode("ascii")


def win32_send_input(params, kind: str):
    """SendInput-based keyboard/mouse. UIPI still applies (equal/lower IL)."""
    ctypes, wintypes, user32, kernel32 = win32_modules()

    class MOUSEINPUT(ctypes.Structure):
        _fields_ = [("dx", ctypes.c_long), ("dy", ctypes.c_long),
                    ("mouseData", wintypes.DWORD), ("dwFlags", wintypes.DWORD),
                    ("time", wintypes.DWORD), ("dwExtraInfo", ctypes.c_void_p)]

    class KEYBDINPUT(ctypes.Structure):
        _fields_ = [("wVk", wintypes.WORD), ("wScan", wintypes.WORD),
                    ("dwFlags", wintypes.DWORD), ("time", wintypes.DWORD),
                    ("dwExtraInfo", ctypes.c_void_p)]

    class HARDWAREINPUT(ctypes.Structure):
        _fields_ = [("uMsg", wintypes.DWORD), ("wParamL", wintypes.WORD),
                    ("wParamH", wintypes.WORD)]

    class INPUTUNION(ctypes.Union):
        _fields_ = [("mi", MOUSEINPUT), ("ki", KEYBDINPUT), ("hi", HARDWAREINPUT)]

    class INPUT(ctypes.Structure):
        _fields_ = [("type", wintypes.DWORD), ("u", INPUTUNION)]

    user32.SendInput.argtypes = [wintypes.UINT, ctypes.POINTER(INPUT), ctypes.c_int]
    user32.SendInput.restype = wintypes.UINT
    user32.SetCursorPos.argtypes = [ctypes.c_int, ctypes.c_int]

    inputs = []
    if kind == "click":
        x, y = target_point(params)
        user32.SetCursorPos(int(x), int(y))
        down, up = INPUT(), INPUT()
        down.type = up.type = 0  # INPUT_MOUSE
        down.u.mi.dwFlags = 0x0002  # MOUSEEVENTF_LEFTDOWN
        up.u.mi.dwFlags = 0x0004   # MOUSEEVENTF_LEFTUP
        inputs = [down, up]
    elif kind == "scroll":
        x, y = target_point(params)
        user32.SetCursorPos(int(x), int(y))
        direction = params.get("direction", "down")
        delta = 120 if direction in ("down", "right") else -120
        wheel = INPUT()
        wheel.type = 0
        wheel.u.mi.mouseData = delta
        wheel.u.mi.dwFlags = 0x0800 if direction in ("down", "up") else 0x1000
        inputs = [wheel]
    elif kind in ("press_key", "type_text"):
        text = params.get("text") if kind == "type_text" else params.get("key", "")
        if not text:
            refuse("key/text is required")
        for char in str(text):
            for flags in (0x0004, 0x0004 | 0x0002):  # KEYEVENTF_UNICODE, +KEYUP
                item = INPUT()
                item.type = 1  # INPUT_KEYBOARD
                item.u.ki.wScan = ord(char)
                item.u.ki.dwFlags = flags
                inputs.append(item)
    else:
        refuse(f"unsupported input kind {kind}")

    array = (INPUT * len(inputs))(*inputs)
    sent = user32.SendInput(len(inputs), array, ctypes.sizeof(INPUT))
    if sent != len(inputs):
        refuse("SendInput was blocked (UIPI / higher integrity level target)")
    return None


def win32_pattern_action(params, action: str):
    index = params.get("element_index")
    if index is None:
        refuse("element_index is required for this action")
    hwnd = bind_window_id(params)
    value = params.get("value", params.get("text", ""))
    out = win32_powershell(PS_UIA_ACTION, int(hwnd), {
        "Index": index, "Action": action, "Value": value,
    })
    return {"applied": out or "ok"}


# ---------------------------------------------------------------------------
# Linux X11 / XWayland backend
# ---------------------------------------------------------------------------

def x11_tool(name: str):
    exe = which(name)
    if not exe:
        refuse(f"{name} is required for X11 window operations")
    return exe


def x11_list_windows():
    xdotool = x11_tool("xdotool")
    code, out, err = run([xdotool, "search", "--onlyvisible", "--name", "."])
    ids = [line.strip() for line in out.splitlines() if line.strip().isdigit()] if code == 0 else []
    windows = []
    for wid in ids[:200]:
        code, title, _ = run([xdotool, "getwindowname", wid])
        code2, cls, _ = run(["xprop", "-id", wid, "WM_CLASS"]) if which("xprop") else (1, "", "")
        match = re.search(r'"([^"]+)"\s*,\s*"([^"]+)"', cls)
        app = match.group(2) if match else (match.group(1) if match else "x11-app")
        windows.append({
            "id": int(wid),
            "title": title.strip() if code == 0 else "",
            "app": app,
            "appName": title.strip() if code == 0 else app,
            "pid": 0,
        })
    return windows


def x11_tree(wid: str):
    """Prefer AT-SPI2 when available; otherwise use xwininfo's window tree."""
    try:
        import pyatspi  # type: ignore
        return atspi_tree(pyatspi, wid)
    except Exception:
        pass
    if which("xwininfo"):
        code, out, err = run(["xwininfo", "-id", wid, "-tree"])
        if code == 0:
            rows = [(0, "window")]
            for line in out.splitlines()[1:]:
                match = re.match(r"^\s+(0x[0-9a-fA-F]+)\s+\"([^\"]*)\"", line)
                if match:
                    depth = (len(line) - len(line.lstrip())) // 2
                    rows.append((min(depth, 10), f"window, {match.group(2)}"))
            return {"text": numbered_tree(rows), "screenshot": None,
                    "ax_tree_source": "x11"}
    return {"text": numbered_tree([(0, "window")]), "screenshot": None,
            "ax_tree_source": "x11-fallback"}


def atspi_tree(pyatspi, target_id):
    rows = [(0, "application")]
    desktop = pyatspi.Registry.getDesktop(0)
    for app in desktop:
        try:
            name = app.name or app.getRoleName()
            rows.append((0, f"application, {name}"))
            for window in app:
                rows.append((1, f"window, {window.name or ''}"))
                def walk(node, depth):
                    if depth > 10:
                        return
                    try:
                        label = f"{node.getRoleName()}, {node.name or ''}".strip(", ")
                        rows.append((depth, label))
                    except Exception:
                        return
                    try:
                        for child in node:
                            walk(child, depth + 1)
                    except Exception:
                        pass
                walk(window, 2)
        except Exception:
            continue
    return {"text": numbered_tree(rows), "screenshot": None, "ax_tree_source": "at_spi"}


def x11_screenshot(wid: str):
    """Capture exactly the requested window.

    Only `import -window <id>` is window-scoped. `scrot -u` and
    `gnome-screenshot -w` capture the *focused* window, which may be a
    different application, so they are deliberately NOT used as fallbacks:
    a wrong capture is worse than an explicit refusal.
    """
    if not str(wid).isdigit():
        refuse("X11 screenshots require an exact numeric window id "
               "(app#window=ID from list_apps)")
    importer = which("import")
    if not importer:
        refuse("window-scoped X11 screenshots require ImageMagick `import`; "
               "install imagemagick (focused-window and full-screen tools are "
               "deliberately not used)")
    with tempfile.TemporaryDirectory(prefix="pcu-x11-") as tmp:
        path = os.path.join(tmp, "window.png")
        code, _out, err = run([importer, "-window", str(wid), path], timeout=15.0)
        if code == 0 and os.path.isfile(path):
            return data_url_from_file(path)
    refuse(f"`import -window {wid}` failed: {err.strip()[:160]}. Refusing to "
           "capture a different window or the full screen")


def x11_input(params, kind: str):
    # Bind FIRST, before xdotool is even resolved. A non-window-id `app` must
    # never produce an xdotool invocation without `--window`, because that
    # would inject into whatever window happens to have focus.
    wid = bind_window_id(params)
    xdotool = x11_tool("xdotool")
    # --window sends synthetic events to that specific X window without
    # activating it. Many modern toolkits ignore XSendEvent input; note it.
    prefix = [xdotool]
    window_flag = ["--window", wid]
    if kind == "click":
        x, y = target_point(params)
        argv = prefix + ["mousemove"] + window_flag + ["--sync", str(int(x)), str(int(y)),
                                                       "click", "1"]
    elif kind == "press_key":
        key = params.get("key")
        if not key:
            refuse("key is required")
        argv = prefix + ["key"] + window_flag + [str(key)]
    elif kind == "type_text":
        text = params.get("text")
        if text is None:
            refuse("text is required")
        argv = prefix + ["type"] + window_flag + ["--clearmodifiers", "--", str(text)]
    elif kind == "scroll":
        direction = params.get("direction", "down")
        button = "5" if direction == "down" else "4" if direction == "up" else "7" if direction == "right" else "6"
        argv = prefix + ["click"] + window_flag + [button]
    else:
        refuse(f"unsupported input kind {kind}")
    code, _out, err = run(argv, timeout=15.0)
    if code != 0:
        refuse(f"xdotool {kind} failed: {err.strip()[:200]}")
    return None


# ---------------------------------------------------------------------------
# Linux Wayland backend (portals + compositor tools)
# ---------------------------------------------------------------------------

def wayland_list_apps():
    apps = {}
    for entry in os.listdir("/proc") if os.path.isdir("/proc") else []:
        if not entry.isdigit():
            continue
        try:
            with open(f"/proc/{entry}/cmdline", "rb") as handle:
                raw = handle.read().replace(b"\0", b" ").decode("utf-8", "replace").strip()
        except OSError:
            continue
        if not raw:
            continue
        exe = os.path.basename(raw.split()[0])
        if exe and not exe.startswith("["):
            apps.setdefault(exe, {"id": exe, "displayName": exe, "isRunning": True,
                                  "pid": int(entry), "windows": []})
    return list(apps.values())


def wayland_tree(_wid: str):
    try:
        import pyatspi  # type: ignore
        return atspi_tree(pyatspi, _wid)
    except Exception:
        refuse("AT-SPI2 (pyatspi) is required for a Wayland accessibility tree; "
               "enable org.a11y.Status.IsEnabled and install python3-pyatspi")


def wayland_screenshot(params):
    """Full-screen capture only with explicit consent.

    Standard Wayland portals / compositor tools cannot scope a capture to a
    single window. Returning a full-screen image for a window-targeted request
    would silently expose other applications and notifications, so the caller
    must opt in with `allow_fullscreen: true`. The result is tagged with its
    scope so the JS layer can surface the warning to the agent.
    """
    if params.get("allow_fullscreen") is not True:
        refuse("Wayland cannot scope a screenshot to one window; full-screen "
               "capture (which may include other applications and notifications) "
               "requires an explicit allow_fullscreen=true opt-in")
    with tempfile.TemporaryDirectory(prefix="pcu-wl-") as tmp:
        path = os.path.join(tmp, "screen.png")
        for argv in (
            [which("grim"), "-t", "png", path] if which("grim") else None,
            [which("spectacle"), "-b", "-n", "-o", path] if which("spectacle") else None,
            [which("gnome-screenshot"), "-f", path] if which("gnome-screenshot") else None,
        ):
            if argv and argv[0]:
                code, _out, _err = run(argv, timeout=20.0)
                if code == 0 and os.path.isfile(path):
                    return {"url": data_url_from_file(path), "scope": "full-screen"}
        # xdg-desktop-portal Screenshot returns a file URI via Gio D-Bus.
        uri = portal_screenshot_uri()
        if uri:
            from urllib.parse import urlparse, unquote
            candidate = unquote(urlparse(uri).path)
            if os.path.isfile(candidate):
                return {"url": data_url_from_file(candidate), "scope": "full-screen"}
    refuse("Wayland full-screen screenshot unavailable: compositor capture tool "
           "or org.freedesktop.portal.Screenshot (Gio) is required, with user consent")


def portal_screenshot_uri(timeout_s: float = 20.0):
    """Call org.freedesktop.portal.Screenshot via Gio, wait for Response."""
    try:
        import gi  # type: ignore
        from gi.repository import Gio, GLib  # type: ignore
    except Exception:
        return None
    try:
        bus = Gio.bus_get_sync(Gio.BusType.SESSION, None)
        proxy = Gio.DBusProxy.new_sync(
            bus, Gio.DBusProxyFlags.NONE, None,
            "org.freedesktop.portal.Desktop", "/org/freedesktop/portal/desktop",
            "org.freedesktop.portal.Screenshot", None)
        handle = proxy.call_sync("Screenshot", GLib.Variant("(sa{sv})", ("", {})),
                                 Gio.DBusCallFlags.NONE, int(timeout_s * 1000), None)
        request_path = handle.unpack()[0]
        request = Gio.DBusProxy.new_sync(
            bus, Gio.DBusProxyFlags.NONE, None,
            "org.freedesktop.portal.Desktop", request_path,
            "org.freedesktop.portal.Request", None)
        loop = GLib.MainLoop()
        box = {}
        def on_signal(_proxy, _sender, _signal, params):
            if params and len(params) >= 2:
                box["response"] = params[1]
            loop.quit()
        request.connect("g-signal", on_signal)
        timer = GLib.timeout_add(int(timeout_s * 1000), loop.quit)
        loop.run()
        GLib.source_remove(timer)
        response = box.get("response") or {}
        return response.get("uri")
    except Exception:
        return None


def wayland_input(params, kind: str):
    """udotool/wtype inject into the focused window (no per-window targeting)."""
    if kind in ("press_key", "type_text"):
        text = params.get("text") if kind == "type_text" else params.get("key")
        if not text:
            refuse("key/text is required")
        if which("wtype"):
            code, _o, err = run(["wtype", "--", str(text)])
            if code == 0:
                return None
        if which("ydotool"):
            code, _o, err = run(["ydotool", "type", "--", str(text)])
            if code == 0:
                return None
    if kind == "click":
        # Coordinate clicks need a global pointer; the portable contract
        # forbids a silent global fallback and Wayland has no per-window
        # synthetic-event delivery. Refuse instead of guessing.
        refuse("Wayland has no per-window background coordinate input; use "
               "AT-SPI element actions or the RemoteDesktop/libei portal")
    refuse("Wayland input requires org.freedesktop.portal.RemoteDesktop + libei "
           "(or wtype/ydotool with /dev/uinput for foreground keyboard input); "
           "per-window background input is not available on standard Wayland")


# ---------------------------------------------------------------------------
# permission / capability status
# ---------------------------------------------------------------------------

def permission_status():
    """Report capabilities derived from dependencies actually present.

    Earlier builds hardcoded accessibility/screenRecording/axTree/screenshot to
    `true`, which overstated readiness when the required OS tools were missing.
    Nothing here claims OS consent: `accessibility`/`screenRecording` are
    capability probes (can the helper read a tree / capture pixels), not a
    statement that a TCC/consent dialog has been accepted.
    """
    tools = {name: bool(which(name)) for name in (
        "powershell", "pwsh", "xdotool", "xprop", "xwininfo", "import", "scrot",
        "gnome-screenshot", "grim", "spectacle", "wtype", "ydotool",
    )}
    try:
        import pyatspi  # noqa: F401
        tools["pyatspi"] = True
    except Exception:
        tools["pyatspi"] = False
    try:
        import gi  # noqa: F401
        tools["gi"] = True
    except Exception:
        tools["gi"] = False

    uia = bool(tools["powershell"] or tools["pwsh"])
    capture_tool = bool(tools["import"] or tools["grim"] or tools["spectacle"]
                        or tools["gnome-screenshot"] or tools["gi"])

    keyboard_injector = bool(tools["wtype"] or tools["ydotool"])

    if PLATFORM == "win32":
        # UIA tree comes from PowerShell; PrintWindow needs no external tool.
        ax_tree = uia
        screenshot = True
        background, targeted, input_mode = False, False, "foreground-only"
        global_input = True  # SendInput drives the physical pointer
    elif SESSION == "x11":
        ax_tree = bool(tools["xwininfo"] or tools["pyatspi"])
        screenshot = bool(tools["import"])  # only window-scoped capture tool
        background = targeted = bool(tools["xdotool"])
        input_mode = "background-synthetic" if targeted else "unavailable"
        global_input = False
    elif SESSION == "wayland":
        ax_tree = bool(tools["pyatspi"])  # AT-SPI2 only
        screenshot = capture_tool
        background, targeted = False, False
        input_mode = "foreground-only" if keyboard_injector else "unavailable"
        # wtype/ydotool inject via uinput into the focused surface: that is a
        # GLOBAL input path, not window-targeted input. Report it truthfully.
        global_input = keyboard_injector
    else:
        ax_tree = screenshot = False
        background, targeted, input_mode = False, False, "unavailable"
        global_input = False

    missing = [name for name, present in tools.items() if not present]
    return {
        "accessibility": ax_tree,
        "screenRecording": screenshot,
        "backgroundAvailable": background,
        "windowTargetedInput": targeted,
        "inputMode": input_mode,
        "globalInput": global_input,
        "axTree": ax_tree,
        "screenshot": screenshot,
        "consentRequired": SESSION == "wayland",
        "fullScreenCaptureRequiresOptIn": SESSION == "wayland",
        "capabilityBasis": "dependency-probe; no OS consent is claimed",
        "compositor": BACKEND,
        "sessionType": SESSION,
        "platform": PLATFORM,
        "backend": BACKEND,
        "helper": HELPER_NAME,
        "helperVersion": VERSION,
        "tools": tools,
        "missingTools": missing,
        "missingSymbols": [],
        "pid": os.getpid(),
        "cursor": {"enabled": False, "visible": False, "phase": "hidden",
                   "moves": 0, "frames": 0, "clickThrough": True,
                   "canBecomeKey": False, "panelWindowID": 0,
                   "point": None, "targetWindowID": None},
    }


# ---------------------------------------------------------------------------
# dispatch
# ---------------------------------------------------------------------------

def dispatch(method: str, params: dict):
    if method == "permissionStatus":
        return permission_status()
    if method == "requestPermissions":
        return permission_status()
    if method in ("cursorStatus", "cursorImage", "hideCursor"):
        return {"enabled": False, "visible": False, "phase": "hidden", "moves": 0,
                "frames": 0, "clickThrough": True, "canBecomeKey": False,
                "panelWindowID": 0, "point": None, "targetWindowID": None}
    if method in ("test_move_window", "test_activate_app"):
        refuse("test hooks are not implemented on this backend")

    if PLATFORM == "unsupported":
        refuse(f"no helper backend for platform {sys.platform}")

    if method == "list_apps":
        if PLATFORM == "win32":
            return app_records(win32_list_windows())
        if SESSION == "x11":
            return app_records(x11_list_windows())
        return wayland_list_apps()

    # Every remaining operation is window-targeted. On Windows/X11 bind to an
    # exact numeric window id first; on Wayland no per-window id exists, so
    # desktop-wide operations (AT-SPI tree, foreground keyboard) keep the raw
    # spec while window-scoped ones refuse.
    wid = bind_window_id(params) if (PLATFORM == "win32" or SESSION == "x11") else resolve_window(params)

    if method == "get_app_state":
        if PLATFORM == "win32":
            return win32_tree(wid)
        if SESSION == "x11":
            return x11_tree(wid)
        return wayland_tree(wid)

    if method == "screenshot":
        if PLATFORM == "win32":
            return {"url": win32_screenshot(wid), "scope": "window"}
        if SESSION == "x11":
            return {"url": x11_screenshot(wid), "scope": "window"}
        return wayland_screenshot(params)

    if method == "click":
        if PLATFORM == "win32":
            if params.get("element_index") is not None:
                return win32_pattern_action(params, "invoke")
            return win32_send_input(params, "click")
        if SESSION == "x11":
            return x11_input(params, "click")
        return wayland_input(params, "click")

    if method in ("press_key", "type_text"):
        if PLATFORM == "win32":
            return win32_send_input(params, method)
        if SESSION == "x11":
            return x11_input(params, method)
        return wayland_input(params, method)

    if method == "scroll":
        if PLATFORM == "win32":
            return win32_send_input(params, "scroll")
        if SESSION == "x11":
            return x11_input(params, "scroll")
        return wayland_input(params, "scroll")

    if method == "set_value":
        if PLATFORM == "win32":
            return win32_pattern_action(params, "set_value")
        refuse("set_value requires AT-SPI2 editable-text support on this Linux backend")

    if method == "select_text":
        refuse("select_text is not implemented on this backend")

    if method == "perform_secondary_action":
        if PLATFORM == "win32":
            return win32_pattern_action(params, str(params.get("action", "invoke")).lower())
        refuse("perform_secondary_action requires AT-SPI2 action support on this Linux backend")

    if method in ("paste", "drag"):
        refuse(f"{method} is not verified on this backend")

    refuse(f"unsupported helper operation: {method}")


def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            message = json.loads(line)
        except ValueError:
            continue
        if message.get("method") == "cancel":
            continue
        rid = message.get("id")
        if not isinstance(rid, int):
            continue
        try:
            result = dispatch(str(message.get("method", "")), message.get("params") or {})
            response = {"id": rid, "result": result}
        except Refusal as exc:
            response = {"id": rid, "error": {"message": str(exc)}}
        except Exception as exc:  # defensive: never kill the protocol loop
            response = {"id": rid, "error": {
                "message": f"{type(exc).__name__}: {exc}",
                "trace": traceback.format_exc(limit=3),
            }}
        sys.stdout.write(json.dumps(response, ensure_ascii=False) + "\n")
        sys.stdout.flush()


if __name__ == "__main__":
    main()
