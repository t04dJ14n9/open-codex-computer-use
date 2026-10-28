import AppKit

final class FlippedView: NSView {
    override var isFlipped: Bool { true }
}

final class TrackingScrollView: NSScrollView {
    var wheelEvents = 0
    var lastWheelDelta: CGFloat = 0

    override func scrollWheel(with event: NSEvent) {
        wheelEvents += 1
        lastWheelDelta = event.scrollingDeltaY
        super.scrollWheel(with: event)
    }
}

final class FixtureDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    let input = NSTextField(string: "")
    let status = NSTextField(labelWithString: "Ready")
    let scrollView = TrackingScrollView()
    var appScrollEvents = 0
    var guardWindow: NSWindow!
    let guardInput = NSTextField(string: "foreground-sentinel")
    var monitor: Timer?
    var expectedForeground: pid_t?
    var protectedPIDs: Set<pid_t> = []
    var baselinePointer = CGPoint.zero
    var baselineWindowOrder: [Int] = []
    var focusViolations = 0
    var pointerViolations = 0
    var windowOrderViolations = 0
    var samples = 0
    var lastCommand = ""
    var mouseEvents: [[String: Any]] = []
    var watchedWindows: [Int] = []
    var baselineKeyWindow: Int?
    var focusStateViolations = 0
    var externalFocusSamples = 0
    var transitions: [[String: Any]] = []
    var lastForeground: pid_t?
    var lastPointer = CGPoint.zero
    var activityToken: NSObjectProtocol?
    var externalApplication: NSRunningApplication?

    func applicationDidFinishLaunching(_ notification: Notification) {
        activityToken = ProcessInfo.processInfo.beginActivity(
            options: [.userInitiated, .latencyCritical],
            reason: "Continuous computer-use background verification"
        )
        let menu = NSMenu()
        let appItem = NSMenuItem()
        appItem.submenu = NSMenu(title: "CUA Verification")
        appItem.submenu?.addItem(withTitle: "Quit CUA Verification", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        menu.addItem(appItem)
        let editItem = NSMenuItem()
        let editMenu = NSMenu(title: "Edit")
        for (title, action, key) in [("Cut", "cut:", "x"), ("Copy", "copy:", "c"), ("Paste", "paste:", "v"), ("Select All", "selectAll:", "a")] {
            editMenu.addItem(withTitle: title, action: Selector(action), keyEquivalent: key)
        }
        editItem.submenu = editMenu
        menu.addItem(editItem)
        NSApplication.shared.mainMenu = menu
        window = NSWindow(
            contentRect: NSRect(x: 220, y: 240, width: 520, height: 240),
            styleMask: [.titled, .closable, .miniaturizable],
            backing: .buffered, defer: false
        )
        let guardMode = ProcessInfo.processInfo.environment["CUA_FIXTURE_MODE"] == "guard"
        let startsInBackground = ProcessInfo.processInfo.environment["CUA_FIXTURE_BACKGROUND"] == "1"
        window.title = guardMode ? "Foreground Guard" : "Codex CUA Verification"
        if guardMode { input.stringValue = "foreground-sentinel" }
        let title = NSTextField(labelWithString: "Computer Use Verification")
        title.font = .systemFont(ofSize: 20, weight: .semibold)
        title.frame = NSRect(x: 24, y: 176, width: 460, height: 32)
        input.frame = NSRect(x: 24, y: 124, width: 460, height: 30)
        input.placeholderString = "Verification text"
        input.setAccessibilityIdentifier("verification-input")
        input.setAccessibilityLabel("Verification input")
        let button = NSButton(title: "Verify", target: self, action: #selector(verify))
        button.bezelStyle = .rounded
        button.frame = NSRect(x: 22, y: 72, width: 110, height: 32)
        button.setAccessibilityIdentifier("verification-button")
        status.frame = NSRect(x: 24, y: 28, width: 260, height: 24)
        status.setAccessibilityIdentifier("verification-status")
        scrollView.frame = NSRect(x: 300, y: 28, width: 190, height: 84)
        scrollView.borderType = .bezelBorder
        scrollView.hasVerticalScroller = true
        scrollView.autohidesScrollers = true
        scrollView.setAccessibilityIdentifier("verification-scroll")
        let document = FlippedView(frame: NSRect(x: 0, y: 0, width: 170, height: 640))
        for index in 0..<20 {
            let label = NSTextField(labelWithString: "Scroll row \(index + 1)")
            label.frame = NSRect(x: 12, y: 10 + index * 30, width: 140, height: 22)
            document.addSubview(label)
        }
        scrollView.documentView = document
        window.contentView?.addSubview(title)
        window.contentView?.addSubview(input)
        window.contentView?.addSubview(button)
        window.contentView?.addSubview(status)
        window.contentView?.addSubview(scrollView)
        window.makeKeyAndOrderFront(nil)
        if !startsInBackground {
            window.makeFirstResponder(input)
            NSApplication.shared.activate(ignoringOtherApps: true)
        }
        guardWindow = NSWindow(contentRect: NSRect(x: 350, y: 320, width: 450, height: 170),
            styleMask: [.titled, .closable], backing: .buffered, defer: false)
        guardWindow.title = "Sibling Window"
        let guardLabel = NSTextField(labelWithString: "Foreground input sentinel")
        guardLabel.frame = NSRect(x: 20, y: 112, width: 410, height: 24)
        guardInput.frame = NSRect(x: 20, y: 60, width: 410, height: 30)
        guardInput.setAccessibilityIdentifier("foreground-guard-input")
        guardWindow.contentView?.addSubview(guardLabel)
        guardWindow.contentView?.addSubview(guardInput)
        if !guardMode { guardWindow.orderBack(nil) }
        monitor = Timer(timeInterval: 0.01, repeats: true) { [weak self] _ in self?.tick() }
        RunLoop.main.add(monitor!, forMode: .common)
        NSEvent.addLocalMonitorForEvents(matching: [.leftMouseDown, .leftMouseUp]) { [weak self] event in
            self?.mouseEvents.append(["type": event.type.rawValue, "window": event.windowNumber,
                                      "x": event.locationInWindow.x, "y": event.locationInWindow.y])
            self?.mouseEvents = Array(self?.mouseEvents.suffix(20) ?? [])
            return event
        }
        NSEvent.addLocalMonitorForEvents(matching: [.scrollWheel]) { [weak self] event in
            self?.appScrollEvents += 1
            return event
        }
    }

    @objc func verify() {
        status.stringValue = "Verified: " + input.stringValue
        let report = ["text": input.stringValue, "verified": true] as [String: Any]
        if let output = ProcessInfo.processInfo.environment["CUA_FIXTURE_RESULT"],
           let data = try? JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted]) {
            try? data.write(to: URL(fileURLWithPath: output), options: [.atomic])
        }
    }

    func nativeWindowOrder() -> [Int] {
        let own = watchedWindows.isEmpty ? [window.windowNumber, guardWindow.windowNumber] : watchedWindows
        return (CGWindowListCopyWindowInfo(.optionOnScreenOnly, kCGNullWindowID) as? [[String: Any]] ?? [])
            .compactMap { ($0[kCGWindowNumber as String] as? NSNumber)?.intValue }.filter { own.contains($0) }
    }

    func tick() {
        let environment = ProcessInfo.processInfo.environment
        if let control = environment["CUA_FIXTURE_CONTROL"], let command = try? String(contentsOfFile: control, encoding: .utf8), command != lastCommand {
            lastCommand = command
            let arguments = command.split(separator: " ").compactMap { Int($0.trimmingCharacters(in: .whitespacesAndNewlines)) }
            let fields = Dictionary(uniqueKeysWithValues: command.split(separator: " ").compactMap { token -> (String, String)? in
                let parts = token.split(separator: "=", maxSplits: 1).map(String.init)
                return parts.count == 2 ? (parts[0], parts[1]) : nil
            })
            if command.hasPrefix("arm "), let guardPID = fields["guard"].flatMap(Int.init) {
                expectedForeground = pid_t(guardPID)
                protectedPIDs = Set((fields["protect"] ?? "").split(separator: ",").compactMap { pid_t($0) })
                watchedWindows = (fields["windows"] ?? "").split(separator: ",").compactMap { Int($0) }
                if let frontmost = NSWorkspace.shared.frontmostApplication,
                   !protectedPIDs.contains(frontmost.processIdentifier) {
                    externalApplication = frontmost
                }
                baselinePointer = CGEvent(source: nil)?.location ?? .zero
                baselineWindowOrder = nativeWindowOrder()
                baselineKeyWindow = NSApplication.shared.keyWindow?.windowNumber
                focusViolations = 0; pointerViolations = 0; windowOrderViolations = 0; samples = 0
                focusStateViolations = 0; externalFocusSamples = 0
                transitions = []
                lastForeground = expectedForeground
                lastPointer = baselinePointer
            } else if command.hasPrefix("guard") {
                guardWindow.makeKeyAndOrderFront(nil)
                guardWindow.makeFirstResponder(guardInput)
                NSApplication.shared.activate(ignoringOtherApps: true)
                expectedForeground = NSWorkspace.shared.frontmostApplication?.processIdentifier
                baselinePointer = CGEvent(source: nil)?.location ?? .zero
                baselineWindowOrder = nativeWindowOrder()
                focusViolations = 0; pointerViolations = 0; windowOrderViolations = 0; samples = 0
                focusStateViolations = 0; externalFocusSamples = 0
                transitions = []
                lastForeground = expectedForeground
                lastPointer = baselinePointer
            } else if command.hasPrefix("target") {
                expectedForeground = nil
                window.makeKeyAndOrderFront(nil)
                window.makeFirstResponder(input)
                NSApplication.shared.activate(ignoringOtherApps: true)
            } else if command.hasPrefix("move "), arguments.count >= 2 {
                window.setFrameOrigin(NSPoint(
                    x: window.frame.origin.x + CGFloat(arguments[0]),
                    y: window.frame.origin.y + CGFloat(arguments[1])
                ))
            } else if command.hasPrefix("restore") {
                externalApplication?.activate(options: [])
            } else if command.hasPrefix("stop") {
                NSApplication.shared.terminate(nil)
            }
        }
        if let expectedForeground {
            samples += 1
            let frontmost = NSWorkspace.shared.frontmostApplication
            let current = frontmost?.processIdentifier
            if current != expectedForeground {
                let helperIsFrontmost = frontmost?.bundleIdentifier == "local.codex.computer-use.standalone"
                if let current, protectedPIDs.contains(current) || helperIsFrontmost { focusViolations += 1 }
                else { externalFocusSamples += 1 }
            }
            if current != lastForeground {
                transitions.append(["kind": "foreground", "time": Date().timeIntervalSince1970, "pid": current ?? 0])
                lastForeground = current
            }
            if let point = CGEvent(source: nil)?.location {
                if hypot(point.x - baselinePointer.x, point.y - baselinePointer.y) > 0.5 { pointerViolations += 1 }
                if hypot(point.x - lastPointer.x, point.y - lastPointer.y) > 0.5 {
                    if transitions.count < 50 { transitions.append(["kind": "pointer", "time": Date().timeIntervalSince1970]) }
                    lastPointer = point
                }
            }
            if nativeWindowOrder() != baselineWindowOrder { windowOrderViolations += 1 }
            if expectedForeground == ProcessInfo.processInfo.processIdentifier,
               NSApplication.shared.keyWindow?.windowNumber != baselineKeyWindow { focusStateViolations += 1 }
        }
        if let output = environment["CUA_FIXTURE_OBSERVATION"], let data = try? JSONSerialization.data(withJSONObject: [
            "pid": ProcessInfo.processInfo.processIdentifier, "windowID": window.windowNumber,
            "frontmostPID": NSWorkspace.shared.frontmostApplication?.processIdentifier ?? 0,
            "windowX": window.frame.origin.x, "windowY": window.frame.origin.y,
            "guardWindowID": guardWindow.windowNumber, "guardText": guardInput.stringValue,
            "targetText": input.stringValue, "status": status.stringValue,
            "scrollOffset": scrollView.documentVisibleRect.origin.y,
            "scrollWheelEvents": scrollView.wheelEvents,
            "scrollWheelDelta": scrollView.lastWheelDelta,
            "appScrollWheelEvents": appScrollEvents,
            "keyWindowID": NSApplication.shared.keyWindow?.windowNumber ?? 0,
            "focusViolations": focusViolations, "pointerViolations": pointerViolations,
            "windowOrderViolations": windowOrderViolations, "samples": samples,
            "externalFocusSamples": externalFocusSamples,
            "protectedPIDs": protectedPIDs.sorted(),
            "mouseEvents": mouseEvents,
            "focusStateViolations": focusStateViolations,
            "transitions": transitions,
        ], options: [.sortedKeys]) {
            try? data.write(to: URL(fileURLWithPath: output), options: .atomic)
        }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
let delegate = FixtureDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
