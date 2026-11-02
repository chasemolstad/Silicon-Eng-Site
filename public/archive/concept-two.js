(() => {
  const site = document.querySelector('#implementation-2');
  if (!site) return;
  const header = site.querySelector('.orbit-header');
  const brand = header.querySelector('.orbit-brand');
  const slot = header.querySelector('.orbit-slot');
  const glass = site.querySelector('.orbit-glass');
  const hero = site.querySelector('.orbit-hero');
  const lens = site.querySelector('.orbit-lens');
  const mark = site.querySelector('.orbit-mark');
  const markInner = mark.querySelector('.orbit-mark-inner');
  const menuToggle = header.querySelector('.orbit-menu-toggle');
  const menuPanel = site.querySelector('.orbit-menu');
  const main = site.querySelector('main');
  const footer = site.querySelector('footer');
  const switcher = document.querySelector('.concept-switcher');
  const phone = matchMedia('(max-width: 860px)');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (from, to, t) => from + (to - from) * t;
  const easeInOut = t => (t < .5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);

  // While the header holds focus or the menu is open, the bar is shown outright instead of waiting for scroll.
  let focusInside = false;
  function isForced() { return focusInside || !menuPanel.hidden; }

  // Mobile navigation
  function closeMenu(restoreFocus = false) {
    if (menuPanel.hidden) return;
    menuPanel.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.querySelector('[data-menu-label]').textContent = 'Menu';
    document.body.classList.remove('orbit-menu-open');
    [main, footer, switcher].forEach(element => { if (element) element.inert = false; });
    if (restoreFocus) menuToggle.focus({ preventScroll: true });
    requestRender();
  }
  menuToggle.addEventListener('click', () => {
    if (!menuPanel.hidden) return closeMenu(true);
    menuPanel.hidden = false;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.querySelector('[data-menu-label]').textContent = 'Close';
    document.body.classList.add('orbit-menu-open');
    [main, footer, switcher].forEach(element => { if (element) element.inert = true; });
    requestRender();
  });
  menuPanel.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
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
  phone.addEventListener('change', () => { if (!phone.matches) closeMenu(); });
  header.addEventListener('focusin', () => { focusInside = true; requestRender(); });
  header.addEventListener('focusout', event => { if (!header.contains(event.relatedTarget)) { focusInside = false; requestRender(); } });

  // Highlight the nav link for the section crossing the upper middle of the viewport.
  const navLinks = [...header.querySelectorAll('.orbit-nav a[href^="#"]')];
  const crossing = new Set();
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) crossing.add(entry.target.id); else crossing.delete(entry.target.id); });
    const current = navLinks.filter(link => crossing.has(link.hash.slice(1))).at(-1);
    navLinks.forEach(link => link.classList.toggle('is-active', link === current));
  }, { rootMargin: '-42% 0px -57% 0px' });
  navLinks.forEach(link => { const section = document.querySelector(link.hash); if (section) spy.observe(section); });

  // Scroll builds the top bar: the copy fades, the lens stretches from a circle into the bar,
  // the mark flies into the bar's slot, and finally the nav fades in.
  let geometry;
  let frame = 0;
  function offsetFrom(element) {
    let left = 0;
    let top = 0;
    for (let node = element; node; node = node.offsetParent) { left += node.offsetLeft; top += node.offsetTop; }
    return { left, top };
  }
  function measure() {
    const box = offsetFrom(mark);
    const size = mark.offsetWidth;
    // The header is fixed, so the slot's offsets are already viewport coordinates.
    const target = offsetFrom(slot);
    geometry = {
      x: box.left + size * .4976,
      y: box.top + size * .4775,
      size,
      targetX: target.left + slot.offsetWidth * .4976,
      targetY: target.top + slot.offsetWidth * .4775,
      targetSize: slot.offsetWidth,
      travel: clamp(hero.offsetHeight * .62, 260, 620),
      heroEnd: hero.offsetTop + hero.offsetHeight
    };
  }
  function resetMorph() {
    site.classList.remove('is-morphing', 'is-flying', 'is-docked');
    mark.style.transform = '';
    site.style.setProperty('--o-hero', '1');
  }
  function render() {
    frame = 0;
    if (!geometry) return;
    const y = scrollY;
    const forced = isForced();
    const morph = !motion.matches;
    site.classList.toggle('has-morph', morph);
    site.classList.toggle('is-past', y > geometry.heroEnd - 80);
    header.classList.toggle('is-forced', forced && (!morph || y < geometry.travel));
    if (!morph) {
      resetMorph();
      header.classList.toggle('is-bar', forced || y > 24);
      return;
    }
    const raw = clamp(y / geometry.travel);
    const shape = easeInOut(raw);
    site.style.setProperty('--o-hero', clamp(1 - raw * 4).toFixed(3));
    site.style.setProperty('--o-drift', `${Math.min(y * .12, 90).toFixed(1)}px`);

    site.classList.toggle('is-morphing', raw > 0);
    let glassTop = Infinity;
    if (raw > 0) {
      const circle = lens.getBoundingClientRect();
      const width = document.documentElement.clientWidth;
      const bar = header.offsetHeight;
      glassTop = lerp(circle.top, 0, shape);
      glass.style.left = `${lerp(circle.left, 0, shape).toFixed(1)}px`;
      glass.style.top = `${glassTop.toFixed(1)}px`;
      glass.style.width = `${lerp(circle.width, width, shape).toFixed(1)}px`;
      glass.style.height = `${lerp(circle.height, bar, shape).toFixed(1)}px`;
      glass.style.borderRadius = `${lerp(circle.width / 2, 0, shape).toFixed(1)}px`;
      glass.style.setProperty('--e', shape.toFixed(3));
    }
    // The header type turns dark once the glass has spread out under it.
    header.classList.toggle('is-bar', shape > .62 && glassTop < header.offsetHeight * .5);

    // The mark rises quickly while it shrinks, then slides home along the bar.
    const rise = 1 - (1 - raw) ** 2;
    const slide = raw ** 2;
    const scale = Math.pow(geometry.targetSize / geometry.size, raw);
    mark.style.transform = raw > 0
      ? `translate3d(${((geometry.targetX - geometry.x) * slide).toFixed(1)}px, ${((geometry.targetY - (geometry.y - y)) * rise).toFixed(1)}px, 0) scale(${scale.toFixed(4)})`
      : '';
    site.classList.toggle('is-flying', raw > 0 && raw < 1);
    site.classList.toggle('is-docked', raw >= 1);
  }
  function requestRender() { if (!frame) frame = requestAnimationFrame(render); }
  function remeasure() { measure(); render(); }
  addEventListener('scroll', requestRender, { passive: true });
  addEventListener('resize', remeasure);
  new ResizeObserver(remeasure).observe(hero);
  motion.addEventListener('change', remeasure);
  document.fonts?.ready.then(remeasure);
  // The lens slides out of the mark on load; keep the glass in step if the page loads part-way down.
  lens.addEventListener('animationend', requestRender);

  // Light catches the silver mark as the pointer moves across the hero, and the mark drifts away from it.
  // The pointer only sets a target; one frame loop eases toward it, so the light keeps up while the pointer moves.
  const rest = { x: 0, y: 0, wx: 0, wy: 0 };
  const light = { ...rest };
  let pointer = null;
  let lightFrame = 0;
  let lightTime = 0;
  function lightTarget() {
    if (!pointer) return rest;
    // Measure the outer mark, which the drift doesn't move, and allow for the scale while it flies to the bar.
    const box = mark.getBoundingClientRect();
    const width = mark.offsetWidth;
    const height = mark.offsetHeight;
    const radius = width * .46;
    const scale = box.width / width;
    // Treat the mark as a dome: the highlight sits under the pointer near the middle and eases toward the rim as
    // the pointer moves away, instead of stopping hard at an edge. Offsets are from the glint's resting spot.
    const vx = (pointer.x - (box.left + box.width / 2)) / (radius * scale);
    const vy = (pointer.y - (box.top + box.height / 2)) / (radius * scale);
    const reach = radius / Math.hypot(1, vx, vy);
    const area = hero.getBoundingClientRect();
    return {
      x: width * (.4976 - .3) + vx * reach,
      y: height * (.4879 - .22) + vy * reach,
      wx: ((pointer.x - area.left) / area.width - .5) * -16,
      wy: ((pointer.y - area.top) / area.height - .5) * -16
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
    markInner.style.setProperty('--glint-x', `${light.x.toFixed(2)}px`);
    markInner.style.setProperty('--glint-y', `${light.y.toFixed(2)}px`);
    markInner.style.setProperty('--wx', `${light.wx.toFixed(2)}px`);
    markInner.style.setProperty('--wy', `${light.wy.toFixed(2)}px`);
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

  // Hero video
  const video = hero.querySelector('.orbit-video');
  const toggle = hero.querySelector('.orbit-video-toggle');
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
      && (!motion.matches || motionOverride) && !video.error;
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
  motion.addEventListener('change', () => {
    motionOverride = false;
    syncPlayback();
  });
  document.addEventListener('visibilitychange', syncPlayback);
  addEventListener('pageshow', () => { closeMenu(); syncPlayback(); });
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }).observe(hero);
  remeasure();
  syncPlayback();
})();
