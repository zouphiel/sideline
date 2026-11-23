'use strict';

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = new Date().getFullYear();
});

document.querySelectorAll('form[data-signup]').forEach((form) => {
  const kind = form.dataset.signup;
  const status = document.getElementById(`${kind}-status`);
  const button = form.querySelector('button[type="submit"]');
  const note = form.parentElement.querySelector('.setup-note');
  const fallback = form.parentElement.querySelector('[data-signup-fallback]');
  const endpoint = new URL(form.action);
  const configured = endpoint.origin === 'https://formspree.io' && /^\/f\/[a-zA-Z0-9]+$/.test(endpoint.pathname);

  // Unconnected forms never invite visitors to submit an email address.
  form.hidden = !configured;
  button.disabled = !configured;
  if (note) note.hidden = configured;
  if (fallback) fallback.hidden = configured;
  if (kind === 'waitlist' && configured) {
    document.querySelectorAll('[data-waitlist-cta]').forEach((link) => {
      link.textContent = 'Join the course waitlist';
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.dataset.state = '';
    status.textContent = '';

    if (!configured) {
      status.dataset.state = 'error';
      status.textContent = 'Signup is not connected yet. Your email has not been sent or saved. Please check back soon.';
      return;
    }
    if (!form.reportValidity() || button.disabled) return;

    const originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(endpoint.href, {
        method: 'POST', body: new FormData(form),
        headers: { Accept: 'application/json' }, signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error('Submission not confirmed');

      status.dataset.state = 'success';
      status.textContent = kind === 'guide'
        ? 'Thank you. Your guide request was received.'
        : 'Thank you. Your waitlist request was received. No payment has been taken.';
      if (kind === 'guide') document.getElementById('guide-success').hidden = false;
      form.reset();
    } catch (error) {
      status.dataset.state = 'error';
      status.textContent = error.name === 'AbortError'
        ? 'The request timed out, so we could not confirm your signup. Please try again later.'
        : 'We could not confirm your signup. Please check your connection and try again later.';
    } finally {
      clearTimeout(timeout);
      button.disabled = false;
      button.textContent = originalLabel;
      form.removeAttribute('aria-busy');
    }
  });
});
