# claude-setup

Version-controlled [Claude Code](https://claude.ai/code) configuration — custom hooks, skills, and project instructions from `~/.claude/`.

## What's inside

| Path | Description |
|------|-------------|
| `CLAUDE.md` | Project-level instructions for this repo |
| `dotclaude/CLAUDE.md` | **Global** instructions to merge into `~/.claude/CLAUDE.md` |
| `dotclaude/settings.json` | **Global** permissions & settings for `~/.claude/settings.json` |
| `hooks/` | Lifecycle hooks and status line scripts (Node.js) |
| `skills/` | Custom skills (`<name>/SKILL.md` prompt templates) |

Only explicitly chosen parts of `~/.claude/` are tracked here — it is not a full mirror.

### `hooks/my-statusline.js`

Custom statusline script in robbyrussell (oh-my-zsh) style. Displays:

- Green arrow + cyan directory name + git branch with colored dirty indicators (`+` unstaged, `*` staged)
- Session name (from `/rename` or auto-generated slug)
- Current model name
- Active task from todo list
- Context window usage as a progress bar with color thresholds (green → yellow → orange → skull)

### `hooks/sync-agents-md.sh`

PostToolUse hook that triggers when `CLAUDE.md` is modified. Prompts Claude to read and update `AGENTS.md` to stay in sync, preserving AGENTS.md-specific differences (header, Codex references).

### `skills/`

Custom skills (`<name>/SKILL.md`) for Claude Code:

- **`/toxic-opinion`** — Second opinion via OpenAI Codex CLI. Claude analyzes the task, composes an adaptive prompt for Codex, runs it in sandbox mode, then synthesizes both AI opinions into a single recommendation with areas of agreement and disagreement.
- **`/toxic-review`** — Dual code review. Codex CLI and Claude independently review the same diff (uncommitted changes, branch, or specific commit), then findings are merged highlighting what both found (high confidence) vs unique findings from each reviewer.

## Usage

- `dotclaude/CLAUDE.md` — **merge** contents into `~/.claude/CLAUDE.md` (not symlinked, to keep sensitive local config private)
- `hooks/` and `skills/` — symlink or copy to `~/.claude/`:

```bash
# example
ln -sf ~/Projects/AI/claude-setup/hooks/my-statusline.js ~/.claude/hooks/my-statusline.js
ln -sf ~/Projects/AI/claude-setup/hooks/sync-agents-md.sh ~/.claude/hooks/sync-agents-md.sh
ln -sfn ~/Projects/AI/claude-setup/skills/toxic-opinion ~/.claude/skills/toxic-opinion
ln -sfn ~/Projects/AI/claude-setup/skills/toxic-review ~/.claude/skills/toxic-review
```

Ensure hook scripts are executable: `chmod +x hooks/*`.
