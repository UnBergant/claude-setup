# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This repository stores selected Claude Code configuration files from `~/.claude/`. Only explicitly chosen parts of the config are tracked here — it is not a full mirror of the `~/.claude/` directory.

## Possible contents

- `CLAUDE.md` — global instructions loaded into every Claude Code session
- `settings.json` — global settings (hooks, status line, permissions)
- `skills/` — custom skills (`<name>/SKILL.md` prompt templates)
- `hooks/` — lifecycle hooks and status line scripts (Node.js)
- `plugins/` — plugin registry and marketplace config

## Workflow

Files edited here should be symlinked or copied to `~/.claude/`. Ensure JSON files remain valid and hook scripts stay executable (`chmod +x`).
