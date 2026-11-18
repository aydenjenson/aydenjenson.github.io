// Font options (A11), preview only.
//   1. On /lab/fonts/: sizes every name lockup so all names are exactly the same width.
//   2. On /lab/fonts/name-N/: scales the real home page's name so it is as wide as it is with
//      the current font, then fires a resize so the site's own script re-fits the small line.

const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));

/** Wait until the fonts the page is using have finished loading (with a time limit, in case the internet is off). */
async function fontsReady() {
  if (!document.fonts) return;
  void document.body.offsetWidth; // make the browser notice which fonts are in use
  await nextFrame();
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 6000))]);
}

/* ---- the options page ---- */

function fitLockups() {
  document.querySelectorAll('[data-fo-lock]').forEach((lock) => {
    const name = lock.querySelector('.fo-lock__name');
    if (!name) return;
    const box = lock.clientWidth;
    if (!box) return;
    name.style.fontSize = '100px';
    const w = name.getBoundingClientRect().width;
    if (!w) return;
    name.style.fontSize = `${((100 * box) / w).toFixed(2)}px`;
    lock.style.setProperty('--w', `${box}px`);
    lock.style.setProperty('--ls', `${Math.max(8, Math.min(12, box * 0.03)).toFixed(1)}px`);
  });
}

async function startOptionsPage() {
  await fontsReady();
  fitLockups();
  if (document.fonts) document.fonts.addEventListener('loadingdone', fitLockups);
  let timer;
  window.addEventListener('resize', () => { clearTimeout(timer); timer = setTimeout(fitLockups, 100); });
}

/* ---- the live home page with a name font applied ---- */

function measure(text, style) {
  const span = document.createElement('span');
  span.textContent = text;
  span.setAttribute('aria-hidden', 'true');
  span.style.cssText = `position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font-size:100px;line-height:1;${style}`;
  document.body.appendChild(span);
  const w = span.getBoundingClientRect().width;
  span.remove();
  return w;
}

async function startLivePage(cfgEl) {
  let cfg;
  try { cfg = JSON.parse(cfgEl.textContent); } catch { return; }
  const title = document.querySelector('.hero__title');
  const nameBtn = document.querySelector('.hero__name');
  if (!title || !nameBtn) return;

  // The size rule as the site sets it (a clamp), remembered so it is never stacked twice.
  const base = title.dataset.foBase || getComputedStyle(title).getPropertyValue('--name-size').trim();
  title.dataset.foBase = base;
  const text = nameBtn.textContent.replace(/\s+/g, ' ').trim();

  async function apply() {
    // The current name: Inter Tight 600 in capitals, the rule in main.css before this preview changed it.
    const current = measure(text, "font-family:'Inter Tight','Helvetica Neue',Arial,sans-serif;font-weight:600;letter-spacing:-0.01em;text-transform:uppercase;");
    const mine = measure(text, `font-family:'${cfg.family}','Helvetica Neue',Arial,sans-serif;font-weight:${cfg.weight};font-stretch:${cfg.stretch};letter-spacing:${cfg.ls};text-transform:${cfg.transform};`);
    if (!current || !mine) return;
    const k = current / mine;
    title.style.setProperty('--name-size', `calc(${base} * ${k.toFixed(4)})`);
    window.dispatchEvent(new Event('resize'));
  }

  await fontsReady();
  await apply();
  // Late-arriving fonts change the measurements: do it again.
  if (document.fonts) document.fonts.addEventListener('loadingdone', apply);
}

const live = document.getElementById('fo-live');
if (live) startLivePage(live);
else if (document.querySelector('[data-fo-page]')) startOptionsPage();
