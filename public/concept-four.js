(() => {
  const site = document.querySelector('#implementation-4');
  if (!site) return;
  const header = site.querySelector('.seam-header');
  const brand = header.querySelector('.seam-brand');
  const socket = header.querySelector('.seam-socket');
  const menuToggle = site.querySelector('.seam-menu-toggle');
  const menuPanel = site.querySelector('.seam-menu');
  const hero = site.querySelector('.seam-hero');
  const wafer = site.querySelector('.seam-wafer');
  const waferInner = wafer.querySelector('.seam-wafer-inner');
  const main = site.querySelector('main');
  const footer = site.querySelector('footer');
  const switcher = document.querySelector('.concept-switcher');
  const wide = matchMedia('(min-width: 1181px)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  // Mobile navigation
  function closeMenu(restoreFocus = false) {
    if (menuPanel.hidden) return;
    menuPanel.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.querySelector('[data-menu-label]').textContent = 'Menu';
    document.body.classList.remove('seam-menu-open');
    [main, footer, switcher].forEach(element => { if (element) element.inert = false; });
    if (restoreFocus) menuToggle.focus({ preventScroll: true });
  }
  menuToggle.addEventListener('click', () => {
    if (!menuPanel.hidden) return closeMenu(true);
    menuPanel.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.querySelector('[data-menu-label]').textContent = 'Close';
    document.body.classList.add('seam-menu-open');
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
      const targets = [brand, menuToggle, ...menuPanel.querySelectorAll('a')];
      const first = targets[0];
      const last = targets.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  wide.addEventListener('change', () => {
    if (!wide.matches) return;
    const moveFocus = menuPanel.contains(document.activeElement) || document.activeElement === menuToggle;
    closeMenu();
    if (moveFocus) brand.focus({ preventScroll: true });
  });

  // Highlight the nav link for the section crossing the upper middle of the viewport.
  const navLinks = [...header.querySelectorAll('.seam-nav a[href^="#"]')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = navLinks.find(item => item.hash === `#${entry.target.id}`);
      link?.classList.toggle('is-active', entry.isIntersecting);
    });
  }, { rootMargin: '-42% 0px -57% 0px' });
  navLinks.forEach(link => { const section = document.querySelector(link.hash); if (section) spy.observe(section); });

  // Scroll: header state, the wafer flying from the film's corner into the header socket, and film drift.
  const film = site.querySelector('.seam-film');
  let geometry;
  let frame = 0;
  function documentOffset(element) {
    let left = 0;
    let top = 0;
    for (let node = element; node; node = node.offsetParent) { left += node.offsetLeft; top += node.offsetTop; }
    return { left, top };
  }
  function measure() {
    const box = documentOffset(wafer);
    const slot = documentOffset(socket);
    const size = wafer.offsetWidth;
    const slotSize = socket.offsetWidth;
    geometry = {
      x: box.left + size * .4976,
      y: box.top + wafer.offsetHeight * .4879,
      size,
      targetX: slot.left + slotSize * .4976,
      targetY: slot.top + socket.offsetHeight * .4879,
      targetSize: slotSize,
      heroEnd: hero.offsetTop + hero.offsetHeight,
      filmTravel: film.offsetHeight * .045
    };
    geometry.distance = Math.max(geometry.y - geometry.targetY, 1);
  }
  function render() {
    frame = 0;
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 8);
    if (!geometry) return;
    const docking = !motion.matches;
    site.classList.toggle('has-dock', docking);
    if (!docking) {
      wafer.style.transform = '';
      site.classList.remove('is-docked');
      film.style.removeProperty('--film-shift');
      return;
    }
    // The wafer rises quickly while it shrinks, then slides home along the header.
    const raw = clamp(y / geometry.distance);
    const rise = 1 - (1 - raw) ** 2;
    const slide = raw ** 2;
    const naturalY = geometry.y - y;
    const scale = Math.pow(geometry.targetSize / geometry.size, raw);
    wafer.style.transform = `translate3d(${(geometry.targetX - geometry.x) * slide}px, ${(geometry.targetY - naturalY) * rise}px, 0) scale(${scale})`;
    site.classList.toggle('is-docked', raw >= 1);
    if (y < geometry.heroEnd) film.style.setProperty('--film-shift', `${Math.min(y * .08, geometry.filmTravel).toFixed(1)}px`);
  }
  function requestRender() { if (!frame) frame = requestAnimationFrame(render); }
  function remeasure() { measure(); render(); }
  addEventListener('scroll', requestRender, { passive: true });
  new ResizeObserver(remeasure).observe(hero);
  addEventListener('resize', remeasure);
  motion.addEventListener('change', remeasure);
  document.fonts?.ready.then(remeasure);
  remeasure();

  // Light catches the brushed silver as the pointer moves across the hero.
  hero.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || !finePointer.matches || motion.matches || site.classList.contains('is-docked')) return;
    const box = waferInner.getBoundingClientRect();
    waferInner.style.setProperty('--gx', `${clamp((event.clientX - box.left) / box.width * 100, -25, 125).toFixed(1)}%`);
    waferInner.style.setProperty('--gy', `${clamp((event.clientY - box.top) / box.height * 100, -25, 125).toFixed(1)}%`);
    const heroBox = hero.getBoundingClientRect();
    waferInner.style.setProperty('--wx', `${((event.clientX - heroBox.left) / heroBox.width - .5) * -14}px`);
    waferInner.style.setProperty('--wy', `${((event.clientY - heroBox.top) / heroBox.height - .5) * -14}px`);
  });
  hero.addEventListener('pointerleave', () => {
    ['--gx', '--gy', '--wx', '--wy'].forEach(name => waferInner.style.removeProperty(name));
  });

  // Hero film
  const video = site.querySelector('.seam-film-video');
  const toggle = site.querySelector('.seam-video-toggle');
  let inView = true;
  let pausedByUser = false;
  let motionOverride = false;
  let pending = false;
  let pageActive = true;
  video.muted = true;

  function updateControl() {
    const playing = !video.paused;
    hero.classList.toggle('is-playing', playing);
    toggle.dataset.playing = String(playing);
    toggle.setAttribute('aria-label', playing ? 'Pause hero video' : 'Play hero video');
    toggle.querySelector('[data-video-label]').textContent = playing ? 'Pause' : 'Play';
  }
  function shouldPlay() {
    return pageActive && inView && !document.hidden && !pausedByUser
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
    hero.style.setProperty('--film-progress', video.duration ? video.currentTime / video.duration : 0);
  });
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncPlayback(); }, { threshold: .05 }).observe(film);
  motion.addEventListener('change', () => { motionOverride = false; syncPlayback(); });
  document.addEventListener('visibilitychange', syncPlayback);
  addEventListener('pagehide', () => { pageActive = false; video.pause(); });
  addEventListener('pageshow', () => { pageActive = true; closeMenu(); syncPlayback(); });
  syncPlayback();
})();
