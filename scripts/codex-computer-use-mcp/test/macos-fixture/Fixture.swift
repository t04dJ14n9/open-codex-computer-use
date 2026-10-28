import AppKit

final class FixtureDelegate: NSObject, NSApplicationDelegate {
    var window: NSWindow!
    let input = NSTextField(string: "")
    let status = NSTextField(labelWithString: "Ready")

    func applicationDidFinishLaunching(_ notification: Notification) {
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
        window.title = "Codex CUA Verification"
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
        status.frame = NSRect(x: 24, y: 28, width: 460, height: 24)
        status.setAccessibilityIdentifier("verification-status")
        window.contentView?.addSubview(title)
        window.contentView?.addSubview(input)
        window.contentView?.addSubview(button)
        window.contentView?.addSubview(status)
        window.makeKeyAndOrderFront(nil)
        window.makeFirstResponder(input)
        NSApplication.shared.activate(ignoringOtherApps: true)
    }

    @objc func verify() {
        status.stringValue = "Verified: " + input.stringValue
        let report = ["text": input.stringValue, "verified": true] as [String: Any]
        if let output = ProcessInfo.processInfo.environment["CUA_FIXTURE_RESULT"],
           let data = try? JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted]) {
            try? data.write(to: URL(fileURLWithPath: output), options: [.atomic])
        }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
let delegate = FixtureDelegate()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
