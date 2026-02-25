# CLAUDE.md

Project-level instructions for this repository.

## Structure

```
claude-setup/
├── CLAUDE.md              # This file — project instructions for this repo
├── README.md
├── dotclaude/
│   └── CLAUDE.md          # Global instructions to merge into ~/.claude/CLAUDE.md
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
