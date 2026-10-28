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

@MainActor
final class ComputerUse {
    struct AppState {
        let app: NSRunningApplication
        let elements: [AXUIElement]
        let bounds: CGRect
        let screenshotScale: Double
    }

    var states: [String: AppState] = [:]
    let eventSource = CGEventSource(stateID: .hidSystemState)

    func permissionStatus() -> [String: Any] {
        ["accessibility": AXIsProcessTrusted(), "screenRecording": CGPreflightScreenCaptureAccess(),
         "helper": Bundle.main.bundlePath, "pid": ProcessInfo.processInfo.processIdentifier]
    }

    func resolve(_ input: String) async throws -> NSRunningApplication {
        let apps = NSWorkspace.shared.runningApplications.filter { !$0.isTerminated }
        if let app = apps.first(where: {
            $0.bundleIdentifier == input || $0.bundleURL?.path == input ||
            $0.localizedName?.caseInsensitiveCompare(input) == .orderedSame ||
            String($0.processIdentifier) == input
        }) { return app }
        let url: URL?
        if input.hasPrefix("/") { url = URL(fileURLWithPath: input) }
        else {
            let commonPaths = ["/Applications", "/System/Applications", "/System/Applications/Utilities"].map {
                URL(fileURLWithPath: $0).appendingPathComponent(input.hasSuffix(".app") ? input : input + ".app")
            }
            url = NSWorkspace.shared.urlForApplication(withBundleIdentifier: input) ?? commonPaths.first(where: { FileManager.default.fileExists(atPath: $0.path) })
        }
        if let url {
            return try await NSWorkspace.shared.openApplication(at: url, configuration: NSWorkspace.OpenConfiguration())
        }
        throw CUAError(message: "App not found: \(input). Use list_apps for current names and IDs")
    }

    func identifier(_ app: NSRunningApplication) -> String {
        app.bundleIdentifier ?? app.bundleURL?.path ?? String(app.processIdentifier)
    }

    func requireAccessibility() throws {
        guard AXIsProcessTrusted() else {
            throw CUAError(message: "Accessibility permission is missing. Enable Codex Computer Use Standalone in System Settings > Privacy & Security > Accessibility")
        }
    }

    func captureState(_ app: NSRunningApplication) throws -> String {
        try requireAccessibility()
        let application = AXUIElementCreateApplication(app.processIdentifier)
        AXUIElementSetMessagingTimeout(application, 2)
        let windows = (attribute(application, kAXWindowsAttribute) as? [AXUIElement] ?? []).sorted {
            let left = elementBounds($0) ?? .zero
            let right = elementBounds($1) ?? .zero
            return left.width * left.height > right.width * right.height
        }
        let menu = attribute(application, kAXMenuBarAttribute)
        var roots = windows
        if let menu, CFGetTypeID(menu) == AXUIElementGetTypeID() { roots.append(menu as! AXUIElement) }
        var elements: [AXUIElement] = []
        var lines: [String] = ["App: \(app.localizedName ?? identifier(app)) (\(identifier(app)))"]
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
        let bounds = windows.first.flatMap(elementBounds) ?? CGRect(x: 0, y: 0, width: 1, height: 1)
        states[identifier(app)] = AppState(app: app, elements: elements, bounds: bounds, screenshotScale: 1)
        if roots.isEmpty { lines.append("No accessibility windows or menu bar are currently exposed") }
        return lines.joined(separator: "\n")
    }

    func selectedElement(_ app: NSRunningApplication, _ index: Int) throws -> AXUIElement {
        guard let state = states[identifier(app)], state.app.processIdentifier == app.processIdentifier,
              index >= 0, index < state.elements.count else {
            throw CUAError(message: "Element index is unavailable; get_app_state before selecting an index")
        }
        let element = state.elements[index]
        var pid: pid_t = 0
        guard AXUIElementGetPid(element, &pid) == .success && pid == app.processIdentifier else {
            throw CUAError(message: "Accessibility element was replaced; refresh app state")
        }
        return element
    }

