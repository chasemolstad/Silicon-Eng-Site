(() => {
  const menu = document.querySelector('.imeg-menu');
  if (!menu) return;

  const site = document.querySelector('#implementation-1');
  const header = site.querySelector('.imeg-header');
  const surface = site.querySelector('.imeg-surface');
  const panel = site.querySelector('.imeg-panel');
  const brand = site.querySelector('.imeg-brand');
  const spacer = site.querySelector('.imeg-hero-space');
  const copy = site.querySelector('.imeg-copy');
  const contactSpace = site.querySelector('.imeg-contact-space');
  const contactSlot = site.querySelector('.imeg-cta-slot');
  const contactTarget = site.querySelector('.imeg-cta-target');
  const video = site.querySelector('.imeg-video');
  const videoToggle = site.querySelector('.imeg-video-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let videoPausedByUser = false;
  let videoMotionOverride = false;
  let videoPlayPending = false;
  let distance = 1;
  let start = 0;
  let frame = 0;
  let needsMeasure = true;
  let silverGeometry;

  function updateVideoControl() {
    if (!video || !videoToggle) return;
    videoToggle.dataset.playing = String(!video.paused);
    videoToggle.setAttribute('aria-label', video.paused ? 'Play background video' : 'Pause background video');
  }

  function syncVideo() {
    if (!video || !videoToggle) return;
    const collapsed = parseFloat(surface.style.getPropertyValue('--collapse')) || 0;
    const hideControl = site.hidden || collapsed > 0 || Boolean(video.error);
    if (hideControl && document.activeElement === videoToggle) {
      menu.querySelector('summary').focus({ preventScroll: true });
    }
    videoToggle.hidden = hideControl;
    const shouldPlay = !site.hidden && !document.hidden && collapsed === 0 && !videoPausedByUser
      && (!reducedMotion.matches || videoMotionOverride) && !video.error;
    if (!shouldPlay) {
      video.pause();
    } else if (video.paused && !videoPlayPending) {
      videoPlayPending = true;
      video.play().catch(() => {}).finally(() => { videoPlayPending = false; updateVideoControl(); });
    }
    updateVideoControl();
  }

  // Each control changes color when the growing silver panel reaches it.
  function isOnSilver(rect, surfaceRect, circle, progress) {
    if (progress === 1 || !circle) return true;
    const x = rect.left + rect.width / 2 - surfaceRect.left;
    const y = rect.top + rect.height / 2 - surfaceRect.top;
    if (silverGeometry.mobile) return y >= circle.top;
    const { centerX, centerY, radius } = circle;
    return x <= centerX || Math.hypot(x - centerX, y - centerY) <= radius;
  }

  function render() {
    frame = 0;
    if (site.hidden) { syncVideo(); return; }
    if (needsMeasure) {
      distance = Math.max(1, spacer.getBoundingClientRect().height);
      start = site.getBoundingClientRect().top + window.scrollY;
      const style = getComputedStyle(site);
      const width = surface.getBoundingClientRect().width;
      const mobile = matchMedia('(max-width: 900px)').matches;
      const mediaHeight = mobile ? video.getBoundingClientRect().height : 0;
      const barHeight = header.getBoundingClientRect().height;
      const radius = (distance + barHeight) * parseFloat(style.getPropertyValue('--curve-radius'));
      const edge = Math.max(width * parseFloat(style.getPropertyValue('--silver-edge')) / 100,
        parseFloat(style.getPropertyValue('--silver-edge-min')));
      const centerX = edge - radius;
      silverGeometry = {
        width,
        mobile,
        mediaHeight,
        radius,
        centerX,
        endRadius: Math.hypot(width - centerX, barHeight / 2) + 1,
      };
      needsMeasure = false;
    }
    const progress = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
    surface.style.setProperty('--collapse', progress.toFixed(5));
    surface.style.setProperty('--brand-collapse', Math.max(0, (progress - .55) / .45).toFixed(5));
    const opacity = Math.max(0, 1 - progress / .32);
    copy.style.setProperty('--copy-opacity', opacity.toFixed(3));
    copy.inert = opacity === 0;
    copy.setAttribute('aria-hidden', String(opacity === 0));
    header.classList.toggle('is-compact', progress === 1);
    syncVideo();
    const surfaceRect = surface.getBoundingClientRect();
    // Use the current, untransformed slot so live spacing edits cannot move the sticky endpoint.
    const slotRect = contactSlot.getBoundingClientRect();
    const targetRect = contactTarget.getBoundingClientRect();
    surface.style.setProperty('--cta-shift-x', `${targetRect.left - slotRect.left}px`);
    surface.style.setProperty('--cta-shift-y', `${targetRect.top - slotRect.top}px`);
    let circle;
    if (silverGeometry.mobile) {
      // Cover a fixed-size video with silver instead of stretching it while scrolling.
      const top = silverGeometry.mediaHeight * (1 - progress);
      circle = { top };
      panel.style.setProperty('--silver-clip', `inset(${top.toFixed(3)}px 0 0 0)`);
    } else {
      const { centerX, radius, endRadius } = silverGeometry;
      const r = radius + (endRadius - radius) * progress;
      const h = surfaceRect.height;
      circle = { centerX, centerY: h / 2, radius: r };
      const edge = centerX + Math.sqrt(Math.max(0, r * r - h * h / 4));
      // The left strip and circular edge form one continuous silver surface.
      panel.style.setProperty('--silver-clip', `path('M 0 0 H ${edge.toFixed(3)} A ${r.toFixed(3)} ${r.toFixed(3)} 0 0 1 ${edge.toFixed(3)} ${h.toFixed(3)} H 0 Z')`);
    }
    const brandRect = brand.getBoundingClientRect();
    const menuRect = menu.querySelector('summary').getBoundingClientRect();
    brand.classList.toggle('is-silver', isOnSilver(brandRect, surfaceRect, circle, progress));
    menu.classList.toggle('is-silver', isOnSilver(menuRect, surfaceRect, circle, progress));
  }

  function requestRender(measure = false) {
    needsMeasure ||= measure;
    if (!frame) frame = window.requestAnimationFrame(render);
  }

  window.addEventListener('scroll', () => requestRender(), { passive: true });
  window.addEventListener('resize', () => requestRender(true));
  window.addEventListener('pageshow', () => requestRender(true));
  new ResizeObserver(() => requestRender(true)).observe(spacer);
  const contactLayoutObserver = new ResizeObserver(() => requestRender());
  [copy, contactSpace, contactSlot, contactTarget].forEach(element => contactLayoutObserver.observe(element));
  new MutationObserver(() => {
    menu.open = false;
    requestRender(true);
  }).observe(document.body, { attributes: true, attributeFilter: ['data-concept'] });
  requestRender(true);

  if (video && videoToggle) {
    video.muted = true;
    video.addEventListener('play', updateVideoControl);
    video.addEventListener('pause', updateVideoControl);
    video.addEventListener('error', syncVideo);
    videoToggle.addEventListener('click', () => {
      videoPausedByUser = !video.paused;
      videoMotionOverride = !videoPausedByUser;
      syncVideo();
    });
    reducedMotion.addEventListener('change', () => {
      videoMotionOverride = false;
      syncVideo();
    });
    document.addEventListener('visibilitychange', syncVideo);
  }

  menu.addEventListener('toggle', () => {
    menu.querySelector('summary').setAttribute('aria-label', menu.open ? 'Close navigation menu' : 'Open navigation menu');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.open = false; }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu.open) {
      menu.open = false;
      menu.querySelector('summary').focus();
    }
  });
  document.addEventListener('click', event => {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
})();
