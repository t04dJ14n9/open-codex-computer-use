#!/bin/zsh
set -euo pipefail

name="codex-computer-use"

cli="${CLAUDE_CLI:-claude}"
if ! command -v "$cli" >/dev/null 2>&1; then
  print -u2 "Claude Code was not found: $cli"
  exit 1
fi

"$cli" mcp remove --scope user "$name"
