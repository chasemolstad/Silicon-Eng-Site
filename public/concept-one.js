(() => {
  const menu = document.querySelector('.imeg-menu');
  if (!menu) return;

  const site = document.querySelector('#implementation-1');
  const header = site.querySelector('.imeg-header');
  const surface = site.querySelector('.imeg-surface');
  const brand = site.querySelector('.imeg-brand');
  const spacer = site.querySelector('.imeg-hero-space');
  const copy = site.querySelector('.imeg-copy');
  const contactSlot = site.querySelector('.imeg-cta-slot');
  const contactTarget = site.querySelector('.imeg-cta-target');
  let distance = 1;
  let start = 0;
  let frame = 0;
  let needsMeasure = true;
  let silverGeometry;

  // Each control changes color when the growing silver panel reaches it.
  function isOnSilver(rect, surfaceRect, progress) {
    const x = rect.left + rect.width / 2 - surfaceRect.left;
    const y = rect.top + rect.height / 2 - surfaceRect.top;
    const { width, top, bottom, mobile } = silverGeometry;
    return mobile
      ? y >= (top + (bottom - top) * x / width) * surfaceRect.height * (1 - progress)
      : x <= (top + (bottom - top) * y / surfaceRect.height) * (1 - progress) + width * progress;
  }

  function render() {
    frame = 0;
    if (site.hidden) return;
    if (needsMeasure) {
      distance = Math.max(1, spacer.getBoundingClientRect().height);
      start = site.getBoundingClientRect().top + window.scrollY;
      const slotRect = contactSlot.getBoundingClientRect();
      const targetRect = contactTarget.getBoundingClientRect();
      surface.style.setProperty('--cta-shift-x', `${targetRect.left - slotRect.left}px`);
      surface.style.setProperty('--cta-shift-y', `${targetRect.top - slotRect.top}px`);
      const style = getComputedStyle(site);
      const width = surface.getBoundingClientRect().width;
      const mobile = matchMedia('(max-width: 900px)').matches;
      const top = parseFloat(style.getPropertyValue('--light-top')) / 100;
      const bottom = parseFloat(style.getPropertyValue('--light-bottom')) / 100;
      silverGeometry = {
        width,
        mobile,
        top: mobile ? top : top * width - parseFloat(style.getPropertyValue('--light-top-inset')),
        bottom: mobile ? bottom : bottom * width - parseFloat(style.getPropertyValue('--light-bottom-inset')),
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
    const surfaceRect = surface.getBoundingClientRect();
    const brandRect = brand.getBoundingClientRect();
    const menuRect = menu.querySelector('summary').getBoundingClientRect();
    brand.classList.toggle('is-silver', isOnSilver(brandRect, surfaceRect, progress));
    menu.classList.toggle('is-silver', isOnSilver(menuRect, surfaceRect, progress));
  }

  function requestRender(measure = false) {
    needsMeasure ||= measure;
    if (!frame) frame = window.requestAnimationFrame(render);
  }

  window.addEventListener('scroll', () => requestRender(), { passive: true });
  window.addEventListener('resize', () => requestRender(true));
  window.addEventListener('pageshow', () => requestRender(true));
  new ResizeObserver(() => requestRender(true)).observe(spacer);
  new MutationObserver(() => {
    menu.open = false;
    requestRender(true);
  }).observe(document.body, { attributes: true, attributeFilter: ['data-concept'] });
  requestRender(true);

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
