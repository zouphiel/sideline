import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../script.js', import.meta.url), 'utf8');
function setup({ kind = 'guide', endpoint = 'https://formspree.io/f/abcdwxyz', valid = true, response = { ok: true, json: async () => ({ ok: true }) }, error } = {}) {
  const status = { dataset: {}, textContent: '' };
  const success = { hidden: true };
  const button = { disabled: true, textContent: 'Submit' };
  const note = { hidden: false };
  const fallback = { hidden: false };
  const cta = { textContent: 'Course launch updates' };
  let handler, requests = 0, resets = 0;
  const form = {
    dataset: { signup: kind }, action: endpoint, hidden: true,
    parentElement: { querySelector: (selector) => selector === '.setup-note' ? note : fallback },
    querySelector: () => button, addEventListener: (_, listener) => { handler = listener; },
    reportValidity: () => valid, setAttribute() {}, removeAttribute() {}, reset: () => { resets++; },
  };
  vm.runInNewContext(source, {
    document: { querySelectorAll: (selector) => selector === '[data-year]' ? [] : selector === '[data-waitlist-cta]' ? [cta] : [form], getElementById: (id) => id === 'guide-success' ? success : status },
    URL, Date, AbortController, setTimeout: () => 1, clearTimeout() {},
    FormData: class { constructor(value) { this.form = value; } },
    fetch: async (_, options) => { requests++; assert.equal(options.method, 'POST'); assert.equal(options.headers.Accept, 'application/json'); if (error) throw error; return response; },
  });
  return { submit: () => handler({ preventDefault() {} }), status, success, button, note, fallback, form, cta, requests: () => requests, resets: () => resets };
}
test('placeholder endpoint never sends an email address or shows success', async () => {
  const page = setup({ endpoint: 'https://formspree.io/f/YOUR_FORM_ID' });
  await page.submit(); assert.equal(page.requests(), 0); assert.equal(page.success.hidden, true); assert.match(page.status.textContent, /not been sent or saved/); assert.equal(page.note.hidden, false);
  assert.equal(page.form.hidden, true); assert.equal(page.button.disabled, true); assert.equal(page.fallback.hidden, false);
});
test('invalid required inputs block submission', async () => {
  const page = setup({ valid: false }); await page.submit(); assert.equal(page.requests(), 0);
});
test('a confirmed guide signup reveals the PDF section', async () => {
  const page = setup(); await page.submit(); assert.equal(page.requests(), 1); assert.equal(page.success.hidden, false); assert.equal(page.status.dataset.state, 'success'); assert.equal(page.resets(), 1); assert.equal(page.button.disabled, false); assert.equal(page.note.hidden, true);
  assert.equal(page.form.hidden, false); assert.equal(page.fallback.hidden, true);
});
test('waitlist success does not pretend to purchase or reveal the guide', async () => {
  const page = setup({ kind: 'waitlist' }); await page.submit(); assert.equal(page.success.hidden, true); assert.match(page.status.textContent, /No payment has been taken/);
  assert.equal(page.cta.textContent, 'Join the course waitlist');
});
test('HTTP failure does not reveal the download or clear the form', async () => {
  const page = setup({ response: { ok: false, json: async () => ({ errors: [{ message: 'Rate limited' }] }) } }); await page.submit(); assert.equal(page.success.hidden, true); assert.equal(page.status.dataset.state, 'error'); assert.equal(page.resets(), 0); assert.equal(page.button.disabled, false);
});
test('unconfirmed or malformed responses do not create false success', async () => {
  for (const response of [{ ok: true, json: async () => ({}) }, { ok: true, json: async () => { throw new Error('Invalid JSON'); } }]) {
    const page = setup({ response }); await page.submit(); assert.equal(page.success.hidden, true); assert.equal(page.status.dataset.state, 'error');
  }
});
test('network failures and timeouts allow a later retry', async () => {
  for (const error of [new Error('Offline'), Object.assign(new Error('Timeout'), { name: 'AbortError' })]) {
    const page = setup({ error }); await page.submit(); assert.equal(page.success.hidden, true); assert.equal(page.status.dataset.state, 'error'); assert.equal(page.button.disabled, false);
  }
});
test('only Formspree HTTPS endpoints can receive a submission', async () => {
  for (const endpoint of ['https://example.com/f/abcd', 'http://formspree.io/f/abcd']) {
    const page = setup({ endpoint }); await page.submit(); assert.equal(page.requests(), 0);
  }
});