    func targetPoint(_ app: NSRunningApplication, _ params: [String: Any]) throws -> CGPoint {
        if let index = params["element_index"] as? Int,
           let bounds = elementBounds(try selectedElement(app, index)) { return CGPoint(x: bounds.midX, y: bounds.midY) }
        guard let x = params["x"] as? Double, let y = params["y"] as? Double,
              x.isFinite, y.isFinite else {
            throw CUAError(message: "Action requires an element_index or finite x/y coordinates")
        }
        if states[identifier(app)] == nil { _ = try captureState(app) }
        let state = states[identifier(app)]!
        let bounds = state.bounds
        let nativeX = x / state.screenshotScale
        let nativeY = y / state.screenshotScale
        guard nativeX >= 0, nativeY >= 0, nativeX <= bounds.width, nativeY <= bounds.height else {
            throw CUAError(message: "Coordinates are outside the selected app window")
        }
        return CGPoint(x: bounds.minX + nativeX, y: bounds.minY + nativeY)
    }

    func setValue(_ element: AXUIElement, _ value: String) throws {
        let result = AXUIElementSetAttributeValue(element, kAXValueAttribute as CFString, value as CFString)
        guard result == .success else { throw CUAError(message: "AX set value failed: \(result.rawValue)") }
    }

    func postKey(_ app: NSRunningApplication, code: CGKeyCode, flags: CGEventFlags = []) {
        for down in [true, false] {
            let event = CGEvent(keyboardEventSource: eventSource, virtualKey: code, keyDown: down)
            event?.flags = flags
            event?.postToPid(app.processIdentifier)
        }
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
        let down = CGEvent(keyboardEventSource: eventSource, virtualKey: code, keyDown: true)
        down?.flags = flags
        down?.postToPid(app.processIdentifier)
        if duration > 0 { try await Task.sleep(nanoseconds: UInt64(min(10, duration) * 1e9)) }
        let up = CGEvent(keyboardEventSource: eventSource, virtualKey: code, keyDown: false)
        up?.flags = flags
        up?.postToPid(app.processIdentifier)
    }

