(() => {
  'use strict';

  window.__ohRules?.stop?.();

  const VERSION = '20261019-5';
  const STYLE_ID = 'wu-oh-conditional-required-styles';
  const INVALID_CLASS = 'wu-conditional-invalid';
  const MARKER_CLASS = 'wu-conditional-required-marker';
  const ERROR_WRAPPER_CLASS = 'wu-conditional-required-error-wrapper';
  const ERROR_CLASS = 'wu-conditional-required-error';

  const norm = value =>
    String(value ?? '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleLowerCase('de');

  const rules = [
    {
      source: 'Für wen wird die Raumanfrage gestellt?',
      target: 'Bezeichnung der Fraktion, des Clubs bzw. der sonstigen Organisation',
      required: value => ['fraktion', 'club', 'sonstiges'].includes(norm(value)),
      message: 'Bitte geben Sie die Bezeichnung der Fraktion, des Clubs bzw. der sonstigen Organisation an.'
    },
    {
      source: 'Ist im Zuge der Veranstaltung eine Verteilung geplant?',
      target: 'Wenn ja, geben Sie nähere Informationen an (was, wann, wo?)',
      required: value => norm(value).startsWith('ja'),
      message: 'Bitte geben Sie änere Informationen zur geplanten Verteilung an.'
    },
    {
      source: 'Handelt es sich um eine Veranstaltung gemäß §5 HSG?',
      target: 'Wenn ja, geben Sie die Begründung an',
      required: value => norm(value).startsWith('ja'),
      message: 'Bitte geben Sie die Begründung an.'
    },
    {
      source: 'Erheben Sie Teilnahmegebühren oder Eintrittsgelder?',
      target: 'Wenn ja, in welcher Höhe?',
      required: value => norm(value).startsWith('ja'),
      message: 'Bitte geben Sie die Höhe der Teilnahmegebühren bzw. Eintrittsgelder an.'
    },
    {
      source: 'Handelt es sich um eine Kooperationsveranstaltung?',
      target: 'Wenn ja, bitte den /die Kooperationspartner*in angeben',
      required: value => norm(value).startsWith('ja'),
      message: 'Bitte geben Sie den/die Kooperationspartner*in an.'
    }
  ];

  let active = null;
  let pageObserver = null;
  let nativeMessageObserver = null;
  let scheduled = false;
  let messageScheduled = false;

  function addStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
ipp-dynamic-form .mat-mdc-form-field-required-marker,
app-dynamic-form .mat-mdc-form-field-required-marker::after,
app-dynamic-form .mat-form-field-required-marker,
app-dynamic-form .mat-form-field-required-marker::after,
app-dynamic-form .mdc-floating-label--required,
app-dynamic-form .mdc-floating-label--required::after,
app-dynamic-form .${MARKER_CLASS} {
  color: #d32f2f !important;
}

app-dynamic-form mat-form-field.${INVALID_CLASS} .mdc-notched-outline__leading,
app-dynamic-form mat-form-field.${INVALID_CLASS} .mdc-notched-outline__notch,
app-dynamic-form mat-form-field.${INVALID_CLASS} .mdc-notched-outline__trailing {
  border-color: #d32f2f !important;
}

app-dynamic-form mat-form-field.${INVALID_CLASS} .mdc-floating-label,
app-dynamic-form mat-form-field.${INVALID_CLASS} mat-label {
  color: #d32f2f !important;
}

app-dynamic-form .${ERROR_WRAPPER_CLASS}[hidden],
app-dynamic-form .${ERROR_CLASS}[hidden] {
  display: none !important;
}
`;
    document.head.appendChild(style);
  }

  function cleanLabelText(label) {
    if (!label) return '';
    const clone = label.cloneNode(true);
    clone.querySelectorAll(`.${MARKER_CLASS}`).forEach(node => node.remove());
    return norm(clone.textContent);
  }

  function findField(root, labelText) {
    const wanted = norm(labelText);
    return [...root.querySelectorAll('mat-form-field')].find(field => {
      const label = field.querySelector('mat-label, label.mdc-floating-label');
      return cleanLabelText(label) === wanted;
    });
  }

  function selectedText(select) {
    return (
      select.querySelector(
        '.mat-mdc-select-value-text, .mat-mdc-select-min-line, .mat-select-value-text'
      )?.textContent?.trim() || ''
    );
  }

  function restoreAttr(element, name, value) {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }

  function resolve(root, rule, index) {
    const sourceField = findField(root, rule.source);
    const targetField = findField(root, rule.target);
    const select = sourceField?.querySelector('mat-select');
    const input = targetField?.querySelector('input:not([hidden]), textarea:not([hidden])');
    const label = targetField?.querySelector('label.mdc-floating-label, mat-label');
    const subscript = targetField?.querySelector('.mat-mdc-form-field-subscript-wrapper');
    const hintWrapper = targetField?.querySelector('.mat-mdc-form-field-hint-wrapper');

    if (!sourceField || !targetField || !select || !input || !label || !subscript) {
      return null;
    }

    return {
      rule,
      select,
      field: targetField,
      input,
      label,
      subscript,
      hintWrapper,
      errorId: `wu-oh-conditional-required-error-${index}`,
      original: {
        required: input.getAttribute('required'),
        ariaRequired: input.getAttribute('aria-required'),
        describedBy: input.getAttribute('aria-describedby'),
        materialInvalid: targetField.classList.contains('mat-form-field-invalid'),
        hintDisplay: hintWrapper?.style.display ?? ''
      }
    };
  }

  function install(item) {
    let touched = false;

    const mustFill = () => item.rule.required(selectedText(item.select));
    const empty = () => item.input.value.trim() === '';

    function setMarker(show) {
      let own = item.label.querySelector(`.${MARKER_CLASS}`);
      const native = item.label.querySelector('.mat-mdc-form-field-required-marker, .mat-form-field-required-marker');

      if (show && !native && !own) {
        own = document.createElement('span');
        own.className = `mat-mdc-form-field-required-marker mdc-floating-label--required ${MARKER_CLASS}`;
        own.setAttribute('aria-hidden', 'true');
        item.label.appendChild(own);
      } else if (!show) {
        own?.remove();
      }
    }

    function ensureError() {
      let wrapper = item.subscript.querySelector(`.${ERROR_WRAPPER_CLASS}`);
      if (wrapper) {
        return {
          wrapper,
          error: wrapper.querySelector(`.${ERROR_CLASS}`)
        };
      }

      wrapper = document.createElement('div');
      wrapper.className = `mat-mdc-form-field-error-wrapper ng-star-inserted ${ERROR_WRAPPER_CLASS}`;
      wrapper.hidden = true;

      const error = document.createElement('mat-error');
      error.id = item.errorId;
      error.className = `mat-mdc-form-field-error mat-mdc-form-field-bottom-align ${ERROR_CLASS}`;
      error.setAttribute('role', 'alert');
      error.hidden = true;

      const inner = document.createElement('div');
      inner.className = 'ng-star-inserted';
      inner.textContent = item.rule.message;
      error.appendChild(inner);
      wrapper.appendChild(error);
      item.subscript.insertBefore(wrapper, item.subscript.firstChild);

      return { wrapper, error };
    }

    function setDescription(show) {
      const ids = new Set(
        String(item.original.describedBy || '')
          .split(/\s+/)
          .filter(Boolean)
      );

      if (show) ids.add(item.errorId);
      if (ids.size) {
        item.input.setAttribute('aria-describedby', [...ids].join(' '));
      } else {
        item.input.removeAttribute('aria-describedby');
      }
    }

    function update(force = false) {
      const required = mustFill();
      const isEmpty = empty();
      const invalid = required && isEmpty && (touched || force);

      item.input.toggleAttribute('required', required);
      item.input.setAttribute('aria-required', String(required));
      item.input.setCustomValidity(required && isEmpty ? item.rule.message : '');

      setMarker(required);
      item.field.classList.toggle(INVALID_CLASS, invalid);
      item.field.classList.toggle('mat-form-field-invalid', invalid);

      const { wrapper, error } = ensureError();
      wrapper.hidden = !invalid;
      error.hidden = !invalid;
      if (item.hintWrapper) {
        item.hintWrapper.style.display = invalid ? 'none' : item.original.hintDisplay;
      }
      setDescription(invalid);
    }

    const onInput = () => {
      touched = true;
      update();
    };
    const onBlur = () => {
      touched = true;
      update();
    };
    const onInvalid = event => {
      event.preventDefault();
      touched = true;
      update(true);
    };

    item.input.addEventListener('input', onInput);
    item.input.addEventListener('blur', onBlur);
    item.input.addEventListener('invalid', onInvalid);

    const selectObserver = new MutationObserver(() => update());
    selectObserver.observe(item.select, {
      childList: true,
      characterData: true,
      subtree: true
    });

    item.update = update;
    item.isInvalid = () => mustFill() && empty();
    item.connected = () =>
      item.select.isConnected &&
      item.field.isConnected &&
      item.input.isConnected &&
      item.label.isConnected;

    item.cleanup = () => {
      selectObserver.disconnect();
      item.input.removeEventListener('input', onInput);
      item.input.removeEventListener('blur', onBlur);
      item.input.removeEventListener('invalid', onInvalid);
      item.label.querySelector(`.${MARKER_CLASS}`)?.remove();
      item.subscript.querySelector(`.${ERROR_WRAPPER_CLASS}`)?.remove();
      item.field.classList.remove(INVALID_CLASS);
      if (!item.original.materialInvalid) {
        item.field.classList.remove('mat-form-field-invalid');
      }
      item.input.setCustomValidity('');
      restoreAttr(item.input, 'required', item.original.required);
      restoreAttr(item.input, 'aria-required', item.original.ariaRequired);
      restoreAttr(item.input, 'aria-describedby', item.original.describedBy);
      if (item.hintWrapper) {
        item.hintWrapper.style.display = item.original.hintDisplay;
      }
    };

    update();
    return item;
  }

  function cleanup() {
    if (!active) return;
    active.form.removeEventListener('submit', active.submit, true);
    active.items.forEach(item => item.cleanup());
    active = null;
  }

  function refresh() {
    const root = document.querySelector('app-dynamic-form');
    const form = root?.querySelector('form') || root?.closest('form');

    if (!root || !form) {
      cleanup();
      return;
    }

    if (
      active?.form === form &&
      active.items.every(item => item.connected())
    ) {
      active.items.forEach(item => item.update());
      return;
    }

    const found = rules.map((rule, index) => resolve(root, rule, index));
    if (found.some(item => !item)) return;

    cleanup();
    const items = found.map(install);

    const submit = event => {
      items.forEach(item => item.update(true));
      const first = items.find(item => item.isInvalid());
      if (!first) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      first.input.focus();
      first.input.reportValidity();
    };

    form.addEventListener('submit', submit, true);
    active = { form, items, submit };

    console.info('[ÖH OSB] Bedingte Pflichtfelder aktiviert.', VERSION);
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      refresh();
    });
  }

  function fixNativeRequiredMessages() {
    document
      .querySelectorAll(
        'app-dynamic-form mat-error, app-dynamic-form .mat-mdc-form-field-error'
      )
      .forEach(error => {
        const walker = document.createTreeWalker(error, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const original = node.nodeValue || '';
          const corrected = original.replace(
            /^(\s*)The\s+(?=.+ \sist erforderlich\s*$)/i,
            '$1'
          );
          if (corrected !== original) node.nodeValue = corrected;
        }
      });
  }

  function scheduleMessageFix() {
    if (messageScheduled) return;
    messageScheduled = true;
    requestAnimationFrame(() => {
      messageScheduled = false;
      fixNativeRequiredMessages();
    });
  }

  function start() {
    addStyles();
    schedule();
    fixNativeRequiredMessages();

    pageObserver = new MutationObserver(schedule);
    pageObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    nativeMessageObserver = new MutationObserver(scheduleMessageFix);
    nativeMessageObserver.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  function stop() {
    cleanup();
    pageObserver?.disconnect();
    nativeMessageObserver?.disconnect();
    pageObserver = null;
    nativeMessageObserver = null;
    document.getElementById(STYLE_ID)?.remove();
    delete window.__ohRules;
  }

  window.__ohRules = {
    version: VERSION,
    refresh,
    stop
  };

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
