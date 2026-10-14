(() => {
  'use strict';

  const STYLE_ID = 'wu-event-form-validation-style';
  const FIXED_ERROR =
    'Gewünschtes Setting (Mehrfachauswahl möglich) ist erforderlich';
  const BROKEN_ERROR =
    'The Gewünschtes Setting (Mehrfachauswahl möglich) ist erforderlich';

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      app-dynamic-form
      mat-form-field.mat-form-field-invalid
      .mdc-notched-outline__leading,
      app-dynamic-form
      mat-form-field.mat-form-field-invalid
      .mdc-notched-outline__notch,
      app-dynamic-form
      mat-form-field.mat-form-field-invalid
      .mdc-notched-outline__trailing,
      app-dynamic-form
      mat-form-field:has(input[aria-invalid="true"])
      .mdc-notched-outline__leading,
      app-dynamic-form
      mat-form-field:has(input[aria-invalid="true"])
      .mdc-notched-outline__notch,
      app-dynamic-form
      mat-form-field:has(input[aria-invalid="true"])
      .mdc-notched-outline__trailing,
      app-dynamic-form
      mat-form-field:has(textarea[aria-invalid="true"])
      .mdc-notched-outline__leading,
      app-dynamic-form
      mat-form-field:has(textarea[aria-invalid="true"])
      .mdc-notched-outline__notch,
      app-dynamic-form
      mat-form-field:has(textarea[aria-invalid="true"])
      .mdc-notched-outline__trailing,
      app-dynamic-form
      mat-form-field:has(mat-select[aria-invalid="true"])
      .mdc-notched-outline__leading,
      app-dynamic-form
      mat-form-field:has(mat-select[aria-invalid="true"])
      .mdc-notched-outline__notch,
      app-dynamic-form
      mat-form-field:has(mat-select[aria-invalid="true"])
      .mdc-notched-outline__trailing {
        border-color: #d32f2f !important;
      }
    `;
    document.head.appendChild(style);
  }

  function fixSettingErrorText(root = document) {
    root
      .querySelectorAll?.('mat-error, .mat-mdc-form-field-error, .mat-error')
      .forEach(el => {
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
        if (text === BROKEN_ERROR) el.textContent = FIXED_ERROR;
      });
  }

  function init() {
    ensureStyles();
    fixSettingErrorText();

    if (window.__wuEventFormValidationObserver) {
      window.__wuEventFormValidationObserver.disconnect();
    }

    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType !== Node.ELEMENT_NODE) return;
          if (
            node.matches?.('mat-error, .mat-mdc-form-field-error, .mat-error')
          ) {
            const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
            if (text === BROKEN_ERROR) node.textContent = FIXED_ERROR;
          }
          fixSettingErrorText(node);
        });
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: false
    });

    window.__wuEventFormValidationObserver = observer;
    console.info('[WU OSB] Formularvalidierungs-Styling aktiv.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
