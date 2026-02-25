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
│   └── my-statusline.js   # Custom statusline hook
└── skills/
    ├── toxic-opinion/
    │   └── SKILL.md
    └── toxic-review/
        └── SKILL.md
```

## Workflow

- `dotclaude/CLAUDE.md` contains global instructions that should be **merged** (not symlinked) into `~/.claude/CLAUDE.md`. This avoids leaking sensitive local config into the public repo.
- `hooks/` and `skills/` can be symlinked or copied to `~/.claude/`.
- Ensure JSON files remain valid and hook scripts stay executable (`chmod +x`).

## Documentation sync

When adding, removing, or renaming files in this repo, update **all three** places that describe the structure:

1. **`CLAUDE.md`** — the Structure tree above
2. **`README.md`** — the "What's inside" table and any related sections
3. **`dotclaude/CLAUDE.md`** — if the change affects global instructions or settings
