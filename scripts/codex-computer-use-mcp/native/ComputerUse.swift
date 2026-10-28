import AppKit
import ApplicationServices
import ScreenCaptureKit
import Darwin

struct CUAError: Error {
    let message: String
}

func attribute(_ element: AXUIElement, _ key: String) -> CFTypeRef? {
    var value: CFTypeRef?
    return AXUIElementCopyAttributeValue(element, key as CFString, &value) == .success ? value : nil
}

func stringAttribute(_ element: AXUIElement, _ key: String) -> String {
    guard let value = attribute(element, key) else { return "" }
    if let string = value as? String { return string }
    if let number = value as? NSNumber { return number.stringValue }
    return ""
}

func elementBounds(_ element: AXUIElement) -> CGRect? {
    guard let position = attribute(element, kAXPositionAttribute),
          let size = attribute(element, kAXSizeAttribute),
          CFGetTypeID(position) == AXValueGetTypeID(), CFGetTypeID(size) == AXValueGetTypeID() else { return nil }
    var origin = CGPoint.zero
    var extent = CGSize.zero
    guard AXValueGetValue(position as! AXValue, .cgPoint, &origin),
          AXValueGetValue(size as! AXValue, .cgSize, &extent) else { return nil }
    return CGRect(origin: origin, size: extent)
}

func elementActions(_ element: AXUIElement) -> [String] {
    var names: CFArray?
    AXUIElementCopyActionNames(element, &names)
    return names as? [String] ?? []
}

@MainActor
final class ComputerUse {
    struct AppState {
        let app: NSRunningApplication
        let window: AXUIElement
        let windowID: CGWindowID
        let elements: [AXUIElement]
        let bounds: CGRect
        let screenshotScale: Double
        let capturedAt: Date
    }

    struct SyntheticFocus {
        let psn: [UInt8]
        let pid: pid_t
        let windowID: CGWindowID
    }

    var states: [String: AppState] = [:]
    var activeState: AppState?
    var syntheticFocus: SyntheticFocus?
    var currentRequestID: Int?
    var cancelledRequestIDs: Set<Int> = []
    let eventSource = CGEventSource(stateID: .privateState)
    let background = BackgroundInput()
    let cursor = AgentCursor()
    var foregroundPID: pid_t = 0

    func appInput(_ input: String) -> (String, CGWindowID?) {
        let parts = input.components(separatedBy: "#window=")
        return (parts[0], parts.count == 2 ? UInt32(parts[1]) : nil)
    }

    func permissionStatus() -> [String: Any] {
        ["accessibility": AXIsProcessTrusted(), "screenRecording": CGPreflightScreenCaptureAccess(),
         "helper": Bundle.main.bundlePath, "pid": ProcessInfo.processInfo.processIdentifier,
         "inputMode": "background-only", "globalInput": false,
         "backgroundAvailable": background.missingSymbols.isEmpty, "missingSymbols": background.missingSymbols,
         "cursor": cursor.status]
    }

    func resolve(_ input: String) async throws -> NSRunningApplication {
        let input = appInput(input).0
        let apps = NSWorkspace.shared.runningApplications.filter { !$0.isTerminated }
        if let app = apps.first(where: {
            $0.bundleIdentifier == input || $0.bundleURL?.path == input ||
            $0.localizedName?.caseInsensitiveCompare(input) == .orderedSame ||
            String($0.processIdentifier) == input
        }) { return app }
        throw CUAError(message: "app_not_running: background-only input does not launch apps; start it without foregrounding this helper, then retry")
    }

    func identifier(_ app: NSRunningApplication) -> String {
        app.bundleIdentifier ?? app.bundleURL?.path ?? String(app.processIdentifier)
    }

    func requireAccessibility() throws {
        guard AXIsProcessTrusted() else {
            throw CUAError(message: "Accessibility permission is missing. Enable Codex Computer Use Standalone in System Settings > Privacy & Security > Accessibility")
        }
    }

