(() => {
  const site = document.querySelector('#implementation-3');
  if (!site) return;
  const header = site.querySelector('.editorial-header');
  const menuToggle = site.querySelector('.editorial-menu-toggle');
  const menuPanel = site.querySelector('.editorial-mobile-panel');
  const hero = site.querySelector('.editorial-hero');
  const emblem = site.querySelector('.editorial-emblem');
  const emblemInner = emblem.querySelector('.editorial-emblem-inner');
  const film = site.querySelector('.editorial-film');
  const desktop = matchMedia('(min-width: 901px)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const main = site.querySelector('main');
  const footer = site.querySelector('footer');
  const switcher = document.querySelector('.concept-switcher');
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function closeMenu(restoreFocus = false) {
    if (menuPanel.hidden) return;
    menuPanel.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.querySelector('[data-menu-label]').textContent = 'Menu';
    document.body.classList.remove('editorial-nav-open');
    [main, footer, switcher].forEach(element => { if (element) element.inert = false; });
    if (restoreFocus) menuToggle.focus({ preventScroll: true });
  }
  menuToggle.addEventListener('click', () => {
    if (!menuPanel.hidden) return closeMenu(true);
    menuPanel.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.querySelector('[data-menu-label]').textContent = 'Close';
    document.body.classList.add('editorial-nav-open');
    [main, footer, switcher].forEach(element => { if (element) element.inert = true; });
  });
  menuPanel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    closeMenu();
    if (link.hash && link.pathname === location.pathname) {
      const target = document.querySelector(link.hash);
      if (target) {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    }
  }));
  document.addEventListener('keydown', event => {
    if (menuPanel.hidden) return;
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); }
    if (event.key === 'Tab') {
      const targets = [header.querySelector('.editorial-brand'), menuToggle, ...menuPanel.querySelectorAll('a')];
      const first = targets[0];
      const last = targets.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  desktop.addEventListener('change', () => {
    if (!desktop.matches) return;
    const moveFocus = menuPanel.contains(document.activeElement) || document.activeElement === menuToggle;
    closeMenu();
    if (moveFocus) header.querySelector('.editorial-brand').focus({ preventScroll: true });
  });
  // Scroll: the header turns into a bar with a reading-progress line, the mark turns, and the film drifts.
  let scrollPending = false;
  function updateScroll() {
    scrollPending = false;
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    const travel = document.documentElement.scrollHeight - innerHeight;
    header.style.setProperty('--c3-read', travel > 0 ? clamp(y / travel, 0, 1).toFixed(4) : '0');
    if (motion.matches) {
      emblem.style.removeProperty('--c3-turn');
      film.style.removeProperty('--c3-shift');
      return;
    }
    if (y > hero.offsetHeight) return;
    emblem.style.setProperty('--c3-turn', `${(y * .05).toFixed(2)}deg`);
    // The video is 70px taller than the film, so it can sink that far without opening a gap.
    film.style.setProperty('--c3-shift', `${Math.min(y * .1, 70).toFixed(1)}px`);
  }
  addEventListener('scroll', () => {
    if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  addEventListener('resize', updateScroll);
  motion.addEventListener('change', updateScroll);
  updateScroll();

  // Light catches the silver mark as the pointer moves across the hero, and the mark drifts away from it.
  // The pointer only sets a target; one frame loop eases toward it, so the light keeps up while the pointer moves.
  const rest = { x: 0, y: 0, wx: 0, wy: 0 };
  const light = { ...rest };
  let pointer = null;
  let lightFrame = 0;
  let lightTime = 0;
  function lightTarget() {
    if (!pointer) return rest;
    // Measure the outer mark, which the drift doesn't move. Scrolling turns it, so turn the pointer into its frame.
    const box = emblem.getBoundingClientRect();
    const width = emblem.offsetWidth;
    const height = emblem.offsetHeight;
    const radius = width * .46;
    const turn = (parseFloat(emblem.style.getPropertyValue('--c3-turn')) || 0) * Math.PI / 180;
    const cos = Math.cos(turn);
    const sin = Math.sin(turn);
    // Treat the mark as a dome: the highlight sits under the pointer near the middle and eases toward the rim as
    // the pointer moves away, instead of stopping hard at an edge. Offsets are from the glint's resting spot.
    const sx = (pointer.x - (box.left + box.width / 2)) / radius;
    const sy = (pointer.y - (box.top + box.height / 2)) / radius;
    const vx = sx * cos + sy * sin;
    const vy = sy * cos - sx * sin;
    const reach = radius / Math.hypot(1, vx, vy);
    const area = hero.getBoundingClientRect();
    const dx = ((pointer.x - area.left) / area.width - .5) * -18;
    const dy = ((pointer.y - area.top) / area.height - .5) * -18;
    return {
      x: width * (.4976 - .3) + vx * reach,
      y: height * (.4879 - .22) + vy * reach,
      wx: dx * cos + dy * sin,
      wy: dy * cos - dx * sin
    };
  }
  function stepLight(now) {
    const dt = lightTime ? Math.min((now - lightTime) / 1000, .05) : 0;
    lightTime = now;
    const target = lightTarget();
    // Frame-rate independent easing: the light follows within a few frames, the drift a little more softly.
    const follow = motion.matches ? 1 : 1 - Math.exp(-dt / .05);
    const sway = motion.matches ? 1 : 1 - Math.exp(-dt / .12);
    light.x += (target.x - light.x) * follow;
    light.y += (target.y - light.y) * follow;
    light.wx += (target.wx - light.wx) * sway;
    light.wy += (target.wy - light.wy) * sway;
    emblemInner.style.setProperty('--c3-glint-x', `${light.x.toFixed(2)}px`);
    emblemInner.style.setProperty('--c3-glint-y', `${light.y.toFixed(2)}px`);
    emblemInner.style.setProperty('--c3-wx', `${light.wx.toFixed(2)}px`);
    emblemInner.style.setProperty('--c3-wy', `${light.wy.toFixed(2)}px`);
    const settled = Object.keys(rest).every(key => Math.abs(target[key] - light[key]) < .05);
    lightFrame = settled ? 0 : requestAnimationFrame(stepLight);
    if (settled) lightTime = 0;
  }
  function wakeLight() { if (!lightFrame) lightFrame = requestAnimationFrame(stepLight); }
  hero.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches || motion.matches) return;
    pointer = { x: event.clientX, y: event.clientY };
    wakeLight();
  });
  hero.addEventListener('pointerleave', () => { pointer = null; wakeLight(); });
  addEventListener('scroll', () => { if (pointer) wakeLight(); }, { passive: true });
  motion.addEventListener('change', () => { pointer = null; wakeLight(); });

  const video = site.querySelector('.editorial-film-video');
  const toggle = site.querySelector('.editorial-video-toggle');
  const dialog = site.querySelector('.editorial-film-dialog');
  const fullVideo = dialog.querySelector('video');
  const expand = site.querySelector('.editorial-film-expand');
  let inView = true;
  let pausedByUser = false;
  let motionOverride = false;
  let pending = false;
  let pageActive = true;
  video.muted = true;

  function updateControl() {
    const playing = !video.paused;
    toggle.dataset.playing = String(playing);
    toggle.setAttribute('aria-label', playing ? 'Pause hero video' : 'Play hero video');
    toggle.querySelector('[data-video-label]').textContent = playing ? 'Pause' : 'Play';
  }
  function shouldPlay() {
    return pageActive && inView && !document.hidden && !dialog.open && !pausedByUser
      && (!motion.matches || motionOverride) && !video.error;
  }
  function syncPlayback() {
    toggle.hidden = Boolean(video.error);
    if (!shouldPlay()) video.pause();
    else if (video.paused && !pending) {
      pending = true;
      video.play().catch(() => {}).finally(() => { pending = false; if (!shouldPlay()) video.pause(); updateControl(); });
    }
    updateControl();
  }
  toggle.addEventListener('click', () => {
    pausedByUser = !video.paused;
    motionOverride = !pausedByUser;
    syncPlayback();
  });
  video.addEventListener('play', updateControl);
  video.addEventListener('pause', updateControl);
  video.addEventListener('error', syncPlayback);
  video.addEventListener('timeupdate', () => {
    film.style.setProperty('--film-progress', video.duration ? video.currentTime / video.duration : 0);
  });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncPlayback(); }, { threshold: .05 }).observe(film);
  motion.addEventListener('change', () => { motionOverride = false; syncPlayback(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) fullVideo.pause(); syncPlayback(); });
  addEventListener('pagehide', () => { pageActive = false; video.pause(); fullVideo.pause(); });
  addEventListener('pageshow', () => { pageActive = true; closeMenu(); syncPlayback(); });
  function playFullVideo() {
    if (!dialog.open || document.hidden || !pageActive) return;
    if (fullVideo.readyState >= 1) fullVideo.currentTime = video.currentTime;
    fullVideo.play().then(() => {
      if (!dialog.open || document.hidden || !pageActive) fullVideo.pause();
    }).catch(() => {});
  }
  fullVideo.addEventListener('loadedmetadata', playFullVideo);
  expand.addEventListener('click', () => {
    dialog.showModal();
    document.body.classList.add('editorial-film-open');
    video.pause();
    if (!fullVideo.src) fullVideo.src = video.currentSrc || video.querySelector('source').src;
    playFullVideo();
  });
  dialog.querySelector('.editorial-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    fullVideo.pause();
    document.body.classList.remove('editorial-film-open');
    syncPlayback();
  });
  syncPlayback();
})();
