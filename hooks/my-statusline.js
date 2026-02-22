#!/usr/bin/env node
// Custom Claude Code Statusline
// Shows: robbyrussell-style prompt (arrow + cyan dir + git) | model | task | context usage
// Based on gsd-statusline.js, without gsd:update notification

const fs = require('fs');
const path = require('path');
const os = require('os');

// Git branch with robbyrussell-style formatting: git:(branch) *+
function getGitInfo(dir) {
  try {
    const { execFileSync } = require('child_process');
    const opts = { cwd: dir, timeout: 150, stdio: ['pipe', 'pipe', 'pipe'] };
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], opts).toString().trim();
    const status = execFileSync('git', ['status', '--porcelain'], opts).toString();
    let hasStaged = false;
    let hasUnstaged = false;
    for (const line of status.split('\n')) {
      if (!line) continue;
      const idx = line[0];  // index column
      const wt = line[1];   // worktree column
      if (idx === '?' || wt === '?') { hasUnstaged = true; continue; }
      if (idx !== ' ' && idx !== '?') hasStaged = true;
      if (wt !== ' ' && wt !== '?') hasUnstaged = true;
    }
    // * = staged (uncommitted), + = unstaged/untracked
    const marks = (hasUnstaged ? '\x1b[33m+\x1b[0m' : '') + (hasStaged ? '\x1b[33m*\x1b[0m' : '');
    const marksDisplay = marks ? ` ${marks}` : '';
    return `\x1b[1;34mgit:(\x1b[31m${branch}\x1b[1;34m)\x1b[0m${marksDisplay}`;
  } catch (e) {
    return '';
  }
}

// Read JSON from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const model = data.model?.display_name || 'Claude';
    const dir = data.workspace?.current_dir || process.cwd();
    const session = data.session_id || '';
    const remaining = data.context_window?.remaining_percentage;

    // Context window display (shows USED percentage scaled to 80% limit)
    // Claude Code enforces an 80% context limit, so we scale to show 100% at that point
    let ctx = '';
    if (remaining != null) {
      const rem = Math.round(remaining);
      const rawUsed = Math.max(0, Math.min(100, 100 - rem));
      // Scale: 80% real usage = 100% displayed
      const used = Math.min(100, Math.round((rawUsed / 80) * 100));

      // Build progress bar (10 segments)
      const filled = Math.floor(used / 10);
      const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

      // Color based on scaled usage (thresholds adjusted for new scale)
      if (used < 63) {        // ~50% real
        ctx = ` \x1b[32m${bar} ${used}%\x1b[0m`;
      } else if (used < 81) { // ~65% real
        ctx = ` \x1b[33m${bar} ${used}%\x1b[0m`;
      } else if (used < 95) { // ~76% real
        ctx = ` \x1b[38;5;208m${bar} ${used}%\x1b[0m`;
      } else {
        ctx = ` \x1b[5;31m💀 ${bar} ${used}%\x1b[0m`;
      }
    }

    // Current task from todos
    let task = '';
    const homeDir = os.homedir();
    const todosDir = path.join(homeDir, '.claude', 'todos');
    if (session && fs.existsSync(todosDir)) {
      try {
        const files = fs.readdirSync(todosDir)
          .filter(f => f.startsWith(session) && f.includes('-agent-') && f.endsWith('.json'))
          .map(f => ({ name: f, mtime: fs.statSync(path.join(todosDir, f)).mtime }))
          .sort((a, b) => b.mtime - a.mtime);

        if (files.length > 0) {
          try {
            const todos = JSON.parse(fs.readFileSync(path.join(todosDir, files[0].name), 'utf8'));
            const inProgress = todos.find(t => t.status === 'in_progress');
            if (inProgress) task = inProgress.activeForm || '';
          } catch (e) {}
        }
      } catch (e) {
        // Silently fail on file system errors - don't break statusline
      }
    }

    // Session name from JSONL (custom-title or slug)
    let sessionName = '';
    if (session && dir) {
      try {
        const { execFileSync } = require('child_process');
        const projectKey = dir.replace(/\//g, '-');
        const jsonlFile = path.join(homeDir, '.claude', 'projects', projectKey, `${session}.jsonl`);
        if (fs.existsSync(jsonlFile)) {
          // Fast grep for custom-title (user-set name via /rename)
          try {
            const out = execFileSync('grep', ['-o', '"customTitle":"[^"]*"', jsonlFile], { timeout: 200 }).toString().trim();
            const lines = out.split('\n');
            const last = lines[lines.length - 1];
            const m = last.match(/"customTitle":"([^"]+)"/);
            if (m) sessionName = m[1];
          } catch (e) {}
          // Fallback: slug from last line with slug
          if (!sessionName) {
            try {
              const out = execFileSync('grep', ['-o', '"slug":"[^"]*"', jsonlFile], { timeout: 200, maxBuffer: 4096 }).toString().trim();
              const lines = out.split('\n');
              const last = lines[lines.length - 1];
              const m = last.match(/"slug":"([^"]+)"/);
              if (m) sessionName = m[1];
            } catch (e) {}
          }
        }
      } catch (e) {}
    }

    // Output — robbyrussell style: ➜  cyan-dir  git:(branch) ✗  │  model  │  [task]  │  ctx
    const dirname = path.basename(dir);
    const gitInfo = getGitInfo(dir);
    // robbyrussell arrow (green) + cyan dirname
    const arrow = `\x1b[1;32m\u279C\x1b[0m`;
    const cyanDir = `\x1b[36m${dirname}\x1b[0m`;
    const gitDisplay = gitInfo ? `  ${gitInfo}` : '';
    const nameDisplay = sessionName ? ` │ \x1b[35m${sessionName}\x1b[0m` : '';
    const modelDisplay = `\x1b[2m${model}\x1b[0m`;
    const prompt = `${arrow}  ${cyanDir}${gitDisplay}`;
    if (task) {
      process.stdout.write(`${prompt}${nameDisplay} │ ${modelDisplay} │ \x1b[1m${task}\x1b[0m${ctx}`);
    } else {
      process.stdout.write(`${prompt}${nameDisplay} │ ${modelDisplay}${ctx}`);
    }
  } catch (e) {
    // Silent fail - don't break statusline on parse errors
  }
});