    func captureState(_ app: NSRunningApplication, windowID requestedID: CGWindowID? = nil) throws -> String {
        try requireAccessibility()
        let application = AXUIElementCreateApplication(app.processIdentifier)
        AXUIElementSetMessagingTimeout(application, 2)
        let windows = attribute(application, kAXWindowsAttribute) as? [AXUIElement] ?? []
        let bound = windows.compactMap { window -> (AXUIElement, CGWindowID)? in
            guard let id = background.windowID(window) else { return nil }
            return (window, id)
        }
        let desired = requestedID ?? states[identifier(app)]?.windowID
        let selection: (AXUIElement, CGWindowID)?
        if let desired { selection = bound.first { $0.1 == desired } }
        else if bound.count == 1 { selection = bound.first }
        else {
            let focused = attribute(application, kAXFocusedWindowAttribute)
            selection = focused.flatMap { value in
                CFGetTypeID(value) == AXUIElementGetTypeID() ? background.windowID(value as! AXUIElement) : nil
            }.flatMap { id in bound.first { $0.1 == id } }
        }
        guard let (window, id) = selection, let bounds = elementBounds(window), bounds.width > 1, bounds.height > 1 else {
            throw CUAError(message: "window_binding_required: select a current window_id from list_apps; no largest-window fallback")
        }
        let roots = [window]
        var elements: [AXUIElement] = []
        var lines: [String] = ["App: \(app.localizedName ?? identifier(app)) (\(identifier(app))#window=\(id))",
                               "Window ID: \(id); input mode: background-only"]
        var pending = roots.reversed().map { ($0, 0) }
        var seen: [CFHashCode: [AXUIElement]] = [:]
        while let (element, depth) = pending.popLast() {
            if elements.count >= 2000 { lines.append("[Accessibility tree truncated at 2000 elements]"); break }
            let hash = CFHash(element)
            if seen[hash, default: []].contains(where: { CFEqual($0, element) }) { continue }
            seen[hash, default: []].append(element)
            let index = elements.count
            elements.append(element)
            let role = stringAttribute(element, kAXRoleAttribute)
            let roles: [String: String] = ["AXWindow": "window", "AXButton": "button", "AXTextField": "text field", "AXTextArea": "text area", "AXStaticText": "text", "AXMenuBar": "menu bar", "AXMenuBarItem": "menu", "AXMenuItem": "menu item", "AXScrollArea": "scroll area", "AXCheckBox": "checkbox"]
            var details = [roles[role] ?? role]
            let title = stringAttribute(element, kAXTitleAttribute)
            let description = stringAttribute(element, kAXDescriptionAttribute)
            let value = stringAttribute(element, kAXValueAttribute)
            let id = stringAttribute(element, kAXIdentifierAttribute)
            let selection = stringAttribute(element, kAXSelectedTextAttribute)
            if !title.isEmpty { details.append(title) }
            if !description.isEmpty && description != title { details.append("Description: " + description) }
            if !value.isEmpty { details.append("Value: " + String(value.prefix(12000))) }
            if !id.isEmpty { details.append("ID: " + id) }
            if !selection.isEmpty { details.append("Selected: " + String(selection.prefix(12000))) }
            if (attribute(element, kAXEnabledAttribute) as? NSNumber)?.boolValue == false { details.append("(disabled)") }
            var actions: CFArray?
            AXUIElementCopyActionNames(element, &actions)
            if let names = actions as? [String], !names.isEmpty { details.append("Actions: " + names.joined(separator: ", ")) }
            lines.append(String(repeating: "\t", count: depth) + "\(index) " + details.joined(separator: ", "))
            if depth < 30 {
                var childArray: CFArray?
                AXUIElementCopyAttributeValues(element, kAXChildrenAttribute as CFString, 0, 2000 - elements.count, &childArray)
                let children = childArray as? [AXUIElement] ?? []
                for child in children.reversed() { pending.append((child, depth + 1)) }
            }
        }
        let state = AppState(app: app, window: window, windowID: id, elements: elements,
                             bounds: bounds, screenshotScale: min(1, 2048 / max(bounds.width, bounds.height)), capturedAt: Date())
        states[identifier(app)] = state
        states[identifier(app) + "#window=\(id)"] = state
        activeState = state
        if roots.isEmpty { lines.append("No accessibility windows or menu bar are currently exposed") }
        return lines.joined(separator: "\n")
    }

    func selectedElement(_ app: NSRunningApplication, _ index: Int) throws -> AXUIElement {
        guard let state = activeState, state.app.processIdentifier == app.processIdentifier,
              index >= 0, index < state.elements.count else {
            throw CUAError(message: "Element index is unavailable; get_app_state before selecting an index")
        }
        let element = state.elements[index]
        var pid: pid_t = 0
        guard AXUIElementGetPid(element, &pid) == .success && pid == app.processIdentifier else {
            throw CUAError(message: "Accessibility element was replaced; refresh app state")
        }
        if !CFEqual(element, state.window) {
            guard let owner = attribute(element, kAXWindowAttribute), CFGetTypeID(owner) == AXUIElementGetTypeID(),
                  background.windowID(owner as! AXUIElement) == state.windowID else {
                throw CUAError(message: "Accessibility element left the bound window; refresh app state")
            }
        }
        return element
    }

