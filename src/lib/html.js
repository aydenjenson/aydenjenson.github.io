// Small HTML helpers used by every page template. No dependencies.

/** Escape text for safe use inside HTML (text nodes and attribute values). */
export function esc(value = '') {
  return String(value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

/**
 * Tagged template for writing HTML.
 *   html`<ul>${items.map((i) => html`<li>${esc(i)}</li>`)}</ul>`
 * Arrays are joined, and null / undefined / false render as nothing, so
 * `${condition && html`...`}` works. It does NOT escape: call esc() on text.
 */
export function html(strings, ...values) {
  let out = '';
  strings.forEach((s, i) => {
    out += s;
    if (i < values.length) out += flat(values[i]);
  });
  return out;
}

function flat(v) {
  if (v === null || v === undefined || v === false || v === true) return '';
  if (Array.isArray(v)) return v.map(flat).join('');
  return String(v);
}

/** "My Title — Here!" -> "my-title-here" */
export function slugify(text = '') {
  return String(text)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** 95 -> "1:35" */
export function clock(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, '0')}`;
}

/** 95 -> "PT1M35S" (ISO 8601 duration, used in structured data) */
export function isoDuration(seconds) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  const m = Math.floor(s / 60);
  return `PT${m ? `${m}M` : ''}${s % 60}S`;
}

/** 3 -> "03" */
export const pad2 = (n) => String(n).padStart(2, '0');

/** Wrap paragraphs: "a\n\nb" -> "<p>a</p><p>b</p>" (text is escaped). */
export function paragraphs(text = '', attrs = '') {
  return String(text)
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p${attrs ? ` ${attrs}` : ''}>${esc(p)}</p>`)
    .join('\n');
}
