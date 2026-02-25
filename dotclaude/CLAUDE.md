# Global Claude Code Instructions

<!-- Instructions to merge into ~/.claude/CLAUDE.md -->
<!-- Do NOT symlink — copy/merge manually to avoid exposing sensitive local config. -->

## Commit messages

- Use Conventional Commits: `feat:`, `fix:`, `style:`, `chore:`, `refactor:`, `docs:`, `config:`, `deps:`
- Use scopes when useful: `feat(statusline):`, `fix(auth):`
- Subject: imperative mood, under 50 chars, no trailing period
- Add a body only when the *why* isn't obvious from the subject
- Do not repeat the diff in the message — that's what `git show` is for
- Do not add `Co-Authored-By` lines
- Always write commit messages in English
