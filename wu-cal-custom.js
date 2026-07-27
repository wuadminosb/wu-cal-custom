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

                if (
                    formText.includes('startdatum') &&
                    formText.includes('enddatum') &&
                    formText.includes('wiederholt') &&
                    formText.includes('gebäude') &&
                    formText.includes('raumart')
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
                !searchButton ||
                !repeatField ||
                !repeatRow ||
                !weekdayGroup
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

            repeatRow.classList.add(
                'wu-series-repeat-row'
            );

            repeatField.classList.add(
                'wu-series-repeat-field'
            );

            weekdayGroup.classList.add(
                'wu-series-weekdays'
            );

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
        showLoggedInUserName();
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
