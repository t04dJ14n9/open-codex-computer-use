import AppKit
import ApplicationServices
import Darwin

// Undocumented ABI and event recipes are adapted from the pinned MIT OCU
// implementation. Keep them isolated from the public-API observation layer.
final class BackgroundInput {
    private typealias Record = @convention(c) (UnsafeRawPointer?, UnsafePointer<UInt8>?) -> Int32
    private typealias Process = @convention(c) (pid_t, UnsafeMutableRawPointer?) -> Int32
    private typealias AXWindow = @convention(c) (AXUIElement, UnsafeMutablePointer<CGWindowID>) -> AXError
    private let sky = dlopen("/System/Library/PrivateFrameworks/SkyLight.framework/SkyLight", RTLD_LAZY | RTLD_LOCAL)
    private let services = dlopen("/System/Library/Frameworks/ApplicationServices.framework/ApplicationServices", RTLD_LAZY | RTLD_LOCAL)
    private let record: Record?
    private let process: Process?
    private let axWindow: AXWindow?
    let missingSymbols: [String]

    init() {
        record = Self.load(sky, "SLPSPostEventRecordTo")
        process = Self.load(services, "GetProcessForPID")
        axWindow = Self.load(services, "_AXUIElementGetWindow")
        missingSymbols = [
            (record != nil, "SLPSPostEventRecordTo"),
            (process != nil, "GetProcessForPID"), (axWindow != nil, "_AXUIElementGetWindow"),
        ].filter { !$0.0 }.map { $0.1 }
    }

    private static func load<T>(_ handle: UnsafeMutableRawPointer?, _ name: String) -> T? {
        guard let handle, let pointer = dlsym(handle, name) else { return nil }
        return unsafeBitCast(pointer, to: T.self)
    }

    func windowID(_ element: AXUIElement) -> CGWindowID? {
        guard let axWindow else { return nil }
        var id: CGWindowID = 0
        return axWindow(element, &id) == .success && id != 0 ? id : nil
    }

    func requireAvailable() throws {
        guard missingSymbols.isEmpty else {
            throw CUAError(message: "background_unavailable: missing private APIs: " + missingSymbols.joined(separator: ", "))
        }
    }

    func checkForeground(_ expected: pid_t, target: pid_t) throws {
        guard let current = NSWorkspace.shared.frontmostApplication?.processIdentifier,
              current == expected, current != target else {
            throw CUAError(message: "foreground_changed: background action stopped; no focus or pointer restoration is attempted")
        }
    }

    func begin(pid: pid_t, windowID: CGWindowID, foreground: pid_t) throws -> [UInt8] {
        try requireAvailable()
        try checkForeground(foreground, target: pid)
        var psn = [UInt8](repeating: 0, count: 8)
        let result = psn.withUnsafeMutableBytes { process!(pid, $0.baseAddress) }
        guard result == 0 else { throw CUAError(message: "background_unavailable: target process lookup failed (\(result))") }
        try activation(psn, windowID: windowID, focused: true)
        do {
            for kind in [UInt8(1), UInt8(2)] {
                var bytes = baseRecord(windowID)
                bytes[0x08] = kind
                bytes[0x3A] = 0x10
                for index in 0x20..<0x30 { bytes[index] = 0xFF }
                try sendRecord(psn, bytes)
            }
            try checkForeground(foreground, target: pid)
            return psn
        } catch {
            try? end(psn, pid: pid, windowID: windowID)
            throw error
        }
    }

    func end(_ psn: [UInt8], pid: pid_t, windowID: CGWindowID) throws {
        // Do not synthetically deactivate a window the user just foregrounded.
        if NSWorkspace.shared.frontmostApplication?.processIdentifier != pid {
            try activation(psn, windowID: windowID, focused: false)
        }
    }

    private func baseRecord(_ id: CGWindowID) -> [UInt8] {
        var bytes = [UInt8](repeating: 0, count: 0xF8)
        bytes[0x04] = 0xF8
        for index in 0..<4 { bytes[0x3C + index] = UInt8(truncatingIfNeeded: id >> (index * 8)) }
        return bytes
    }

    private func activation(_ psn: [UInt8], windowID: CGWindowID, focused: Bool) throws {
        var bytes = baseRecord(windowID)
        bytes[0x08] = 0x0D
        bytes[0x8A] = focused ? 1 : 2
        try sendRecord(psn, bytes)
    }

    private func sendRecord(_ psn: [UInt8], _ bytes: [UInt8]) throws {
        let result = psn.withUnsafeBytes { p in bytes.withUnsafeBufferPointer { b in record!(p.baseAddress, b.baseAddress) } }
        guard result == 0 else { throw CUAError(message: "background_unavailable: synthetic window record failed (\(result))") }
    }

}
