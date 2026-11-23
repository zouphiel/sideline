import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { contentProblems, pathProblem, scanPublicFiles } from './public-safety.mjs';

// Assemble synthetic canaries so no realistic credential is stored in Git.
const canary = () => ['gh', 'p_', 'A'.repeat(36)].join('');
const policy = ['public-files.json', 'script.js'];
function fixture(t, useGit = false) {
  const root = mkdtempSync(join(tmpdir(), 'sideline-public-safety-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (path, data) => { mkdirSync(dirname(join(root, path)), { recursive: true }); writeFileSync(join(root, path), data); };
  const git = (...args) => {
    const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
    assert.equal(result.status, 0, `fixture git ${args[0]} failed`);
  };
  write('public-files.json', JSON.stringify(policy));
  write('script.js', '// Public storefront\n');
  if (useGit) {
    git('init', '--quiet');
    git('config', '--local', 'user.name', 'Sideline Test');
    git('config', '--local', 'user.email', 'test@example.invalid');
    // Fixtures deliberately contain synthetic bad commits; isolate their hooks.
    mkdirSync(join(root, '.git', 'fixture-hooks'));
    git('config', '--local', 'core.hooksPath', '.git/fixture-hooks');
  }
  const commit = () => { git('add', '-A'); git('commit', '--quiet', '-m', 'Synthetic fixture'); };
  return { root, write, git, commit };
}

test('only the deliberately free PDF is an approved downloadable asset', () => {
  const allowed = new Set(['assets/sideline-starter-guide.pdf', 'assets/course.pdf']);
  assert.equal(pathProblem('assets/sideline-starter-guide.pdf', allowed), null);
  assert.equal(pathProblem('assets/course.pdf', allowed), 'unapproved download');
  assert.ok(pathProblem('../outside.txt', allowed));
});

test('private paths cannot be approved by editing the manifest', () => {
  for (const path of ['.env', '.env.local', 'paid/course.txt', 'customer-data/list.json', 'orders.csv', 'signing.key', 'cookies.json']) {
    assert.equal(pathProblem(path, new Set([path])), 'private-file category');
  }
});

test('credential checks distinguish public payment keys and redact secret values', (t) => {
  const { root, write } = fixture(t);
  write('script.js', `const value = '${canary()}';`);
  assert.throws(() => scanPublicFiles({ root }), (error) => error.message.includes('GitHub credential') && !error.message.includes(canary()));
  assert.deepEqual(contentProblems(Buffer.from(['pk', '_live_', 'B'.repeat(24)].join(''))), []);
  assert.deepEqual(contentProblems(Buffer.from(['sk', '_test_', 'B'.repeat(24)].join(''))), ['payment secret']);
  assert.deepEqual(contentProblems(Buffer.from(['-----BEGIN ', 'PRIVATE KEY-----'].join(''))), ['private key']);
});

test('unexpected files are rejected even when they are not staged', (t) => {
  const { root, write } = fixture(t);
  write('unreviewed.txt', 'Not approved for publication');
  assert.throws(() => scanPublicFiles({ root }), /not on the reviewed public list/);
});

test('an invalid public manifest cannot approve a paid file', (t) => {
  const { root, write } = fixture(t);
  write('public-files.json', JSON.stringify([...policy, 'course.pdf']));
  assert.throws(() => scanPublicFiles({ root }), /prohibited path/);
});

test('symlinks are rejected before their target is read', (t) => {
  const { root, write } = fixture(t, true);
  // An index symlink fixture works on Windows without symlink privileges.
  write('target-path.txt', '../outside-secret');
  const blob = spawnSync('git', ['hash-object', '-w', 'target-path.txt'], { cwd: root, encoding: 'utf8' });
  assert.equal(blob.status, 0);
  rmSync(join(root, 'target-path.txt'));
  spawnSync('git', ['add', 'public-files.json'], { cwd: root });
  const indexed = spawnSync('git', ['update-index', '--add', '--cacheinfo', `120000,${blob.stdout.trim()},script.js`], { cwd: root });
  assert.equal(indexed.status, 0);
  assert.throws(() => scanPublicFiles({ root, mode: 'staged' }), /symlinks/);
});

test('staged checks read the index even when the working file looks clean', (t) => {
  const { root, write, git } = fixture(t, true);
  write('script.js', `const value = '${canary()}';`);
  git('add', 'public-files.json', 'script.js');
  write('script.js', '// Clean working copy\n');
  assert.throws(() => scanPublicFiles({ root, mode: 'staged' }), /GitHub credential/);
});

test('history checks catch a secret after a later commit removes it', (t) => {
  const { root, write, commit } = fixture(t, true);
  write('script.js', `const value = '${canary()}';`);
  commit();
  write('script.js', '// Secret removed from the latest version\n');
  commit();
  assert.doesNotThrow(() => scanPublicFiles({ root }));
  assert.throws(() => scanPublicFiles({ root, mode: 'history' }), /GitHub credential/);
});

test('the old public QA page is allowed only in history', (t) => {
  const { root, write, commit } = fixture(t, true);
  write('responsive-review.html', '<p>Public viewport review</p>');
  commit();
  assert.throws(() => scanPublicFiles({ root }), /not on the reviewed public list/);
  rmSync(join(root, 'responsive-review.html'));
  commit();
  assert.doesNotThrow(() => scanPublicFiles({ root, mode: 'history' }));
});

test('a clean reviewed tree passes both staged and history checks', (t) => {
  const { root, git, commit } = fixture(t, true);
  git('add', '-A');
  assert.doesNotThrow(() => scanPublicFiles({ root, mode: 'staged' }));
  commit();
  assert.doesNotThrow(() => scanPublicFiles({ root, mode: 'history' }));
});
