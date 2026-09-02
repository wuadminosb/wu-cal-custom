(() => {
  'use strict';

  const VERSION = '20260902-2';
  const STYLE_ID = 'wu-events-frameless-style';

  const CLS = {
    header: 'wu-events-frameless-header',
    layout: 'wu-events-frameless-layout',
    sidebar: 'wu-events-frameless-sidebar-path',
    main: 'wu-events-frameless-main-path'
  };

  const state = {
    route: '',
    scheduled: false
  };

  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clean = value => String(value ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

  function currentRoute() {
    const path = location.pathname;

    if (/\/APPS\/OSR\/myevents(?:\/|$)/i.test(path)) {
      return 'myevents';
    }

    if (/\/APPS\/OSR\/viewevent(?:\/|$)/i.test(path)) {
      return 'viewevent';
    }

    return '';
  }

  function addClass(element, className) {
    if (element && !element.classList.contains(className)) {
      element.classList.add(className);
    }
  }

  function clearClasses() {
    Object.values(CLS).forEach(className => {
      qa('.' + className).forEach(element => element.classList.remove(className));
    });
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .${CLS.header} {
        border: 0 !important;
        border-top: 0 !important;
        border-right: 0 !important;
        border-bottom: 0 !important;
        border-left: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
      }

      .${CLS.layout},
      .${CLS.sidebar},
      .${CLS.main} {
        border-left: 0 !important;
        border-right: 0 !important;
        box-shadow: none !important;
      }

      .${CLS.layout} {
        border: 0 !important;
        background: transparent !important;
      }

      /* Meine Veranstaltungen */
      .wu-myevents-filter-panel {
        border: 0 !important;
        border-radius: 0 !important;
        box-shadow: none !important;
        background: transparent !important;
        padding: 8px 12px 12px 0 !important;
      }

      .wu-myevents-filter-panel .usi-sidebarHeader {
        margin-top: 0 !important;
        margin-bottom: 6px !important;
        font-size: 21px !important;
        line-height: 1.1 !important;
      }

      .wu-myevents-filter-panel .usi-filterSection,
      .wu-myevents-filter-panel .form-group {
        margin-bottom: 17px !important;
      }

      .wu-myevents-filter-panel input,
      .wu-myevents-filter-panel select,
      .wu-myevents-filter-panel .form-control,
      .wu-myevents-filter-panel .usi-filterRefreshBtn {
        border-radius: 0 !important;
        box-shadow: none !important;
      }

      .wu-myevents-filter-panel .usi-filterRefreshBtn {
        min-height: 40px !important;
      }

      .wu-myevents-guide-button {
        margin-top: 16px !important;
        border: 1px solid #b8ccd5 !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      .wu-myevents-guide-button:hover {
        border-color: #007a9f !important;
        background: #f4f9fb !important;
      }

      #wu-myevents-dashboard {
        width: 100% !important;
        max-width: none !important;
        padding-left: 8px !important;
      }

      #wu-myevents-dashboard h1 {
        margin-bottom: 8px !important;
      }

      #wu-myevents-dashboard .sub {
        max-width: 900px !important;
        margin-bottom: 27px !important;
      }

      #wu-myevents-dashboard .shell {
        border-top: 2px solid #007a9f !important;
        box-shadow: none !important;
      }

      #wu-myevents-dashboard table {
        width: 100% !important;
      }

      #wu-myevents-dashboard th {
        padding-top: 12px !important;
        padding-bottom: 12px !important;
        color: #50616a !important;
      }

      #wu-myevents-dashboard td {
        padding-top: 14px !important;
        padding-bottom: 14px !important;
      }

      #wu-myevents-dashboard tbody tr:hover {
        background: #f7fafb !important;
      }

      #wu-myevents-dashboard .status {
        border-width: 1px !important;
        background: color-mix(in srgb, var(--c) 5%, white) !important;
        box-shadow: none !important;
      }

      #wu-myevents-dashboard .foot {
        padding-top: 17px !important;
      }

      #wu-myevents-dashboard .pg,
      #wu-myevents-dashboard .ps {
        border-radius: 0 !important;
        box-shadow: none !important;
      }

      @media (min-width: 1100px) {
        .wu-myevents-filter-panel {
          margin-right: 18px !important;
        }
      }

      /* Veranstaltungsübersicht */
      #wu-viewevent-dashboard {
        width: 100% !important;
        max-width: none !important;
      }

      #wu-viewevent-dashboard .back {
        min-height: 35px !important;
        border-radius: 0 !important;
        box-shadow: none !important;
      }

      #wu-viewevent-dashboard .head {
        margin-bottom: 20px !important;
      }

      #wu-viewevent-dashboard .head h1 {
        margin: 0 !important;
      }

      #wu-viewevent-dashboard .banner {
        border: 0 !important;
        border-left: 4px solid var(--c) !important;
        padding: 15px 18px !important;
        margin-bottom: 20px !important;
        background: #f8fafb !important;
        box-shadow: none !important;
      }

      #wu-viewevent-dashboard .card {
        border: 0 !important;
        border-top: 1px solid #d9e2e6 !important;
        border-bottom: 1px solid #d9e2e6 !important;
        padding: 19px 14px 20px !important;
        margin-bottom: 25px !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      #wu-viewevent-dashboard .card h2 {
        margin-bottom: 20px !important;
      }

      #wu-viewevent-dashboard .facts {
        gap: 19px 55px !important;
      }

      #wu-viewevent-dashboard .fact {
        min-height: 46px !important;
      }

      #wu-viewevent-dashboard .section {
        margin-top: 27px !important;
        margin-bottom: 12px !important;
      }

      #wu-viewevent-dashboard .room {
        border: 0 !important;
        border-top: 1px solid #d9e2e6 !important;
        border-bottom: 1px solid #d9e2e6 !important;
        padding: 15px 14px !important;
        margin-bottom: 10px !important;
        background: transparent !important;
        box-shadow: none !important;
      }

      #wu-viewevent-dashboard .roomtitle {
        margin-bottom: 14px !important;
      }

      #wu-viewevent-dashboard .meta > div {
        border-left-color: #e4eaed !important;
      }

      #wu-viewevent-dashboard .status {
        background: color-mix(in srgb, var(--c) 5%, white) !important;
        box-shadow: none !important;
      }

      #wu-viewevent-dashboard .note {
        border: 0 !important;
        border-left: 3px solid #68a9c2 !important;
        padding: 14px 16px !important;
        background: #f4fafc !important;
        box-shadow: none !important;
      }

      @media (max-width: 980px) {
        #wu-viewevent-dashboard .facts {
          grid-template-columns: 1fr !important;
        }

        #wu-viewevent-dashboard .meta {
          grid-template-columns: 1fr !important;
          gap: 11px !important;
        }

        #wu-viewevent-dashboard .meta > div {
          padding: 0 !important;
          border-left: 0 !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  function decorateHeader() {
    const link = qa('a').find(anchor =>
      /meine veranstaltungen/i.test(clean(anchor.textContent))
    );

    if (!link) {
      return;
    }

    let element = link;

    for (let i = 0; element && i < 8; i++, element = element.parentElement) {
      const rect = element.getBoundingClientRect();
      const background = getComputedStyle(element).backgroundColor;
      const whiteish =
        background === 'rgb(255, 255, 255)' ||
        background === 'rgba(0, 0, 0, 0)' ||
        background === 'transparent';

      if (
        rect.width > window.innerWidth * 0.75 &&
        rect.top >= 60 &&
        rect.top < 150 &&
        rect.height < 120 &&
        whiteish
      ) {
        addClass(element, CLS.header);
      }
    }
  }

  function commonAncestor(a, b) {
    const ancestors = new Set();
    let element = a;

    while (element) {
      ancestors.add(element);
      element = element.parentElement;
    }

    element = b;

    while (element) {
      if (ancestors.has(element)) {
        return element;
      }
      element = element.parentElement;
    }

    return null;
  }

  function decorateMyEvents() {
    const filter =
      q('.wu-myevents-filter-panel') ||
      q('.usi-sidebarHeader')?.parentElement;
    const dashboard = q('#wu-myevents-dashboard');

    if (!filter || !dashboard) {
      return;
    }

    const common = commonAncestor(filter, dashboard);

    if (!common) {
      return;
    }

    addClass(common, CLS.layout);

    let element = filter;
    while (element && element !== common) {
      addClass(element, CLS.sidebar);
      element = element.parentElement;
    }

    element = dashboard;
    while (element && element !== common) {
      addClass(element, CLS.main);
      element = element.parentElement;
    }
  }

  function apply() {
    const nextRoute = currentRoute();

    if (state.route !== nextRoute) {
      clearClasses();
      state.route = nextRoute;
    }

    if (!nextRoute) {
      return;
    }

    ensureStyle();
    decorateHeader();

    if (nextRoute === 'myevents') {
      decorateMyEvents();
    }
  }

  function schedule() {
    if (state.scheduled) {
      return;
    }

    state.scheduled = true;

    requestAnimationFrame(() => {
      state.scheduled = false;
      apply();
    });
  }

  function cleanup() {
    clearClasses();
    document.getElementById(STYLE_ID)?.remove();
    state.route = '';
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true });

  addEventListener('popstate', schedule);
  addEventListener('hashchange', schedule);

  window.wuEventsFrameless = {
    version: VERSION,
    apply,
    cleanup,
    status: () => ({
      active: Boolean(document.getElementById(STYLE_ID)),
      route: currentRoute(),
      headerElements: qa('.' + CLS.header).length,
      framelessLayout: Boolean(q('.' + CLS.layout))
    })
  };

  apply();
})();
