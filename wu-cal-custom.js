(function () {
    'use strict';

    let updatePending = false;

    function normalizedText(element) {
        return (element.textContent || '')
            .replace(/\u00a0/g, '')
            .replace(/\s+/g, '')
            .trim()
            .toLowerCase();
    }

    function isWeekend(text) {
        return [
            'so', 'so.', 'sonntag', 'sun', 'sunday',
            'sa', 'sa.', 'samstag', 'sat', 'saturday'
        ].includes(text);
    }

    function isWeekday(text) {
        return [
            'mo', 'mo.', 'montag',
            'di', 'di.', 'dienstag',
            'mi', 'mi.', 'mittwoch',
            'do', 'do.', 'donnerstag',
            'fr', 'fr.', 'freitag'
        ].includes(text);
    }

    function normalizeText(value) {
        return String(value || '')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function isVisible(element) {
        if (!element) {
            return false;
        }

        const rectangle = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        return (
            rectangle.width > 0 &&
            rectangle.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden'
        );
    }

    function findVisibleField(container, label) {
        const normalizedLabel = normalizeText(label);

        return Array.from(
            container.querySelectorAll(
                'mat-form-field, ' +
                '.mat-mdc-form-field, ' +
                '.mat-form-field'
            )
        ).filter(isVisible).find(function (field) {
            const control = field.querySelector(
                'input, select, textarea, [role="combobox"]'
            );

            const searchText = normalizeText([
                field.textContent,
                control?.getAttribute('placeholder'),
                control?.getAttribute('aria-label'),
                control?.getAttribute('name'),
                control?.getAttribute('id')
            ].filter(Boolean).join(' '));

            return searchText.includes(normalizedLabel);
        });
    }

    /* Space → Raum */
    function changeSpaceLabel() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );

        const textNodes = [];
        let node;

        while ((node = walker.nextNode())) {
            const value = node.nodeValue || '';

            if (/\bspace\b/gi.test(value)) {
                textNodes.push(node);
            }
        }

        textNodes.forEach(function (textNode) {
            textNode.nodeValue = textNode.nodeValue.replace(
                /\bspace\b/gi,
                'Raum'
            );
        });

        document.querySelectorAll(
            '.originCellContent, [class*="Cell"], ' +
            '.rowHeaderContent, span, div, label, p'
        ).forEach(function (element) {
            if (element.children.length !== 0) {
                return;
            }

            const text = element.textContent || '';

            if (/\bspace\b/gi.test(text)) {
                element.textContent = text.replace(
                    /\bspace\b/gi,
                    'Raum'
                );
            }
        });

        document.querySelectorAll(
            '[aria-label], [title], [placeholder]'
        ).forEach(function (element) {
            ['aria-label', 'title', 'placeholder'].forEach(
                function (attribute) {
                    const value = element.getAttribute(attribute);

                    if (value && /\bspace\b/gi.test(value)) {
                        element.setAttribute(
                            attribute,
                            value.replace(/\bspace\b/gi, 'Raum')
                        );
                    }
                }
            );
        });
    }

    /* AM/PM → 24-Stunden-Format */
    function changeCalendarTimeFormat() {
        document.querySelectorAll(
            'span, div, td, th, p, label, button'
        ).forEach(function (element) {
            if (
                element.children.length !== 0 ||
                !element.textContent
            ) {
                return;
            }

            const text = element.textContent.trim();

            const match = text.match(
                /^(\d{1,2})\s*(?::(\d{2}))?\s*(AM|PM)$/i
            );

            if (!match) {
                return;
            }

            let hour = parseInt(match[1], 10);
            const minutes = match[2] || '00';
            const period = match[3].toUpperCase();

            if (period === 'AM') {
                if (hour === 12) {
                    hour = 0;
                }
            } else if (hour !== 12) {
                hour += 12;
            }

            element.textContent =
                String(hour).padStart(2, '0') +
                ':' +
                minutes;
        });
    }

    /* Date/Daten → Datum */
    function changeDateLabel() {
        document.querySelectorAll(
            'label[for="searchDatePicker"] mat-label, ' +
            'label[for="searchDatePicker"], ' +
            '#searchDatePicker mat-label'
        ).forEach(function (label) {
            const text = (label.textContent || '')
                .replace(/\s+/g, ' ')
                .trim();

            if (
                text === 'Daten' ||
                text === 'Date' ||
                text === 'Datum'
            ) {
                label.textContent = 'Datum';
            }
        });
    }

    /*
     * Raumnummer und Raumname trennen.
     * Bereits formatierte Räume werden erneut ausgerichtet.
     */
    function formatRoomHeaders() {
        const roomPattern =
            /^\s*([A-ZÄÖÜ][A-ZÄÖÜ0-9-]*(?:\.[A-ZÄÖÜ0-9-]+)+)\s+(.+?)\s*$/i;

        document.querySelectorAll(
            '.headerCell .rowHeaderContent'
        ).forEach(function (element) {
            let numberElement =
                element.querySelector('.wu-room-number');

            let nameElement =
                element.querySelector('.wu-room-name');

            if (!numberElement || !nameElement) {
                const originalText =
                    (element.textContent || '').trim();

                const match = originalText.match(roomPattern);

                if (!match) {
                    return;
                }

                numberElement =
                    document.createElement('span');

                numberElement.className = 'wu-room-number';
                numberElement.textContent = match[1];

                nameElement =
                    document.createElement('span');

                nameElement.className = 'wu-room-name';
                nameElement.textContent = match[2];

                element.replaceChildren(
                    numberElement,
                    document.createElement('br'),
                    nameElement
                );
            }

            element.style.setProperty(
                'width',
                '100%',
                'important'
            );

            element.style.setProperty(
                'text-align',
                'center',
                'important'
            );

            element.style.setProperty(
                'white-space',
                'normal',
                'important'
            );

            element.style.setProperty(
                'line-height',
                '14px',
                'important'
            );

            element.style.setProperty(
                'font-size',
                '12px',
                'important'
            );

            element.style.setProperty(
                'padding',
                '0 2px',
                'important'
            );

            element.style.setProperty(
                'box-sizing',
                'border-box',
                'important'
            );

            numberElement.style.setProperty(
                'font-weight',
                'normal',
                'important'
            );

            nameElement.style.setProperty(
                'font-weight',
                '700',
                'important'
            );

            const headerCell =
                element.closest('.headerCell');

            if (!headerCell) {
                return;
            }

            headerCell.style.setProperty(
                'display',
                'flex',
                'important'
            );

            headerCell.style.setProperty(
                'flex-direction',
                'column',
                'important'
            );

            headerCell.style.setProperty(
                'justify-content',
                'center',
                'important'
            );

            headerCell.style.setProperty(
                'align-items',
                'center',
                'important'
            );

            headerCell.style.setProperty(
                'text-align',
                'center',
                'important'
            );

            headerCell.style.setProperty(
                'box-sizing',
                'border-box',
                'important'
            );
        });
    }

    function findWeekdayGroups() {
        const groups = document.querySelectorAll(
            'mat-button-toggle-group, ' +
            '.mat-button-toggle-group, ' +
            '.usi-dayOfWeekButtons, ' +
            '[role="group"]'
        );

        return Array.from(groups).filter(function (group) {
            const controls = group.querySelectorAll(
                'mat-button-toggle, ' +
                '.mat-button-toggle, ' +
                '.mat-mdc-button-toggle, ' +
                '[role="radio"]'
            );

            let recognizedDays = 0;

            controls.forEach(function (control) {
                const text = normalizedText(control);

                if (isWeekday(text) || isWeekend(text)) {
                    recognizedDays += 1;
                }
            });

            return recognizedDays >= 5;
        });
    }

    function markWeekendButtons() {
        findWeekdayGroups().forEach(function (group) {
            group.classList.add('wu-weekday-group');

            const toggles = Array.from(
                group.querySelectorAll(
                    'mat-button-toggle, ' +
                    '.mat-button-toggle, ' +
                    '.mat-mdc-button-toggle, ' +
                    '[role="radio"]'
                )
            );

            toggles.forEach(function (toggle) {
                const value =
                    toggle.getAttribute('value') ||
                    toggle.getAttribute('ng-reflect-value');

                const text = normalizedText(toggle);

                if (
                    value === '0' ||
                    value === '6' ||
                    isWeekend(text)
                ) {
                    toggle.classList.add(
                        'wu-hidden-weekend'
                    );
                }
            });
        });
    }

    function markRepeatAndWeekdayArea() {
        findWeekdayGroups().forEach(function (group) {
            group.classList.add('wu-weekday-group');

            if (group.parentElement) {
                group.parentElement.classList.add(
                    'wu-repeat-weekday-native-row'
                );
            }
        });

        document.querySelectorAll(
            'mat-label, label, .mdc-floating-label'
        ).forEach(function (label) {
            const text = (label.textContent || '')
                .replace(/\s+/g, ' ')
                .trim();

            if (!text.startsWith('Wiederholt')) {
                return;
            }

            const field =
                label.closest('mat-form-field') ||
                label.closest('.mat-mdc-form-field');

            if (!field) {
                return;
            }

            field.classList.add('wu-repeat-field');

            if (field.parentElement) {
                field.parentElement.classList.add(
                    'wu-repeat-weekday-native-row'
                );
            }
        });
    }

    /*
     * Veranstaltungs-Serie dauerhaft für das CSS kennzeichnen.
     * Die Funktion darf beliebig oft durch den MutationObserver
     * aufgerufen werden.
     */
    function markSeriesFormLayout() {
        const optionsRows = Array.from(
            document.querySelectorAll('.moreSearchOptions')
        ).filter(isVisible);

        optionsRows.forEach(function (optionsRow) {
            const optionsText = normalizeText(
                optionsRow.textContent
            );

            if (
                !optionsText.includes('gebäude') ||
                !optionsText.includes('raumart') ||
                !optionsText.includes('suche')
            ) {
                return;
            }

            let seriesForm = optionsRow.parentElement;

            while (
                seriesForm &&
                seriesForm !== document.body
            ) {
                const formText = normalizeText(
                    seriesForm.textContent
                );

                const isSingleEventForm =
                    formText.includes('datum') &&
                    formText.includes('startzeit') &&
                    formText.includes('endzeit');

                const isMultiDayOrSeriesForm =
                    formText.includes('startdatum') &&
                    formText.includes('enddatum');

                if (
                    formText.includes('gebäude') &&
                    formText.includes('raumart') &&
                    (
                        isSingleEventForm ||
                        isMultiDayOrSeriesForm
                    )
                ) {
                    break;
                }

                seriesForm = seriesForm.parentElement;
            }

            if (!seriesForm || seriesForm === document.body) {
                return;
            }

            const optionsGroup =
                optionsRow.closest(
                    '.usi-moreSearchOptionsGroup'
                ) ||
                optionsRow.parentElement;

            const buildingField =
                findVisibleField(optionsRow, 'Gebäude');

            const roomTypeField =
                findVisibleField(optionsRow, 'Raumart');

            const searchButton = Array.from(
                optionsRow.querySelectorAll('button')
            ).filter(isVisible).find(function (button) {
                return normalizeText(
                    button.textContent
                ) === 'suche';
            });

            const repeatField = Array.from(
                seriesForm.querySelectorAll(
                    '.usi-repeatsSelect, ' +
                    'mat-form-field, ' +
                    '.mat-mdc-form-field, ' +
                    '.mat-form-field'
                )
            ).filter(isVisible).find(function (field) {
                return normalizeText(
                    field.textContent
                ).includes('wiederholt');
            });

            const repeatRow =
                repeatField?.closest(
                    '.usi-recurringSelects'
                ) ||
                repeatField?.parentElement;

            const weekdayGroup = Array.from(
                seriesForm.querySelectorAll(
                    '.usi-dayOfWeekButtons'
                )
            ).find(isVisible);

            if (
                !buildingField ||
                !roomTypeField ||
                !searchButton
            ) {
                return;
            }

            seriesForm.classList.add('wu-series-form');

            optionsRow.classList.add(
                'wu-series-options-row'
            );

            if (optionsGroup !== seriesForm) {
                optionsGroup.classList.add(
                    'wu-series-options-group'
                );
            }

            buildingField.classList.add(
                'wu-series-building'
            );

            roomTypeField.classList.add(
                'wu-series-roomtype'
            );

            searchButton.classList.add(
                'wu-series-search'
            );

            /*
             * Diese Elemente sind nur bei einer Veranstaltungsserie
             * vorhanden. Die Formatierung der allgemeinen Suchfelder
             * darf davon nicht abhängen.
             */
            if (repeatField && repeatRow && weekdayGroup) {
                repeatRow.classList.add(
                    'wu-series-repeat-row'
                );

                repeatField.classList.add(
                    'wu-series-repeat-field'
                );

                weekdayGroup.classList.add(
                    'wu-series-weekdays'
                );
            }

            const participantField =
                findVisibleField(
                    seriesForm,
                    'Teilnehmerzahl'
                );

            let standardWidth = participantField
                ? Math.round(
                    participantField
                        .getBoundingClientRect()
                        .width
                )
                : 160;

            if (
                standardWidth < 100 ||
                standardWidth > 300
            ) {
                standardWidth = 160;
            }

            seriesForm.style.setProperty(
                '--wu-series-standard-width',
                standardWidth + 'px'
            );

            seriesForm.style.setProperty(
                '--wu-series-total-width',
                (
                    standardWidth * 2 +
                    240 +
                    20 * 2
                ) + 'px'
            );
        });
    }

    function ensureStyleTag(styleId, cssText) {
        let style = document.getElementById(styleId);

        if (!style) {
            style = document.createElement('style');
            style.id = styleId;
            style.textContent = cssText;
            document.head.appendChild(style);
            return;
        }

        if (style.textContent !== cssText) {
            style.textContent = cssText;
        }
    }

    function escapeRegExp(value) {
        return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function isSitzungssaalOnePage() {
        const scope = document.querySelector('app-space-details') || document.body;

        if (!scope) {
            return false;
        }

        const text = normalizeText(scope.textContent);

        const hasName = text.includes('sitzungssaal 1');
        const hasNumber = /\btc\.?4\.?09\b/.test(text) || /\btc4\.09\b/.test(text);

        return hasName || hasNumber;
    }

    function getSpaceDetailsRow() {
        const root = document.querySelector('app-space-details');

        if (!root) {
            return null;
        }

        const rows = Array.from(root.querySelectorAll('.usi-row')).filter(isVisible);

        return rows.find(function (row) {
            return !!(
                row.querySelector('.usi-op-imageViewerContainer') &&
                row.querySelector('.usi-spaceDetails')
            );
        }) || null;
    }

    function buildTechnicalDetailsData() {
        return [
            {
                title: 'Hybride Veranstaltungen',
                content: `
                    <p>
                        Der Sitzungssaal 1 ist für hybride Veranstaltungen
                        ausgestattet. Dafür muss eines der vorgesehenen
                        Hybrid-Settings gebucht werden.
                    </p>
                    <p>
                        Eine 140-Zoll-Videowall und drei zusätzliche Monitore
                        sorgen für eine gute Sicht im gesamten Raum.
                    </p>
                    <p>
                        Zwei Deckenmikrofon-Arrays und vier Kameras erkennen
                        die aktive Sprecherposition und wählen automatisch
                        die passende Kamera aus.
                    </p>
                    <p>
                        Der integrierte PC wird über das Touchpanel gestartet.
                        Eigene Geräte können am Rednerpult angeschlossen werden.
                    </p>
                `
            },
            {
                title: 'Videowall',
                content: `
                    <dl>
                        <div>
                            <dt>Anzahl und Größe</dt>
                            <dd>1 Videowall mit 140 Zoll</dd>
                        </div>
                        <div>
                            <dt>Bildformat</dt>
                            <dd>16:9</dd>
                        </div>
                        <div>
                            <dt>Standardauflösung</dt>
                            <dd>1920 × 1080 Pixel</dd>
                        </div>
                    </dl>
                `
            },
            {
                title: 'PC',
                content: `
                    <dl>
                        <div>
                            <dt>Vortragenden-PC</dt>
                            <dd>Lenovo M910Q</dd>
                        </div>
                        <div>
                            <dt>Bedienung</dt>
                            <dd>
                                Bluetooth-Tastatur mit integriertem Trackpad
                            </dd>
                        </div>
                    </dl>
                `
            },
            {
                title: 'Lautsprecher',
                content: `
                    <dl>
                        <div>
                            <dt>Ausstattung</dt>
                            <dd>2 fest installierte Lautsprecher</dd>
                        </div>
                        <div>
                            <dt>Modell</dt>
                            <dd>JBL CBT 50LA-1WH</dd>
                        </div>
                    </dl>
                `
            },
            {
                title: 'Mikrofone',
                content: `
                    <dl>
                        <div>
                            <dt>Funkmikrofone</dt>
                            <dd>Bis zu 4 gleichzeitig verwendbar</dd>
                        </div>
                        <div>
                            <dt>Varianten</dt>
                            <dd>
                                Taschen- und Handsender können flexibel
                                kombiniert werden.
                            </dd>
                        </div>
                        <div>
                            <dt>Modelle</dt>
                            <dd>Sennheiser SKM 300 und SK 300</dd>
                        </div>
                    </dl>
                `
            },
            {
                title: 'Rednerpult',
                content: `
                    <dl>
                        <div>
                            <dt>Ausführung</dt>
                            <dd>Fest installiertes Rednerpult</dd>
                        </div>
                        <div>
                            <dt>Anschlüsse</dt>
                            <dd>1 HDMI-Anschluss und 1 USB-Anschluss</dd>
                        </div>
                    </dl>
                `
            },
            {
                title: 'Raumsteuerung',
                content: `
                    <dl>
                        <div>
                            <dt>Steuerung</dt>
                            <dd>
                                AMX-Touchpanel am Medientechnikrack oder
                                mobile Steuerung über ein iPad Mini
                            </dd>
                        </div>
                        <div>
                            <dt>Funktionen</dt>
                            <dd>
                                Licht, Projektion und externe Geräte
                            </dd>
                        </div>
                    </dl>
                `
            },
            {
                title: 'Wireless Presenter',
                subtitle: 'Leihequipment am Service Desk TC',
                content: `
                    <p>
                        Presenter zum Weiterschalten von Folien inklusive
                        Laserpointer. Dadurch muss die vortragende Person
                        nicht unmittelbar am Rednerpult stehen.
                    </p>
                `
            },
            {
                title: 'Kabel und Adapter',
                subtitle: 'Leihequipment am Service Desk TC',
                content: `
                    <p>
                        Folgende Multimedia-Kabel und Adapter können auf
                        Anfrage bereitgestellt werden:
                    </p>
                    <ul>
                        <li>HDMI-Kabel</li>
                        <li>DisplayPort-zu-HDMI-Adapter</li>
                        <li>Mini-DisplayPort-zu-HDMI-Adapter</li>
                    </ul>
                `
            }
        ];
    }

    function buildSettingsData() {
        const base =
            'https://www.wu.ac.at/fileadmin/wu/h/structure/' +
            'servicecenters/procurement/veranstaltungsmanagement/' +
            'Fotos/Sitzungssaal1/';

        return [
            {
                title: 'Settings Standard',
                items: [
                    {
                        title: '80 Theater',
                        image:
                            'https://www.wu.ac.at/fileadmin/wu/_processed_/2/5/' +
                            'csm_Theater_80_0b93dd4d90.png',
                        pdf: base + 'Theater_80.pdf'
                    },
                    {
                        title: '36 Klassenzimmer',
                        image:
                            'https://www.wu.ac.at/fileadmin/wu/_processed_/5/9/' +
                            'csm_Klassenzimmer_36_Pax_9b0d51bb46.png',
                        pdf: base + 'Klassenzimmer_36_Pax.pdf'
                    },
                    {
                        title: '30 Sitzgruppe',
                        subtitle: '5 Gruppen mit je 6 Sesseln',
                        image:
                            'https://www.wu.ac.at/fileadmin/wu/_processed_/7/6/' +
                            'csm_Sitzgruppe_5er_je_6_Sessel_30_e7b74c6739.png',
                        pdf: base + 'Sitzgruppe_5er_je_6_Sessel_30.pdf'
                    },
                    {
                        title: '32 U-Form',
                        image:
                            'https://www.wu.ac.at/fileadmin/wu/_processed_/f/8/' +
                            'csm_U_Form_32_1b6268d730.png',
                        pdf: base + 'U_Form_32.pdf'
                    },
                    {
                        title: '40 Konferenzbestuhlung',
                        image:
                            'https://www.wu.ac.at/fileadmin/wu/_processed_/d/2/' +
                            'csm_AD_-_SS_1_-_Konferenzbestuhlung_40_Pax_-' +
                            '_Setting1_c07398dac4.png',
                        pdf:
                            base +
                            'AD_-_SS_1_-_Konferenzbestuhlung_40_Pax_-' +
                            '_Setting1.pdf'
                    },
                    {
                        title: '54 Konferenzbestuhlung',
                        image:
                            'https://www.wu.ac.at/fileadmin/wu/_processed_/0/4/' +
                            'csm_AD_-_SS_1_-_Konferenzbestuhlung_54_Pax_-' +
                            '_Setting_2_b85cac5eae.png',
                        pdf:
                            base +
                            'AD_-_SS_1_-_Konferenzbestuhlung_54_Pax_-' +
                            '_Setting_2.pdf'
                    },
                    {
                        title: '45 Sesselkreis',
                        image:
                            'https://www.wu.ac.at/fileadmin/wu/_processed_/5/c/' +
                            'csm_Sesselkreis_45_Pax_8c58e40503.png',
                        pdf: base + 'Sesselkreis_45_Pax.pdf'
                    }
                ]
            },
            {
                title: 'Settings Hybrid',
                items: [
                    {
                        title: '80 Theater Hybrid',
                        image:
                            'https://www.wu.ac.at/fileadmin/wu/_processed_/e/e/' +
                            'csm_AD_-_SS_1_-Theaterbestuhlung_hybrid_80_Pax_' +
                            '6b8385557b.png',
                        pdf:
                            base +
                            'AD_-_SS_1_-Theaterbestuhlung_hybrid_80_Pax.pdf'
                    },
                    {
                        title: '32 U-Form Hybrid',
                        image:
                            'https://www.wu.ac.at/fileadmin/wu/_processed_/5/f/' +
                            'csm_AD_-_SS_1_-U-Form_hybrid_32_Pax_-_Setting_1_' +
                            'd53ebd403c.png',
                        pdf:
                            base +
                            'AD_-_SS_1_-U-Form_hybrid_32_Pax_-_Setting_1.pdf'
                    },
                    {
                        title: '42 U-Form Hybrid',
                        image:
                            'https://www.wu.ac.at/fileadmin/wu/_processed_/2/9/' +
                            'csm_AD_-_SS_1_-_U_Form_hybrid__42_Pax_-' +
                            '_Setting_2__574f546f49.png',
                        pdf:
                            base +
                            'AD_-_SS_1_-_U_Form_hybrid__42_Pax_-' +
                            '_Setting_2_.pdf'
                    },
                    {
                        title: '40 Konferenzbestuhlung Hybrid',
                        image:
                            'https://www.wu.ac.at/fileadmin/wu/_processed_/c/2/' +
                            'csm_AD_-_SS_1_-_Konferenzbestuhlung_hybrid_' +
                            '40_Pax_-_Setting_1_fa03f4df60.png',
                        pdf:
                            base +
                            'AD_-_SS_1_-_Konferenzbestuhlung_hybrid_' +
                            '40_Pax_-_Setting_1.pdf'
                    },
                    {
                        title: '54 Konferenzbestuhlung Hybrid',
                        image:
                            'https://www.wu.ac.at/fileadmin/wu/_processed_/1/c/' +
                            'csm_AD_-_SS_1_-_Konferenzbestuhlung_hybrid_' +
                            '54_Pax_-_Setting_2_bc6df6da69.png',
                        pdf:
                            base +
                            'AD_-_SS_1_-_Konferenzbestuhlung_hybrid_' +
                            '54_Pax_-_Setting_2.pdf'
                    }
                ]
            }
        ];
    }

    function applySitzungssaalOneLayout() {
        const styleId = 'wu-sitzungssaal1-layout-style';

        const css = `
            .wu-room-details-row {
                display: flex !important;
                flex-flow: row nowrap !important;
                align-items: flex-start !important;
                gap: 24px !important;
                width: 100% !important;
            }

            .wu-room-details-row > .wu-room-gallery {
                flex: 1 1 auto !important;
                width: calc(100% - 454px) !important;
                min-width: 0 !important;
                max-width: calc(100% - 454px) !important;
            }

            .wu-room-details-row > .wu-room-sidebar {
                position: static !important;
                display: block !important;
                flex: 0 0 430px !important;
                width: 430px !important;
                min-width: 430px !important;
                max-width: 430px !important;
                margin: 0 !important;
                transform: none !important;
            }

            .wu-room-sidebar .usi-addSpaceDesktop {
                width: 100% !important;
                margin: 0 0 16px !important;
            }

            .wu-room-sidebar .usi-spaceDetailsContainer {
                width: 100% !important;
                min-width: 0 !important;
                max-width: 100% !important;
                margin: 0 !important;
            }

            .wu-room-sidebar .usi-detailsInfo {
                display: block !important;
                width: 100% !important;
            }

            .wu-room-sidebar .usi-detailsLine {
                display: flex !important;
                width: 100% !important;
                max-width: 100% !important;
                align-items: flex-start !important;
                border: 0 !important;
            }

            @media (max-width: 950px) {
                .wu-room-details-row {
                    flex-wrap: wrap !important;
                }

                .wu-room-details-row > .wu-room-gallery,
                .wu-room-details-row > .wu-room-sidebar {
                    flex: 0 0 100% !important;
                    width: 100% !important;
                    min-width: 0 !important;
                    max-width: 100% !important;
                }
            }
        `;

        ensureStyleTag(styleId, css);

        const row = getSpaceDetailsRow();

        if (!row) {
            return;
        }

        const gallery = row.querySelector('.usi-op-imageViewerContainer');
        const sidebar = row.querySelector('.usi-spaceDetails');

        if (!gallery || !sidebar) {
            return;
        }

        row.classList.add('wu-room-details-row');
        gallery.classList.add('wu-room-gallery');
        sidebar.classList.add('wu-room-sidebar');
    }

    function renderTechnicalDetailsSection() {
        const existing = document.getElementById('wu-technical-details-section');

        if (existing) {
            return existing;
        }

        const section = document.createElement('section');
        section.id = 'wu-technical-details-section';

        const heading = document.createElement('h2');
        heading.textContent = 'Technische Details';
        section.appendChild(heading);

        const details = buildTechnicalDetailsData();

        let currentSubtitle = '';

        details.forEach(function (item) {
            if (item.subtitle && item.subtitle !== currentSubtitle) {
                const subtitle = document.createElement('h3');
                subtitle.className = 'wu-technical-subtitle';
                subtitle.textContent = item.subtitle;
                section.appendChild(subtitle);
                currentSubtitle = item.subtitle;
            }

            const tile = document.createElement('details');
            tile.className = 'wu-technical-tile';

            const summary = document.createElement('summary');

            const title = document.createElement('span');
            title.textContent = item.title;

            const icon = document.createElement('span');
            icon.className = 'wu-technical-icon';
            icon.setAttribute('aria-hidden', 'true');
            icon.textContent = '+';

            summary.append(title, icon);

            const content = document.createElement('div');
            content.className = 'wu-technical-content';
            content.innerHTML = item.content;

            tile.append(summary, content);
            section.appendChild(tile);

            tile.addEventListener('toggle', function () {
                icon.textContent = tile.open ? '−' : '+';
            });
        });

        return section;
    }

    function applyTechnicalDetails() {
        const styleId = 'wu-technical-details-style';

        const css = `
            #wu-technical-details-section {
                --wu-blue: #0b80a7;
                --wu-blue-dark: #075f7d;
                --wu-text: #262626;
                --wu-muted: #666666;
                --wu-border: #d2d2d2;
                --wu-light: #f4f4f4;

                width: 100%;
                max-width: 1100px;
                margin: 45px auto;
                padding: 0;
                color: var(--wu-text);
                font-family: Verdana, Arial, sans-serif;
            }

            #wu-technical-details-section,
            #wu-technical-details-section * {
                box-sizing: border-box;
            }

            #wu-technical-details-section > h2 {
                margin: 0 0 20px;
                padding: 0 0 12px;
                border-bottom: 4px solid var(--wu-blue);
                color: var(--wu-text);
                font-size: 27px;
                font-weight: 700;
                line-height: 1.25;
            }

            #wu-technical-details-section .wu-technical-subtitle {
                margin: 34px 0 14px;
                padding: 0 0 9px;
                border-bottom: 3px solid var(--wu-blue-dark);
                color: var(--wu-text);
                font-size: 17px;
                font-weight: 700;
            }

            #wu-technical-details-section .wu-technical-tile {
                margin: 0 0 8px;
                border: 1px solid var(--wu-border);
                border-radius: 0;
                background: #ffffff;
            }

            #wu-technical-details-section
            .wu-technical-tile
            > summary {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 20px;
                min-height: 62px;
                padding: 16px 20px;
                color: var(--wu-text);
                background: var(--wu-light);
                cursor: pointer;
                list-style: none;
                font-size: 17px;
                font-weight: 700;
                line-height: 1.4;
                user-select: none;
            }

            #wu-technical-details-section
            .wu-technical-tile
            > summary::-webkit-details-marker {
                display: none;
            }

            #wu-technical-details-section
            .wu-technical-tile
            > summary:hover {
                color: #ffffff;
                background: var(--wu-blue);
            }

            #wu-technical-details-section
            .wu-technical-tile[open]
            > summary {
                color: #ffffff;
                background: var(--wu-blue);
            }

            #wu-technical-details-section .wu-technical-icon {
                display: inline-flex;
                flex: 0 0 32px;
                align-items: center;
                justify-content: center;
                width: 32px;
                height: 32px;
                border: 2px solid currentColor;
                border-radius: 50%;
                font-size: 22px;
                font-weight: 400;
                line-height: 1;
            }

            #wu-technical-details-section .wu-technical-content {
                padding: 22px 24px 25px;
                border-top: 4px solid var(--wu-blue-dark);
                background: #ffffff;
            }

            #wu-technical-details-section .wu-technical-content p {
                margin: 0 0 14px;
                color: var(--wu-text);
                font-size: 15px;
                line-height: 1.65;
            }

            #wu-technical-details-section
            .wu-technical-content
            p:last-child {
                margin-bottom: 0;
            }

            #wu-technical-details-section .wu-technical-content dl {
                margin: 0;
            }

            #wu-technical-details-section .wu-technical-content dl div {
                display: grid;
                grid-template-columns: minmax(170px, 32%) 1fr;
                gap: 22px;
                padding: 13px 0;
                border-bottom: 1px solid var(--wu-border);
            }

            #wu-technical-details-section
            .wu-technical-content
            dl div:last-child {
                border-bottom: 0;
            }

            #wu-technical-details-section .wu-technical-content dt {
                color: var(--wu-muted);
                font-size: 14px;
                font-weight: 700;
                line-height: 1.5;
            }

            #wu-technical-details-section .wu-technical-content dd {
                margin: 0;
                color: var(--wu-text);
                font-size: 15px;
                line-height: 1.5;
            }

            #wu-technical-details-section .wu-technical-content ul {
                margin: 12px 0 0;
                padding-left: 22px;
            }

            #wu-technical-details-section .wu-technical-content li {
                margin: 6px 0;
                color: var(--wu-text);
                font-size: 15px;
                line-height: 1.5;
            }

            @media (max-width: 650px) {
                #wu-technical-details-section {
                    margin: 30px auto;
                }

                #wu-technical-details-section
                .wu-technical-tile
                > summary {
                    padding: 14px 15px;
                    font-size: 15px;
                }

                #wu-technical-details-section
                .wu-technical-content {
                    padding: 18px 16px 20px;
                }

                #wu-technical-details-section
                .wu-technical-content
                dl div {
                    grid-template-columns: 1fr;
                    gap: 4px;
                }
            }
        `;

        ensureStyleTag(styleId, css);

        const row = getSpaceDetailsRow();

        if (!row) {
            return;
        }

        const section = renderTechnicalDetailsSection();

        if (section.parentElement !== row.parentElement) {
            row.insertAdjacentElement('afterend', section);
        }
    }

    function renderSettingsSection() {
        const existing = document.getElementById('wu-settings-section');

        if (existing) {
            return existing;
        }

        const section = document.createElement('section');
        section.id = 'wu-settings-section';

        const groups = buildSettingsData();

        groups.forEach(function (group) {
            const heading = document.createElement('h2');
            heading.textContent = group.title;

            const grid = document.createElement('div');
            grid.className = 'wu-settings-grid';

            group.items.forEach(function (item) {
                const card = document.createElement('article');
                card.className = 'wu-setting-card';

                const imageLink = document.createElement('a');
                imageLink.href = item.pdf;
                imageLink.target = '_blank';
                imageLink.rel = 'noopener noreferrer';
                imageLink.className = 'wu-setting-image';

                const image = document.createElement('img');
                image.src = item.image;
                image.alt = 'Stellplan ' + item.title;
                image.loading = 'lazy';

                const content = document.createElement('div');
                content.className = 'wu-setting-content';

                const title = document.createElement('h3');
                title.textContent = item.title;

                content.appendChild(title);

                if (item.subtitle) {
                    const subtitle = document.createElement('p');
                    subtitle.textContent = item.subtitle;
                    content.appendChild(subtitle);
                }

                const download = document.createElement('a');
                download.href = item.pdf;
                download.target = '_blank';
                download.rel = 'noopener noreferrer';
                download.className = 'wu-setting-download';
                download.innerHTML = '<span aria-hidden="true">↓</span>PDF öffnen';

                imageLink.appendChild(image);
                content.appendChild(download);
                card.append(imageLink, content);
                grid.appendChild(card);
            });

            section.append(heading, grid);
        });

        return section;
    }

    function applySettingsSection() {
        const styleId = 'wu-settings-style';

        const css = `
            #wu-settings-section {
                --wu-blue: #0b80a7;
                --wu-blue-dark: #075f7d;
                --wu-text: #262626;
                --wu-muted: #666666;
                --wu-border: #d2d2d2;

                grid-column: 1 / -1 !important;
                clear: both !important;
                float: none !important;
                display: block !important;
                width: 100% !important;
                max-width: none !important;
                margin: 45px 0 0 !important;
                padding: 0 !important;
                font-family: Verdana, Arial, sans-serif;
            }

            #wu-settings-section,
            #wu-settings-section * {
                box-sizing: border-box;
            }

            #wu-settings-section > h2 {
                margin: 42px 0 20px;
                padding: 0 0 12px;
                border-bottom: 4px solid var(--wu-blue);
                color: var(--wu-text);
                font-size: 27px;
                font-weight: 700;
                line-height: 1.25;
            }

            #wu-settings-section > h2:first-child {
                margin-top: 0;
            }

            #wu-settings-section .wu-settings-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, 198px);
                gap: 24px;
                justify-content: start;
            }

            #wu-settings-section .wu-setting-card {
                display: flex;
                flex-direction: column;
                width: 198px;
                height: 257px;
                min-width: 0;
                border: 1px solid var(--wu-border);
                background: #ffffff;
                transition:
                    box-shadow 160ms ease,
                    transform 160ms ease;
            }

            #wu-settings-section .wu-setting-card:hover {
                box-shadow: 0 7px 20px rgba(0, 0, 0, 0.14);
                transform: translateY(-2px);
            }

            #wu-settings-section .wu-setting-image {
                display: block;
                position: relative;
                overflow: hidden;
                flex: 0 0 132px;
                width: 196px;
                height: 132px;
                border-bottom: 5px solid var(--wu-blue-dark);
                background: #f3f3f3;
            }

            #wu-settings-section .wu-setting-image img {
                display: block;
                width: 100% !important;
                height: 100% !important;
                object-fit: contain !important;
                padding: 8px;
                background: #ffffff;
                transition: transform 180ms ease;
            }

            #wu-settings-section
            .wu-setting-card:hover
            .wu-setting-image img {
                transform: scale(1.025);
            }

            #wu-settings-section .wu-setting-content {
                display: flex;
                flex: 1;
                flex-direction: column;
                align-items: flex-start;
                min-height: 0;
                padding: 12px;
            }

            #wu-settings-section .wu-setting-content h3 {
                margin: 0 0 7px !important;
                color: var(--wu-text) !important;
                font-size: 14px !important;
                font-weight: 700 !important;
                line-height: 1.4 !important;
            }

            #wu-settings-section .wu-setting-content p {
                margin: 0 0 15px !important;
                color: var(--wu-muted) !important;
                font-size: 13px !important;
                line-height: 1.5 !important;
            }

            #wu-settings-section .wu-setting-download {
                display: inline-flex;
                align-items: center;
                gap: 9px;
                margin-top: auto;
                padding: 8px 11px;
                color: #ffffff !important;
                background: var(--wu-blue);
                text-decoration: none !important;
                font-size: 12px;
                font-weight: 700;
            }

            #wu-settings-section .wu-setting-download:hover {
                background: var(--wu-blue-dark);
            }

            #wu-settings-section .wu-setting-download span {
                font-size: 19px;
                line-height: 1;
            }

            @media (max-width: 900px) {
                #wu-settings-section .wu-settings-grid {
                    grid-template-columns: repeat(auto-fill, 198px);
                }
            }

            @media (max-width: 600px) {
                #wu-settings-section .wu-settings-grid {
                    grid-template-columns: repeat(auto-fill, 198px);
                }

                #wu-settings-section > h2 {
                    font-size: 23px;
                }
            }
        `;

        ensureStyleTag(styleId, css);

        const technicalSection = document.getElementById('wu-technical-details-section');

        if (!technicalSection) {
            return;
        }

        const section = renderSettingsSection();

        if (section.parentElement !== technicalSection.parentElement) {
            technicalSection.insertAdjacentElement('afterend', section);
            return;
        }

        if (section.previousElementSibling !== technicalSection) {
            technicalSection.insertAdjacentElement('afterend', section);
        }
    }

    function cleanupSitzungssaalOneEnhancements() {
        [
            'wu-sitzungssaal1-layout-style',
            'wu-technical-details-style',
            'wu-settings-style'
        ].forEach(function (id) {
            document.getElementById(id)?.remove();
        });

        [
            'wu-technical-details-section',
            'wu-settings-section'
        ].forEach(function (id) {
            document.getElementById(id)?.remove();
        });

        document.querySelectorAll('.wu-room-gallery').forEach(function (element) {
            element.classList.remove('wu-room-gallery');
        });

        document.querySelectorAll('.wu-room-sidebar').forEach(function (element) {
            element.classList.remove('wu-room-sidebar');
        });

        document.querySelectorAll('.wu-room-details-row').forEach(function (element) {
            element.classList.remove('wu-room-details-row');
        });
    }

    function applySitzungssaalOneEnhancements() {
        if (!isSitzungssaalOnePage()) {
            cleanupSitzungssaalOneEnhancements();
            return;
        }

        const row = getSpaceDetailsRow();

        if (!row) {
            return;
        }

        applySitzungssaalOneLayout();
        applyTechnicalDetails();
        applySettingsSection();
    }

    /*
     * Den von OSB bereitgestellten Namen neben dem Benutzer-Icon anzeigen.
     * Der Benutzername wird dynamisch aus OSB übernommen.
     */
    function showLoggedInUserName() {
        const controls = Array.from(document.querySelectorAll(
            'header button, header a, header [role="button"], ' +
            'nav button, nav a, nav [role="button"], ' +
            'app-header button, app-header a, app-header [role="button"], ' +
            '.usi-header button, .usi-header a, .usi-header [role="button"]'
        ));

        const genericLabels = [
            'account',
            'account circle',
            'benutzer',
            'benutzerkonto',
            'user',
            'user account',
            'profil',
            'profile',
            'person',
            'mein konto',
            'my account',
            'abmelden',
            'logout',
            'log out'
        ];

        function cleanName(value) {
            let name = (value || '')
                .replace(/\u00a0/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            name = name.replace(
                /^(benutzer(?:konto)?|user(?:\s+account)?|account|profil|profile|person)\s*[:\-–]\s*/i,
                ''
            );

            name = name.replace(
                /\s*[:\-–]\s*(abmelden|logout|log out)$/i,
                ''
            ).trim();

            if (
                name.length < 2 ||
                name.length > 100 ||
                genericLabels.includes(name.toLowerCase())
            ) {
                return '';
            }

            return name;
        }

        const userControl = controls.filter(function (control) {
            const rectangle = control.getBoundingClientRect();

            const descriptor = [
                control.getAttribute('aria-label'),
                control.getAttribute('title'),
                control.className
            ].filter(Boolean).join(' ').toLowerCase();

            const icon = control.querySelector(
                'mat-icon, .mat-icon, svg, i, ' +
                '[class*="person"], [class*="user"], [class*="account"]'
            );

            const iconDescriptor = icon
                ? [
                    icon.textContent,
                    icon.getAttribute('aria-label'),
                    icon.getAttribute('title'),
                    icon.getAttribute('class')
                ].filter(Boolean).join(' ').toLowerCase()
                : '';

            const combinedDescriptor =
                descriptor + ' ' + iconDescriptor;

            return (
                rectangle.width > 0 &&
                rectangle.height > 0 &&
                rectangle.top < 150 &&
                (
                    combinedDescriptor.includes('user') ||
                    combinedDescriptor.includes('benutzer') ||
                    combinedDescriptor.includes('account') ||
                    combinedDescriptor.includes('profil') ||
                    combinedDescriptor.includes('person')
                )
            );
        }).sort(function (first, second) {
            return (
                second.getBoundingClientRect().right -
                first.getBoundingClientRect().right
            );
        })[0];

        if (!userControl) {
            return;
        }

        const existingName =
            userControl.querySelector('.wu-header-user-name');

        const sourceValues = [
            userControl.getAttribute('aria-label'),
            userControl.getAttribute('title'),
            userControl.getAttribute('data-user-name'),
            userControl.getAttribute('data-username')
        ];

        Array.from(
            userControl.querySelectorAll('span, div, p')
        ).filter(function (element) {
            return !element.closest('mat-icon, .mat-icon');
        }).forEach(function (element) {
            sourceValues.push(element.textContent);
        });

        const userName = sourceValues
            .map(cleanName)
            .find(Boolean);

        if (!userName) {
            return;
        }

        userControl.classList.add('wu-header-user-control');

        if (existingName) {
            if (existingName.textContent !== userName) {
                existingName.textContent = userName;
            }

            return;
        }

        const nameElement = document.createElement('span');

        nameElement.className = 'wu-header-user-name';
        nameElement.textContent = userName;
        nameElement.setAttribute('aria-hidden', 'true');

        userControl.appendChild(nameElement);
    }

    function applyWuAdjustments() {
        changeSpaceLabel();
        changeCalendarTimeFormat();
        changeDateLabel();
        formatRoomHeaders();
        markWeekendButtons();
        markRepeatAndWeekdayArea();
        markSeriesFormLayout();
        applySitzungssaalOneEnhancements();
    }

    function scheduleUpdate() {
        if (updatePending) {
            return;
        }

        updatePending = true;

        window.requestAnimationFrame(function () {
            updatePending = false;
            applyWuAdjustments();
        });
    }

    function initialize() {
        applyWuAdjustments();

        [
            50,
            100,
            200,
            500,
            1000,
            2000,
            3000,
            5000,
            8000
        ].forEach(function (delay) {
            window.setTimeout(
                applyWuAdjustments,
                delay
            );
        });

        const observer = new MutationObserver(
            scheduleUpdate
        );

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: [
                'textContent',
                'innerText'
            ]
        });

        window.setInterval(
            applyWuAdjustments,
            1000
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }
})();
