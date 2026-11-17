// Behaviour for the design options page (local preview only). See lab/pages.js.
// Each block below looks for its own markup and does nothing if it is not there.
import { $, $$, clamp, ticker } from '/assets/js/util.js';

/** D1. Bars over the reel: the one for the clip on screen fills up; click a bar to jump there. */
function initTimeline() {
  const root = $('[data-lab-timeline]');
  if (!root) return;
  const video = $('video', root);
  const buttons = $$('button[data-at]', root);
  const starts = buttons.map((b) => Number(b.dataset.at));
  const total = () => video.duration || 17.5;
  buttons.forEach((button, i) => {
    button.style.flexGrow = String((starts[i + 1] ?? 17.5) - starts[i]);
    button.addEventListener('click', () => {
      if (!video.getAttribute('src')) video.src = video.dataset.src;
      video.currentTime = starts[i] + 0.05;
      video.play().catch(() => {});
    });
  });
  ticker.add(() => {
    const t = video.currentTime || 0;
    buttons.forEach((button, i) => {
      const end = starts[i + 1] ?? total();
      button.style.setProperty('--p', clamp((t - starts[i]) / (end - starts[i]), 0, 1).toFixed(3));
      button.classList.toggle('is-on', t >= starts[i] && t < end);
    });
  });
}

initTimeline();
