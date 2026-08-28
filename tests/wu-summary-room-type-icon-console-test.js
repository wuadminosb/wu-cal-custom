(() => {
  'use strict';

  const LOG = '[WU Seminarraum Icon Test]';
  const ICON_URL =
    'https://cdn.jsdelivr.net/gh/wuadminosb/wu-cal-custom@feature/summary-room-type-icons/assets/icons/seminarraum.svg';

  const TARGET_CODES = new Set(['D1.1.074', 'D2.0.038']);

  const root =
    document.getElementById('wu-summary-v32-root') ||
    document.querySelector('app-summary .usi-summarySection') ||
    document;

  const cards = [...root.querySelectorAll('.wu32-room, article')];
  let found = 0;
  let replaced = 0;

  for (const card of cards) {
    const visibleText = (card.textContent || '').replace(/\s+/g, ' ').trim();
    const code = visibleText.match(/\b[A-Z]{1,3}\.\d+\.\d+\b/i)?.[0]?.toUpperCase();

    if (!code || !TARGET_CODES.has(code)) continue;

    found++;

    const wrap =
      card.querySelector('.wu32-room-image-wrap') ||
      card.querySelector('.wu32-room-image')?.parentElement;

    if (!wrap) {
      console.warn(LOG, 'Bildcontainer fehlt:', code, card);
      continue;
    }

    const img = document.createElement('img');
    img.className = 'wu32-room-image';
    img.alt = `Seminarraum - ${code}`;
    img.src = ICON_URL;
    img.loading = 'eager';
    img.decoding = 'async';

    img.addEventListener('load', () => {
      console.log(LOG, 'Icon geladen:', code, img.naturalWidth, 'x', img.naturalHeight);
    }, { once: true });

    img.addEventListener('error', () => {
      console.error(LOG, 'Icon konnte nicht geladen werden:', code, ICON_URL);
    }, { once: true });

    wrap.replaceChildren(img);
    wrap.title = 'Neutrales Seminarraum-Symbolbild';
    replaced++;
  }

  console.log(LOG, {
    KartenGefunden: found,
    IconsEingesetzt: replaced,
    IconURL: ICON_URL
  });

  return { found, replaced, iconUrl: ICON_URL };
})();
