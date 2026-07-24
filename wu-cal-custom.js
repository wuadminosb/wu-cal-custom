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

    /* SPACE → Raum Konvertierung - ALL INCLUSIVE */
    function changeSpaceLabel() {
        // Strategie 1: Alle Textelemente mit TreeWalker
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );

        const textNodes = [];
        let node;

        while ((node = walker.nextNode())) {
            const val = node.nodeValue || '';
            if (/\bspace\b/gi.test(val)) {
                textNodes.push(node);
            }
        }

        textNodes.forEach(function (textNode) {
            textNode.nodeValue = textNode.nodeValue.replace(/\bspace\b/gi, 'Raum');
        });

        // Strategie 2: Spezifische Elemente mit textContent
        document.querySelectorAll('.originCellContent, [class*="Cell"], .rowHeaderContent, span, div, label, p').forEach(function (element) {
            if (element.children.length === 0) {
                const text = element.textContent;
                if (/\bspace\b/gi.test(text)) {
                    element.textContent = text.replace(/\bspace\b/gi, 'Raum');
                }
            }
        });

        // Strategie 3: Attribute durchsuchen
        document.querySelectorAll('[aria-label], [title], [placeholder], [data-*]').forEach(function (element) {
            ['aria-label', 'title', 'placeholder'].forEach(function (attr) {
                const val = element.getAttribute(attr);
                if (val && /\bspace\b/gi.test(val)) {
                    element.setAttribute(attr, val.replace(/\bspace\b/gi, 'Raum'));
                }
            });
        });
    }

    /* Zeit AM/PM → 24h Format */
    function changeCalendarTimeFormat() {
        // Suche alle Elemente die Zeit enthalten könnten
        document.querySelectorAll('span, div, td, th, p, label, button').forEach(function (element) {
            if (element.children.length === 0 && element.textContent) {
                const text = element.textContent.trim();
                
                // Regex für AM/PM Format: "8 AM", "8AM", "8:00 AM", etc.
                const match = text.match(/^(\d{1,2})\s*(?::(\d{2}))?\s*(AM|PM|am|pm)$/i);
                
                if (match) {
                    let hour = parseInt(match[1], 10);
                    const minutes = (match[2] || '00').trim();
                    const ampm = match[3].toUpperCase();

                    if (ampm === 'AM') {
                        if (hour === 12) hour = 0;
                    } else {
                        if (hour !== 12) hour += 12;
                    }

                    const newTime = String(hour).padStart(2, '0') + ':' + minutes;
                    element.textContent = newTime;
                }
            }
        });
    }

    function changeDateLabel() {
        document.querySelectorAll(
            'label[for="searchDatePicker"] mat-label, ' +
            'label[for="searchDatePicker"], ' +
            '#searchDatePicker mat-label'
        ).forEach(function (label) {
            const text = (label.textContent || '').replace(/\s+/g, ' ').trim();

            if (text === 'Daten' || text === 'Date' || text === 'Datum') {
                label.textContent = 'Datum';
            }
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

            const toggles = Array.from(group.querySelectorAll(
                'mat-button-toggle, ' +
                '.mat-button-toggle, ' +
                '.mat-mdc-button-toggle, ' +
                '[role="radio"]'
            ));

            toggles.forEach(function (toggle) {
                const value =
                    toggle.getAttribute('value') ||
                    toggle.getAttribute('ng-reflect-value');
                const text = normalizedText(toggle);

                if (value === '0' || value === '6' || isWeekend(text)) {
                    toggle.classList.add('wu-hidden-weekend');
                }
            });
        });
    }

    function markRepeatAndWeekdayArea() {
        findWeekdayGroups().forEach(function (group) {
            group.classList.add('wu-weekday-group');

            if (group.parentElement) {
                group.parentElement.classList.add('wu-repeat-weekday-native-row');
            }
        });

        document.querySelectorAll(
            'mat-label, label, .mdc-floating-label'
        ).forEach(function (label) {
            const text = (label.textContent || '').replace(/\s+/g, ' ').trim();

            if (!text.startsWith('Wiederholt')) {
                return;
            }

            const field =
                label.closest('mat-form-field') ||
                label.closest('.mat-mdc-form-field');

            if (field) {
                field.classList.add('wu-repeat-field');
                if (field.parentElement) {
                    field.parentElement.classList.add(
                        'wu-repeat-weekday-native-row'
                    );
                }
            }
        });
    }

    function applyWuAdjustments() {
        changeSpaceLabel();
        changeCalendarTimeFormat();
        changeDateLabel();
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

        // Häufigere Wiederholungen für bessere Coverage
        [50, 100, 200, 500, 1000, 2000, 3000, 5000, 8000].forEach(function (delay) {
            window.setTimeout(applyWuAdjustments, delay);
        });

        const observer = new MutationObserver(scheduleUpdate);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ['textContent', 'innerText']
        });

        // Noch häufigere Interval-Prüfung für Angular-Rendering
        window.setInterval(applyWuAdjustments, 1000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
        initialize();
    }
})();
