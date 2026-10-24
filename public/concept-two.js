(() => {
  const site = document.querySelector('#implementation-2');
  const hero = site?.querySelector('.practical-hero');
  const video = hero?.querySelector('.practical-hero-video');
  const toggle = hero?.querySelector('.practical-video-toggle');
  if (!video || !toggle) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let inView = false;
  let pausedByUser = false;
  let motionOverride = false;
  let playPending = false;

  function updateControl() {
    toggle.dataset.playing = String(!video.paused);
    toggle.setAttribute('aria-label', video.paused ? 'Play hero video' : 'Pause hero video');
  }

  function syncPlayback() {
    toggle.hidden = Boolean(video.error);
    const shouldPlay = !site.hidden && !document.hidden && inView && !pausedByUser
      && (!reducedMotion.matches || motionOverride) && !video.error;
    if (!shouldPlay) {
      video.pause();
    } else if (video.paused && !playPending) {
      playPending = true;
      video.play().catch(() => {}).finally(() => { playPending = false; updateControl(); });
    }
    updateControl();
  }

  video.muted = true;
  video.addEventListener('play', updateControl);
  video.addEventListener('pause', updateControl);
  video.addEventListener('error', syncPlayback);
  toggle.addEventListener('click', () => {
    pausedByUser = !video.paused;
    motionOverride = !pausedByUser;
    syncPlayback();
  });
  reducedMotion.addEventListener('change', () => {
    motionOverride = false;
    syncPlayback();
  });
  document.addEventListener('visibilitychange', syncPlayback);
  window.addEventListener('pageshow', syncPlayback);
  new MutationObserver(syncPlayback).observe(document.body, { attributes: true, attributeFilter: ['data-concept'] });
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }).observe(hero);
  syncPlayback();
})();
