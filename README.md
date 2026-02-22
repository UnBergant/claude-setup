# claude-setup

Version-controlled [Claude Code](https://claude.ai/code) configuration — custom hooks, slash commands, and project instructions from `~/.claude/`.

## What's inside

### `CLAUDE.md`

Project instructions loaded into every Claude Code session. Describes the repo purpose and workflow for syncing files back to `~/.claude/`.

### `hooks/my-statusline.js`

Custom statusline script in robbyrussell (oh-my-zsh) style. Displays:

- Green arrow + cyan directory name + git branch with colored dirty indicators (`+` unstaged, `*` staged)
- Session name (from `/rename` or auto-generated slug)
- Current model name
- Active task from todo list
- Context window usage as a progress bar with color thresholds (green → yellow → orange → skull)

### `commands/`

Custom slash commands (`.md` prompt templates) for Claude Code:

- **`/toxic-opinion`** — Second opinion via OpenAI Codex CLI. Claude analyzes the task, composes an adaptive prompt for Codex, runs it in sandbox mode, then synthesizes both AI opinions into a single recommendation with areas of agreement and disagreement.
- **`/toxic-review`** — Dual code review. Codex CLI and Claude independently review the same diff (uncommitted changes, branch, or specific commit), then findings are merged highlighting what both found (high confidence) vs unique findings from each reviewer.

## Usage

Files from this repo should be symlinked or copied to `~/.claude/`:

```bash
# example
ln -sf ~/Projects/AI/claude-setup/hooks/my-statusline.js ~/.claude/hooks/my-statusline.js
ln -sf ~/Projects/AI/claude-setup/commands/toxic-opinion.md ~/.claude/commands/toxic-opinion.md
ln -sf ~/Projects/AI/claude-setup/commands/toxic-review.md ~/.claude/commands/toxic-review.md
```

Ensure hook scripts are executable: `chmod +x hooks/*.js`.
