---
description: Show portable-computer-use runtime status, permissions and effective timeouts (read-only)
---

Use the `portable-computer-use` MCP `status` tool and report concisely:

- platform, native backend and `backendStatus`
- whether the helper binary is present
- `permissions.accessibility` and `permissions.screenRecording`
- the effective `timeouts` block (native, js, max, status, cancel grace)
- any `permissionError`

If Screen Recording or Accessibility is false, tell the user to grant it in
System Settings > Privacy & Security and restart the session. Do not request
permissions or interact with app windows — this command is read-only.
