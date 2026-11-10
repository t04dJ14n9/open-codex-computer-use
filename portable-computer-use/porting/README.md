# Porting

Research and design for taking `portable-computer-use` beyond macOS.

| Document | Contents |
| --- | --- |
| [PORTING-RESEARCH.md](PORTING-RESEARCH.md) | Full research: Windows and Linux Wayland API mappings, permissions/signing, compositor support matrix, the background-only-input problem, prior art in this repo, phased plan, open questions, and 19 cited sources |
| [BACKEND-CONTRACT.md](BACKEND-CONTRACT.md) | The exact JSON-lines helper protocol a port must implement (methods, params, results, cancellation, capability negotiation, helper discovery) |

**Current status:** macOS backend is shipped and verified. The JS/MCP layers are
platform-neutral; [`src/backend.mjs`](../src/backend.mjs) detects the platform,
session type and helper, and reports `backendStatus: "not-implemented"` for
Windows/Wayland rather than pretending a helper exists. `scripts/setup.mjs
--check` and the `status` MCP tool surface that state to any agent.

The backend seam is verified by a **test-only** mock helper
([`test/mock-helper.mjs`](../test/mock-helper.mjs) +
[`test/portable-seam.mjs`](../test/portable-seam.mjs)): the real MCP server is
driven unchanged against a fake contract-compliant helper, so a future
Windows/Wayland helper can be validated in CI. `npm test` runs 25 checks across
three suites.

This is research, not a claim that Windows or Wayland helpers exist. No code in
`src/` fakes a non-macOS backend. Validate any future implementation on real
Windows and Linux VMs (see §6 open questions in the research document).
