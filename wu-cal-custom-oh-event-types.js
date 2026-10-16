(() => {
  'use strict';

  const HIDDEN_EVENT_TYPES = new Set([
    'Prüfung',
    'Raumsperre',
    'Feier öffentlich',
    'Fraktionsstand',
    'Sportveranstaltung',
    'Verteilaktion'
  ]);

  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();

  const hideOptions = root => {
    const scope = root || document;
    const candidates = scope.querySelectorAll?.([
      '[role="option"]',
      'mat-option',
      '.mat-mdc-option',
      '.mat-option',
      '[class*="option"]'
    ].join(','));

    if (!candidates) return;

    candidates.forEach(el => {
      const text = clean(el.textContent);
      if (!HIDDEN_EVENT_TYPES.has(text)) return;

      el.style.setProperty('display', 'none', 'important');
      el.setAttribute('aria-hidden', 'true');
      el.dataset.wuOhHiddenEventType = 'true';
    });
  };

  const run = () => {
    hideOptions(document);

    document
      .querySelectorAll(
        '.cdk-overlay-container, .cdk-overlay-pane, .mat-mdc-select-panel, .mat-select-panel'
      )
      .forEach(hideOptions);
  };

  if (window.__wuOhEventTypeObserver) {
    window.__wuOhEventTypeObserver.disconnect();
  }

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        hideOptions(node);
      });
    }
    run();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window.__wuOhEventTypeObserver = observer;
  run();

  console.info(
    '[ÖH OSB] Zusätzliche Veranstaltungsarten ausgeblendet:',
    [...HIDDEN_EVENT_TYPES]
  );
})();
