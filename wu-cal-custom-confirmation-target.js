(() => {
  'use strict';

  const VERSION = '20260828-4';
  const ROOT_ID = 'wu-confirmation';

  const clean = value =>
    String(value ?? '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const norm = value => clean(value).toLocaleLowerCase('de');

  function findMyEventsElement(doc = document) {
    return [...doc.querySelectorAll('a,button,[role="button"]')]
      .find(element =>
        norm(element.textContent) === 'meine veranstaltungen'
      ) || null;
  }

  function openMyEventsSameTab() {
    const target = findMyEventsElement();

    if (!target) {
      console.error(
        '[WU Confirmation Target]',
        'Natives Ziel "Meine Veranstaltungen" wurde nicht gefunden.'
      );
      return false;
    }

    console.info(
      '[WU Confirmation Target] Navigiere per nativem Momentus-Klick im gleichen Tab.',
      target
    );

    target.click();
    return true;
  }

  function apply() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return false;

    const current = root.querySelector('.wu-cf-primary');
    if (!current) return false;

    if (current.dataset.wuTargetFix === VERSION) return true;

    /*
     * Wichtig: Der Primary-Button aus wu-cal-custom-confirmation.js
     * besitzt bereits einen onclick-Handler, der window.open() verwendet.
     * Durch Klonen werden ALLE alten JS-Handler entfernt.
     */
    const button = current.cloneNode(true);
    button.dataset.wuTargetFix = VERSION;

    current.replaceWith(button);

    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openMyEventsSameTab();
    });

    return true;
  }

  let pending = false;
  const schedule = () => {
    if (pending) return;
    pending = true;

    requestAnimationFrame(() => {
      pending = false;
      apply();
    });
  };

  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true
  });

  [0, 100, 300, 700, 1500, 3000].forEach(delay =>
    setTimeout(apply, delay)
  );

  window.wuConfirmationTarget = {
    version: VERSION,
    apply,
    openMyEventsSameTab
  };
})();
