---
name: toxic-review
description: Dual code review — Codex CLI + Claude analyze changes in parallel and merge findings
argument-hint: "[branch|sha|empty for uncommitted]"
allowed-tools: Agent
---

# Skill: Dual Code Review via Codex CLI

The user wants a code review from two AIs — Codex and Claude — with merged findings.

**User argument:** $ARGUMENTS

---

## IMPORTANT: Runs via sub-agent

This skill ALWAYS runs via `Agent(general-purpose)` to keep verbose Codex CLI output out of the main context.

Launch one `Agent(general-purpose)` with the prompt below. The agent does all the work and returns only the final result.

### Agent prompt:

```
Perform a dual code review: Codex CLI + your own.

**Scope:** $ARGUMENTS
Argument interpretation:
- Empty → uncommitted changes (`--uncommitted`, `git diff && git diff --cached`)
- Branch name → changes vs branch (`--base {branch}`, `git diff {branch}...HEAD`)
- Commit SHA → specific commit (`--commit {sha}`, `git show {sha}`)

**Step 1:** Validate the ref: `git rev-parse --verify {ref}`. If invalid or diff is empty — report it.

**Step 1.5: Auto-update Codex CLI.**
Compare versions: `codex --version` vs `npm view @openai/codex version`.
If outdated — run `npm install -g @openai/codex@latest` before proceeding.

**Step 2:** Run Codex review (timeout 180 sec):
```bash
codex exec review {flags} --ephemeral -o /tmp/codex-review-{ts}.txt 2>&1
```
IMPORTANT: Do NOT use the `-C` flag. Codex runs from the project working directory.
Read the result from `/tmp/codex-review-{ts}.txt`.

**Step 3:** Get the diff and perform your own review. Focus on:
- Correctness — logic errors, edge cases, bugs
- Security — injections, secrets, unsafe operations
- Performance — N+1, memory leaks
- Types — TypeScript type safety, any-casts
- Architecture — compliance with CLAUDE.md / TECH.md

**Step 4:** Return the result STRICTLY in this format:

## Dual Code Review

**Scope:** {what was reviewed}
**Files affected:** {N}

### Codex Review
{Codex response, formatted. If timeout — "Codex did not respond (timeout)"}

### My Review

#### Critical
{bugs, security — must fix}

#### Important
{design, performance, types — should fix}

#### Minor
{style, naming — optional}

### Merged Findings
- **Both found:** {high confidence}
- **Codex only:** {evaluate validity}
- **Mine only:** {evaluate validity}
- **Recommendation:** APPROVE / REQUEST CHANGES / discuss
```

## Error Handling

If the agent returns an error:
- **Codex not installed** → suggest: `npm install -g @openai/codex`
- **No authentication** → suggest: `codex login`
- **No changes** → inform the user
- **Invalid branch/SHA** → inform the user
