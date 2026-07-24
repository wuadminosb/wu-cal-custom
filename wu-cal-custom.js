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
     * Bereits formatierte Einträge werden erneut ausgerichtet.
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

            /*
             * Noch nicht formatierte Räume aufteilen.
             */
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

            /*
             * Raumbezeichnung innerhalb der bestehenden
             * Zeilenhöhe formatieren.
             */
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

            /*
             * Raumnummer normal, nur Raumname fett.
             */
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

            /*
             * Horizontal und vertikal zentrieren,
             * ohne die Zeilenhöhe zu verändern.
             */
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

    function applyWuAdjustments() {
        changeSpaceLabel();
        changeCalendarTimeFormat();
        changeDateLabel();
        formatRoomHeaders();
        markWeekendButtons();
        markRepeatAndWeekdayArea();
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
