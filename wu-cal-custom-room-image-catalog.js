(() => {
  'use strict';

  const VERSION = '20260828-2';
  const CDN = 'https://cdn.jsdelivr.net/gh/wuadminosb/wu-cal-custom@main/';

  const ICONS = {
    seminarraum: CDN + 'assets/icons/seminarraum.svg?v=' + VERSION,
    hoersaal: CDN + 'assets/icons/hoersaal.svg?v=' + VERSION,
    besprechungsraum: CDN + 'assets/icons/besprechungsraum.svg?v=' + VERSION,
    stand: CDN + 'assets/icons/stand.svg?v=' + VERSION,
    raum: CDN + 'assets/icons/raum.svg?v=' + VERSION
  };

  // Verifizierte, raumgenaue WU-Homepage-Bilder.
  const EXACT = {
    'AD.0.089': 'https://www.wu.ac.at/fileadmin/wu/_processed_/0/2/csm_sitzungssaal3_header_582207fb43.jpg',
    'AD.0.090': 'https://www.wu.ac.at/fileadmin/wu/_processed_/1/3/csm_sitzungssaal6_header_3204233ed3.jpg',
    'AD.0.091': 'https://www.wu.ac.at/fileadmin/wu/_processed_/8/7/csm_sitzungssaal4_header_4e23569c62.jpg',
    'AD.0.095': 'https://www.wu.ac.at/fileadmin/wu/_processed_/8/f/csm_sitzungssaal5_header_6897abd18e.jpg',
    'AD.0.122': 'https://www.wu.ac.at/fileadmin/wu/_processed_/4/d/csm_sitzungssaal2_header_3a044a80bb.jpg'
  };

  // Offizielles WU-Pressefoto des Audimax. Wird nur als klarer
  // Raumtyp-Fallback für Hörsäle verwendet, nicht als raumgenaues Foto.
  const LECTURE_HALL_FALLBACK =
    'https://www.wu.ac.at/fileadmin/wu/_processed_/a/5/csm_BOAnet_Audimax_innen_7be0730d85.jpg';

  // Hörsaal-IDs laut aktueller WU-Seite "Hörsäle & Ausstattung".
  const LECTURE_HALL_CODES = new Set([
    'TC.0.10',
    'D4.0.250',
    'TC.0.01', 'TC.0.02', 'TC.0.03', 'TC.0.04',
    'D5.0.001',
    'TC.1.01', 'TC.1.02', 'TC.2.01', 'TC.2.02',
    'TC.2.03',
    'TC.3.01', 'TC.3.03', 'TC.3.05', 'TC.3.21',
    'TC.4.01', 'TC.4.03', 'TC.4.05', 'TC.4.27',
    'TC.5.01', 'TC.5.03', 'TC.5.05', 'TC.5.13', 'TC.5.15', 'TC.5.27',
    'D3.0.225', 'D3.0.233',
    'D5.0.002',
    'EA.6.026', 'EA.6.032',
    'D4.0.022'
  ]);

  const clean = value =>
    String(value ?? '')
      .replace(/\u00a0/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const norm = value => clean(value).toLocaleLowerCase('de');

  const normalizeCode = value =>
    clean(value)
      .toUpperCase()
      .replace(/\s+/g, '');

  function codeFrom(room) {
    const explicit = normalizeCode(room?.code);
    if (explicit) return explicit;

    return clean(room?.title)
      .match(/\b[A-Z]{1,3}\.\d+\.\d+\b/i)?.[0]
      ?.toUpperCase() || '';
  }

  function validUrl(value) {
    const url = clean(value);
    return /^https?:\/\//i.test(url) ? url : '';
  }

  function matchRoomData(entry, room) {
    const code = codeFrom(room);
    const title = norm(room?.title);

    if (code && normalizeCode(entry?.key) === code) return true;

    return (entry?.match || []).some(token => {
      const normalized = norm(token);
      return (
        (code && normalizeCode(token) === code) ||
        (normalized && title.includes(normalized))
      );
    });
  }

  function eventSpaceImage(room) {
    const entry = (window.wuEventSpaceRooms || [])
      .find(item => matchRoomData(item, room));

    const image = validUrl(entry?.settings?.[0]?.[1]);

    return image
      ? {
          src: image,
          type: 'event-space-homepage',
          label: entry?.name || 'Veranstaltungsraum',
          exact: true
        }
      : null;
  }

  function room36Image(room) {
    const rooms = window.wuRoomDetails36?.rooms;
    const code = codeFrom(room);

    if (!rooms || !code) return null;

    const entry = rooms[code];
    const image = validUrl(entry?.s?.[0]?.[1]);

    return image
      ? {
          src: image,
          type: 'room-homepage',
          label: entry?.name || room?.title || 'Raum',
          exact: true
        }
      : null;
  }

  function isLectureHall(room) {
    const code = codeFrom(room);
    const title = norm(room?.title);

    if (LECTURE_HALL_CODES.has(code)) return true;
    if (title.includes('hörsaal') || title.includes('hoersaal') || title.includes('audimax')) return true;

    // Branded TC-Hörsäle werden im OSB teilweise ohne das Wort "Hörsaal"
    // angezeigt, z. B. "TC.1.01 OeNB (120)".
    if (
      /^TC\./.test(code) &&
      /\((60|120|170|180|250|650|800)\)/.test(clean(room?.title))
    ) {
      return true;
    }

    return false;
  }

  function isStand(room) {
    const title = norm(room?.title);
    return /\bstand\b/.test(title) || title.includes('infostand') || title.includes('messestand');
  }

  function resolve(room = {}) {
    const nativeImage = validUrl(room.nativeImage);
    if (nativeImage) {
      return {
        src: nativeImage,
        type: 'native',
        label: room.title || 'Raum',
        exact: true
      };
    }

    const code = codeFrom(room);

    if (EXACT[code]) {
      return {
        src: EXACT[code],
        type: 'exact-homepage',
        label: room.title || code,
        exact: true
      };
    }

    const eventSpace = eventSpaceImage(room);
    if (eventSpace) return eventSpace;

    const room36 = room36Image(room);
    if (room36) return room36;

    const title = norm(room.title);

    if (title.includes('seminarraum')) {
      return {
        src: ICONS.seminarraum,
        type: 'seminar-icon',
        label: 'Seminarraum',
        exact: false
      };
    }

    if (isLectureHall(room)) {
      return {
        src: LECTURE_HALL_FALLBACK,
        type: 'lecture-homepage-fallback',
        label: 'Hörsaal – WU Symbolfoto',
        exact: false
    };
  }

  if (isStand(room)) {
    return {
      src: ICONS.stand,
      type: 'stand-icon',
      label: 'Stand',
      exact: false
    };
  }

  if (
    title.includes('sitzungssaal') ||
    title.includes('besprechungsraum') ||
    title.includes('besprechung')
  ) {
    return {
      src: ICONS.besprechungsraum,
      type: 'besprechungsraum-icon',
      label: 'Besprechungsraum',
      exact: false
    };
  }

  if (
    title.includes('festsaal') ||
    title.includes('foyer') ||
    title.includes('galerie') ||
    title.includes('clubraum') ||
    title.includes('sky lounge') ||
    title.includes('tc hall') ||
    title.includes('forum')
  ) {
    return {
      src: ICONS.raum,
      type: 'event-space-icon',
      label: 'Veranstaltungsraum',
      exact: false
    };
  }

  // Letzte Stufe: keine graue Fläche. Jeder unbekannte verfügbare
   // OSB-Raum erhält einen neutralen Raum-Platzhalter.
  return {
    src: ICONS.raum,
    type: 'room-icon',
    label: room.title || 'Raum',
    exact: false
  };
}

  window.wuRoomImageCatalog = {
    version: VERSION,
    resolve,
    exact: { ...EXACT },
    lectureHallCodes: [...LECTURE_HALL_CODES],
    sources: {
      lectureHallFallback: LECTURE_HALL_FALLBACK,
      icons: { ...ICONS }
    }
  };
})();
