// YouTube helpers. A project can give its video as a full link or a bare ID.

/**
 * Pull the 11-character video ID out of anything YouTube-ish:
 *   https://www.youtube.com/watch?v=AjwAc7Xz_D4
 *   https://youtu.be/AjwAc7Xz_D4?si=abc
 *   https://www.youtube.com/embed/AjwAc7Xz_D4
 *   https://www.youtube.com/shorts/AjwAc7Xz_D4
 *   AjwAc7Xz_D4
 * Returns '' when nothing matches.
 */
export function youtubeId(input = '') {
  const s = String(input).trim();
  if (!s) return '';
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|\/embed\/|\/shorts\/|\/live\/|\/v\/)([\w-]{11})/);
  return m ? m[1] : '';
}

export const youtubeWatchUrl = (id) => `https://www.youtube.com/watch?v=${id}`;
export const youtubeEmbedUrl = (id) => `https://www.youtube-nocookie.com/embed/${id}`;

/** Thumbnail straight from YouTube. Used only when there is no local poster. */
export const youtubeThumb = (id, size = 'maxresdefault') => `https://i.ytimg.com/vi/${id}/${size}.jpg`;