    func checkTarget(_ state: AppState) throws {
        guard !state.app.isTerminated, !state.app.isHidden,
              Date().timeIntervalSince(state.capturedAt) < 120,
              background.windowID(state.window) == state.windowID,
              let live = elementBounds(state.window),
              abs(live.minX - state.bounds.minX) < 1, abs(live.minY - state.bounds.minY) < 1,
              abs(live.width - state.bounds.width) < 1, abs(live.height - state.bounds.height) < 1,
              (attribute(state.window, kAXMinimizedAttribute) as? NSNumber)?.boolValue != true else {
            throw CUAError(message: "window_stale: window changed, is hidden/minimized, or snapshot expired; refresh state")
        }
        let info = CGWindowListCopyWindowInfo(.optionAll, kCGNullWindowID) as? [[String: Any]] ?? []
        guard info.contains(where: { ($0[kCGWindowNumber as String] as? NSNumber)?.uint32Value == state.windowID &&
                                    ($0[kCGWindowOwnerPID as String] as? NSNumber)?.int32Value == state.app.processIdentifier }) else {
            throw CUAError(message: "window_stale: native window ownership changed")
        }
    }

    func checkAction(_ app: NSRunningApplication) throws {
        try checkCancellation()
        guard let state = activeState else { throw CUAError(message: "Refresh app state") }
        try checkTarget(state)
        try background.checkForeground(foregroundPID, target: app.processIdentifier)
    }

    func checkCancellation() throws {
        if let currentRequestID, cancelledRequestIDs.contains(currentRequestID) {
            throw CUAError(message: "cancelled: native computer-use call cancelled")
        }
    }

    func cancel(_ id: Int) {
        cancelledRequestIDs.insert(id)
        if currentRequestID == id { cursor.hide() }
    }

    func releaseSyntheticFocus() {
        guard let focus = syntheticFocus else { return }
        syntheticFocus = nil
        try? background.end(focus.psn, pid: focus.pid, windowID: focus.windowID)
    }

    func pause(_ seconds: Double) async throws {
        var remaining = UInt64(max(0, min(10, seconds)) * 1_000_000_000)
        while remaining > 0 {
            try checkCancellation()
            let chunk = min(remaining, 50_000_000)
            try await Task.sleep(nanoseconds: chunk)
            remaining -= chunk
        }
    }

    func focusedTextElement(_ app: NSRunningApplication) throws -> AXUIElement {
        guard let value = attribute(AXUIElementCreateApplication(app.processIdentifier), kAXFocusedUIElementAttribute),
              CFGetTypeID(value) == AXUIElementGetTypeID(), let state = activeState else {
            throw CUAError(message: "background_unavailable: no focused text input; click a field first")
        }
        let element = value as! AXUIElement
        let role = stringAttribute(element, kAXRoleAttribute)
        guard [kAXTextFieldRole as String, kAXTextAreaRole as String, "AXComboBox"].contains(role),
              let owner = attribute(element, kAXWindowAttribute), CFGetTypeID(owner) == AXUIElementGetTypeID(),
              background.windowID(owner as! AXUIElement) == state.windowID else {
            throw CUAError(message: "background_unavailable: focused editor is not in the bound window")
        }
        return element
    }

    func clickableElement(_ app: NSRunningApplication, _ params: [String: Any], point: CGPoint) throws -> AXUIElement {
        if let index = params["element_index"] as? Int { return try selectedElement(app, index) }
        guard let state = activeState else { throw CUAError(message: "Refresh app state") }
        let candidates = state.elements.filter {
            guard let bounds = elementBounds($0), bounds.contains(point) else { return false }
            return [kAXButtonRole as String, kAXCheckBoxRole as String, kAXRadioButtonRole as String,
                    kAXTextFieldRole as String, kAXTextAreaRole as String, "AXComboBox"].contains(stringAttribute($0, kAXRoleAttribute))
        }.sorted { left, right in
            let a = elementBounds(left) ?? .zero
            let b = elementBounds(right) ?? .zero
            return a.width * a.height < b.width * b.height
        }
        guard let element = candidates.first else {
            throw CUAError(message: "background_unavailable: coordinate has no supported AX control in the bound window; raw pointer fallback is disabled")
        }
        return element
    }

