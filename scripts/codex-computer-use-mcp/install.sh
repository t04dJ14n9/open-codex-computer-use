#!/bin/zsh
set -euo pipefail

root="${0:A:h}"
launcher="$root/bin/codex-computer-use-mcp"
name="codex-computer-use"

if [[ ! -x "$launcher" ]]; then
  print -u2 "Missing executable: $launcher"
  exit 1
fi

cli="${CLAUDE_CLI:-claude}"
if ! command -v "$cli" >/dev/null 2>&1; then
  print -u2 "Claude Code was not found: $cli"
  exit 1
fi

node_bin="${CODEX_CUA_NODE:-$(command -v node)}"
CLAUDE_CLI="$cli" "$node_bin" "$root/scripts/install-claude.mjs"

cat <<EOF
Installed $name for $cli.

Test it with:
  $cli mcp list
  $cli -p "/open-codex-computer-use List the running apps."

For an already-open session, restart $cli to load the new MCP tools and skill.
EOF
