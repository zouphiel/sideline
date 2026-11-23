import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const pages = ['index.html', 'privacy.html', 'terms.html', 'disclaimer.html'];
let links = 0;
for (const page of pages) {
  const html = readFileSync(resolve(root, page), 'utf8');
  assert.match(html, /<!doctype html>/i, `${page}: HTML doctype`);
  assert.match(html, /<html lang="en">/, `${page}: document language`);
  assert.match(html, /name="viewport"/, `${page}: responsive viewport`);
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${page}: one main heading`);
  assert.doesNotMatch(html, /OWNER_NAME|OWNER_COUNTRY|CONTACT_EMAIL/, `${page}: no unfinished identity placeholders`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(ids.length, new Set(ids).size, `${page}: unique IDs`);
  // Comments may contain the intentionally disabled future store link.
  const activeHTML = html.replace(/<!--[\s\S]*?-->/g, '');
  for (const [, value] of activeHTML.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:)/.test(value)) continue;
    assert.ok(!value.startsWith('/'), `${page}: site asset must use a relative path: ${value}`);
    const [relativeURL, hash] = value.split('#');
    const path = relativeURL.split('?')[0];
    const target = path ? resolve(dirname(resolve(root, page)), path) : resolve(root, page);
    assert.ok(target.startsWith(root), `${page}: path outside site`);
    assert.ok(existsSync(target), `${page}: missing ${value}`);
    if (hash) assert.ok(readFileSync(target, 'utf8').includes(`id="${hash}"`), `${page}: missing anchor ${value}`);
    links++;
  }
}
const home = readFileSync(resolve(root, 'index.html'), 'utf8');
assert.match(home, /<title>Sideline/);
assert.match(home, /property="og:title"/);
assert.match(home, /property="og:description"/);
const schema = JSON.parse(home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
assert.equal(schema['@type'], 'Organization');
assert.equal(schema.name, 'Sideline');
assert.equal(schema.founder.name, 'Zouphiel');
if (schema.email) assert.match(schema.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Optional structured-data email must be real');
for (const id of ['products', 'course', 'about', 'free-guide', 'waitlist', 'faq', 'contact']) assert.ok(home.includes(`id="${id}"`));
assert.equal((home.match(/data-signup=/g) || []).length, 2);
assert.equal((home.match(/<button[^>]*type="submit"[^>]*\bdisabled/g) || []).length, 2, 'HTML submission stays disabled without JavaScript safeguards');
assert.equal((home.match(/<form[^>]*data-signup="[^"]+"[^>]*\bhidden/g) || []).length, 2, 'Unconfigured email forms start hidden');
assert.match(home, /<a class="button button-dark" href="assets\/sideline-starter-guide\.pdf" download>/, 'Free guide is a working direct download without signup or JavaScript');
new vm.Script(readFileSync(resolve(root, 'script.js'), 'utf8'));
const css = readFileSync(resolve(root, 'styles.css'), 'utf8');
assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length, 'CSS braces');
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /max-width:720px/);
assert.match(css, /focus-visible/);
const pdf = readFileSync(resolve(root, 'assets/sideline-starter-guide.pdf'), 'utf8');
assert.ok(pdf.startsWith('%PDF-1.4'));
const xref = Number(pdf.match(/startxref\n(\d+)/)[1]);
assert.equal(pdf.slice(xref, xref + 4), 'xref', 'PDF cross-reference offset');
assert.match(pdf, /\/Count 3\b/, 'Three-page starter guide');
assert.match(pdf, /My learning worksheet/);
assert.doesNotMatch(pdf, /[Pp]laceholder/);
console.log(`Static checks passed: ${pages.length} pages, ${links} internal links/assets, structured data, JS, responsive CSS, and PDF.`);
const tests = spawnSync(process.execPath, ['scripts/signup.test.mjs'], { cwd: root, stdio: 'inherit' });
if (tests.status !== 0) process.exit(tests.status || 1);
if (home.includes('YOUR_FORM_ID')) console.log('Email signup is intentionally inactive; the free guide is available as a direct download.');