    func scrollableElement(_ app: NSRunningApplication, _ params: [String: Any], point: CGPoint) throws -> AXUIElement? {
        let selected: AXUIElement?
        if let index = params["element_index"] as? Int {
            selected = try selectedElement(app, index)
        } else {
            guard let state = activeState else { throw CUAError(message: "Refresh app state") }
            let candidates = state.elements.filter {
                guard let bounds = elementBounds($0), bounds.contains(point) else { return false }
                return elementActions($0).contains { $0.hasPrefix("AXScroll") }
            }.sorted { left, right in
                let a = elementBounds(left) ?? .zero
                let b = elementBounds(right) ?? .zero
                return a.width * a.height < b.width * b.height
            }
            selected = candidates.first
        }
        var candidate: AXUIElement? = selected
        for _ in 0..<20 {
            guard let current = candidate else { break }
            if elementActions(current).contains(where: { $0.hasPrefix("AXScroll") }) { return current }
            guard let parent = attribute(current, kAXParentAttribute), CFGetTypeID(parent) == AXUIElementGetTypeID() else { break }
            candidate = (parent as! AXUIElement)
        }
        return nil
    }

    func targetPoint(_ app: NSRunningApplication, _ params: [String: Any]) throws -> CGPoint {
        if let index = params["element_index"] as? Int,
           let bounds = elementBounds(try selectedElement(app, index)) { return CGPoint(x: bounds.midX, y: bounds.midY) }
        guard let x = params["x"] as? Double, let y = params["y"] as? Double,
              x.isFinite, y.isFinite else {
            throw CUAError(message: "Action requires an element_index or finite x/y coordinates")
        }
        guard let state = activeState else { throw CUAError(message: "Refresh app state") }
        let bounds = state.bounds
        let nativeX = x / state.screenshotScale
        let nativeY = y / state.screenshotScale
        guard nativeX >= 0, nativeY >= 0, nativeX < bounds.width, nativeY < bounds.height else {
            throw CUAError(message: "Coordinates are outside the selected app window")
        }
        return CGPoint(x: bounds.minX + nativeX, y: bounds.minY + nativeY)
    }

    func setValue(_ element: AXUIElement, _ value: String) throws {
        let result = AXUIElementSetAttributeValue(element, kAXValueAttribute as CFString, value as CFString)
        guard result == .success else { throw CUAError(message: "AX set value failed: \(result.rawValue)") }
    }

    func keyChord(_ chord: String) throws -> (CGKeyCode, CGEventFlags) {
        let pieces = chord.split(separator: "+").map { $0.trimmingCharacters(in: .whitespaces).lowercased() }
        var flags: CGEventFlags = []
        var key = ""
        for piece in pieces {
            switch piece {
            case "super_l", "super_r", "super", "cmd", "command", "meta": flags.insert(.maskCommand)
            case "control_l", "control_r", "control", "ctrl": flags.insert(.maskControl)
            case "alt_l", "alt_r", "alt", "option": flags.insert(.maskAlternate)
            case "shift_l", "shift_r", "shift": flags.insert(.maskShift)
            default: key = piece
            }
        }
        let keys: [String: CGKeyCode] = ["a":0,"s":1,"d":2,"f":3,"h":4,"g":5,"z":6,"x":7,"c":8,"v":9,"b":11,"q":12,"w":13,"e":14,"r":15,"y":16,"t":17,"1":18,"2":19,"3":20,"4":21,"6":22,"5":23,"equal":24,"9":25,"7":26,"minus":27,"8":28,"0":29,"bracketright":30,"o":31,"u":32,"bracketleft":33,"i":34,"p":35,"return":36,"enter":36,"l":37,"j":38,"apostrophe":39,"k":40,"semicolon":41,"backslash":42,"comma":43,"slash":44,"n":45,"m":46,"period":47,"tab":48,"space":49,"grave":50,"backspace":51,"delete":51,"escape":53,"esc":53,"f1":122,"f2":120,"f3":99,"f4":118,"f5":96,"f6":97,"f7":98,"f8":100,"f9":101,"f10":109,"f11":103,"f12":111,"home":115,"end":119,"page_up":116,"page_down":121,"left":123,"right":124,"down":125,"up":126]
        guard let code = keys[key] else { throw CUAError(message: "Unsupported key chord: \(chord)") }
        return (code, flags)
    }

