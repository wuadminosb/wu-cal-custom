(() => {
  'use strict';

  const WU = '#0085AD';
  const OFF_BG = '#FFFFFF';
  const OFF_TEXT = WU;
  const ON_BG = WU;
  const ON_TEXT = '#FFFFFF';

  const SEARCH_GROUP_SELECTOR = '.wu-series-weekdays';
  const RESULTS_SIDEBAR_SELECTOR = '.usi-searchResults-sidebar';
  const RESULTS_GROUP_SELECTOR = '.usi-dayOfWeekButtons';
  const RESULTS_REPEAT_SELECTOR = '.wu-repeat-field';

  const observedGroups = new WeakMap();
  const scheduledGroups = new WeakSet();
  let rootObserver = null;

  function setImportant(el, prop, value) {
    el.style.setProperty(prop, value, 'important');
  }

  function isWeekend(toggle) {
    const value = toggle.getAttribute('value');
    return value === '0' || value === '6';
  }

  function applyState(toggle) {
    const button = toggle.querySelector('.mat-button-toggle-button');
    if (!button || isWeekend(toggle)) return;

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

  function styleSearchToggle(toggle) {
    if (isWeekend(toggle)) return;
    applyState(toggle);
  }

  function styleResultsToggle(toggle) {
    if (isWeekend(toggle)) {
      setImportant(toggle, 'display', 'none');
      return;
    }

    const button = toggle.querySelector('.mat-button-toggle-button');
    if (!button) return;

    const label = button.querySelector('.mat-button-toggle-label-content');

    setImportant(toggle, 'display', 'flex');
    setImportant(toggle, 'flex', '0 0 48px');
    setImportant(toggle, 'width', '48px');
    setImportant(toggle, 'height', '36px');
    setImportant(toggle, 'min-width', '48px');
    setImportant(toggle, 'max-width', '48px');
    setImportant(toggle, 'height', '36px');
    setImportant(toggle, 'min-height', '36px');
    setImportant(toggle, 'max-height', '36px');
    setImportant(toggle, 'margin', '0');
    setImportant(toggle, 'padding', '0');
    setImportant(toggle, 'border-width', '1px');
    setImportant(toggle, 'border-style', 'solid');
    setImportant(toggle, 'border-color', WU);
    setImportant(toggle, 'border-radius', '0');
    setImportant(toggle, 'box-shadow', 'none');
    setImportant(toggle, 'overflow', 'hidden');

    setImportant(button, 'display', 'flex');
    setImportant(button, 'align-items', 'center');
    setImportant(button, 'justify-content', 'center');
    setImportant(button, 'width', '48px');
    setImportant(button, 'height', '34px');
    setImportant(button, 'min-height', '34px');
    setImportant(button, 'min-width', '48px');
    setImportant(button, 'margin', '0');
    setImportant(button, 'padding', '0');
    setImportant(button, 'border', '0');
    setImportant(button, 'border-radius', '0');
    setImportant(button, 'box-shadow', 'none');

    if (label) {
      setImportant(label, 'display', 'block');
      setImportant(label, 'width', '100%');
      setImportant(label, 'padding', '0');
      setImportant(label, 'margin', '0');
      setImportant(label, 'line-height', '34px');
      setImportant(label, 'text-align', 'center');
      setImportant(label, 'font-size', '14px');
      setImportant(label, 'font-weight', '400');
    }

    applyState(toggle);
  }

  function applyGroup(group, context) {
    if (!group?.isConnected) return;

    if (context === 'results') {
      setImportant(group, 'display', 'flex');
      setImportant(group, 'position', 'static');
      setImportant(group, 'width', 'auto');
      setImportant(group, 'height', '36px');
      setImportant(group, 'gap', '8px');
      setImportant(group, 'margin', '8px 0 14px 0');
      setImportant(group, 'padding', '0');
      setImportant(group, 'border', '0');
      setImportant(group, 'overflow', 'visible');
      setImportant(group, 'background', 'transparent');
    }

    group.querySelectorAll('mat-button-toggle').forEach(toggle => {
      if (context === 'results') {
        styleResultsToggle(toggle);
      } else {
        styleSearchToggle(toggle);
      }
    });
  }

  function scheduleGroup(group, context) {
    if (scheduledGroups.has(group)) return;
    scheduledGroups.add(group);

    requestAnimationFrame(() => {
      scheduledGroups.delete(group);
      applyGroup(group, context);
    });
  }

  function observeGroup(group, context) {
    const existing = observedGroups.get(group);
    if (existing?.context === context) {
      scheduleGroup(group, context);
      return;
    }

    if (existing) existing.observer.disconnect();

    applyGroup(group, context);

    const observer = new MutationObserver(() => scheduleGroup(group, context));
    observer.observe(group, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-pressed', 'class']
    });

    observedGroups.set(group, { observer, context });
  }

  function prepareSearchGroups() {
    document.querySelectorAll(SEARCH_GROUP_SELECTOR).forEach(group => {
      if (group.closest(RESULTS_SIDEBAR_SELECTOR)) return;
      observeGroup(group, 'search');
    });
  }

  function prepareResultsGroup() {
    const sidebar = document.querySelector(RESULTS_SIDEBAR_SELECTOR);
    if (!sidebar) return;

    const repeatField = sidebar.querySelector(RESULTS_REPEAT_SELECTOR);
    const group = sidebar.querySelector(RESULTS_GROUP_SELECTOR);
    if (!repeatField || !group) return;

    if (group.previousElementSibling !== repeatField) {
      repeatField.insertAdjacentElement('afterend', group);
    }

    observeGroup(group, 'results');
  }

  function refresh() {
    prepareSearchGroups();
    prepareResultsGroup();
  }

  function init() {
    refresh();

    rootObserver = new MutationObserver(() => {
      requestAnimationFrame(refresh);
    });

    rootObserver.observe(document.body, {
      subtree: true,
      childList: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
