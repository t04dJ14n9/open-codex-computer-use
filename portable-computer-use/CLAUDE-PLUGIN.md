# Claude Code plugin layout

This directory is **both** a standalone Agent Skill and a Claude Code plugin.
The plugin root is `portable-computer-use/` itself, so there is no duplicated
copy of the runtime, helper, docs or tests.

| Plugin component | Location | Notes |
| --- | --- | --- |
| Plugin manifest | `.claude-plugin/plugin.json` | name, metadata, inline MCP server, `userConfig.timeout_ms` |
| Marketplace | `../.claude-plugin/marketplace.json` | marketplace `open-codex-computer-use`, plugin source `./portable-computer-use` |
| Skill | `SKILL.md` | declared via `"skills": ["."]` — the plugin root itself |
| Slash command | `commands/status.md` | `/portable-computer-use:status`, read-only status report |
| MCP server | inline in `plugin.json` | `node ${CLAUDE_PLUGIN_ROOT}/src/cli.mjs mcp` |
| Runtime sources | `src/`, `native/`, `build/`, `scripts/`, `references/`, `porting/`, `test/` | unchanged from the standalone skill |
| Node dependencies | `package.json` + `package-lock.json` | Claude Code installs them with scripts disabled for plugins from a marketplace |

## MCP server registration

`plugin.json` declares the server inline:

```json
"mcpServers": {
  "portable-computer-use": {
    "command": "node",
    "args": ["${CLAUDE_PLUGIN_ROOT}/src/cli.mjs", "mcp"],
    "env": { "COMPUTER_USE_TIMEOUT_MS": "${user_config.timeout_ms}" }
  }
}
```

`${CLAUDE_PLUGIN_ROOT}` is substituted by Claude Code at load time, so the
server works whether the plugin is installed from GitHub or loaded from a local
path with `--plugin-dir`. `${user_config.timeout_ms}` is the value the user set
via `/plugin configure` (default `120000`). It maps to the
`COMPUTER_USE_TIMEOUT_MS` env var documented in [README.md](README.md#configurable-timeouts).

The four MCP tools are `computer`, `js`, `js_reset`, `status`, matching the
standalone skill's MCP server. There is no product host, `node_repl`, `@oai/*`
package, `CODEX_*` variable, XPC service or IPC socket.

## Validation

```sh
claude plugin validate .                        # marketplace at repo root
claude plugin validate ./portable-computer-use  # plugin
claude plugin validate ./portable-computer-use --strict
claude plugin validate ./portable-computer-use --profile directory
```

All four pass with zero manifest errors/warnings. `--profile directory` also
checks the README install line and license metadata; the manifest sets
`"license": "NOASSERTION"` because the repository contains recovered
proprietary reference material alongside newly authored code.

## Install

```sh
# From GitHub (marketplace name derives from owner/repo)
claude plugin marketplace add t04dJ14n9/open-codex-computer-use
/plugin install portable-computer-use --marketplace t04dJ14n9/open-codex-computer-use

# Or from a local checkout
claude plugin marketplace add /absolute/path/to/open-codex-computer-use
/plugin install portable-computer-use@open-codex-computer-use

# Or load just this directory for a session (no install)
claude --plugin-dir /absolute/path/to/open-codex-computer-use/portable-computer-use
```

After enabling, run `/reload-plugins` or start a new session. Then check
`/portable-computer-use:status` or the `status` MCP tool.

## Caveats

- **macOS permissions**: Accessibility is required for the AX tree; Screen
  Recording is required for screenshots. Grant them to the bundled
  `Computer Use Helper.app` in System Settings and restart the session. Plugin
  installs copy files into `~/.claude/plugins/cache/`, so a helper copied there
  is a new code identity and macOS may require the permission grant again.
- **Node dependencies**: for plugins loaded in place (`--plugin-dir` or a local
  relative-path marketplace) Claude Code does not run `npm ci` in the source
  directory. Run `npm ci --ignore-scripts` once in this directory, or install
  the plugin from the GitHub marketplace so dependencies are installed into the
  cache automatically.
- **Plugins vs skills**: the plugin is a *distribution wrapper* around the same
  `SKILL.md`. Using it through Claude Code does not change the skill's behavior,
  and the skill still works standalone with any other MCP-capable agent.
