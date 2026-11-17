// Project page player.
//   data-mode="file"     a film hosted on the site: plays on arrival (muted),
//                        with the site's own controls that fade while it plays.
//   data-mode="youtube"  poster + play button; pressing it loads the standard
//                        YouTube player. We never draw anything over that player.
import { $, clamp, clock, setChars, ticker } from './util.js';

export default function initFilm() {
  const root = $('[data-film]');
  if (!root) return;
  if (root.dataset.mode === 'youtube') initYouTube(root);
  else initFile(root);
}

/* ----------------------------------------------------------------- YouTube ---- */

function initYouTube(root) {
  const button = $('[data-film-play]', root);
  const holder = $('[data-film-embed]', root);
  if (!button || !holder) return;

  button.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(holder.dataset.yt)}?autoplay=1&rel=0&playsinline=1`;
    iframe.title = holder.dataset.title || 'Video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    holder.append(iframe);
    root.classList.add('is-started');
    iframe.focus();
  }, { once: true });
}

/* ------------------------------------------------------------- hosted film ---- */

function initFile(root) {
  const stage = $('[data-film-stage]', root);
  const video = $('[data-film-video]', root);
  if (!stage || !video) return;

  const toggleBtn = $('[data-film-toggle]', root);
  const muteBtn = $('[data-film-mute]', root);
  const fsBtn = $('[data-film-fs]', root);
  const soundBtn = $('[data-film-sound]', root);
  const timeEl = $('[data-film-time]', root);
  const progress = $('[data-film-progress]', root);
  const fill = $('[data-film-fill]', root);
  const buffer = $('[data-film-buffer]', root);

  // Our controls take over from the browser's.
  video.controls = false;
  video.muted = true;
  video.loop = true;
  video.setAttribute('muted', '');

  let idleTimer;
  let hadSound = false;
  let pausedByScroll = false;

  const label = (el, text) => {
    if (!el || el.dataset.label === text) return;
    el.dataset.label = text;
    setChars(el, text);
  };
  // The "Play with sound" prompt steps aside after a while; the bar keeps a Sound button.
  setTimeout(() => root.classList.add('hint-off'), 9000);

  function render() {
    label(toggleBtn, video.paused ? 'Play' : 'Pause');
    label(muteBtn, video.muted ? 'Sound on' : 'Mute');
    label(fsBtn, document.fullscreenElement ? 'Exit' : 'Fullscreen');
    root.classList.toggle('is-playing', !video.paused);
    root.classList.toggle('has-sound', !video.muted || hadSound);
    if (video.paused) wake();
  }

  /** Controls (and the site menu) fade while the film plays untouched. */
  function setIdle(idle) {
    root.classList.toggle('is-idle', idle);
    document.documentElement.classList.toggle('film-idle', idle && window.scrollY < 40);
  }

  /** Show the controls, then let them fade again after a pause in movement. */
  function wake() {
    setIdle(false);
    clearTimeout(idleTimer);
    if (!video.paused) idleTimer = setTimeout(() => setIdle(true), 2600);
  }
  window.addEventListener('scroll', () => document.documentElement.classList.remove('film-idle'), { passive: true });

  function withSound() {
    hadSound = true;
    video.muted = false;
    video.currentTime = 0;
    video.play().catch(() => {});
    render();
  }

  function togglePlay() {
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (stage.requestFullscreen) stage.requestFullscreen().catch(() => {});
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen(); // iPhone
  }

  toggleBtn && toggleBtn.addEventListener('click', togglePlay);
  muteBtn && muteBtn.addEventListener('click', () => { video.muted = !video.muted; if (!video.muted) hadSound = true; render(); });
  fsBtn && fsBtn.addEventListener('click', toggleFullscreen);
  soundBtn && soundBtn.addEventListener('click', withSound);

  // Clicking the picture: first click turns the sound on, later clicks pause / play.
  video.addEventListener('click', () => { if (!hadSound && video.muted) withSound(); else togglePlay(); });

  ['play', 'pause', 'volumechange'].forEach((type) => video.addEventListener(type, render));
  document.addEventListener('fullscreenchange', render);

  ['pointermove', 'pointerdown', 'keydown', 'touchstart'].forEach((type) => {
    stage.addEventListener(type, wake, { passive: true });
  });
  stage.addEventListener('pointerleave', () => { if (!video.paused) root.classList.add('is-idle'); });
  document.addEventListener('pointermove', (event) => { if (event.clientY < 70) document.documentElement.classList.remove('film-idle'); }, { passive: true });

  /* Progress bar: click or drag to seek, arrow keys when focused */
  if (progress) {
    const seekTo = (clientX) => {
      const rect = progress.getBoundingClientRect();
      const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
      if (video.duration) video.currentTime = ratio * video.duration;
    };
    let dragging = false;
    progress.addEventListener('pointerdown', (event) => { dragging = true; progress.setPointerCapture(event.pointerId); seekTo(event.clientX); });
    progress.addEventListener('pointermove', (event) => { if (dragging) seekTo(event.clientX); });
    progress.addEventListener('pointerup', () => { dragging = false; });
    progress.addEventListener('pointercancel', () => { dragging = false; });
    progress.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') { video.currentTime = Math.min(video.duration || 0, video.currentTime + 5); event.stopPropagation(); }
      if (event.key === 'ArrowLeft') { video.currentTime = Math.max(0, video.currentTime - 5); event.stopPropagation(); }
    });
  }

  ticker.add(() => {
    const duration = video.duration || 0;
    const ratio = duration ? video.currentTime / duration : 0;
    if (fill) fill.style.setProperty('--p', ratio.toFixed(4));
    if (buffer && duration && video.buffered.length) {
      buffer.style.setProperty('--b', (video.buffered.end(video.buffered.length - 1) / duration).toFixed(3));
    }
    if (timeEl && duration) {
      const text = `${clock(video.currentTime)} / ${clock(duration)}`;
      if (timeEl.textContent !== text) timeEl.textContent = text;
    }
    if (progress) progress.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
  });

  /* Keyboard: space/K play, M mute, F fullscreen, arrows seek */
  document.addEventListener('keydown', (event) => {
    if (event.target.closest('input, textarea, select, [contenteditable]') || event.metaKey || event.ctrlKey || event.altKey) return;
    const inStage = stage.getBoundingClientRect().bottom > window.innerHeight * 0.4;
    if (!inStage) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'k') { if (event.target.closest('button, a')) return; event.preventDefault(); togglePlay(); }
    else if (key === 'm') { video.muted = !video.muted; if (!video.muted) hadSound = true; render(); }
    else if (key === 'f') toggleFullscreen();
    else if (key === 'arrowright') video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
    else if (key === 'arrowleft') video.currentTime = Math.max(0, video.currentTime - 5);
    else return;
    wake();
  });

  /* Scrolled down to the details: pause a film that has sound, resume on return */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting && !video.paused && !video.muted) { video.pause(); pausedByScroll = true; }
      else if (entry.isIntersecting && pausedByScroll) { pausedByScroll = false; video.play().catch(() => {}); }
    }, { threshold: 0.3 }).observe(stage);
  }

  root.classList.add('is-started');
  video.play().catch(() => {}).finally(render);
  render();
  wake();
}
