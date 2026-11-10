# Provenance — shipped `computer-use` skill plugin

Source root (absolute):
`/Applications/ChatGPT.app/Contents/Resources/plugins/openai-bundled/plugins/computer-use/`

These three files are a **byte-for-byte** copy of the original skill plugin as
shipped inside the installed ChatGPT.app (build present on this machine):

- `skills/computer-use/SKILL.md` — full skill instructions, including the
  "Computer Use Confirmations Policy".
- `.codex-plugin/plugin.json` — plugin manifest.
- `assets/app-icon.png` — the plugin's 1024x1024 icon. This single binary asset
  is retained because the plugin snapshot is preserved verbatim; it is the only
  non-text file in `recovered-source/`.

License: **Proprietary**, per `.codex-plugin/plugin.json` (`"license":
"Proprietary"`, `"author": {"name": "OpenAI"}`).

Status: **reference-only**. The files are OpenAI's proprietary shipped material,
included so the recovered tree documents the exact instructions and plugin
metadata that the rest of this tree supports. They are not licensed for reuse or
redistribution as source code.
