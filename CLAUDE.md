# CLAUDE.md

Project-level instructions for this repository.

## Structure

```
claude-setup/
├── CLAUDE.md              # This file — project instructions for this repo
├── README.md
├── dotclaude/
│   ├── CLAUDE.md          # Global instructions to merge into ~/.claude/CLAUDE.md
│   └── settings.json      # Global permissions & settings for ~/.claude/settings.json
├── hooks/
│   ├── my-statusline.js   # Custom statusline hook
│   └── sync-agents-md.sh  # PostToolUse hook: sync AGENTS.md when CLAUDE.md changes
└── skills/
    ├── toxic-opinion/
    │   └── SKILL.md
    └── toxic-review/
        └── SKILL.md
```

## Workflow

- `dotclaude/CLAUDE.md` contains global instructions that should be **merged** (not symlinked) into `~/.claude/CLAUDE.md`. This avoids leaking sensitive local config into the public repo.
- `dotclaude/settings.json` should be **copied** (not symlinked) to `~/.claude/settings.json`. It contains permissions **and** hook registrations (e.g. `sync-agents-md.sh` as a PostToolUse hook on Edit/Write).
- `hooks/` and `skills/` should be **copied** (not symlinked) to `~/.claude/`. After updating files here, re-copy them to `~/.claude/`.
- Ensure JSON files remain valid and hook scripts stay executable (`chmod +x`).

## Post-pull sync check

After pulling from remote, diff repo files against the global config to detect drift:

- `dotclaude/settings.json` vs `~/.claude/settings.json`
- `hooks/*` vs `~/.claude/hooks/*`
- `skills/` vs `~/.claude/skills/`

If any files differ, copy the updated repo versions to `~/.claude/`. For `dotclaude/CLAUDE.md`, merge changes into `~/.claude/CLAUDE.md` instead of overwriting.

## Documentation sync

When adding, removing, or renaming files in this repo, update **all three** places that describe the structure:

1. **`CLAUDE.md`** — the Structure tree above
2. **`README.md`** — the "What's inside" table and any related sections
3. **`dotclaude/CLAUDE.md`** — if the change affects global instructions or settings
