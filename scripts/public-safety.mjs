import { lstatSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const MAX_BYTES = 5 * 1024 * 1024;
const freeDownloads = new Set(['assets/sideline-starter-guide.pdf']);
const historicalPublicFiles = new Set(['responsive-review.html']);
const ignoredLocalDirectories = new Set(['.git', 'node_modules', '.cache', 'coverage', 'test-results']);
const credentialPatterns = [
  ['private key', /-----BEGIN (?:[A-Z0-9]+ )*PRIVATE KEY-----/],
  ['GitHub credential', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b/],
  ['payment secret', /\b(?:(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{12,}|whsec_[A-Za-z0-9]{16,})\b/],
  ['AWS access key', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ['credential assignment', /\b(?:api[_-]?key|api[_-]?secret|client[_-]?secret|password|access[_-]?token)\s*["']?\s*[:=]\s*["'][A-Za-z0-9+/_=.-]{16,}["']/i],
];

function privatePath(path) {
  return path.split('/').some((part) => /^(?:\.env(?:\..*)?|private|paid|premium|secrets?|credentials?|customer[-_]?data|customers?|subscribers?|orders?|exports?|backups?|cookies?|transcripts?)(?:[._-].*)?$/i.test(part))
    || /\.(?:pem|key|p12|pfx|crt|cer|sqlite3?|db|csv|har)$/i.test(path);
}

export function pathProblem(path, allowed, history = false) {
  if (!/^[A-Za-z0-9_./-]+$/.test(path) || path.startsWith('/') || path.split('/').some((part) => !part || part === '.' || part === '..')) return 'invalid public path';
  if (privatePath(path)) return 'private-file category';
  if (/\.(?:pdf|zip|epub|mobi|mp4|mov|mp3|7z|tar|gz|docx?|xlsx?|pptx?)$/i.test(path) && !freeDownloads.has(path)) return 'unapproved download';
  if (!allowed.has(path) && !(history && historicalPublicFiles.has(path))) return 'file is not on the reviewed public list';
  return null;
}

export function contentProblems(bytes) {
  if (bytes.length > MAX_BYTES) return ['file exceeds the review size limit'];
  const text = bytes.toString('utf8');
  return credentialPatterns.filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
}

function git(root, args, optional = false) {
  const result = spawnSync('git', args, { cwd: root, maxBuffer: 16 * MAX_BYTES, timeout: 60000 });
  if (result.status !== 0) {
    if (optional) return null;
    // Never echo blob contents, command output, or matched credentials.
    throw new Error(`Cannot complete public safety check: git ${args[0]} failed.`);
  }
  return result.stdout;
}

function readPolicy(bytes) {
  let paths;
  try { paths = JSON.parse(bytes.toString('utf8')); } catch { throw new Error('The reviewed public file list is invalid JSON.'); }
  if (!Array.isArray(paths) || paths.some((path) => typeof path !== 'string') || new Set(paths).size !== paths.length || !paths.includes('public-files.json')) throw new Error('The reviewed public file list is invalid.');
  const allowed = new Set(paths);
  for (const path of paths) if (pathProblem(path, allowed)) throw new Error('The reviewed public file list contains a prohibited path.');
  return allowed;
}

function entries(bytes) {
  return bytes.toString('utf8').split('\0').filter(Boolean).map((entry) => {
    const match = entry.match(/^(\d+) (?:blob )?([a-f0-9]+)(?: (\d))?\t([\s\S]+)$/);
    if (!match) throw new Error('Cannot parse Git file metadata.');
    return { mode: match[1], hash: match[2], stage: match[3], path: match[4] };
  });
}

export function scanPublicFiles({ root, mode = 'worktree' }) {
  if (!['worktree', 'staged', 'history'].includes(mode)) throw new Error('Unknown public safety check mode.');
  const policyBytes = mode === 'worktree' ? readFileSync(join(root, 'public-files.json')) : git(root, ['show', mode === 'staged' ? ':public-files.json' : 'HEAD:public-files.json']);
  const allowed = readPolicy(policyBytes);
  const problems = new Set();
  const checkedContents = new Map();
  let files = 0;
  const inspect = (entry, read, history = false) => {
    files++;
    const issue = pathProblem(entry.path, allowed, history);
    if (issue) { problems.add(`${entry.path}: ${issue}`); return; }
    if (!['100644', '100755'].includes(entry.mode) || (entry.stage && entry.stage !== '0')) { problems.add(`${entry.path}: symlinks, submodules, or unresolved merges are prohibited`); return; }
    const cacheKey = entry.hash;
    let issues = cacheKey && checkedContents.get(cacheKey);
    if (!issues) {
      issues = contentProblems(read());
      if (cacheKey) checkedContents.set(cacheKey, issues);
    }
    for (const label of issues) problems.add(`${entry.path}: possible ${label}`);
  };

  if (mode === 'worktree') {
    const seen = new Set();
    const directories = new Set([...allowed].flatMap((path) => path.split('/').slice(0, -1).map((_, i, parts) => parts.slice(0, i + 1).join('/'))));
    const walk = (directory = '') => {
      for (const name of readdirSync(join(root, directory))) {
        if (!directory && ignoredLocalDirectories.has(name)) continue;
        const path = directory ? `${directory}/${name}` : name;
        const stat = lstatSync(join(root, path));
        if (stat.isDirectory() && !stat.isSymbolicLink()) {
          if (directories.has(path)) walk(path);
          else problems.add(`${path}/: directory is not on the reviewed public list`);
        } else {
          seen.add(path);
          inspect({ path, mode: stat.isFile() && !stat.isSymbolicLink() ? '100644' : '120000' }, () => stat.size > MAX_BYTES ? Buffer.alloc(MAX_BYTES + 1) : readFileSync(join(root, path)));
        }
      }
    };
    walk();
    for (const path of allowed) if (!seen.has(path)) problems.add(`${path}: reviewed public file is missing`);
    // Also catch tracked ignored files and Windows checkouts of Git symlinks.
    const tracked = git(root, ['ls-files', '--stage', '-z'], true);
    if (tracked) for (const entry of entries(tracked)) inspect(entry, () => git(root, ['cat-file', 'blob', entry.hash]));
  } else if (mode === 'staged') {
    const staged = entries(git(root, ['ls-files', '--stage', '-z']));
    const paths = new Set(staged.map((entry) => entry.path));
    for (const path of allowed) if (!paths.has(path)) problems.add(`${path}: reviewed public file is missing from the index`);
    for (const entry of staged) inspect(entry, () => git(root, ['cat-file', 'blob', entry.hash]));
  } else {
    if (git(root, ['rev-parse', '--is-shallow-repository']).toString().trim() !== 'false') throw new Error('Full Git history is required for the public safety history check.');
    const commits = git(root, ['rev-list', '--all']).toString().trim().split('\n').filter(Boolean);
    const inspected = new Set();
    for (const commit of commits) {
      for (const entry of entries(git(root, ['ls-tree', '-r', '-z', commit]))) {
        const key = `${entry.path}:${entry.mode}:${entry.hash}`;
        if (inspected.has(key)) continue;
        inspected.add(key);
        inspect(entry, () => git(root, ['cat-file', 'blob', entry.hash]), true);
      }
    }
  }
  if (problems.size) throw new Error(`Public safety check failed (${mode}):\n${[...problems].join('\n')}`);
  return { mode, files };
}
