(() => {
  'use strict';

  const commonReservable = [
    [
      'Wireless Presenter',
      '<p>Logitech Spotlight Plus zum Weiterschalten von Folien inklusive virtuellem Laserpointer.</p>',
      'Buchbare / reservierbare Technik'
    ]
  ];

  const room = {
    key: 'LC.0.100',
    name: 'Festsaal 1',
    match: ['lc.0.100', 'festsaal 1'],
    details: [
      ['Raumnummer', 'LC.0.100'],
      ['Bestuhlung', 'flexibel'],
      ['Catering', 'kalt & warm'],
      ['Fläche', '487 m²'],
      ['Bühne', '25 m²']
    ],
    tech: [
      [
        'Induktive Höranlage',
        '<p>Induktive Höranlage zur Verbesserung der Sprach- und Tonverständlichkeit für Menschen mit Hörbeeinträchtigungen.</p>'
      ],
      [
        'Projektion',
        '<dl><div><dt>Ausstattung</dt><dd>2 Deckenprojektoren NEC PX750U</dd></div><div><dt>Steuerung</dt><dd>Getrennte Bespielung und Steuerung möglich</dd></div><div><dt>Maximale Auflösung</dt><dd>1920 × 1080 Pixel</dd></div></dl>'
      ],
      [
        'Lautsprecher',
        '<dl><div><dt>Ausstattung</dt><dd>2 Line-Arrays</dd></div><div><dt>Modell</dt><dd>JBL VRX932LA-PSV</dd></div></dl>'
      ],
      [
        'Rednerpult',
        '<dl><div><dt>Ausführung</dt><dd>Höhenverstellbares, geschlossenes Holzmodell</dd></div><div><dt>Integriert</dt><dd>Vortragenden-PC, Vorschaumonitor, Tastatur mit Touchpad, Schwanenhalsmikrofon</dd></div><div><dt>Anschlüsse</dt><dd>5× USB Input, 1× HDMI Input</dd></div></dl>'
      ],
      [
        'Vorschaumonitore',
        '<p>Zwei Monitore in Bühnenrichtung zur Anzeige des Präsentationsinhalts für Vortragende.</p>'
      ],
      [
        'Raumsteuerung',
        '<dl><div><dt>Fix</dt><dd>AMX Modero S700 Touchpanel</dd></div><div><dt>Mobil</dt><dd>iPad mini</dd></div></dl>'
      ],
      [
        'Mikrofone',
        '<dl><div><dt>Funkmikrofone</dt><dd>Maximal 8 gleichzeitig</dd></div><div><dt>Modell</dt><dd>Shure ULXD2 H51</dd></div><div><dt>Varianten</dt><dd>Taschensender und Handsender variabel kombinierbar</dd></div></dl>'
      ],
      ...commonReservable,
      [
        'Notebook',
        '<p>Vorinstalliert: Microsoft Office, Microsoft Teams, Zoom, Firefox, Edge und Acrobat Reader.</p>'
      ],
      [
        'Tonsumme für Mitschnitt',
        '<p>Tonsumme per XLR-Ausgang zur Aufzeichnung.</p>'
      ]
    ],
    settings: [
      [
        '400 Theater mit Regie',
        'https://www.wu.ac.at/fileadmin/wu/_processed_/6/4/csm_Theater_400_mit_Regie_c8d2f46a81.png',
        'https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Festsaal1/Theater_400_mit_Regie.pdf'
      ],
      [
        '400 Theater ohne Regie',
        'https://www.wu.ac.at/fileadmin/wu/_processed_/9/2/csm_Theater_400__ohne_Regie_f08395d839.png',
        'https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Festsaal1/Theater_400__ohne_Regie.pdf'
      ],
      [
        '250 Theater + 10 Stehtische mit Regie',
        'https://www.wu.ac.at/fileadmin/wu/_processed_/0/c/csm_Theater_250_10_Stehtische_mit_Regie_4f5b152acf.png',
        'https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Festsaal1/Theater_250_10_Stehtische_mit_Regie.pdf'
      ],
      [
        '250 Theater + 10 Stehtische ohne Regie',
        'https://www.wu.ac.at/fileadmin/wu/_processed_/2/7/csm_Theater_250_10_Stehtische_ohne_Regie_29c97dc0d8.png',
        'https://www.wu.ac.at/fileadmin/wu/h/structure/servicecenters/procurement/veranstaltungsmanagement/Fotos/Festsaal1/Theater_250_10_Stehtische_ohne_Regie.pdf'
      ]
    ]
  };

  const existing = window.wuEventSpaceRooms || [];
  window.wuEventSpaceRooms = existing
    .filter(item => item.key !== room.key)
    .concat(room);
})();