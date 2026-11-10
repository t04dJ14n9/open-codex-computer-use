# Client registration

This skill is a standard Agent Skill folder plus a stdio MCP server. Any agent
that can read `SKILL.md` and launch a stdio MCP server can use it. No product
host, signed runtime, account, IPC socket or environment variables are
required — only Node.js 20+ and the platform helper. macOS needs 14+ and grants;
Windows needs Python 3.8+ (`python`/`py`) and PowerShell; Linux needs Python
3.8+ (`python3`) plus optional `xdotool`/AT-SPI2/portal tools. See
[../native/crossplatform/README.md](../native/crossplatform/README.md).

## Universal MCP entry

Paste this into any MCP client's configuration (use absolute paths). Registering
`node src/cli.mjs mcp` instead of the `bin/computer-use` zsh wrapper is what
makes it work on Windows too:

```json
{
  "mcpServers": {
    "portable-computer-use": {
      "type": "stdio",
      "command": "/absolute/path/to/node",
      "args": ["/absolute/path/portable-computer-use/src/cli.mjs", "mcp"]
    }
  }
}
```

`scripts/install.mjs` writes this form automatically using `process.execPath`.

The server exposes `computer`, `js`, `js_reset`, `status` and a `computer-use`
prompt. In clients that prefix tool names they appear as
`mcp__portable-computer-use__computer`, `__js`, `__js_reset`, `__status`.

## Built-in targets

Run `node scripts/install.mjs <flags>` from this skill's directory. It links
the skill folder, merges the `mcpServers` entry without clobbering other
settings, backs up every file it changes under
`.local/installation-backup/`, and is idempotent.

| Client | Flag | Skill directory | MCP config | Notes |
| --- | --- | --- | --- | --- |
| Claude Code | `--claude [binary]` | `~/.claude/skills/portable-computer-use` | `~/.claude.json` | Also adds four `mcp__portable-computer-use__*` grants to `~/.claude/settings.local.json` |
| Codex | `--codex` | `$CODEX_HOME/skills/portable-computer-use` | — | Codex uses the CLI fallback; no MCP registration |
| DeepSeek Harness | `--dsh` | `~/.agents/skills/portable-computer-use` | `~/.dsh/cordis.patch.yml` | Appends one block-style `- insert:` entry |
| Cursor | `--cursor` | — | `~/.cursor/mcp.json` | |
| Windsurf | `--windsurf` | — | `~/.codeium/windsurf/mcp_config.json` | |
| Gemini CLI | `--gemini` | — | `~/.gemini/settings.json` | |
| Any client | `--generic /path/to/mcp.json` | — | exactly that file | Merges the universal entry |
| All six | `--all` | — | — | |
| Print only | `--print-config` | — | — | Prints the universal JSON, writes nothing |

Environment overrides for isolated testing (and for nonstandard installs):

| Variable | Selects |
| --- | --- |
| `CUA_CLAUDE_CONFIG_DIR` | Claude skill/config directory |
| `CUA_CLAUDE_CONFIG_FILE` | Claude MCP config file |
| `CODEX_HOME` / `CUA_CODEX_SKILLS_DIR` | Codex skills root / exact skills directory |
| `DSH_SKILLS_DIR` | DSH skills directory |
| `DSH_MCP_CONFIG_FILE` | DSH `cordis.patch.yml` path |
| `CUA_CURSOR_CONFIG_FILE` | Cursor config |
| `CUA_WINDSURF_CONFIG_FILE` | Windsurf config |
| `CUA_GEMINI_CONFIG_FILE` | Gemini config |
| `COMPUTER_USE_NODE` | Node binary used by `bin/computer-use` |
| `COMPUTER_USE_HELPER` | Alternate helper executable |
| `COMPUTER_USE_HELPER_ARGS` | Args for that executable (JSON array, e.g. a Python script) |
| `COMPUTER_USE_PYTHON` | Python interpreter for the Windows/Linux helper |
| `COMPUTER_USE_TIMEOUT_MS` | Master default (ms) for the helper + JS deadlines; restart the session after changing |
| `COMPUTER_USE_NATIVE_TIMEOUT_MS` | Helper request deadline (ms); overrides the master |
| `COMPUTER_USE_JS_TIMEOUT_MS` | JavaScript execution deadline (ms); overrides the master |
| `COMPUTER_USE_MAX_TIMEOUT_MS` | Ceiling for per-call `timeout_ms` (default 600000) |
| `COMPUTER_USE_STATUS_TIMEOUT_MS` | Deadline for the `status` probe |
| `COMPUTER_USE_CANCEL_GRACE_MS` | Grace before closing a cancelled helper |

`--help` prints every flag and the universal snippet.

## After installation

Start a **new session** (or reload the profile) in each client. Newly
registered MCP servers do not attach to an already-running session; the skill
folder itself is often discovered immediately.

Verify with:

```sh
node scripts/setup.mjs --check
node scripts/verify.mjs
npm test
```

## CLI fallback

Clients without MCP support can run the same operations directly:

```sh
./bin/computer-use status
./bin/computer-use list-apps
./bin/computer-use state Finder
./bin/computer-use screenshot Finder finder.png
./bin/computer-use js 'await cua.listApps()'
./bin/computer-use computer '{"action":"get_app_state","app":"Finder"}'
```

Each CLI invocation starts a new runtime session, so batch indexed actions with
`js --file` or use the MCP `js` tool.

## macOS permissions

Grant **Accessibility** and **Screen Recording** to the bundled helper
(`build/Computer Use Helper.app`) in System Settings → Privacy & Security.
`./bin/computer-use permissions --request` opens the prompts; a TCC change
usually requires relaunching the helper/MCP server. AX trees, screenshots,
clicks and typing are gated on those grants. The desktop must be unlocked for
meaningful window inspection and capture.
