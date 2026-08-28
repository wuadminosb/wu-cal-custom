(() => {
  'use strict';

  const VERSION = '20260828-5';
  const ROOT_ID = 'wu-confirmation';
  const MARKER = 'wuLocalSameTab';

  const norm = value =>
    String(value ?? '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleLowerCase('de');

  function findMyEvents() {
    return [...document.querySelectorAll('a[href], button, [role="button"]')]
      .find(element =>
        norm(element.textContent) === 'meine veranstaltungen' &&
        (!element.href || /\/APPS\/OSR\/myevents/i.test(element.href))
      ) || null;
  }

  function patch() {
    const root = document.getElementById(ROOT_ID);
    const current = root?.querySelector('.wu-cf-primary');

    if (!current) return false;
    if (current.dataset[MARKER] === '1') return true;

    // Klonen entfernt den ursprünglichen onclick-und addEventListener-Handler.
    const button = current.cloneNode(true);

    // Den bereits vorgefundenen data-wu-target-fix bewusst beibehalten.
    // Dadurch erkennt ein noch laufender alter Target-Observer den Button als bereits behandelt.
    button.dataset[MARKER] = '1';
    button.onclick = null;
    current.replaceWith(button);

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();

      const target = findMyEvents();
      if (!target) {
        console.error('[WU Confirmation Same-Tab] "Meine Veranstaltungen" nicht gefunden.');
        return;
      }

      console.info('[WU Confirmation Same-Tab] Natives Ziel:', target);
      target.click();
    }, true);

    return true;
  }

  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      patch();
    });
  };

  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true
  });

  [0, 100, 300, 700, 1500, 3000, 5000].forEach(delay => setTimeout(patch, delay));

  window.wuConfirmationSameTabFinal = {
    version: VERSION,
    patch,
    status() {
      const button = document.querySelector('#' + ROOT_ID + ' .wu-cf-primary');
      return {
        version: VERSION,
        active: button?.dataset[MARKER] === '1',
        targetFix: button?.dataset.wuTargetFix || '',
        targetFound: !!findMyEvents()
      };
    }
  };
})();