    func pressKey(_ app: NSRunningApplication, _ chord: String, duration: Double = 0) async throws {
        let (code, flags) = try keyChord(chord)
        // Command navigation/menu shortcuts may foreground an app. Only editor
        // select-all is supported, through its exact AX selection range.
        if flags.contains(.maskCommand) {
            guard code == 0, flags == .maskCommand else {
                throw CUAError(message: "background_unavailable: command shortcut may activate an app; use an explicit AX action")
            }
            let element = try focusedTextElement(app)
            var range = CFRange(location: 0, length: (stringAttribute(element, kAXValueAttribute) as NSString).length)
            guard let value = AXValueCreate(.cfRange, &range),
                  AXUIElementSetAttributeValue(element, kAXSelectedTextRangeAttribute as CFString, value) == .success else {
                throw CUAError(message: "background_unavailable: select-all is unsupported by this editor")
            }
            return
        }
        guard flags.isEmpty else { throw CUAError(message: "background_unavailable: modifier shortcut is not supported") }
        _ = try focusedTextElement(app)
        try checkAction(app)
        let down = CGEvent(keyboardEventSource: eventSource, virtualKey: code, keyDown: true)
        let up = CGEvent(keyboardEventSource: eventSource, virtualKey: code, keyDown: false)
        guard let down, let up else { throw CUAError(message: "Keyboard event creation failed") }
        down.flags = flags
        up.flags = flags
        down.postToPid(app.processIdentifier)
        defer { up.postToPid(app.processIdentifier) }
        if duration > 0 { try await pause(duration) }
    }

    func typeText(_ app: NSRunningApplication, _ text: String) throws {
        _ = try focusedTextElement(app)
        let characters = Array(text.utf16)
        var start = 0
        while start < characters.count {
            try checkAction(app)
            var end = min(characters.count, start + 64)
            if end < characters.count && (0xD800...0xDBFF).contains(characters[end - 1]) { end -= 1 }
            var chunk = Array(characters[start..<end])
            for down in [true, false] {
                let event = CGEvent(keyboardEventSource: eventSource, virtualKey: 0, keyDown: down)
                event?.keyboardSetUnicodeString(stringLength: chunk.count, unicodeString: &chunk)
                event?.postToPid(app.processIdentifier)
            }
            start = end
        }
    }

    func screenshot(_ app: NSRunningApplication) async throws -> String {
        guard CGPreflightScreenCaptureAccess() else {
            throw CUAError(message: "Screen Recording permission is missing. Enable Codex Computer Use Standalone in System Settings > Privacy & Security > Screen & System Audio Recording")
        }
        let content = try await SCShareableContent.excludingDesktopWindows(true, onScreenWindowsOnly: false)
        guard let state = activeState,
              let window = content.windows.first(where: { $0.windowID == state.windowID && $0.owningApplication?.processID == app.processIdentifier }) else {
            throw CUAError(message: "App has no capturable bound window")
        }
        try checkTarget(state)
        let config = SCStreamConfiguration()
        let scale = min(1, 2048 / max(window.frame.width, window.frame.height))
        config.width = max(1, Int(window.frame.width * scale))
        config.height = max(1, Int(window.frame.height * scale))
        config.showsCursor = false
        let image = try await SCScreenshotManager.captureImage(contentFilter: SCContentFilter(desktopIndependentWindow: window), configuration: config)
        guard let data = NSBitmapImageRep(cgImage: image).representation(using: .png, properties: [:]) else { throw CUAError(message: "Screenshot encoding failed") }
        return "data:image/png;base64," + data.base64EncodedString()
    }

    func moveWindowForTest(_ params: [String: Any]) throws -> Any {
        guard ProcessInfo.processInfo.environment["CODEX_CUA_ENABLE_TEST_HOOKS"] == "1" else {
            throw CUAError(message: "Test hooks are disabled")
        }
        guard let name = params["app"] as? String,
              let requestedID = (params["window_id"] as? NSNumber)?.uint32Value,
              let dx = params["dx"] as? Double, let dy = params["dy"] as? Double else {
            throw CUAError(message: "test_move_window requires app, window_id, dx and dy")
        }
        let app = try resolveSync(name)
        let windows = attribute(AXUIElementCreateApplication(app.processIdentifier), kAXWindowsAttribute) as? [AXUIElement] ?? []
        guard let window = windows.first(where: { background.windowID($0) == requestedID }),
              let position = attribute(window, kAXPositionAttribute),
              CFGetTypeID(position) == AXValueGetTypeID() else {
            throw CUAError(message: "Test window is unavailable")
        }
        var origin = CGPoint.zero
        guard AXValueGetValue(position as! AXValue, .cgPoint, &origin) else {
            throw CUAError(message: "Test window position is unavailable")
        }
        origin.x += dx
        origin.y += dy
        var moved = origin
        guard let value = AXValueCreate(.cgPoint, &moved),
              AXUIElementSetAttributeValue(window, kAXPositionAttribute as CFString, value) == .success else {
            throw CUAError(message: "Test window move failed")
        }
        return ["windowID": requestedID, "x": moved.x, "y": moved.y]
    }

