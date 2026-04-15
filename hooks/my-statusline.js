#!/usr/bin/env node
// Custom Claude Code Statusline
// Shows: robbyrussell-style prompt (arrow + cyan dir + git) | model | task | context | rate limit | session time

const fs = require('fs');
const path = require('path');
const os = require('os');

// Git branch with robbyrussell-style formatting + file counts + push/pull
function getGitInfo(dir) {
  try {
    const { execFileSync } = require('child_process');
    const opts = { cwd: dir, timeout: 150, stdio: ['pipe', 'pipe', 'pipe'] };
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], opts).toString().trim();
    const status = execFileSync('git', ['status', '--porcelain'], opts).toString();
    let staged = 0;
    let unstaged = 0;
    for (const line of status.split('\n')) {
      if (!line) continue;
      const idx = line[0];
      const wt = line[1];
      if (idx === '?' || wt === '?') { unstaged++; continue; }
      if (idx !== ' ' && idx !== '?') staged++;
      if (wt !== ' ' && wt !== '?') unstaged++;
    }

    // Worktree detection: if --git-dir differs from --git-common-dir, we're in a worktree
    let wtLabel = '';
    try {
      const gitDir = execFileSync('git', ['rev-parse', '--git-dir'], opts).toString().trim();
      const commonDir = execFileSync('git', ['rev-parse', '--git-common-dir'], opts).toString().trim();
      const normGit = path.resolve(dir, gitDir);
      const normCommon = path.resolve(dir, commonDir);
      if (normGit !== normCommon) {
        const wtName = path.basename(gitDir);
        wtLabel = ` \x1b[1;36mwt:${wtName}\x1b[0m`;
      }
    } catch (e) {}

    let ahead = 0, behind = 0;
    try {
      const counts = execFileSync('git', ['rev-list', '--left-right', '--count', `${branch}...@{u}`], opts).toString().trim();
      const parts = counts.split('\t');
      ahead = parseInt(parts[0], 10) || 0;
      behind = parseInt(parts[1], 10) || 0;
    } catch (e) {}

    const segments = [];
    if (staged > 0) segments.push(`\x1b[1;33m+${staged}\x1b[0m`);
    if (unstaged > 0) segments.push(`\x1b[36m~${unstaged}\x1b[0m`);
    if (ahead > 0) segments.push(`\x1b[1;35m\u2191${ahead}\x1b[0m`);
    if (behind > 0) segments.push(`\x1b[1;31m\u2193${behind}\x1b[0m`);

    const extra = segments.length ? ` \x1b[2m[\x1b[0m${segments.join(' ')}\x1b[2m]\x1b[0m` : '';
    return `\x1b[1;34m(\x1b[31m${branch}\x1b[1;34m)\x1b[0m${wtLabel}${extra}`;
  } catch (e) {
    return '';
  }
}

// Format milliseconds as Xh Ym
function formatDuration(ms) {
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h${m}m`;
  return `${m}m`;
}

// Format token count: 215174 → "215k"
function formatTokens(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return `${n}`;
}

// Read JSON from stdin
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => input += chunk);
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input);
    const model = (data.model?.display_name || 'Claude').replace(/ \(.*\)$/, '');
    const dir = data.workspace?.current_dir || process.cwd();
    const session = data.session_id || '';
    const cw = data.context_window || {};

    // Context window: tokens + progress bar (10 segments, simple █░)
    let ctx = '';
    const remaining = cw.remaining_percentage;
    if (remaining != null) {
      const rawUsed = Math.max(0, Math.min(100, 100 - Math.round(remaining)));
      const used = Math.min(100, Math.round((rawUsed / 80) * 100));
      const filled = Math.floor(used / 10);
      const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(10 - filled);

      const sep = ` \x1b[2m│\x1b[0m `;
      if (used < 63) {
        ctx = `${sep}\x1b[32m${used}% ${bar}\x1b[0m`;
      } else if (used < 81) {
        ctx = `${sep}\x1b[33m${used}% ${bar}\x1b[0m`;
      } else if (used < 95) {
        ctx = `${sep}\x1b[38;5;208m${used}% ${bar}\x1b[0m`;
      } else {
        ctx = `${sep}\x1b[5;31m\uD83D\uDC80 ${used}% ${bar}\x1b[0m`;
      }
    }

    // Rate limit 5h: icon + percentage + time to reset
    let rl = '';
    const fiveHour = data.rate_limits?.five_hour;
    if (fiveHour) {
      const pct = Math.round(fiveHour.used_percentage || 0);
      let timeLeft = '';
      if (fiveHour.resets_at) {
        const msLeft = fiveHour.resets_at * 1000 - Date.now();
        if (msLeft > 0) timeLeft = ` \uD83D\uDD52 ${formatDuration(msLeft)}`;
      }
      // Color: green <50, yellow 50-75, orange 75-90, red >90
      let color;
      if (pct < 50) color = '32';       // green
      else if (pct < 75) color = '33';   // yellow
      else if (pct < 90) color = '38;5;208'; // orange
      else color = '31';                 // red
      rl = ` \x1b[2m│\x1b[0m \x1b[${color}m\u26A1 ${pct}%${timeLeft}\x1b[0m`;
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
      } catch (e) {}
    }

    // Output
    const dirname = path.basename(dir);
    const gitInfo = getGitInfo(dir);
    const arrow = `\x1b[1;32m\u279C\x1b[0m`;
    const cyanDir = `\x1b[36m${dirname}\x1b[0m`;
    const gitDisplay = gitInfo ? ` \x1b[2m│\x1b[0m ${gitInfo}` : '';
    const modelDisplay = `\x1b[2m${model}\x1b[0m`;
    const prompt = `${arrow}  ${cyanDir}${gitDisplay}`;
    if (task) {
      process.stdout.write(`${prompt} \x1b[2m│\x1b[0m \x1b[1m${task}\x1b[0m${ctx}${rl} \x1b[2m│\x1b[0m ${modelDisplay}`);
    } else {
      process.stdout.write(`${prompt}${ctx}${rl} \x1b[2m│\x1b[0m ${modelDisplay}`);
    }
  } catch (e) {
    // Silent fail
  }
});
