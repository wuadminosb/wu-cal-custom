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

    /* SPACE → Raum Konvertierung */
    function changeSpaceLabel() {
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

        document.querySelectorAll('.originCellContent, [class*="Cell"], .rowHeaderContent, span, div, label, p').forEach(function (element) {
            if (element.children.length === 0) {
                const text = element.textContent;
                if (/\bspace\b/gi.test(text)) {
                    element.textContent = text.replace(/\bspace\b/gi, 'Raum');
                }
            }
        });

        document.querySelectorAll('[aria-label], [title], [placeholder]').forEach(function (element) {
            ['aria-label', 'title', 'placeholder'].forEach(function (attr) {
                const val = element.getAttribute(attr);
                if (val && /\bspace\b/gi.test(val)) {
                    element.setAttribute(attr, val.replace(/\bspace\b/gi, 'Raum'));
                }
            });
        });
    }

    /* Zeit AM/PM → 24h Format - AGGRESSIV */
    function changeCalendarTimeFormat() {
        // Strategie 1: Alle Textelemente durchsuchen
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );

        const textNodes = [];
        let node;

        while ((node = walker.nextNode())) {
            const val = (node.nodeValue || '').trim();
            // Flexiblerer Regex: optional Leerzeichen, optional Minuten
            if (/\d{1,2}\s*(?::\d{2})?\s*(?:AM|PM)/i.test(val)) {
                textNodes.push(node);
            }
        }

        textNodes.forEach(function (textNode) {
            const newValue = convertTime(textNode.nodeValue);
            if (newValue !== textNode.nodeValue) {
                textNode.nodeValue = newValue;
            }
        });

        // Strategie 2: Alle Elemente mit textContent durchsuchen
        document.querySelectorAll('span, div, td, th, p, label, button, .header-column, .mergedHeaderContent').forEach(function (element) {
            if (element.children.length === 0) {
                const text = element.textContent.trim();
                if (/\d{1,2}\s*(?::\d{2})?\s*(?:AM|PM)/i.test(text)) {
                    const newText = convertTime(text);
                    if (newText !== text) {
                        element.textContent = newText;
                    }
                }
            }
        });

        // Strategie 3: innerHTML für verschachtelte Elemente
        document.querySelectorAll('*').forEach(function (element) {
            if (element.innerHTML && !element.querySelector('*')) {
                const html = element.innerHTML;
                const newHtml = html.replace(
                    /(\d{1,2})\s*(?::(\d{2}))?\s*(AM|PM|am|pm)/gi,
                    function (match, hour, minutes, ampm) {
                        return convertTimeString(hour, minutes, ampm);
                    }
                );
                if (newHtml !== html) {
                    element.innerHTML = newHtml;
                }
            }
        });
    }

    /* Konvertiert einzelne Zeit */
    function convertTime(timeString) {
        return timeString.replace(
            /(\d{1,2})\s*(?::(\d{2}))?\s*(AM|PM|am|pm)/gi,
            function (match, hour, minutes, ampm) {
                return convertTimeString(hour, minutes, ampm);
            }
        );
    }

    /* Hilfsfunktion für Zeit-Konvertierung */
    function convertTimeString(hour, minutes, ampm) {
        let h = parseInt(hour, 10);
        const m = (minutes || '00').trim();
        const ap = ampm.toUpperCase();

        if (ap === 'AM') {
            if (h === 12) h = 0;
        } else {
            if (h !== 12) h += 12;
        }

        return String(h).padStart(2, '0') + ':' + m;
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

        // Sehr häufige Wiederholungen
        [50, 100, 150, 250, 500, 750, 1000, 1500, 2000, 3000, 5000].forEach(function (delay) {
            window.setTimeout(applyWuAdjustments, delay);
        });

        const observer = new MutationObserver(scheduleUpdate);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        // Sehr häufige Interval-Prüfung
        window.setInterval(applyWuAdjustments, 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
        initialize();
    }
})();
