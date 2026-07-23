(function () {
    'use strict';

    /* Verhindert, dass mehrere DOM-Aktualisierungen gleichzeitig laufen. */
    let updatePending = false;

    /* Vereinheitlicht Buttontexte für die zuverlässige Tageserkennung. */
    function normalizedText(element) {
        return (element.textContent || '')
            .replace(/\u00a0/g, '')
            .replace(/\s+/g, '')
            .trim()
            .toLowerCase();
    }

    /* Erkennt Samstag und Sonntag auf Deutsch und Englisch. */
    function isWeekend(text) {
        return [
            'so', 'so.', 'sonntag', 'sun', 'sunday',
            'sa', 'sa.', 'samstag', 'sat', 'saturday'
        ].includes(text);
    }

    /* Erkennt Montag bis Freitag auf Deutsch. */
    function isWeekday(text) {
        return [
            'mo', 'mo.', 'montag',
            'di', 'di.', 'dienstag',
            'mi', 'mi.', 'mittwoch',
            'do', 'do.', 'donnerstag',
            'fr', 'fr.', 'freitag'
        ].includes(text);
    }

    /* Ändert „SPACE" auf „RAUM" überall auf der Seite. */
    function changeSpaceLabel() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );

        const textNodes = [];
        let node;

        while ((node = walker.nextNode())) {
            if (node.nodeValue && node.nodeValue.toUpperCase().includes('SPACE')) {
                textNodes.push(node);
            }
        }

        textNodes.forEach(function (textNode) {
            /* Case-insensitive Ersetzung */
            textNode.nodeValue = textNode.nodeValue.replace(/\bspace\b/gi, 'RAUM');
        });
    }

    /* Wandelt die Stundenachse von AM/PM in das 24-Stunden-Format HH:MM um. */
    function changeCalendarTimeFormat() {
        // Strategie 1: Alle Textelemente im gesamten Dokument
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );

        const textNodes = [];
        let node;

        while ((node = walker.nextNode())) {
            const nodeValue = (node.nodeValue || '').trim();
            /* Flexiblerer Regex – auch mit Leerzeichen und verschiedenen Formaten */
            if (/\d{1,2}\s*(?::\d{2})?\s*(?:AM|PM)/i.test(nodeValue)) {
                textNodes.push(node);
            }
        }

        textNodes.forEach(function (textNode) {
            const match = (textNode.nodeValue || '').trim().match(
                /^(\d{1,2})\s*(?::(\d{2}))?\s*(AM|PM)$/i
            );

            if (!match) {
                return;
            }

            let hour = parseInt(match[1], 10);
            const minutes = (match[2] || '00').trim();
            const ampm = match[3].toUpperCase();

            // Korrekte AM/PM-Konvertierung
            if (ampm === 'AM') {
                if (hour === 12) hour = 0;
            } else {
                if (hour !== 12) hour += 12;
            }

            textNode.nodeValue =
                String(hour).padStart(2, '0') + ':' + minutes;
        });

        // Strategie 2: Spezifisch Tabellenzellen durchsuchen
        document.querySelectorAll('th, td').forEach(function (cell) {
            const content = cell.textContent.trim();
            const match = content.match(/^(\d{1,2})\s*(?::(\d{2}))?\s*(AM|PM)$/i);

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
                cell.textContent = newTime;
            }
        });

        // Strategie 3: Alle anderen Elemente mit innerHTML durchsuchen und ersetzen
        const allElements = document.querySelectorAll('*');
        allElements.forEach(function (element) {
            if (element.children.length === 0) {
                let html = element.innerHTML;
                const newHtml = html.replace(
                    /(\d{1,2})\s*(?::(\d{2}))?\s*(AM|PM)/gi,
                    function (match, hour, minutes, ampm) {
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
                );
                if (newHtml !== html) {
                    element.innerHTML = newHtml;
                }
            }
        });
    }

    /* Korrigiert die Datumsbeschriftung auf „Datum". */
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

    /* Findet die von Momentus erzeugte Gruppe der Wochentagsbuttons. */
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

    /* 
     * Markiert Samstag und Sonntag mit CSS-Klasse statt sie zu entfernen.
     * Die CSS-Datei verbirgt sie dann mit display:none.
     */
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

                /* Markiere Wochenende mit Klasse */
                if (value === '0' || value === '6' || isWeekend(text)) {
                    toggle.classList.add('wu-hidden-weekend');
                }
            });
        });
    }

    /*
     * Vergibt CSS-Hilfsklassen, damit „Wiederholt" und Mo.–Fr.
     * gemeinsam gestaltet und in einer Zeile angeordnet werden können.
     */
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

    /* Führt alle WU-Anpassungen in der richtigen Reihenfolge aus. */
    function applyWuAdjustments() {
        changeSpaceLabel();
        changeCalendarTimeFormat();
        changeDateLabel();
        markWeekendButtons();
        markRepeatAndWeekdayArea();
    }

    /* Bündelt schnelle DOM-Änderungen in einen einzigen Browser-Zyklus. */
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

    /*
     * Startet die Anpassungen, wiederholt sie während des Seitenaufbaus
     * und überwacht spätere dynamische Änderungen der Angular-Oberfläche.
     */
    function initialize() {
        applyWuAdjustments();

        [100, 250, 500, 1000, 2000, 4000, 8000].forEach(function (delay) {
            window.setTimeout(applyWuAdjustments, delay);
        });

        const observer = new MutationObserver(scheduleUpdate);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        window.setInterval(applyWuAdjustments, 1500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize, { once: true });
    } else {
        initialize();
    }
})();
