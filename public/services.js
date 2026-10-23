(() => {
  const section = document.querySelector('#services-1');
  const tablist = section?.querySelector('.service-phase-tabs');
  const stage = section?.querySelector('.service-phase-panels');
  const controls = section?.querySelector('.service-rotation-controls');
  const rotationButton = controls?.querySelector('button');
  if (!tablist || !stage || !rotationButton) return;

  const tabs = [...tablist.querySelectorAll('button')];
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  if (!tabs.length || panels.some(panel => !panel || !section.contains(panel))) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const rotationInterval = 5000;
  let selectedIndex = -1;
  let animation;
  let progressAnimation;
  let timer;
  let rotationVersion = 0;
  let rotationEnabled = !reducedMotion.matches;
  let inView = false;
  let panelHovered = false;
  let allowHoveredPlayback = false;
  let controlFocused = false;
  let allowControlPlayback = false;

  function cancelRotation() {
    clearTimeout(timer);
    timer = undefined;
    rotationVersion++;
    progressAnimation?.cancel();
  }

  function canRotate() {
    return rotationEnabled && inView && !document.hidden && section.getClientRects().length > 0
      && (!panelHovered || allowHoveredPlayback) && (!controlFocused || allowControlPlayback);
  }

  function scheduleRotation() {
    cancelRotation();
    rotationButton.dataset.playing = String(rotationEnabled);
    rotationButton.querySelector('.service-rotation-label').textContent = rotationEnabled ? 'Pause rotation' : 'Play rotation';
    tablist.dataset.rotating = String(canRotate());
    if (!canRotate()) return;

    const next = (selectedIndex + 1) % tabs.length;
    const image = panels[next].querySelector('img');
    image.loading = 'eager';
    const imageReady = image.decode().catch(() => {});
    const version = rotationVersion;
    if (!reducedMotion.matches) {
      progressAnimation = tabs[selectedIndex].querySelector('.service-tab-progress').animate(
        [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
        { duration: rotationInterval, fill: 'forwards' }
      );
    }
    timer = setTimeout(async () => {
      await imageReady;
      if (version !== rotationVersion || !canRotate()) return;
      selectPhase(next);
      scheduleRotation();
    }, rotationInterval);
  }

  function pauseRotation() {
    rotationEnabled = false;
    scheduleRotation();
  }

  function selectManually(index, options) {
    rotationEnabled = false;
    selectPhase(index, options);
    scheduleRotation();
  }

  function selectPhase(index, { focus = false, animate = true } = {}) {
    if (focus) tabs[index].focus();
    if (index === selectedIndex) return;
    animation?.cancel();
    selectedIndex = index;
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
      panels[i].inert = i !== index;
    });
    if (animate && !reducedMotion.matches && typeof panels[index].animate === 'function') {
      animation = panels[index].animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 220, easing: 'ease-out' }
      );
    }
  }

  tablist.setAttribute('role', 'tablist');
  stage.classList.add('is-enhanced');
  stage.setAttribute('aria-live', 'off');
  tabs.forEach((tab, index) => {
    const progress = document.createElement('span');
    progress.className = 'service-tab-progress';
    progress.setAttribute('aria-hidden', 'true');
    tab.append(progress);
    tab.setAttribute('role', 'tab');
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', () => selectManually(index));
    tab.addEventListener('pointerenter', () => { panels[index].querySelector('img').loading = 'eager'; });
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tabs.length - 1;
      else return;
      event.preventDefault();
      selectManually(next, { focus: true });
    });
  });

  function phaseFromHash() {
    return panels.findIndex(panel => `#${panel.id}` === location.hash);
  }
  const initialPhase = phaseFromHash();
  if (initialPhase >= 0) rotationEnabled = false;
  selectPhase(initialPhase < 0 ? 0 : initialPhase, { animate: false });
  tablist.hidden = false;
  controls.hidden = false;
  scheduleRotation();

  rotationButton.addEventListener('click', () => {
    rotationEnabled = !rotationEnabled;
    // An explicit Play action works even while its own control is focused.
    allowControlPlayback = rotationEnabled;
    allowHoveredPlayback = rotationEnabled;
    scheduleRotation();
  });
  section.addEventListener('focusin', event => {
    if (rotationButton.contains(event.target)) {
      controlFocused = true;
      allowControlPlayback = false;
      scheduleRotation();
    } else pauseRotation();
  });
  rotationButton.addEventListener('focusout', () => {
    controlFocused = false;
    allowControlPlayback = false;
    scheduleRotation();
  });
  stage.addEventListener('pointerenter', event => {
    if (event.pointerType === 'touch') return;
    panelHovered = true;
    allowHoveredPlayback = false;
    scheduleRotation();
  });
  stage.addEventListener('pointerleave', () => {
    panelHovered = false;
    allowHoveredPlayback = false;
    scheduleRotation();
  });
  stage.addEventListener('pointermove', () => {
    if (!allowHoveredPlayback) return;
    allowHoveredPlayback = false;
    scheduleRotation();
  });
  stage.addEventListener('pointerdown', pauseRotation, { passive: true });
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRect.height > 0;
    scheduleRotation();
  }, { rootMargin: '-128px 0px -128px 0px', threshold: 0 }).observe(stage);
  document.addEventListener('visibilitychange', scheduleRotation);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) rotationEnabled = false;
    scheduleRotation();
  });
  window.addEventListener('pagehide', cancelRotation);
  window.addEventListener('pageshow', scheduleRotation);
  window.addEventListener('hashchange', () => {
    const index = phaseFromHash();
    if (index >= 0) selectManually(index, { animate: false });
  });
})();
