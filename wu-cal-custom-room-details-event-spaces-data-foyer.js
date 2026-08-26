(() => {
  'use strict';

  const commonReservable = [
      ['Wireless Presenter',
        '<p>Logitech Spotlight Plus zum Weiterschalten von Folien inklusive virtuellem Laserpointer.</p>',
        'Buchbare / reservierbare Technik']
    ];

  const room = {
        key: 'EA.0.024',
        name: 'Foyer',
        match: ['ea.0.024', 'foyer'],
        details: [
          ['Raumnummer', 'EA.0.024'],
          ['Bestuhlung', 'flexibel'],
          ['Catering', 'kalt'],
          ['Fläche', '173 m²'],
          ['Bühne', '12 m²']
        ],
        tech: [
          ['Projektion',
            '<dl><div><dt>Videowall</dt><dd>165 Zoll Absen A2725 LED Panele</dd></div><div><dt>Maximale Auflösung</dt><dd>1900 × 1080 Pixel</dd></div></dl>'],
          ['Lautsprecher',
            '<dl><div><dt>Ausstattung</dt><dd>2 Lautsprecher</dd></div><div><dt>Modell</dt><dd>JBL CBT100</dd></div></dl>'],
          ['Rednerpult',
            '<p>Höhenverstellbares Rednerpult mit schwarzer Front; keine Technik verbaut.</p>'],
          ['Raumsteuerung',
            '<dl><div><dt>Fix</dt><dd>AMX Modero S700 Touchpanel unter der Videowall</dd></div><div><dt>Mobil</dt><dd>iPad mini</dd></div></dl>'],
          ['Mikrofone',
            '<dl><div><dt>Funkmikrofone</dt><dd>Maximal 2 gleichzeitig</dd></div><div><dt>Modell</dt><dd>Shure ULXD2 H51</dd></div></dl>'],
          ...commonReservable,
          ['Notebook',
            '<p>Leihlaptop mit Microsoft Office, Microsoft Teams, Zoom, Firefox, Edge und Acrobat Reader.</p>'],
          ['Tonsumme für Mitschnitt',
            '<p>Tonsumme per XLR-Ausgang zur Aufzeichnung.</p>']
        ],
        settings: [
          ['80 Theater Standard',
           'https://www.wu.ac.at/fileadmin/wu/_processed_/8/6/csm_Theater_80_Standard_b0bc81b7e2.png',
           'https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Foyer/Theater_80_Standard.pdf'],
          ['60 Theater + 6 Stehtische + 6 Beistelltische',
           'https://www.wu.ac.at/fileadmin/wu/_processed_/0/7/csm_Theater_60_6_Stehtische_6_BT_120x60_37ad2468fd.png',
           'https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Foyer/Theater_60_6_Stehtische_6_BT_120x60.pdf'],
          ['Stehbuffet 15 Stehtische + 8 Beistelltische',
           'https://www.wu.ac.at/fileadmin/wu/_processed_/8/7/csm_Stehbuffet_15_Stehtische_8_BT_120x60_97fadbbce9.png',
           'https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Foyer/Stehbuffet_15_Stehtische_8_BT_120x60.pdf']
        ]
      };

  const existing = window.wuEventSpaceRooms || [];
  window.wuEventSpaceRooms = existing
    .filter(item => item.key !== room.key)
    .concat(room);
})();
