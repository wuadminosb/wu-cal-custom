(() => {
  'use strict';
  // Only configure this loader in the dedicated "OSB Theme ÖH" web layout.
  const self = document.currentScript?.src || '';
  const match = self.match(/^(https:\/\/cdn\.jsdelivr\.net\/gh\/wuadminosb\/wu-cal-custom@[^/]+\/)/);
  if (!match) {
    console.error('[ÖH OSB] Unbekannte Skriptquelle; Loader beendet.');
    return;
  }
  const BASE = match[1], VERSION = '20261002-1', GLOBAL = '__wuOehLoader';
  if (window[GLOBAL]) return;
  window[GLOBAL] = { version: VERSION, ready: false };
  // WU questionnaire scripts and the v8/v11/v12 wrappers MUST NOT be loaded here.
  const load = (file, essential = false) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = BASE + file + '?v=' + VERSION;
    script.async = false;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error('Modul nicht geladen: ' + file));
    document.head.appendChild(script);
  }).catch(error => {
    console.error('[ÖH OSB]', error);
    if (essential) throw error;
    return false;
  });
  const roomNames = ['festsaal-1','festsaal-2','galerie','clubraum','sky-lounge','foyer','tc-hall'];
  (async () => {
    await Promise.all([
      load('wu-cal-custom-room-details.js'),
      load('wu-cal-custom-room-details-3-6.js'),
      (async () => {
        await Promise.all(roomNames.map(name => load(
          'wu-cal-custom-room-details-event-spaces-data-' + name + '.js')));
        await load('wu-cal-custom-room-details-event-spaces.js');
      })()
    ]);
    await load('wu-cal-custom.js', true);
    await Promise.all([
      load('wu-cal-custom-slider.js'),
      load('wu-cal-custom-account-choice.js'),
      load('wu-cal-custom-calendar-tabs.js'),
      load('wu-cal-custom-header.js'),
      load('wu-cal-custom-terms-links.js'),
      load('wu-cal-custom-required-legend.js'),
      load('wu-cal-custom-hide-required-note.js'),
      load('wu-cal-custom-hide-course-option.js'),
      load('wu-cal-custom-oh-conditional-required.js', true)
    ]);
    await load('wu-cal-custom-room-image-catalog.js');
    await Promise.all([
      load('wu-cal-custom-summary-dashboard.js'),
      load('wu-cal-custom-summary-images.js'),
      load('wu-cal-custom-myevents-dashboard.js'),
      load('wu-cal-custom-viewevent-dashboard.js')
    ]);
    await Promise.all([
      load('wu-cal-custom-confirmation-same-tab-final.js'),
      load('wu-cal-custom-confirmation-target.js'),
      load('wu-cal-custom-events-frameless.js')
    ]);
    // Exclude confirmation.js: known syntax error on main; browser regression test required.
    window[GLOBAL].ready = true;
    console.info('[ÖH OSB] Loader aktiv:', VERSION);
  })().catch(err => console.error('[ÖH OSB] Initialisierung unvollständig:', err));
})();