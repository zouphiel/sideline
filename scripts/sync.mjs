import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

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
const allowed = ['index.html', 'privacy.html', 'terms.html', 'disclaimer.html', 'styles.css', 'script.js', 'assets/favicon.svg', 'assets/sideline-starter-guide.pdf', '.nojekyll', '.gitignore', '.gitattributes', 'README.md', 'package.json', 'scripts/check-site.mjs', 'scripts/signup.test.mjs', 'scripts/sync.mjs'];
run(['add', '--', ...allowed.filter((path) => existsSync(path))]);
if (run(['diff', '--cached', '--name-only'], true)) run(['commit', '-m', message]);
run(['push', '-u', 'origin', 'main']);
