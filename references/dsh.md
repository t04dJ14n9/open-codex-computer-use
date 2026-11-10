# DeepSeek Harness (DSH)

DSH loads Agent Skills from `~/.agents/skills/<name>/SKILL.md` and composes its
MCP servers from `~/.dsh/cordis.patch.yml` (a top-level YAML array of loader
patch entries). Both are user-level paths; this repository is the skill folder.

## Install

```sh
cd /path/to/open-codex-computer-use
node scripts/setup.mjs            # once: installs the locked MCP dependencies
node scripts/install.mjs --dsh    # links the skill and registers the MCP server
```

`--dsh` does three things:

1. Symlinks this checkout into
   `~/.agents/skills/open-codex-computer-use` (existing nonmatching paths are
   refused, not overwritten).
2. Appends one `- insert:` entry to `~/.dsh/cordis.patch.yml` that registers
   `codex-computer-use` as a stdio MCP client. The previous file is copied to
   `.local/installation-backup/<timestamp>/dsh-cordis.patch.yml`.
3. Leaves every other entry in that file untouched. Re-running the installer is
   idempotent: it detects `id: mcp-codex-computer-use` and does not duplicate it.

Environment overrides: `DSH_SKILLS_DIR` (skill directory),
`DSH_CONFIG_DIR` (DSH config root), `DSH_MCP_CONFIG_FILE` (exact patch file).

The registration written by the installer is equivalent to:

```yaml
- insert:
    - id: mcp-codex-computer-use
      name: '@deepseek-ai/dsh-mcp-client'
      config:
        serverName: codex-computer-use
        transport: stdio
        command: '/absolute/path/open-codex-computer-use/scripts/computer-use'
        args:
          - mcp
        env:
          CODEX_CUA_BACKEND: standalone
```

`CODEX_CUA_BACKEND=standalone` selects the source-built Swift helper; the
original Codex native daemon is not required and should not be used as the
default backend.

The installer appends to the live `cordis.patch.yml` rather than going through
DSH's config editor. It backs the file up first, requires a block-style
top-level `- insert:` list, and refuses other YAML shapes (flow arrays,
multi-document files, `!!js` expressions). If your patch file uses one of those
forms, add the entry manually with the snippet above instead. `cordis.patch.yml`
belongs to the user: review the installer's diff before keeping it. Set
`CUA_DSH_BACKUP_DIR` to choose where the backup is written; with
`DSH_CONFIG_DIR`/`DSH_MCP_CONFIG_FILE` set, backups are colocated with the
config by default.

## Tools

After the profile reloads, the server exposes four tools. In DSH their names
are prefixed with the server name:

| Tool | Purpose |
| --- | --- |
| `mcp__codex-computer-use__computer` | One operation: `list_apps`, `get_app_state`, `screenshot`, `click`, `press_key`, `type_text`, `scroll`, `set_value`, `select_text`, `perform_secondary_action` |
| `mcp__codex-computer-use__js` | Persistent JavaScript runtime with `cua` and `nodeRepl` loaded |
| `mcp__codex-computer-use__js_reset` | Reset the persistent JS session |
| `mcp__codex-computer-use__status` | Runtime paths, backend, helper and macOS permission state |

DSH sessions may use approval prompts for MCP tool calls. Approve the four
tools when prompted; this installer does not edit DSH permission policy. Read
[SKILL.md](../SKILL.md) for the operating procedure and
[operations.md](operations.md) for exact schemas.

## CLI fallback

If MCP tools are not available in a session, run the same operations through
the relocatable launcher relative to this skill's directory:

```sh
./scripts/computer-use status
./scripts/computer-use list-apps
./scripts/computer-use state Finder
./scripts/computer-use screenshot Finder finder.png
./scripts/computer-use computer '{"action":"get_app_state","app":"Finder"}'
```

Each CLI invocation starts a new session, so do not reuse a state index across
two CLI calls; use the MCP `js` tool (or `js --file`) to batch indexed actions.

## Verify

```sh
node scripts/verify-dsh.mjs   # skill link, patch YAML, live MCP tool list
node scripts/setup.mjs --check
./scripts/computer-use status
./scripts/computer-use list-apps
npm test                     # in scripts/codex-computer-use-mcp
```

`verify-dsh.mjs` is read-only: it checks the symlink, the `cordis.patch.yml`
entry, YAML syntax, and the four tools over a live stdio handshake, and exits
nonzero if any check fails.

`status` reports `backend: standalone`, `helperPresent: true`, and the macOS
permission state. `list_apps` returns the running apps as JSON when the helper
is functional. The MCP stdio handshake should list exactly
`computer, js, js_reset, status`.

DSH discovers the new skill folder live (it appeared in this session's skill
catalog immediately), but a new DSH session is required before the MCP tools
attach. Editing `cordis.patch.yml` does not retroactively attach servers to an
already running session.

## macOS permissions

Observation and input are background-only. macOS Accessibility and Screen
Recording are required for AX trees, window screenshots, clicks and typing;
grant them in System Settings for **Codex Computer Use Standalone**. Request
them with `./scripts/computer-use permissions --request` only when the user
needs setup, and never retry a denied grant in a loop. See
[setup.md](setup.md) for the rest of the permission and rebuild guidance.

## Limits

This is a finite reconstruction, not parity with the original OpenAI service.
`recovered-source/` holds the recovered shipped source material;
`.local/rea-evidence-bundle.json` (gitignored, 130 MB) holds the complete
reverse-engineering Evidence, indexed in
[recovered-source/REA-EVIDENCE.md](../recovered-source/REA-EVIDENCE.md). See
[RECOVERY-STATUS.md](../scripts/codex-computer-use-mcp/RECOVERY-STATUS.md) and
[recovered-source/RECOVERY-REPORT.md](../recovered-source/RECOVERY-REPORT.md).
