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
  let overlayObserver = null;
  let refreshPending = false;

  const setImportant = (el, prop, value) => {
    if (el) el.style.setProperty(prop, value, 'important');
  };

  const isWeekend = toggle => {
    const value = toggle.getAttribute('value');
    return value === '0' || value === '6';
  };

  const applyState = toggle => {
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
    setImportant(label, 'color', fg);
  };

  const styleSearchToggle = toggle => {
    if (isWeekend(toggle)) return;
    applyState(toggle);
  };

  const styleResultsToggle = toggle => {
    if (isWeekend(toggle)) {
      setImportant(toggle, 'display', 'none');
      return;
    }

    const button = toggle.querySelector('.mat-button-toggle-button');
    if (!button) return;
    const label = button.querySelector(~.mat-button-toggle-label-content');

    [
      ['display', 'flex'],
      ['flex', '0 0 48px'],
      ['width', '48px'],
      ['min-width', '48px'],
      ['max-width', '48px'],
      ['height', '36px'],
      ['min-height', '36px'],
      ['max-height', '36px'],
      ['margin', '0'],
      ['padding', '0'],
      ['border-width', '1px'],
      ['border-style', 'solid'],
      ['border-color', WU],
      ['border-radius', '0'],
      ['box-shadow', 'none'],
      ['overflow', 'hidden']
    ].forEach(([p, v]) => setImportant(toggle, p, v));

    [
      ['display', 'flex'],
      ['align-items', 'center'],
      ['justify-content', 'center'],
      ['width', '48px'],
      ['min-width', '48px'],
      ['height', '34px'],
      ['min-height', '34px'],
      ['margin', '0'],
      ['padding', '0'],
      ['border', '0'],
      ['border-radius', '0'],
      ['box-shadow', 'none']
    ].forEach(([p, v]) => setImportant(button, p, v));

    if (label) {
      [
        ['display', 'block'],
        ['width', '100%'],
        ['padding', '0'],
        ['margin', '0'],
        ['line-height', '34px'],
        ['text-align', 'center'],
        ['font-size', '14px'],
        ['font-weight', '400']
      ].forEach(([p, v]) => setImportant(label, p, v));
    }

    applyState(toggle);
  };

  const applyGroup = (group, context) => {
    if (!group?.isConnected) return;

    if (context === 'results') {
      [
        ['display', 'flex'],
        [position', 'static'],
        ['width', 'auto'],
        ['height', '36px'],
        ['gap', '8px'],
        ['margin', '8px 0 14px 0'],
        ['padding', '0'],
        ['border', '0'],
        ['overflow', 'visible'],
        ['background', 'transparent']
      ].forEach(([p, v]) => setImportant(group, p, v));
    }

    group.querySelectorAll('mat-button-toggle').forEach(toggle => {
      if (context === 'results') styleResultsToggle(toggle);
      else styleSearchToggle(toggle);
    });
  };

  const scheduleGroup = (group, context) => {
    if (scheduledGroups.has(group)) return;
    scheduledGroups.add(group);
    requestAnimationFrame(() => {
      scheduledGroups.delete(group);
      applyGroup(group, context);
    });
  };

  const observeGroup = (group, context) => {
    const existing = observedGroups.get(group);
    if (existing?.context === context) {
      scheduleGroup(group, context);
      return;
    }

    existing?.observer.disconnect();
    applyGroup(group, context);
    const observer = new MutationObserver(() => scheduleGroup(group, context));
    observer.observe(group, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['aria-pressed', 'class']
    });
    observedGroups.set(group, { observer, context });
  };

  const prepareSearchGroups = () => {
    document.querySelectorAll(SEARCH_GROUP_SELECTOR).forEach(group => {
      if (group.closest(RESULTS_SIDEBAR_SELECTOR)) return;
      observeGroup(group, 'search');
    });
  };

  const prepareResultsGroup = () => {
    const sidebar = document.querySelector(RESULTS_SIDEBAR_SELECTOR);
    if (!sidebar) return;
    const repeatField = sidebar.querySelector(RESULTS_REPEAT_SELECTOR);
    const group = sidebar.querySelector(RESULTS_GROUP_SELECTOR);
    if (!repeatField || !group) return;
    if (group.previousElementSibling !== repeatField) {
      repeatField.insertAdjacentElement('afterend', group);
    }
    observeGroup(group, 'results');
  };

  const findFieldByLabel = (root, labelText) =>
    [...root.querySelectorAll('mat-form-field')].find(field =>
      [...field.querySelectorAll('mat-label')].some(
        label => label.textContent.trim() === labelText
      )
    ) || null;

  const styleSidebarField = field => {
    if (!field) return;
    [
      ['display', 'flex'],
      ['width', '100%'],
      ['max-width', '100%'],
      ['min-width', '0'],
      ['margin', '0 0 8px 0'],
      ['padding', '0']
    ].forEach(([p, v]) => setImportant(field, p, v));

    const wrapper = field.querySelector(~.mat-mdc-text-field-wrapper');
    setImportant(wrapper, 'width', '100%');
    setImportant(wrapper, 'max-width', '100%');

    const flex = field.querySelector(~.mat-mdc-form-field-flex');
    setImportant(flex, 'width', '100%');
    setImportant(flex, 'max-width', '100%');

    const infix = field.querySelector('.mat-mdc-form-field-infix');
    if (infix) {
      setImportant(infix, 'width', 'auto');
      setImportant(infix, 'min-width', '0');
      setImportant(infix, 'max-width', 'none');
      setImportant(infix, 'flex', '1 1 auto');
    }

    const outline = field.querySelector('.mdc-notched-outline');
    setImportant(outline, 'width', '100%');
    setImportant(outline, 'max-width', '100%');
  };

  const prepareMonthlyResultsLayout = () => {
    if (!location.pathname.includes('/searchresults')) return;
    const sidebar = document.querySelector(RESULTS_SIDEBAR_SELECTOR);
    if (!sidebar) return;

    const repeat = findFieldByLabel(sidebar, 'Wiederholt');
    const ordinal = findFieldByLabel(sidebar, 'Wiederkehrend jede');
    const day = findFieldByLabel(sidebar, 'Tag');
    if (!repeat || !ordinal || !day) return;
    if (!/Monatlich/i.test(repeat.textContent || '')) return;

    if (ordinal.previousElementSibling !== repeat) {
      repeat.insertAdjacentElement('afterend', ordinal);
    }
    if (day.previousElementSibling !== ordinal) {
      ordinal.insertAdjacentElement('afterend', day);
    }

    [repeat, ordinal, day].forEach(styleSidebarField);
  };

  const hideSaturday = () => {
    if (!location.pathname.includes('/search')) return;

    const candidates = document.querySelectorAll(
    [
      '.cdk-overlay-container [role="option"]',
      '.cdk-overlay-container mat-option',
      '.cdk-overlay-container .mat-mdc-option',
      '.cdk-overlay-container .mat-option',
      '.mat-mdc-select-panel [role="option"]',
     '.mat-select-panel [role="option"]'
    ].join(',')
   );

    candidates.forEach(option => {
      const text = (option.textContent || '').replace(/\s+/g, ' ').trim();
      if (text !== 'Samstag') return;
      setImportant(option, 'display', 'none');
      option.setAttribute('aria-hidden', 'true');
    });
  };

  const refresh = () => {
    refreshPending = false;
    prepareSearchGroups();
    prepareResultsGroup();
    prepareMonthlyResultsLayout();
    hideSaturday();
  };

  const scheduleRefresh = () => {
    if (refreshPending) return;
    refreshPending = true;
    requestAnimationFrame(refresh);
  };

  const init = () => {
    refresh();

    rootObserver = new MutationObserver(scheduleRefresh);
    rootObserver.observe(document.body, {
      subtree: true,
      childList: true
    });

    const overlay = document.querySelector('.cdk-overlay-container') || document.body;
    overlayObserver = new MutationObserver(() => requestAnimationFrame(hideSaturday));
    overlayObserver.observe(overlay, {
      subtree: true,
      childList: true
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
