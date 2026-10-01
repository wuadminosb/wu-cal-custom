(() => {
  'use strict';
  const source = document.currentScript?.src || '';
  const match = source.match(/^(https:\/\/cdn\.jsdelivr\.net\/gh\/wuadminosb\/wu-cal-custom@[^/]+\/)/);
  const base = match?.[1] || 'https://cdn.jsdelivr.net/gh/wuadminosb/wu-cal-custom@main/';
  const load = file => new Promise((resolve, reject) => {
    const el = document.createElement('script');
    el.src = base + file;
    el.async = false;
    el.onload = resolve;
    el.onerror = () => reject(new Error('Script nicht geladen: ' + el.src));
    document.head.appendChild(el);
  });
  const ready = () => new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      if (window.wuOsbLoaderVersion === '20260902-2') return resolve();
      if (Date.now() - started > 20000) return reject(new Error('v11 nicht bereit'));
      setTimeout(check, 100);
    };
    check();
  });
  load('wu-cal-custom-osb-loader-v11.js?v=20260902-2')
    .then(ready)
    .then(() => load('wu-cal-custom-short-internal-profile.js?v=20261001-1'))
    .then(() => {
      window.wuOsbLoaderVersion = '20261001-1';
      console.info('[WU OSB] Loader v12 aktiv: 20261001-1');
    })
    .catch(error => console.error('[WU OSB] Loader v12:', error));
})();
