(() => {
  'use strict';

  const BASE =
    'https://cdn.jsdelivr.net/gh/wuadminosb/wu-cal-custom@main/';

  const VERSION = '20260828-4';

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
      script.onerror = () =>
        reject(new Error('Datei konnte nicht geladen werden: ' + url));
      document.head.appendChild(script);
    });
  }

  const v8 =
    BASE + 'wu-cal-custom-osb-loader-v8.js?v=20260828-3';

  load(v8)
    .then(() =>
      load(
        BASE +
        'wu-cal-custom-confirmation-target.js?v=' +
        VERSION
      )
    )
    .catch(error =>
      console.error('[WU OSB] Loader v9:', error)
    );

  window.wuOsbLoaderVersion = VERSION;
  console.info('[WU OSB] Loader v9 aktiv:', VERSION);
})();