    func resolveSync(_ input: String) throws -> NSRunningApplication {
        func find(_ value: String) -> NSRunningApplication? {
            NSWorkspace.shared.runningApplications.first {
                !$0.isTerminated && ($0.bundleIdentifier == value || $0.bundleURL?.path == value ||
                    $0.localizedName?.caseInsensitiveCompare(value) == .orderedSame ||
                    String($0.processIdentifier) == value)
            }
        }
        let value = appInput(input).0
        guard let app = find(value) else {
            throw CUAError(message: "app_not_running: test window app is not running")
        }
        return app
    }

    func activateAppForTest(_ params: [String: Any]) throws -> Any {
        guard ProcessInfo.processInfo.environment["CODEX_CUA_ENABLE_TEST_HOOKS"] == "1" else {
            throw CUAError(message: "Test hooks are disabled")
        }
        guard let name = params["app"] as? String else { throw CUAError(message: "app is required") }
        let app = try resolveSync(name)
        guard app.activate(options: [.activateAllWindows]) else {
            throw CUAError(message: "Test app activation failed")
        }
        if let windowID = (params["window_id"] as? NSNumber)?.uint32Value {
            let windows = attribute(AXUIElementCreateApplication(app.processIdentifier), kAXWindowsAttribute) as? [AXUIElement] ?? []
            if let window = windows.first(where: { background.windowID($0) == windowID }) {
                _ = AXUIElementPerformAction(window, kAXRaiseAction as CFString)
            }
        }
        for _ in 0..<200 {
            if NSWorkspace.shared.frontmostApplication?.processIdentifier == app.processIdentifier {
                return ["pid": app.processIdentifier]
            }
            Thread.sleep(forTimeInterval: 0.01)
        }
        throw CUAError(message: "Test app did not become frontmost")
    }