    func typeText(_ app: NSRunningApplication, _ text: String) {
        let characters = Array(text.utf16)
        var start = 0
        while start < characters.count {
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
        let windows = content.windows.filter {
            $0.owningApplication?.processID == app.processIdentifier && $0.windowLayer == 0 && $0.frame.width > 1 && $0.frame.height > 1
        }.sorted {
            if $0.isOnScreen != $1.isOnScreen { return $0.isOnScreen }
            return $0.frame.width * $0.frame.height > $1.frame.width * $1.frame.height
        }
        guard let window = windows.first(where: { $0.isOnScreen }) ?? windows.first else {
            throw CUAError(message: "App has no capturable window")
        }
        let config = SCStreamConfiguration()
        let scale = min(1, 2048 / max(window.frame.width, window.frame.height))
        states[identifier(app)] = states[identifier(app)].map {
            AppState(app: $0.app, elements: $0.elements, bounds: window.frame, screenshotScale: scale)
        }
        config.width = max(1, Int(window.frame.width * scale))
        config.height = max(1, Int(window.frame.height * scale))
        config.showsCursor = false
        let image = try await SCScreenshotManager.captureImage(contentFilter: SCContentFilter(desktopIndependentWindow: window), configuration: config)
        guard let data = NSBitmapImageRep(cgImage: image).representation(using: .png, properties: [:]) else { throw CUAError(message: "Screenshot encoding failed") }
        return "data:image/png;base64," + data.base64EncodedString()
    }

    func handle(_ method: String, _ params: [String: Any]) async throws -> Any {
        if method == "permissionStatus" { return permissionStatus() }
        if method == "requestPermissions" {
            let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
            _ = AXIsProcessTrustedWithOptions(options)
            _ = CGRequestScreenCaptureAccess()
            return permissionStatus()
        }
        if method == "list_apps" {
            return NSWorkspace.shared.runningApplications.filter { !$0.isTerminated && $0.activationPolicy == .regular }.map {
                ["id": identifier($0), "displayName": $0.localizedName ?? identifier($0), "isRunning": true, "pid": $0.processIdentifier] as [String: Any]
            }
        }
        guard let name = params["app"] as? String, !name.isEmpty else { throw CUAError(message: "app is required") }
        let app = try await resolve(name)
        if method == "get_app_state" {
            let text = try captureState(app)
            let image = try? await screenshot(app)
            return ["app": identifier(app), "text": text, "screenshot": image.map { ["url": $0] as Any } ?? NSNull()] as [String: Any]
        }
        if method == "screenshot" { return ["url": try await screenshot(app)] }
        try requireAccessibility()
        app.activate(options: [])
        try await Task.sleep(nanoseconds: 80_000_000)
        switch method {
        case "click":
            let buttonName = params["mouse_button"] as? String ?? "left"
            let clickCount = max(1, min(3, params["click_count"] as? Int ?? 1))
            let hold = min(10, max(0, params["duration"] as? Double ?? 0))
            let modifierKey = params["key"] as? String
            let modifierFlags = try modifierKey.map { try keyChord($0 + "+space").1 } ?? []
            if let index = params["element_index"] as? Int {
                let element = try selectedElement(app, index)
                if buttonName == "left", clickCount == 1, hold == 0, modifierFlags.isEmpty,
                   AXUIElementPerformAction(element, kAXPressAction as CFString) == .success { break }
                _ = AXUIElementSetAttributeValue(element, kAXFocusedAttribute as CFString, kCFBooleanTrue)
            }
            let point = try targetPoint(app, params)
            let button: CGMouseButton = buttonName == "right" ? .right : buttonName == "middle" ? .center : .left
            let down: CGEventType = button == .right ? .rightMouseDown : button == .center ? .otherMouseDown : .leftMouseDown
            let up: CGEventType = button == .right ? .rightMouseUp : button == .center ? .otherMouseUp : .leftMouseUp
            for count in 1...clickCount {
                for type in [down, up] {
                    let event = CGEvent(mouseEventSource: eventSource, mouseType: type, mouseCursorPosition: point, mouseButton: button)
                    event?.setIntegerValueField(.mouseEventClickState, value: Int64(count))
                    event?.flags = modifierFlags
                    event?.post(tap: .cghidEventTap)
                    if type == down { try await Task.sleep(nanoseconds: UInt64(max(0.02, hold) * 1e9)) }
                }
            }
        case "press_key": try await pressKey(app, params["key"] as? String ?? "", duration: params["duration"] as? Double ?? 0)
        case "type_text": typeText(app, params["text"] as? String ?? "")
        case "paste":
            let pasteboard = NSPasteboard.general
            let saved = pasteboard.pasteboardItems?.map { item -> NSPasteboardItem in
                let copy = NSPasteboardItem()
                for type in item.types { if let data = item.data(forType: type) { copy.setData(data, forType: type) } }
                return copy
            } ?? []
            pasteboard.clearContents()
            let pasted = params["text"] as? String ?? ""
            pasteboard.setString(pasted, forType: .string)
            if (params["format"] as? String) == "html" { pasteboard.setString(pasted, forType: .html) }
            let change = pasteboard.changeCount
            postKey(app, code: 9, flags: .maskCommand)
            try await Task.sleep(nanoseconds: 180_000_000)
            if pasteboard.changeCount == change { pasteboard.clearContents(); pasteboard.writeObjects(saved) }
        case "set_value":
            guard let index = params["element_index"] as? Int else { throw CUAError(message: "element_index is required") }
            try setValue(try selectedElement(app, index), params["value"] as? String ?? "")
        case "select_text":
            guard let index = params["element_index"] as? Int, let text = params["text"] as? String else { throw CUAError(message: "element_index and text are required") }
            let element = try selectedElement(app, index)
            let full = stringAttribute(element, kAXValueAttribute) as NSString
            let prefix = params["prefix"] as? String ?? ""
            let suffix = params["suffix"] as? String ?? ""
            var found = full.range(of: prefix + text + suffix)
            guard found.location != NSNotFound else { throw CUAError(message: "Text selection was not found") }
            found.location += (prefix as NSString).length
            found.length = (text as NSString).length
            let selection = params["selection_type"] as? String ?? "text"
            if selection == "cursor_after" { found.location += found.length; found.length = 0 }
            if selection == "cursor_before" { found.length = 0 }
            var range = CFRange(location: found.location, length: found.length)
            guard let value = AXValueCreate(.cfRange, &range), AXUIElementSetAttributeValue(element, kAXSelectedTextRangeAttribute as CFString, value) == .success else { throw CUAError(message: "Text selection is not supported by this element") }
        case "perform_secondary_action":
            guard let index = params["element_index"] as? Int, let action = params["action"] as? String else { throw CUAError(message: "element_index and action are required") }
            let result = AXUIElementPerformAction(try selectedElement(app, index), action as CFString)
            guard result == .success else { throw CUAError(message: "AX action failed: \(result.rawValue)") }
        case "scroll":
            let point = try targetPoint(app, params)
            CGEvent(mouseEventSource: eventSource, mouseType: .mouseMoved, mouseCursorPosition: point, mouseButton: .left)?.post(tap: .cghidEventTap)
            let direction = params["direction"] as? String ?? "down"
            let distance = Int32(min(4000, max(1, params["pages"] as? Double ?? 1) * 500))
            let vertical: Int32 = direction == "up" ? distance : direction == "down" ? -distance : 0
            let horizontal: Int32 = direction == "left" ? distance : direction == "right" ? -distance : 0
            CGEvent(scrollWheelEvent2Source: eventSource, units: .pixel, wheelCount: 2, wheel1: vertical, wheel2: horizontal, wheel3: 0)?.post(tap: .cghidEventTap)
        case "drag":
            let from = try targetPoint(app, ["x": params["from_x"] ?? NSNull(), "y": params["from_y"] ?? NSNull()])
            let to = try targetPoint(app, ["x": params["to_x"] ?? NSNull(), "y": params["to_y"] ?? NSNull()])
            CGEvent(mouseEventSource: eventSource, mouseType: .leftMouseDown, mouseCursorPosition: from, mouseButton: .left)?.post(tap: .cghidEventTap)
            for step in 1...20 {
                let fraction = Double(step) / 20
                let point = CGPoint(x: from.x + (to.x - from.x) * fraction, y: from.y + (to.y - from.y) * fraction)
                CGEvent(mouseEventSource: eventSource, mouseType: .leftMouseDragged, mouseCursorPosition: point, mouseButton: .left)?.post(tap: .cghidEventTap)
                try await Task.sleep(nanoseconds: 10_000_000)
            }
            CGEvent(mouseEventSource: eventSource, mouseType: .leftMouseUp, mouseCursorPosition: to, mouseButton: .left)?.post(tap: .cghidEventTap)
        default: throw CUAError(message: "Unsupported method: \(method)")
        }
        try await Task.sleep(nanoseconds: 70_000_000)
        return NSNull()
    }
}

func emit(_ response: [String: Any]) {
    if let data = try? JSONSerialization.data(withJSONObject: response, options: [.sortedKeys, .withoutEscapingSlashes]) {
        FileHandle.standardOutput.write(data)
        FileHandle.standardOutput.write(Data([10]))
    }
}

let app = NSApplication.shared
app.setActivationPolicy(.prohibited)
let computer = MainActor.assumeIsolated { ComputerUse() }
DispatchQueue.global(qos: .userInitiated).async {
    while let line = readLine() {
        guard let data = line.data(using: .utf8), let request = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else { continue }
        let semaphore = DispatchSemaphore(value: 0)
        Task { @MainActor in
            let id = request["id"] ?? NSNull()
            do {
                let result = try await computer.handle(request["method"] as? String ?? "", request["params"] as? [String: Any] ?? [:])
                emit(["id": id, "result": result])
            } catch {
                emit(["id": id, "error": ["code": -32000, "message": (error as? CUAError)?.message ?? error.localizedDescription]])
            }
            semaphore.signal()
        }
        semaphore.wait()
    }
    exit(0)
}
app.run()
