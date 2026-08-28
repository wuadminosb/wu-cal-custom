(() => {
  'use strict';

  const ROOT_ID = 'wu-summary-dashboard';
  const STYLE_ID = 'wu-summary-image-patch-style';
  const VERSION = '20260828-2';

  const clean = value =>
    String(value ?? '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  function parseCard(card) {
    const titleNode = card.querySelector('.wu-sum-title strong');
    const title = clean(titleNode?.textContent || card.textContent);
    const code =
      title.match(/\b[A-Z]{1,3}\.\d+\.\d+\b/i)?.[0]?.toUpperCase() || '';

    return { title, code };
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID} .wu-sum-img.wu-room-image-photo img {
        object-fit: cover !important;
        padding: 0 !important;
        background: #edf1f3 !important;
      }

      #${ROOT_ID} .wu-sum-img.wu-room-image-icon img {
        object-fit: contain !important;
        padding: 5px !important;
        background: #f3f7f9 !important;
      }
    `;
    document.head.appendChild(style);
  }

  function apply() {
    const root = document.getElementById(ROOT_ID);
    const resolver = window.wuRoomImageCatalog?.resolve;

    if (!root || !resolver) return false;

    ensureStyles();

    root.querySelectorAll('.wu-sum-room').forEach(card => {
      const room = parseCard(card);
      const image = resolver(room);
      const wrap = card.querySelector('.wu-sum-img');

      if (!wrap || !image?.src) return;

      const signature = [room.code, room.title, image.src, image.type].join('|');
      if (wrap.dataset.wuImageSignature === signature) return;

      wrap.dataset.wuImageSignature = signature;
      wrap.classList.remove('icon', 'wu-room-image-photo', 'wu-room-image-icon');

      const iconLike = /-icon$/.test(image.type);
      wrap.classList.add(iconLike ? 'wu-room-image-icon' : 'wu-room-image-photo');

      const img = document.createElement('img');
      img.src = image.src;
      img.alt = image.exact
        ? room.title
        : `${image.label || 'Raum'} – Symbolbild`;
      img.loading = 'eager';
      img.decoding = 'async';

      img.addEventListener('error', () => {
        const fallback = window.wuRoomImageCatalog?.sources?.icons?.raum;
        if (!fallback || img.src === fallback) return;

        img.src = fallback;
        img.alt = `${room.title || 'Raum'} – neutrales Symbolbild`;
        wrap.classList.remove('wu-room-image-photo');
        wrap.classList.add('wu-room-image-icon');
      }, { once: true });

      wrap.replaceChildren(img);
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

  [0, 100, 300, 700, 1500, 3000].forEach(delay => {
    setTimeout(apply, delay);
  });

  window.wuSummaryImages = {
    version: VERSION,
    apply
  };
})();
