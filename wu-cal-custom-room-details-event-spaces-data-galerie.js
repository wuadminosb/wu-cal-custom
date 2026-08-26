(() => {
  'use strict';

  const commonReservable = [
      ['Wireless Presenter',
        '<p>Logitech Spotlight Plus zum Weiterschalten von Folien inklusive virtuellem Laserpointer.</p>',
        'Buchbare / reservierbare Technik']
    ];

  const room = {
        key: 'LC.0.004',
        name: 'Galerie',
        match: ['lc.0.004', 'galerie'],
        details: [
          ['Raumnummer', 'LC.0.004'],
          ['Bestuhlung', 'flexibel'],
          ['Catering', 'kalt'],
          ['Fläche', '146 m²'],
          ['Bühne', 'keine Bühne']
        ],
        tech: [
          ['Projektion',
            '<dl><div><dt>Ausstattung</dt><dd>2 TV-Screens</dd></div><div><dt>Modelle</dt><dd>190 Zoll Sharp PN-R903; 55 Zoll Samsung DB55D</dd></div><div><dt>Maximale Auflösung</dt><dd>1920 × 1080 Pixel</dd></div></dl>'],
          ['Lautsprecher',
            '<dl><div><dt>Ausstattung</dt><dd>2 Lautsprecher</dd></div><div><dt>Modell</dt><dd>JBL CBT100</dd></div></dl>'],
          ['Rednerpult',
            '<dl><div><dt>Ausführung</dt><dd>Höhenverstellbares, geschlossenes Holzmodell</dd></div><div><dt>Integriert</dt><dd>Vortragenden-PC, Vorschaumonitor, Tastatur mit Touchpad, Schwanenhalsmikrofon</dd></div><div><dt>Anschlüsse</dt><dd>5× USB Input, 1× HDMI Input</dd></div></dl>'],
          ['Raumsteuerung',
            '<dl><div><dt>Fix</dt><dd>AMX Modero S700 Touchpanel</dd></div><div><dt>Mobil</dt><dd>iPad mini</dd></div></dl>'],
          ['Mikrofone',
            '<dl><div><dt>Funkmikrofone</dt><dd>Maximal 2 gleichzeitig</dd></div><div><dt>Modell</dt><dd>Shure ULXD2 H51</dd></div></dl>'],
          ...commonReservable,
          ['Notebook',
            '<p>Vorinstalliert: Microsoft Office, Microsoft Teams, Zoom, Firefox, Edge und Acrobat Reader.</p>'],
          ['Tonsumme für Mitschnitt',
            '<p>Tonsumme per XLR-Ausgang zur Aufzeichnung.</p>']
        ],
        settings: [
          ['80 Theater Standard',
           'https://www.wu.ac.at/fileadmin/wu/_processed_/1/0/csm_Theater_80_Standard_701f33108b.png',
           'https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Galerie/Theater_80_Standard.pdf'],
          ['48 Theater + 6 Stehtische',
           'https://www.wu.ac.at/fileadmin/wu/_processed_/d/4/csm_Theater_48_6_Stehtische_ea6a71d0ec.png',
           'https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Galerie/Theater_48_6_Stehtische.pdf'],
          ['Stehbuffet 15 Stehtische + 8 Tische',
           'https://www.wu.ac.at/fileadmin/wu/_processed_/1/8/csm_Stehbuffet_15_Stehtische_8_Tische__120x60__0b3de7aad4.png',
           'https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Galerie/Stehbuffet_15_Stehtische_8_Tische__120x60_.pdf']
        ]
      };

  const existing = window.wuEventSpaceRooms || [];
  window.wuEventSpaceRooms = existing
    .filter(item => item.key !== room.key)
    .concat(room);
})();
