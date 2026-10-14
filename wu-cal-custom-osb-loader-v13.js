(() => {
  'use strict';

  const VERSION = '20261014-6';
  const source = document.currentScript?.src || '';
  const lastSlash = source.lastIndexOf('/');
  const base = source && lastSlash >= 0
    ? source.slice(0, lastSlash + 1)
    : 'https://cdn.jsdelivr.net/gh/wuadminosb/wu-cal-custom@main/';

  const load = file => new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = base + file;
    el.async = false;
    el.onload = resolve;
    el.onerror = () => reject(new Error('Script nicht geladen: ' + el.src));
    document.head.appendChild(el);
  });

  const waitForV12 = () => new Promise((resolve, reject) => {
    const started = Date.now();

    const check = () => {
      if (window.wuOsbLoaderVersion === '20261001-1') {
        resolve();
        return;
      }
      if (Date.now() - started > 20000) {
        reject(new Error('Loader v12 nicht bereit'));
        return;
      }

      setTimeout(check, 100);
    };

    check();
  });

  load('wu-cal-custom-osb-loader-v12.js?v=20261001-1')
    .then(waitForV12)
    .then(() => Promise.all([
      load('wu-cal-custom-calendar-forum-note.js?v=20261014-6'),
      load('wu-cal-custom-series-weekday-state.js?v=20261014-6')
    ]))
    .then(() => {
      window.wuOsbLoaderVersion = VERSION;
      console.info('[WU OSB] Loader v13 aktiv:', VERSION);
    })
    .catch(error => console.error('[WU OSB] Loader v13:', error));
})();
