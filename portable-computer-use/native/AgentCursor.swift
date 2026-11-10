import AppKit
import QuartzCore

@MainActor
final class AgentCursor {
    private let panel = AgentCursorPanel(contentRect: CGRect(x: 0, y: 0, width: 56, height: 56),
        styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
    private let glyph = AgentCursorView(frame: CGRect(x: 0, y: 0, width: 56, height: 56))
    private var point: CGPoint?
    private var windowID: CGWindowID?
    private var hideTimer: Timer?
    private(set) var frameCount = 0
    private(set) var moveCount = 0
    private(set) var phase = "hidden"
    private let enabled = ProcessInfo.processInfo.environment["CODEX_CUA_VISUAL_CURSOR"] != "0"

    init() {
        panel.isOpaque = false
        panel.title = "Computer Use Agent Cursor"
        panel.backgroundColor = .clear
        panel.hasShadow = false
        panel.ignoresMouseEvents = true
        panel.hidesOnDeactivate = false
        panel.isReleasedWhenClosed = false
        panel.collectionBehavior = [.transient, .ignoresCycle, .fullScreenAuxiliary]
        panel.contentView = glyph
    }

    var status: [String: Any] {
        ["enabled": enabled, "visible": panel.isVisible, "phase": phase,
         "frames": frameCount, "moves": moveCount, "panelWindowID": panel.windowNumber,
         "targetWindowID": windowID.map { $0 as Any } ?? NSNull(),
         "point": point.map { ["x": $0.x, "y": $0.y] as Any } ?? NSNull(),
         "clickThrough": panel.ignoresMouseEvents, "canBecomeKey": panel.canBecomeKey]
    }

    func move(to target: CGPoint, windowID id: CGWindowID, bounds: CGRect,
              check: () throws -> Void) async throws {
        guard enabled else { return }
        hideTimer?.invalidate()
        let start = windowID == id ? (point ?? target) : CGPoint(x: bounds.minX + 20, y: bounds.minY + 20)
        windowID = id
        phase = "moving"
        panel.alphaValue = 1
        panel.order(.above, relativeTo: Int(id))
        let dx = target.x - start.x
        let dy = target.y - start.y
        let distance = hypot(dx, dy)
        let duration = min(0.65, max(0.20, distance / 1400))
        let frames = max(12, Int(duration * 60))
        let bend = min(45, distance * 0.14)
        do {
            for step in 0...frames {
                try check()
                let t = Double(step) / Double(frames)
                let progress = t * t * (3 - 2 * t)
                let arc = sin(progress * .pi) * bend
                let normalX = distance > 0 ? -dy / distance : 0
                let normalY = distance > 0 ? dx / distance : 0
                let current = CGPoint(x: start.x + dx * progress + normalX * arc,
                                      y: start.y + dy * progress + normalY * arc)
                glyph.tilt = sin(t * .pi) * (dx >= 0 ? 0.16 : -0.16)
                place(current)
                try await Task.sleep(nanoseconds: 16_666_667)
            }
            moveCount += 1
            phase = "idle"
            glyph.tilt = 0
            place(target)
            scheduleHide()
        } catch {
            hide()
            throw error
        }
    }

    func press(_ down: Bool) {
        guard enabled else { return }
        glyph.pressed = down
        phase = down ? "pressed" : "idle"
        glyph.needsDisplay = true
        frameCount += 1
        if !down { scheduleHide() }
    }

    func hide() {
        hideTimer?.invalidate()
        panel.orderOut(nil)
        phase = "hidden"
        glyph.pressed = false
    }

    func image() -> NSBitmapImageRep? {
        guard let bitmap = glyph.bitmapImageRepForCachingDisplay(in: glyph.bounds) else { return nil }
        glyph.cacheDisplay(in: glyph.bounds, to: bitmap)
        return bitmap
    }

    private func place(_ value: CGPoint) {
        point = value
        let desktopTop = NSScreen.screens.first?.frame.maxY ?? 0
        panel.setFrameOrigin(CGPoint(x: value.x - 9, y: desktopTop - value.y - 47))
        glyph.needsDisplay = true
        frameCount += 1
    }

    private func scheduleHide() {
        hideTimer?.invalidate()
        hideTimer = Timer.scheduledTimer(withTimeInterval: 8, repeats: false) { [weak self] _ in
            MainActor.assumeIsolated { self?.hide() }
        }
    }
}

private final class AgentCursorPanel: NSPanel {
    override var canBecomeKey: Bool { false }
    override var canBecomeMain: Bool { false }
}

private final class AgentCursorView: NSView {
    var tilt: Double = 0
    var pressed = false
    override var isFlipped: Bool { true }

    override func draw(_ dirtyRect: NSRect) {
        NSGraphicsContext.saveGraphicsState()
        let transform = AffineTransform(translationByX: 9, byY: 9)
        var pose = transform
        pose.rotate(byRadians: CGFloat(tilt))
        pose.scale(pressed ? 0.82 : 1)
        (pose as NSAffineTransform).concat()
        let arrow = NSBezierPath()
        arrow.move(to: .zero)
        for p in [CGPoint(x: 0, y: 29), CGPoint(x: 8, y: 22), CGPoint(x: 14, y: 34),
                  CGPoint(x: 20, y: 31), CGPoint(x: 14, y: 19), CGPoint(x: 25, y: 19)] { arrow.line(to: p) }
        arrow.close()
        NSColor.systemTeal.setFill()
        arrow.fill()
        NSColor.white.setStroke()
        arrow.lineWidth = 2
        arrow.stroke()
        NSGraphicsContext.restoreGraphicsState()
        let badge = NSBezierPath(roundedRect: CGRect(x: 29, y: 30, width: 22, height: 18), xRadius: 4, yRadius: 4)
        NSColor.controlTextColor.setFill()
        badge.fill()
        ("AI" as NSString).draw(at: CGPoint(x: 32, y: 31), withAttributes: [
            .font: NSFont.systemFont(ofSize: 11, weight: .bold), .foregroundColor: NSColor.white,
        ])
    }
}
