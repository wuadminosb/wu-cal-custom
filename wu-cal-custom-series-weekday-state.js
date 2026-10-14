(() => {
  'use strict';

  const GROUP_SELECTOR = '.wu-series-weekdays';
  const WU = '#0085AD';
  const OFF_BG = '#FFFFFF';
  const OFF_TEXT = WU;
  const ON_BG = WU;
  const ON_TEXT = '#FFFFFF';

  let rootObserver = null;
  const groupObservers = new WeakMap();
  const scheduled = new WeakSet();

  function setImportant(el, prop, value) {
    el.style.setProperty(prop, value, 'important');
  }

  function applyToggleState(toggle) {
    const button = toggle.querySelector('.mat-button-toggle-button');
    if (!button) return;

    const value = toggle.getAttribute('value');
    if (value === '0' || value === '6') return;

    const selected = button.getAttribute('aria-pressed') === 'true';
    const bg = selected ? ON_BG : OFF_BG;
    const fg = selected ? ON_TEXT : OFF_TEXT;

    setImportant(toggle, 'background-color', bg);
    setImportant(toggle, 'border-color', WU);
    setImportant(toggle, 'color', fg);
    setImportant(button, 'background-color', bg);
    setImportant(button, 'color', fg);

    const label = button.querySelector('.mat-button-toggle-label-content');
    if (label) setImportant(label, 'color', fg);
  }

  function applyGroup(group) {
    group.querySelectorAll('mat-button-toggle').forEach(applyToggleState);
  }

  function scheduleGroup(group) {
    if (scheduled.has(group)) return;
    scheduled.add(group);
    requestAnimationFrame(() => {
      scheduled.delete(group);
      applyGroup(group);
    });
  }

  function observeGroup(group) {
    if (groupObservers.has(group)) return;

    applyGroup(group);

    const observer = new MutationObserver(() => scheduleGroup(group));
    observer.observe(group, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-pressed', 'class']
    });

    groupObservers.set(group, observer);
  }

  function findAndObserveGroups() {
    document.querySelectorAll(GROUP_SELECTOR).forEach(observeGroup);
  }

  function init() {
    findAndObserveGroups();

    rootObserver = new MutationObserver(() => {
      requestAnimationFrame(findAndObserveGroups);
    });
    rootObserver.observe(document.body, { subtree: true, childList: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
