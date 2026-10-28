# Open Codex Computer Use

A self-contained macOS agent skill with a CLI and stdio MCP server for Claude
Code and other MCP clients. The repo root is the skill folder; code and binaries
live under `scripts/`. Automatic skill discovery is enabled.

## Install

Requires macOS 14+ and Node.js 24.11+. The included native helper targets Apple
Silicon. Xcode Command Line Tools are needed only to rebuild (including Intel).
Git LFS is needed for the complete 203 MB accessibility WAT disassembly; the
runtime itself does not use that WAT file.

```sh
git lfs install
git clone https://github.com/t04dJ14n9/open-codex-computer-use.git
cd open-codex-computer-use
node scripts/setup.mjs
node scripts/install.mjs --claude claude --codex
./scripts/computer-use permissions --request
```

The installer links this complete folder into the selected clients' skill
directories, registers `codex-computer-use` in Claude's user MCP configuration,
and adds only its four
tool grants. Existing configuration is backed up in `.local/installation-backup/`.
Keep this checkout at its installed path. Restart existing client sessions.

Enable **Codex Computer Use Standalone** in macOS Accessibility and Screen
Recording when requested. The bundled app is ad-hoc signed, not notarized.
Verify the included hashes or rebuild from source before trusting the binary.

```sh
claude -p '/open-codex-computer-use List the running apps.'
./scripts/computer-use state Finder
./scripts/computer-use screenshot Finder finder.png
./scripts/computer-use status
```

Codex can discover `$open-codex-computer-use` and use the bundled CLI without
any extra MCP registration. Read [SKILL.md](SKILL.md) for the operational
workflow, [setup](references/setup.md) for manual MCP configuration and rebuilds,
and [operations](references/operations.md) for schemas and batch examples.

## Contents And Provenance

- `SKILL.md`, `agents/openai.yaml`: portable skill instructions and Codex metadata.
- `scripts/computer-use`: relocatable CLI/MCP launcher.
- `scripts/codex-computer-use-mcp/`: authored MCP/CLI, source supervisor, Swift
  native source, signed helper app, lockfile, and verification fixtures.
- `scripts/codex-computer-use-source/`: recovered shipped packages, embedded
  REPL JavaScript, browser derivatives, WASM disassembly, native analysis,
  original binaries, hashes, and retained third-party notices.

This is a functional reconstruction, not the complete original OpenAI source
repository or an official OpenAI project. Exact original Rust/Swift source and
pre-minification browser names remain unavailable. The working backend is
`standalone`; the original `codex`/`source` investigation routes are not the
verified default. See [recovery status](scripts/codex-computer-use-mcp/RECOVERY-STATUS.md).

The name does not grant redistribution rights. No blanket open-source license
is applied to recovered artifacts; original notices remain attached. Keep this
repo private unless redistribution rights are established. A public listing
or pull request to an awesome list is a separate action.

## Verify

```sh
node scripts/setup.mjs --check
cd scripts/codex-computer-use-mcp
npm test
```

The protocol test uses read-only app inspection and screenshots. The action
fixture test is `npm run test:actions` after launching the dedicated fixture
from `test/macos-fixture/`. It changes only that scratch window. Historical
verification evidence is retained in `test/`.

The full-folder skill was loaded by Claude Code on October 28, 2026. Its packaged
MCP passed app discovery, standalone status, and persistent JavaScript checks
without permission denials. Fresh GitHub clone and LFS hashes matched all 2,540
shipped files; setup passed from that clone. Installer tests confirmed unrelated
settings were preserved and repeated installation was idempotent.
The full UI test also passed after unlocking the desktop: Claude loaded the
packaged skill, clicked the scratch input, selected all, typed the exact marker,
clicked Verify, read the changed AX status, and received a 520x272 PNG. The
fixture independently wrote the same marker to its result file. No unrelated
tools or permission denials occurred.
See the [verification summary](references/verification.json) and
[verified screenshot](references/verified-skill-window.png). Local client
transcripts, profile paths, and unrelated app inventory are not included.

Generated analysis metadata uses symbolic roots instead of local filesystem
paths. Original shipped package bytes remain unchanged; third-party example
and upstream build-machine paths inside those artifacts are not local user
metadata. See `scripts/codex-computer-use-source/PUBLICATION-MANIFEST.json` for
the redacted metadata's current hashes and provenance limits.

These are finite fixture tests, not proof of full original-service parity.
An unlocked desktop is required to rerun UI tests; a locked console can fail
capture even when macOS permissions are granted.
