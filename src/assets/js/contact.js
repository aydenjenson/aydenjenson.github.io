// Contact form.
// With a Web3Forms key in content/site.json the message is sent straight to
// Ayden's inbox. Without a key, the form opens the visitor's own email app
// with the message filled in, so it still works.
import { $ } from './util.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function initContact() {
  const form = $('[data-form]');
  if (!form) return;
  const status = $('[data-form-status]', form);
  const button = $('button[type="submit"]', form);
  const loadedAt = Date.now();

  const say = (text, isError = false) => {
    status.textContent = text;
    status.classList.toggle('is-error', isError);
  };

  form.addEventListener('input', (event) => {
    const field = event.target.closest('.field');
    if (field) field.classList.remove('is-invalid');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Check the three required fields.
    let firstBad = null;
    ['name', 'email', 'message'].forEach((name) => {
      const input = form.elements[name];
      const value = input.value.trim();
      const ok = value.length > 0 && (name !== 'email' || EMAIL.test(value));
      input.closest('.field').classList.toggle('is-invalid', !ok);
      if (!ok && !firstBad) firstBad = input;
    });
    if (firstBad) {
      firstBad.focus();
      say('Please add your name, a valid email and a short message.', true);
      return;
    }

    const data = Object.fromEntries(new FormData(form));
    // Spam traps: a hidden checkbox only bots tick, and forms sent within two seconds of loading.
    if (data.botcheck || Date.now() - loadedAt < 2000) { say('Thanks. Your message is on its way.'); return; }
    delete data.botcheck;

    if (form.dataset.fallback === 'mailto' || !data.access_key) {
      const lines = [
        data.message,
        '',
        `Name: ${data.name}`,
        `Email: ${data.email}`,
        data.company ? `Business: ${data.company}` : '',
        data.project_type ? `Project: ${data.project_type}` : '',
      ].filter((line, i) => line || i === 1);
      const subject = `Project inquiry: ${data.project_type || 'video'}`;
      location.href = `mailto:${form.dataset.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
      say('Opening your email app with the message filled in. If nothing opens, email me directly.');
      return;
    }

    button.disabled = true;
    say('Sending…');
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) throw new Error(result.message || `Request failed (${response.status})`);
      form.reset();
      form.classList.add('is-sent');
      say('Thanks. Your message is on its way and I will be in touch soon.');
    } catch (error) {
      button.disabled = false;
      say(`That didn't send. Please email ${form.dataset.email} instead.`, true);
      console.error(error);
    }
  });
}
