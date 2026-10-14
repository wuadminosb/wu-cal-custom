(() => {
  'use strict';

  const WU = '#0085AD';
  const SEARCH_GROUP = '.wu-series-weekdays';
  const RESULTS_SIDEBAR = '.usi-searchResults-sidebar';
  const RESULTS_GROUP = '.usi-dayOfWeekButtons';

  const setImportant = (el, prop, value) => {
    if (el) el.style.setProperty(prop, value, 'important');
  };

  const isWeekendToggle = toggle => {
    const value = toggle.getAttribute('value');
    return value === '0' || value === '6';
  };

  const applyToggleState = toggle => {
    const button = toggle.querySelector('.mat-button-toggle-button');
    if (!button || isWeekendToggle(toggle)) return;

    const selected = button.getAttribute('aria-pressed') === 'true';
    const bg = selected ? WU : '#FFFFFF';
    const fg = selected ? '#FFFFFF' : WU;

    setImportant(toggle, 'background-color', bg);
    setImportant(toggle, 'border-color', WU);
    setImportant(toggle, 'color', fg);
    setImportant(button, 'background-color', bg);
    setImportant(button, 'color', fg);

    const label = button.querySelector('.mat-button-toggle-label-content');
    setImportant(label, 'color', fg);
  };

  const styleSearchWeekly = () => {
    document.querySelectorAll(SEARCH_GROUP).forEach(group => {
      if (group.closest(RESULTS_SIDEBAR)) return;

      group.querySelectorAll('mat-button-toggle').forEach(toggle => {
        if (isWeekendToggle(toggle)) return;
        applyToggleState(toggle);

        const button = toggle.querySelector(~.mat-button-toggle-button');
        if (button && !button.dataset.wuStateObserver) {
          button.dataset.wuStateObserver = '1';
          new MutationObserver(() => applyToggleState(toggle)).observe(button, {
            attributes: true,
            attributeFilter: ['aria-pressed']
          });
        }
      });
    });
  };

  const findFieldByLabel = (root, labelText) => {
    return [...root.querySelectorAll('mat-form-field')].find(field =>
      [...field.querySelectorAll('mat-label')].some(
        label => label.textContent.trim() === labelText
      )
    ) || null;
  };

  const styleSidebarField = field => {
    if (!field) return;

    [
      ['display', 'flex'],
      ['width', '100%'],
      ['max-width', '100%'],
      ['min-width', '0'],
      ['margin', '0 0 8px 0'],
      ['opacity', '1'],
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

    const outline = field.querySelector(~.mdc-notched-outline');
    setImportant(outline, 'width', '100%');
    setImportant(outline, 'max-width', '100%');
  };

  const styleResultsWeeklyGroup = (sidebar, repeatField, group) => {
    if (group.previousElementSibling !== repeatField) {
      repeatField.insertAdjacentElement('afterend', group);
    }

    [
      ['display', 'flex'],
      ['position', 'static'],
      ['width', 'auto'],
      ['height', '36px'],
      ['gap', '8px'],
      ['margin', '8px 0 14px 0'],
      ['opacity', '1'],
      ['padding', '0'],
      ['border', '0'],
      ['overflow', 'visible'],
      ['background', 'transparent']
    ].forEach(([p, v]) => setImportant(group, p, v));

    group.querySelectorAll('mat-button-toggle').forEach(toggle => {
      if (isWeekendToggle(toggle)) {
        setImportant(toggle, 'display', 'none');
        return;
      }

      const button = toggle.querySelector('.mat-button-toggle-button');
      if (!button) return;
      const label = button.querySelector('.mat-button-toggle-label-content');

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

      applyToggleState(toggle);

      if (!button.dataset.wuStateObserver) {
        button.dataset.wuStateObserver = '1';
        new MutationObserver(() => applyToggleState(toggle)).observe(button, {
          attributes: true,
          attributeFilter: ['aria-pressed']
        });
      }
    });
  };

  const prepareResultsLayout = () => {
    if (!location.pathname.includes('/searchresults')) return;

    const sidebar = document.querySelector(RESULTS_SIDEBAR);
    if (!sidebar