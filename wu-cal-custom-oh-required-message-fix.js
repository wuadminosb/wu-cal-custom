(() => {
  'use strict';

  const VERSION = '20261019-1';
  const GLOBAL = '__wuOehRequiredMessageFix';
  window[GLOBAL]?.stop?.();

  let observer = null;
  let scheduled = false;

  function fix() {
    let changed = 0;

    document
      .querySelectorAll(
        'app-dynamic-form mat-error, app-dynamic-form .mat-mdc-form-field-error'
      )
      .forEach(error => {
        const full = String(error.textContent || '').trim();
        if (!/\ist erforderlich\s*$/i.test(full)) return;

        const walker = document.createTreeWalker(error, NodeFilter.SHOW_TEXT);
        let node;

        while ((node = walker.nextNode())) {
          const original = node.nodeValue || '';
          const corrected = original.replace(/^(\s*)The\s*/i, '$1');
          if (corrected !== original) {
            node.nodeValue = corrected;
            changed += 1;
            break;
          }
        }
      });

    return changed;
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      fix();
    });
  }

  function start() {
    fix();
    observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  function stop() {
    observer?.disconnect();
    observer = null;
    delete window[GLOBAL];
  }

  window[GLOBAL] = { version: VERSION, fix, stop };

  if (document.body) start();
  else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
