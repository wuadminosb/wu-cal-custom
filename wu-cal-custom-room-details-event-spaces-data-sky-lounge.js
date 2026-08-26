(() => {
  'use strict';

  const commonReservable = [
      ['Wireless Presenter',
        '<p>Logitech Spotlight Plus zum Weiterschalten von Folien inklusive virtuellem Laserpointer.</p>',
        'Buchbare / reservierbare Technik']
    ];

  const room = {
        key: 'EA.6.022',
        name: 'WU Sky Lounge',
        match: ['ea.6.020', 'ea.6.022', 'wu sky lounge'],
        details: [
          ['Raumnummer', 'EA.6.022'],
          ['Bestuhlung', 'flexibel'],
          ['Catering', 'kalt & warm'],
          ['Fläche', '173 m²'],
          ['Bühne', 'keine Bühne']
        ],
        tech: [
          ['Projektion',
            '<dl><div><dt>Videowall</dt><dd>165 Zoll Absen A2725 LED Panele, max. 1900 × 1080</dd></div><div><dt>TV-Screens</dt><dd>2× 80 Zoll NEC Monitore</dd></div></dl>'],
          ['Lautsprecher',
            '<dl><div><dt>Ausstattung</dt><dd>6 Lautsprecher</dd></div><div><dt>Modell</dt><dd>JBL CBT100</dd></div></dl>'],
          ['Rednerpult',
            '<dl><div><dt>Ausführung</dt><dd>Höhenverstellbares, geschlossenes Holzmodell</dd></div><div><dt>Integriert</dt><dd>Vortragenden-PC, Vorschaumonitor, Tastatur mit Touchpad, Schwanenhalsmikrofon</dd></div><div><dt>Anschlüsse</dt><dd>5× USB Input, 1× HDMI Input</dd></div></dl>'],
          ['Raumsteuerung',
            '<p>AMX Modero S700 Touchpanel; fixe Steuerung im Raum.</p>'],
          ['Mikrofone',
            '<dl><div><dt>Funkmikrofone</dt><dd>Maximal 2 gleichzeitig</dd></div><div><dt>Modell</dt><dd>Shure ULXD2 H51</dd></div></dl>'],
          ...commonReservable,
          ['Notebook',
            '<p>Vorinstalliert: Microsoft Office, Microsoft Teams, Zoom, Firefox, Edge und Acrobat Reader.</p>'],
          ['Tonsumme für Mitschnitt',
            '<p>Tonsumme per XLR-Ausgang zur Aufzeichnung.</p>']
        ],
        settings: [
          ['Plan leer',
           'https://www.wu.ac.at/fileadmin/wu/_processed_/a/1/csm_Plan_leer_9e933a4d1d.png',
           'https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/WU_Sky_Lounge/Plan_leer.pdf']
        ]
      };

  const existing = window.wuEventSpaceRooms || [];
  window.wuEventSpaceRooms = existing
    .filter(item => item.key !== room.key)
    .concat(room);
})();