    func handle(_ requestID: Int, _ method: String, _ params: [String: Any]) async throws -> Any {
        currentRequestID = requestID
        defer {
            releaseSyntheticFocus()
            cancelledRequestIDs.remove(requestID)
            if currentRequestID == requestID { currentRequestID = nil }
        }
        try checkCancellation()
        if method == "permissionStatus" { return permissionStatus() }
        if method == "cursorStatus" { return cursor.status }
        if method == "cursorImage" {
            guard let data = cursor.image()?.representation(using: .png, properties: [:]) else { throw CUAError(message: "Cursor image unavailable") }
            return ["url": "data:image/png;base64," + data.base64EncodedString()]
        }
        if method == "hideCursor" { cursor.hide(); return NSNull() }
        if method == "test_move_window" { return try moveWindowForTest(params) }
        if method == "test_activate_app" { return try activateAppForTest(params) }
        if method == "requestPermissions" {
            let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
            _ = AXIsProcessTrustedWithOptions(options)
            _ = CGRequestScreenCaptureAccess()
            return permissionStatus()
        }
        if method == "list_apps" {
            return NSWorkspace.shared.runningApplications.filter { !$0.isTerminated && $0.activationPolicy == .regular }.map {
                app in
                let windows = (attribute(AXUIElementCreateApplication(app.processIdentifier), kAXWindowsAttribute) as? [AXUIElement] ?? []).compactMap { window -> [String: Any]? in
                    guard let id = background.windowID(window) else { return nil }
                    return ["id": id, "title": stringAttribute(window, kAXTitleAttribute), "app": identifier(app) + "#window=\(id)"]
                }
                return ["id": identifier(app), "displayName": app.localizedName ?? identifier(app), "isRunning": true,
                        "pid": app.processIdentifier, "windows": windows] as [String: Any]
            }
        }
        guard let name = params["app"] as? String, !name.isEmpty else { throw CUAError(message: "app is required") }
        let app = try await resolve(name)
        let requestedID = (params["window_id"] as? NSNumber)?.uint32Value ?? appInput(name).1
        if method == "get_app_state" || method == "screenshot" {
            let text = try captureState(app, windowID: requestedID)
            if method == "screenshot" { return ["url": try await screenshot(app)] }
            let image = try? await screenshot(app)
            return ["app": identifier(app) + "#window=\(activeState!.windowID)", "text": text,
                    "screenshot": image.map { ["url": $0] as Any } ?? NSNull()] as [String: Any]
        }
        activeState = states[requestedID.map { identifier(app) + "#window=\($0)" } ?? identifier(app)]
        if activeState == nil { _ = try captureState(app, windowID: requestedID) }
        try requireAccessibility()
        guard let frontmost = NSWorkspace.shared.frontmostApplication?.processIdentifier,
              frontmost != app.processIdentifier else {
            throw CUAError(message: "target_is_foreground: background-only input requires another app in front; move your focus away from the target")
        }
        foregroundPID = frontmost
        try checkAction(app)
        let state = activeState!
        let supported = ["click", "press_key", "type_text", "paste", "set_value", "select_text", "perform_secondary_action", "scroll", "drag"]
        guard supported.contains(method) else { throw CUAError(message: "Unsupported method: \(method)") }
        if method == "drag" { throw CUAError(message: "background_unavailable: drag is not verified; global fallback is disabled") }
        if method == "paste" { throw CUAError(message: "background_unavailable: paste would mutate your shared clipboard; use type_text or set_value") }
        defer { releaseSyntheticFocus() }
        if ["click", "press_key", "type_text", "scroll"].contains(method) {
            let psn = try background.begin(pid: app.processIdentifier, windowID: state.windowID, foreground: foregroundPID)
            syntheticFocus = SyntheticFocus(psn: psn, pid: app.processIdentifier, windowID: state.windowID)
            try await pause(0.03)
        }
        defer { cursor.press(false) }
        try checkAction(app)
        switch method {
        case "click":
            let buttonName = params["mouse_button"] as? String ?? "left"
            let clickCount = max(1, min(3, params["click_count"] as? Int ?? 1))
            let hold = min(10, max(0, params["duration"] as? Double ?? 0))
            let modifierKey = params["key"] as? String
            let modifierFlags = try modifierKey.map { try keyChord($0 + "+space").1 } ?? []
            guard buttonName == "left", clickCount == 1, hold == 0, modifierFlags.isEmpty else {
                throw CUAError(message: "background_unavailable: only plain single left click is verified")
            }
            let point = try targetPoint(app, params)
            let element = try clickableElement(app, params, point: point)
            try await cursor.move(to: point, windowID: state.windowID, bounds: state.bounds) { try self.checkAction(app) }
            cursor.press(true)
            let role = stringAttribute(element, kAXRoleAttribute)
            guard (attribute(element, kAXEnabledAttribute) as? NSNumber)?.boolValue != false else {
                throw CUAError(message: "AX control is disabled")
            }
            if [kAXTextFieldRole as String, kAXTextAreaRole as String, "AXComboBox"].contains(role) {
                guard AXUIElementSetAttributeValue(element, kAXFocusedAttribute as CFString, kCFBooleanTrue) == .success else {
                    throw CUAError(message: "background_unavailable: editor does not support AX focus")
                }
            } else if [kAXButtonRole as String, kAXCheckBoxRole as String, kAXRadioButtonRole as String].contains(role) {
                let result = AXUIElementPerformAction(element, kAXPressAction as CFString)
                guard result == .success else { throw CUAError(message: "AX press failed; observe before retrying") }
            } else {
                throw CUAError(message: "background_unavailable: AX role is not supported for background click")
            }
            try await pause(0.07)
            cursor.press(false)
        case "press_key": try await pressKey(app, params["key"] as? String ?? "", duration: params["duration"] as? Double ?? 0)
        case "type_text": try typeText(app, params["text"] as? String ?? "")
        case "set_value":
            guard let index = params["element_index"] as? Int else { throw CUAError(message: "element_index is required") }
            try setValue(try selectedElement(app, index), params["value"] as? String ?? "")
        case "select_text":
            guard let index = params["element_index"] as? Int, let text = params["text"] as? String else { throw CUAError(message: "element_index and text are required") }
            let element = try selectedElement(app, index)
            let full = stringAttribute(element, kAXValueAttribute) as NSString
            let prefix = params["prefix"] as? String ?? ""
            let suffix = params["suffix"] as? String ?? ""
            let needle = prefix + text + suffix
            guard !text.isEmpty else { throw CUAError(message: "Text selection is empty") }
            var matches: [NSRange] = []
            var offset = 0
            while offset <= full.length {
                let match = full.range(of: needle, range: NSRange(location: offset, length: full.length - offset))
                if match.location == NSNotFound { break }
                matches.append(match)
                offset = match.location + 1
            }
            guard matches.count == 1 else { throw CUAError(message: "Text selection must have exactly one match; add prefix/suffix") }
            var found = matches[0]
            guard found.location != NSNotFound else { throw CUAError(message: "Text selection was not found") }
            found.location += (prefix as NSString).length
            found.length = (text as NSString).length
            let selection = params["selection_type"] as? String ?? "text"
            if selection == "cursor_after" { found.location += found.length; found.length = 0 }
            if selection == "cursor_before" { found.length = 0 }
            var range = CFRange(location: found.location, length: found.length)
            guard let value = AXValueCreate(.cfRange, &range), AXUIElementSetAttributeValue(element, kAXSelectedTextRangeAttribute as CFString, value) == .success else { throw CUAError(message: "Text selection is not supported by this element") }
            var readback = CFRange(location: 0, length: 0)
            guard let read = attribute(element, kAXSelectedTextRangeAttribute), CFGetTypeID(read) == AXValueGetTypeID(),
                  AXValueGetValue(read as! AXValue, .cfRange, &readback), readback.location == range.location,
                  readback.length == range.length else { throw CUAError(message: "Text selection verification failed") }
        case "perform_secondary_action":
            guard let index = params["element_index"] as? Int, let action = params["action"] as? String else { throw CUAError(message: "element_index and action are required") }
            guard [kAXPressAction as String, kAXIncrementAction as String, kAXDecrementAction as String].contains(action) else {
                throw CUAError(message: "background_unavailable: secondary action could change window focus")
            }
            let result = AXUIElementPerformAction(try selectedElement(app, index), action as CFString)
            guard result == .success else { throw CUAError(message: "AX action failed: \(result.rawValue)") }
        case "scroll":
            let point = try targetPoint(app, params)
            try await cursor.move(to: point, windowID: state.windowID, bounds: state.bounds) { try self.checkAction(app) }
            let direction = params["direction"] as? String ?? "down"
            guard let element = try scrollableElement(app, params, point: point) else {
                throw CUAError(message: "background_unavailable: this control exposes no AX page-scroll action")
            }
            let action = ["up": "AXScrollUpByPage", "down": "AXScrollDownByPage",
                          "left": "AXScrollLeftByPage", "right": "AXScrollRightByPage"][direction]!
            guard elementActions(element).contains(action) else {
                throw CUAError(message: "background_unavailable: this control does not expose \(action)")
            }
            let pages = min(10, max(1, Int((params["pages"] as? Double ?? 1).rounded())))
            for _ in 0..<pages {
                let result = AXUIElementPerformAction(element, action as CFString)
                guard result == .success else {
                    throw CUAError(message: "background_unavailable: AX page-scroll failed for this control (\(result.rawValue)); no global scroll fallback")
                }
                try await pause(0.05)
            }
        default: throw CUAError(message: "Unsupported method: \(method)")
        }
        try await pause(0.07)
        try checkAction(app)
        return NSNull()
    }
}

