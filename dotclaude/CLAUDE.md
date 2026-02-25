# Global Claude Code Instructions

<!-- Instructions to merge into ~/.claude/CLAUDE.md -->
<!-- Do NOT symlink — copy/merge manually to avoid exposing sensitive local config. -->

## Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

Format:
```
<type>(<scope>): <short description>
```

Types:
- `feat` — new feature
- `fix` — bug fix
- `docs` — documentation only
- `refactor` — code change that neither fixes a bug nor adds a feature
- `chore` — configs, dependencies, CI, tooling
- `style` — formatting, linting (not CSS)
- `test` — adding or updating tests
- `config` — configuration changes
- `deps` — dependency updates

Rules:
- English language only
- Lowercase after `:`
- No period at the end
- Imperative mood (present tense): `add`, `fix`, `update` — not `added`, `fixes`, `updated`
- Subject under 50 chars, hard limit ~72 chars
- Scope is optional, use when it adds clarity: `feat(auth):`, `fix(api):`
- Add a body only when the *why* isn't obvious from the subject
- Do not repeat the diff in the message — that's what `git show` is for
- Never add `Co-Authored-By` footer