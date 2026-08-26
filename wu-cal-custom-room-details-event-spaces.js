(() => {
  'use strict';

  const GLOBAL = 'wuEventSpaceRoomDetails';
  const ROOT = 'app-space-details';
  const STYLE_ID = 'wu-event-space-room-details-style';
  const ROOT_CLASS = 'wu-event-room-details';
  const rooms = window.wuEventSpaceRoomConfigs || [];

  const clean = value =>
    String(value || '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const norm = value => clean(value).toLowerCase();

  const previous = window[GLOBAL];
  previous?.observer?.disconnect?.();
  previous?.cleanup?.();

  let current = null;
  let pending = false;

  function findRoom(title) {
    return rooms.find(config =>
      config.match.some(token => norm(title).includes(norm(token)))
    ) || null;
  }

  function renderRoom(root, row, gallery, sidebar, info, room, title) {
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent = `
      ${ROOT}.${ROOT_CLASS}{
        --wu-blue:#0b80a7;--wu-blue-dark:#075f7d;--wu-border:#d2d2d2;
        --wu-text:#262626;--wu-muted:#666;--wu-light:#f4f4f4
      }
      ${ROOT}.${ROOT_CLASS} .usi-spaceFeatures,
      ${ROOT}.${ROOT_CLASS} .usi-spaceSetups{display:none!important}
      .wu-evt-row{display:flex!important;align-items:flex-start!important;gap:24px!important;width:100%!important;height:auto!important;overflow:visible!important}
      .wu-evt-gallery{flex:1 1 auto!important;min-width:0!important;max-width:calc(100% - 454px)!important}
      .wu-evt-side{position:static!important;display:block!important;flex:0 0 430px!important;width:430px!important;max-width:430px!important;height:auto!important;overflow:visible!important;transform:none!important}
      .wu-evt-side .usi-spaceDetailsContainer,.wu-evt-side .usi-detailsInfo{height:auto!important;overflow:visible!important;width:100%!important;max-width:100%!important}
      .wu-evt-side .usi-detailsLine,.wu-evt-detail{display:flex!important;align-items:flex-start!important;gap:16px!important;padding:9px 0!important;border-bottom:1px solid var(--wu-border)!important}
      .wu-evt-side .usi-detailsLine>.label,.wu-evt-detail dt{flex:0 0 42%!important;margin:0!important;color:var(--wu-muted)!important;font-size:12px!important;font-weight:700!important}
      .wu-evt-side .usi-detailsLine>.usi-detail,.wu-evt-detail dd{flex:1!important;margin:0!important;font-size:12px!important;white-space:nowrap!important}
      #wu-evt-official{margin:0!important;padding:0!important}
      .wu-evt-nav{display:grid!important;grid-template-columns:110px 1fr 110px!important;align-items:center!important;gap:12px!important;margin:12px 0!important}
      .wu-evt-nav button,.wu-evt-pdf{border:0!important;background:var(--wu-blue)!important;color:#fff!important;font-weight:700!important;text-decoration:none!important;cursor:pointer!important}
      .wu-evt-nav button{min-height:44px!important}
      .wu-evt-count{text-align:center!important;font-weight:700!important;font-size:13px!important}
      .wu-evt-section{width:100%!important;margin:45px 0 0!important;color:var(--wu-text)!important;font-family:Verdana,Arial,sans-serif!important}
      .wu-evt-section>h2{margin:0 0 20px!important;padding:0 0 12px!important;border-bottom:4px solid var(--wu-blue)!important;font-size:27px!important}
      .wu-evt-sub{margin:34px 0 14px!important;padding-bottom:9px!important;border-bottom:3px solid var(--wu-blue-dark)!important;font-size:17px!important}
      .wu-evt-tech{margin:0 0 8px!important;border:1px solid var(--wu-border)!important}
      .wu-evt-tech>summary{display:flex!important;justify-content:space-between!important;align-items:center!important;padding:16px 20px!important;background:var(--wu-light)!important;cursor:pointer!important;font-size:17px!important;font-weight:700!important;list-style:none!important}
      .wu-evt-tech>summary::-webkit-details-marker{display:none}
      .wu-evt-tech[open]>summary{background:var(--wu-blue)!important;color:#fff!important}
      .wu-evt-icon{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:28px!important;height:28px!important;border:1px solid currentColor!important;border-radius:50%!important}
      .wu-evt-content{padding:20px 22px!important;border-top:1px solid var(--wu-border)!important}
      .wu-evt-content dl{margin:0!important}
      .wu-evt-content dl div{display:grid!important;grid-template-columns:210px 1fr!important;gap:22px!important;padding:9px 0!important;border-bottom:1px solid #e3e3e3!important}
      .wu-evt-content dt{font-weight:700!important;color:var(--wu-muted)!important}
      .wu-evt-content dd{margin:0!important}
      .wu-evt-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:12px!important}
      .wu-evt-card{display:flex!important;flex-direction:column!important;min-height:230px!important;border:1px solid var(--wu-border)!important;background:#fff!important;text-align:center!important}
      .wu-evt-img{display:flex!important;align-items:center!important;justify-content:center!important;height:125px!important;border-bottom:5px solid var(--wu-blue-dark)!important;overflow:hidden!important}
      .wu-evt-img img{width:100%!important;height:100%!important;object-fit:contain!important;padding:6px!important}
      .wu-evt-body{display:flex!important;flex:1!important;flex-direction:column!important;align-items:center!important;padding:10px 8px!important}
      .wu-evt-card h3{margin:0 0 8px!important;font-size:12px!important;line-height:1.3!important}
      .wu-evt-pdf{margin:auto 0 0!important;padding:7px 9px!important;font-size:10px!important}
      @media(max-width:1100px){.wu-evt-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
      @media(max-width:950px){.wu-evt-row{flex-wrap:wrap!important}.wu-evt-gallery,.wu-evt-side{flex:0 0 100%!important;width:100%!important;max-width:100%!important}.wu-evt-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
      @media(max-width:600px){.wu-evt-grid{grid-template-columns:1fr!important}.wu-evt-content dl div{grid-template-columns:1fr!important}}
      `;
      document.head.appendChild(style);
    }

    root.dataset.wuEventRoom = room.key;
    root.classList.add(ROOT_CLASS);
    row.classList.add('wu-evt-row');
    gallery.classList.add('wu-evt-gallery');
    sidebar.classList.add('wu-evt-side');

    const official = document.createElement('dl');
    official.id = 'wu-evt-official';

    room.details.forEach(([label, value]) => {
      const item = document.createElement('div');
      item.className = 'wu-evt-detail';
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = label;
      dd.textContent = value;
      item.append(dt, dd);
      official.appendChild(item);
    });

    info.appendChild(official);

    const techSection = document.createElement('section');
    techSection.id = 'wu-evt-tech';
    techSection.className = 'wu-evt-section';
    techSection.innerHTML = '<h2>Technische Details</h2>';

    let group = '';
    room.tech.forEach(([titleText, html, groupName]) => {
      if (groupName && groupName !== group) {
        const h = document.createElement('h3');
        h.className = 'wu-evt-sub';
        h.textContent = groupName;
        techSection.appendChild(h);
        group = groupName;
      }

      const details = document.createElement('details');
      details.className = 'wu-evt-tech';
      details.innerHTML =
        '<summary><span></span><span class="wu-evt-icon" aria-hidden="true">+</span></summary>' +
        '<div class="wu-evt-content"></div>';

      details.querySelector('summary span').textContent = titleText;
      details.querySelector('.wu-evt-content').innerHTML = html;
      details.addEventListener('toggle', () => {
        details.querySelector('.wu-evt-icon').textContent = details.open ? '−' : '+';
      });

      techSection.appendChild(details);
    });

    row.after(techSection);

    const settingsSection = document.createElement('section');
    settingsSection.id = 'wu-evt-settings';
    settingsSection.className = 'wu-evt-section';
    settingsSection.innerHTML = '<h2>Settings Standard</h2><div class="wu-evt-grid"></div>';

    const grid = settingsSection.querySelector('.wu-evt-grid');

    room.settings.forEach(([titleText, imageUrl, pdfUrl]) => {
      const card = document.createElement('article');
      card.className = 'wu-evt-card';
      card.innerHTML =
        '<a class="wu-evt-img" target="_blank" rel="noopener noreferrer"><img loading="lazy"></a>' +
        '<div class="wu-evt-body"><h3></h3><a class="wu-evt-pdf" target="_blank" rel="noopener noreferrer">↓ PDF öffnen</a></div>';

      card.querySelector('h3').textContent = titleText;
      const img = card.querySelector('img');
      img.src = imageUrl;
      img.alt = 'Stellplan ' + titleText;

      card.querySelectorAll('a').forEach(link => {
        link.href = pdfUrl;
        link.setAttribute('aria-label', 'Stellplan ' + titleText + ' als PDF öffnen');
      });

      grid.appendChild(card);
    });

    techSection.after(settingsSection);

    const main = gallery.querySelector('.usi-desktopSpaceImg');
    const mainImage = main?.querySelector('img');
    const thumbs = [...gallery.querySelectorAll('.usi-thumbnailButtons')]
      .filter(button => button.querySelector('img'));

    let sliderCleanup = () => {};

    if (main && mainImage && thumbs.length) {
      const slides = thumbs.map(button => {
        const image = button.querySelector('img');
        return [image.currentSrc || image.src, clean(image.alt) || room.name];
      });

      const original = {
        src: mainImage.getAttribute('src'),
        srcset: mainImage.getAttribute('srcset'),
        alt: mainImage.getAttribute('alt')
      };

      let index = 0;
      const nav = document.createElement('div');
      nav.className = 'wu-evt-nav';
      nav.innerHTML =
        '<button type="button">‹ Zurück</button>' +
        '<span class="wu-evt-count" aria-live="polite"></span>' +
        '<button type="button">Weiter ›</button>';
      main.after(nav);

      const show = newIndex => {
        index = ((newIndex % slides.length) + slides.length) % slides.length;
        mainImage.removeAttribute('srcset');
        mainImage.src = slides[index][0];
        mainImage.alt = slides[index][1];
        nav.querySelector('.wu-evt-count').textContent =
          `${index + 1} von ${slides.length}`;
      };

      const prev = event => {
        event.preventDefault();
        event.stopPropagation();
        show(index - 1);
      };

      const next = event => {
        event.preventDefault();
        event.stopPropagation();
        show(index + 1);
      };

      const thumbClick = event => {
        const button = event.target.closest?.('.usi-thumbnailButtons');
        if (!button) return;
        const i = thumbs.indexOf(button);
        if (i < 0) return;
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        show(i);
      };

      const blockMain = event => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      };

      nav.children[0].addEventListener('click', prev);
      nav.children[2].addEventListener('click', next);
      gallery.addEventListener('click', thumbClick, true);
      main.addEventListener('click', blockMain, true);
      show(0);

      sliderCleanup = () => {
        nav.children[0]?.removeEventListener('click', prev);
        nav.children[2]?.removeEventListener('click', next);
        gallery.removeEventListener('click', thumbClick, true);
        main.removeEventListener('click', blockMain, true);
        nav.remove();

        if (original.src !== null) mainImage.setAttribute('src', original.src);
        if (original.srcset !== null) mainImage.setAttribute('srcset', original.srcset);
        else mainImage.removeAttribute('srcset');
        if (original.alt !== null) mainImage.setAttribute('alt', original.alt);
      };
    }

    const cleanup = () => {
      sliderCleanup();
      official.remove();
      techSection.remove();
      settingsSection.remove();

      if (root.dataset.wuEventRoom === room.key) {
        delete root.dataset.wuEventRoom;
      }

      root.classList.remove(ROOT_CLASS);
      row.classList.remove('wu-evt-row');
      gallery.classList.remove('wu-evt-gallery');
      sidebar.classList.remove('wu-evt-side');
    };

    return cleanup;
  }

  function cleanup() {
    current?.cleanup?.();
    current = null;
  }

  function apply() {
    const root = document.querySelector(ROOT);

    if (!root) {
      cleanup();
      return false;
    }

    const title = clean(
      root.querySelector(
        '.usi-spaceDetailsTopRow .usi-detailsTitle,.usi-detailsTitle,h1'
      )?.textContent
    );

    const room = findRoom(title);

    if (!room) {
      cleanup();
      return false;
    }

    if (
      current &&
      current.key === room.key &&
      current.root === root &&
      root.dataset.wuEventRoom === room.key &&
      document.getElementById('wu-evt-tech') &&
      document.getElementById('wu-evt-settings')
    ) {
      return true;
    }

    cleanup();

    const row = [...root.querySelectorAll('.usi-row')].find(element =>
      element.querySelector('.usi-op-imageViewerContainer') &&
      element.querySelector('.usi-spaceDetails')
    );

    if (!row) {
      return false;
    }

    const gallery = row.querySelector('.usi-op-imageViewerContainer');
    const sidebar = row.querySelector('.usi-spaceDetails');
    const info =
      sidebar?.querySelector('.usi-detailsInfo') ||
      sidebar?.querySelector('.usi-spaceDetailsContainer');

    if (!gallery || !sidebar || !info) {
      return false;
    }

    current = {
      key: room.key,
      root,
      cleanup: renderRoom(root, row, gallery, sidebar, info, room, title)
    };

    return true;
  }

  function schedule() {
    if (pending) {
      return;
    }

    pending = true;

    window.requestAnimationFrame(() => {
      pending = false;
      apply();
    });
  }

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  window[GLOBAL] = {
    apply,
    cleanup,
    observer,
    rooms
  };

  [0, 100, 300, 700, 1500, 3000].forEach(delay => {
    window.setTimeout(apply, delay);
  });
})();
