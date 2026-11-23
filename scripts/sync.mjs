import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { scanPublicFiles } from './public-safety.mjs';

// Optional local maintenance helper; never needed to build or serve this site.
const args = process.argv.slice(2);
const message = args[args.indexOf('--message') + 1];
if (!args.includes('--message') || !message || message.startsWith('--')) throw new Error('Usage: npm run agent:sync -- --message "Describe the change"');
const run = (args, capture = false) => {
  const result = spawnSync('git', args, { encoding: 'utf8', stdio: capture ? 'pipe' : 'inherit' });
  if (result.status !== 0) throw new Error(`git ${args[0]} failed`);
  return result.stdout?.trim();
};
if (run(['branch', '--show-current'], true) !== 'main') throw new Error('This standalone Pages project syncs only its main branch.');
const remote = run(['remote', 'get-url', 'origin'], true);
if (!/^(https:\/\/github\.com\/zouphiel\/sideline(?:\.git)?|git@github\.com:zouphiel\/sideline(?:\.git)?)$/i.test(remote)) throw new Error('Refusing to sync an unexpected repository.');
if (run(['diff', '--cached', '--name-only'], true)) throw new Error('Existing staged work must be reviewed first.');
scanPublicFiles({ root: process.cwd() });
const allowed = JSON.parse(readFileSync('public-files.json', 'utf8'));
run(['add', '--', ...allowed.filter((path) => existsSync(path))]);
run(['update-index', '--chmod=+x', '--', '.githooks/pre-commit', '.githooks/pre-push']);
scanPublicFiles({ root: process.cwd(), mode: 'staged' });
if (run(['diff', '--cached', '--name-only'], true)) run(['commit', '-m', message]);
scanPublicFiles({ root: process.cwd(), mode: 'history' });
run(['push', '-u', 'origin', 'main']);
