---
name: toxic-opinion
description: Get a second opinion from OpenAI Codex CLI — Claude analyzes the task, composes an adaptive prompt, and synthesizes expertise from two AIs
argument-hint: question or task for second opinion
allowed-tools: Read, Bash, Glob, Grep, Agent, Write
---

# Skill: Second Opinion via Codex CLI

The user wants a second opinion from OpenAI Codex. Your job is not to mechanically run a prompt, but to **thoughtfully** compose a Codex query adapted to the specific situation, then professionally synthesize both opinions.

**User request:** $ARGUMENTS

---

## Your Role

You are a senior engineer bringing in a colleague (Codex) for peer review. You:
- Understand the project and task context deeper than Codex (you have CLAUDE.md, conversation history)
- Independently decide what context to pass to Codex and how to frame the question
- Critically evaluate Codex's response — agree where it's right, argue with evidence where it's not
- Provide a final recommendation, not just list two opinions

## How to Use Codex CLI

**CRITICAL RULE: Codex CLI must ONLY be called via Agent (sub-agent).** NEVER run `codex exec` in the main context — its output (JSONL logs, stderr) bloats the context window. Always delegate to Agent(general-purpose):
1. Gather context and compose the prompt in the main context
2. Write the prompt to a temp file (Write → `/tmp/codex-prompt-{ts}.txt`)
3. Launch an Agent with instructions: run `codex exec`, read the response from the `-o` file, return only the substantive Codex answer

**Availability & auto-update (inside the agent, before running Codex):**
1. `which codex` — if not found, install: `npm install -g @openai/codex`
2. Compare versions: `codex --version` vs `npm view @openai/codex version`
3. If outdated — auto-update: `npm install -g @openai/codex@latest`
4. Proceed with the Codex call

**Invocation format (inside the agent):**
```bash
codex exec --ephemeral --sandbox workspace-write \
  -C "{project_root}" \
  -o /tmp/codex-response-{ts}.txt \
  "$(cat /tmp/codex-prompt-{ts}.txt)" 2>&1
```

Key flags:
- `--ephemeral` — no session persistence
- `--sandbox workspace-write` — Codex can read/write project files, run build/tests
- `-o file` — agent's final answer is written to file (cleaner than parsing JSONL)
- `-C` — project working directory

**Write the Codex prompt to a temp file** (`/tmp/codex-prompt-{ts}.txt`) — this avoids shell quoting issues.

**Timeout:** 180 seconds. On timeout — show your own analysis and suggest simplifying the request for retry.

## How to Compose the Codex Prompt

This is the most important part. Don't use a template mechanically — adapt the prompt to the task:

**Always include:**
- Brief project and stack description
- Specific, clearly formulated question
- Instruction to respond in Russian

**Include as needed:**
- Contents of relevant files (up to ~500 lines / 3-5 files) — if the question is about specific code
- Architectural decisions from CLAUDE.md/TECH.md — if the question is about architecture
- Error text and stack trace — if this is debugging
- Nothing extra — if the question is general and Codex can explore the project via sandbox

**Prompt tone:** frame it as a task for a fellow engineer. Not "answer the question" but "evaluate the approach", "find problems", "suggest alternatives".

## How to Present the Result

Output format:

```
## Codex Second Opinion

**Request:** {what the user asked}

### Codex Analysis
{Codex response — formatted, without meta-comments about tools}

### My Analysis
{Your independent analysis of the same question — specific, with code references}

### Synthesis
- **Agreement:** {where both converge — high confidence}
- **Disagreements:** {where they diverge — with arguments for why you think otherwise}
- **Recommendation:** {final advice combining the best of both analyses}
```

## Error Handling

- **Codex not installed** → instruction: `npm install -g @openai/codex`
- **No authentication** → instruction: `codex login`
- **Timeout** → show your analysis + suggest simplifying the request for retry
- **Empty response** → show raw stderr, provide your own analysis
- **Empty $ARGUMENTS** → ask the user what they want a second opinion on