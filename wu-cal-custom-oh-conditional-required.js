(() => {
  'use strict';

  window.__ohRules?.stop?.();

  const VERSION = '20261019-2';
  const STYLE_ID = 'wu-oh-required-marker-styles';
  const MARKER_ATTR = 'data-wu-oh-required-marker';

  const rules = [
    { source: ['verteilung geplant'], targets: ['-1003123026'] },
    { source: ['§5 hsg'], targets: ['-1003123039'] },
    { source: ['teilnahmegebühren', 'eintrittsgelder eingehoben'], targets: ['-1003123034', '-1003123020'] },
    { source: ['kooperationsveranstaltung'], targets: ['-1003123009'] }
  ];

  const norm = (s) =>
    String(s || '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleLowerCase('de');

  const saved = new Map();
  let queued = false;
  let stopped = false;
  let locked = null;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      app-dynamic-form .mat-mdc-form-field-required-marker,
      app-dynamic-form .mat-mdc-form-field-required-marker::after,
      app-dynamic-form .mat-form-field-required-marker,
      app-dynamic-form .mat-form-field-required-marker::after,
      app-dynamic-form .mdc-floating-label--required,
      app-dynamic-form .mdc-floating-label--required::after,
      app-dynamic-form [${MARKER_ATTR}] {
        color: #d32f2f !important;
      }

      app-dynamic-form [${MARKER_ATTR}] {
        font-weight: 700;
      }
    `;
    document.head.appendChild(style);
  }

  function button() {
    return [...document.querySelectorAll('button')].find((b) =>
      norm(b.textContent).includes('zur übersicht gehen')
    );
  }

  function unlock() {
    if (locked?.dataset.ohLock === '1') {
      locked.disabled = false;
      delete locked.dataset.ohLock;
    }
    locked = null;
  }

  function findSource(fields, terms) {
    return fields.find((field) => {
      const label = norm(field.querySelector('mat-label')?.textContent);
      return (
        terms.some((term) => label.includes(term)) &&
        field.querySelector('mat-select') &&
        field.getClientRects().length
      );
    });
  }

  function findTarget(ids) {
    for (const id of ids) {
      const input = document.getElementById(id);
      if (input?.isConnected) return input;
    }
    return null;
  }

  function hasNativeVisualMarker(field) {
    if (!field) return false;
    return Boolean(
      field.querySelector(
        '.mat-mdc-form-field-required-marker, .mat-form-field-required-marker'
      ) ||
      field.querySelector('.mdc-floating-label--required')
    );
  }

  function syncVisualMarker(input, wanted, originallyRequired) {
    const field = input.closest('mat-form-field');
    const label = field?.querySelector('mat-label');

    if (!field || !label) return;

    const existing = label.querySelector(`[${MARKER_ATTR}]`);

    if (!wanted || originallyRequired || hasNativeVisualMarker(field)) {
      existing?.remove();
      return;
    }

    if (!existing) {
      const marker = document.createElement('span');
      marker.setAttribute(MARKER_ATTR, 'true');
      marker.setAttribute('aria-hidden', 'true');
      marker.textContent = ' *';
      label.appendChild(marker);
    }
  }

  function restoreVisualMarker(input) {
    input
      .closest('mat-form-field')
      ?.querySelector(`[${MARKER_ATTR}]`)
      ?.remove();
  }

  function check(report = false) {
    ensureStyles();

    const fields = [...document.querySelectorAll('mat-form-field')];
    const missing = [];

    for (const rule of rules) {
      const source = findSource(fields, rule.source);
      const input = findTarget(rule.targets);

      if (!source || !input) continue;

      if (!saved.has(input)) {
        saved.set(input, {
          required: input.required,
          aria: input.getAttribute('aria-required')
        });
      }

      const selection = norm(
        source.querySelector(
          '.mat-mdc-select-min-line, .mat-mdc-select-value-text, .mat-select-value-text'
        )?.textContent
      );

      const active = /ja(?:$|[\s.,;:!()\-])/.test(selection);
      const empty = !String(input.value || '').trim();
      const original = saved.get(input);
      const wanted = original.required || active;

      if (input.required !== wanted) input.required = wanted;

      if (input.getAttribute('aria-required') !== String(wanted)) {
        input.setAttribute('aria-required', String(wanted));
      }

      syncVisualMarker(input, wanted, original.required);

      if (!active || !empty) input.setCustomValidity('');

      if (active && empty) {
        missing.push(input);
        if (report) {
          input.setCustomValidity('Bei Ja ist dieses Feld verpflichtend.');
        }
      }
    }

    const next = button();

    if (locked && locked !== next) unlock();

    if (next && missing.length && !next.disabled) {
      next.disabled = true;
      next.dataset.ohLock = '1';
      locked = next;
    }

    if (!missing.length) unlock();

    return missing;
  }

  function schedule() {
    if (queued || stopped) return;

    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      check();
    });
  }

  function guard(event) {
    if (
      event.type === 'click' &&
      !norm(event.target.closest?.('button')?.textContent).includes(
        'zur übersicht gehen'
      )
    ) {
      return;
    }

    const missing = check(true);
    if (!missing.length) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    missing[0].focus();
    missing[0].reportValidity();
  }

  ensureStyles();

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  for (const type of ['input', 'change']) {
    document.addEventListener(type, schedule, true);
  }

  for (const type of ['click', 'submit']) {
    document.addEventListener(type, guard, true);
  }

  window.__ohRules = {
    version: VERSION,
    check,
    stop() {
      stopped = true;
      observer.disconnect();

      for (const type of ['input', 'change']) {
        document.removeEventListener(type, schedule, true);
      }

      for (const type of ['click', 'submit']) {
        document.removeEventListener(type, guard, true);
      }

      unlock();

      for (const [input, value] of saved) {
        if (!input.isConnected) continue;

        input.required = value.required;

        if (value.aria === null) {
          input.removeAttribute('aria-required');
        } else {
          input.setAttribute('aria-required', value.aria);
        }

        input.setCustomValidity('');
        restoreVisualMarker(input);
      }

      saved.clear();
      delete window.__ohRules;
    }
  };

  schedule();
})();
