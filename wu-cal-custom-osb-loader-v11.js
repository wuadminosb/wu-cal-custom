(() => {
  'use strict';

  const BASE = 'https://cdn.jsdelivr.net/gh/wuadminosb/wu-cal-custom@main/';
  const VERSION = '20260902-1';

  function load(url) {
    return new Promise((resolve, reject) => {
      const existing = [...document.querySelectorAll('script[src]')]
        .find(script => script.src === url);

      if (existing) {
        resolve(url);
        return;
      }

      const script = document.createElement('script');
      script.src = url;
      script.async = false;
      script.onload = () => resolve(url);
      script.onerror = () => reject(new Error('Datei konnte nicht geladen werden: ' + url));
      document.head.appendChild(script);
    });
  }

  const v8Url = BASE + 'wu-cal-custom-osb-loader-v8.js?v=20260828-3';
  const finalUrl = BASE + 'wu-cal-custom-confirmation-same-tab-final.js?v=20260828-5';
  const myEventsUrl = BASE + 'wu-cal-custom-myevents-dashboard.js?v=' + VERSION;
  const viewEventUrl = BASE + 'wu-cal-custom-viewevent-dashboard.js?v=' + VERSION;

  load(v8Url)
    .then(() => load(finalUrl))
    .then(() => Promise.all([
      load(myEventsUrl),
      load(viewEventUrl)
    ]))
    .then(() => {
      window.wuOsbLoaderVersion = VERSION;
      console.info('[WU OSB] Loader v11 aktiv:', VERSION);
    })
    .catch(error => console.error('[WU OSB] Loader v11:', error));
})();