func emit(_ response: [String: Any]) {
    if let data = try? JSONSerialization.data(withJSONObject: response, options: [.sortedKeys, .withoutEscapingSlashes]) {
        FileHandle.standardOutput.write(data)
        FileHandle.standardOutput.write(Data([10]))
    }
}

@main
struct ComputerUseMain {
static func main() {
let app = NSApplication.shared
app.setActivationPolicy(.accessory)
let computer = MainActor.assumeIsolated { ComputerUse() }
signal(SIGTERM, SIG_IGN)
signal(SIGINT, SIG_IGN)
let terminateSource = DispatchSource.makeSignalSource(signal: SIGTERM, queue: .main)
terminateSource.setEventHandler {
    MainActor.assumeIsolated {
        computer.releaseSyntheticFocus()
        computer.cursor.hide()
        exit(0)
    }
}
terminateSource.resume()
let interruptSource = DispatchSource.makeSignalSource(signal: SIGINT, queue: .main)
interruptSource.setEventHandler {
    MainActor.assumeIsolated {
        computer.releaseSyntheticFocus()
        computer.cursor.hide()
        exit(0)
    }
}
interruptSource.resume()
DispatchQueue.global(qos: .userInitiated).async {
    let operations = OperationQueue()
    operations.maxConcurrentOperationCount = 1
    while let line = readLine() {
        guard let data = line.data(using: .utf8), let request = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { continue }
        let requestID = (request["id"] as? NSNumber)?.intValue ?? 0
        let method = request["method"] as? String ?? ""
        let params = request["params"] as? [String: Any] ?? [:]
        if method == "cancel" {
            let cancelledID = (params["id"] as? NSNumber)?.intValue ?? 0
            Task { @MainActor in computer.cancel(cancelledID) }
            continue
        }
        operations.addOperation {
            let semaphore = DispatchSemaphore(value: 0)
            Task { @MainActor in
                do {
                    let result = try await computer.handle(requestID, method, params)
                    emit(["id": request["id"] ?? NSNull(), "result": result])
                } catch {
                    computer.cursor.hide()
                    emit(["id": request["id"] ?? NSNull(), "error": ["code": -32000, "message": (error as? CUAError)?.message ?? error.localizedDescription]])
                }
                semaphore.signal()
            }
            semaphore.wait()
        }
    }
    operations.waitUntilAllOperationsAreFinished()
    exit(0)
}
app.run()
}
}
