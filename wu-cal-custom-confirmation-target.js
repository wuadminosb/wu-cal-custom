(() => {
  'use strict';

  const VERSION = '20260828-2';
  const ROOT_ID = 'wu-confirmation';

  const clean = value =>
    String(value ?? '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const norm = value => clean(value).toLocaleLowerCase('de');

  function findMenuLink(label) {
    return [...document.querySelectorAll('a[href],a[routerlink]')]
      .find(link => norm(link.textContent) === norm(label)) || null;
  }

  function hrefOf(element) {
    if (!element) return '';

    if (element.href) return element.href;

    const route =
      element.getAttribute('routerlink') ||
      element.getAttribute('ng-reflect-router-link');

    if (!route) return '';

    try {
      return new URL(route, location.origin).href;
    } catch (_) {
      return '';
    }
  }

  function openNewTab(url) {
    if (!url) return false;

    return !!window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );
  }

  function openMyEvents() {
    const link = findMenuLink('Meine Veranstaltungen');
    const href = hrefOf(link);

    if (!href) {
      console.error(
        '[WU Confirmation Target]',
        'Ziel "Meine Veranstaltungen" wurde nicht gefunden.'
      );
      return false;
    }

    return openNewTab(href);
  }

  function apply() {
    const root = document.getElementById(ROOT_ID);
    if (!root) return false;

    const button = root.querySelector('.wu-cf-primary');
    if (!button || button.dataset.wuTargetFix === VERSION) return true;

    button.dataset.wuTargetFix = VERSION;

    button.addEventListener(
      'click',
      event => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        openMyEvents();
      },
      true
    );

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

  [0, 100, 300, 700, 1500].forEach(delay => setTimeout(apply, delay));

  window.wuConfirmationTarget = {
    version: VERSION,
    apply,
    openMyEvents
  };
})();
