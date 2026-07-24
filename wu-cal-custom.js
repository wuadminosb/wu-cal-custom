(function () {
    'use strict';

    function initializeWuCalendar() {
        const styleId = 'wu-calendar-custom-styles';

        /*
         * Vorherige Skriptinstanz bereinigen,
         * falls die Datei mehrfach geladen wurde.
         */
        if (window.wuCalendarObserver) {
            window.wuCalendarObserver.disconnect();
        }

        if (window.wuCalendarInterval) {
            window.clearInterval(window.wuCalendarInterval);
        }

        document.getElementById(styleId)?.remove();

        /*
         * WU-Formatierungen einfügen.
         */
        const style = document.createElement('style');
        style.id = styleId;

        style.textContent = `
            /*
             * Ursprüngliche Beschriftung „Space“ ausblenden.
             */
            span.originCellContent {
                font-size: 0 !important;
            }

            /*
             * Deutsche Bezeichnung „Raum“ anzeigen.
             */
            span.originCellContent::after {
                content: "Raum" !important;
                display: inline-block !important;
                font-family: Verdana, Geneva, sans-serif !important;
                font-size: 16px !important;
                font-weight: 700 !important;
                font-style: normal !important;
                line-height: 1.2 !important;
                letter-spacing: normal !important;
                text-transform: none !important;
                color: #000000 !important;
                opacity: 1 !important;
                -webkit-text-fill-color: #000000 !important;
            }

            /*
             * Uhrzeiten formatieren.
             */
            .wu-calendar-time {
                font-family: Verdana, Geneva, sans-serif !important;
                font-size: 16px !important;
                font-weight: 700 !important;
                font-style: normal !important;
                line-height: 1.2 !important;
                letter-spacing: normal !important;
                color: #000000 !important;
                opacity: 1 !important;
                -webkit-text-fill-color: #000000 !important;
            }

            /*
             * Deutsches Kalenderdatum formatieren.
             */
            .wu-calendar-date {
                font-family: Verdana, Geneva, sans-serif !important;
            }
        `;

        (document.head || document.documentElement).appendChild(style);

        const germanMonths = {
            january: 'Jänner',
            february: 'Februar',
            march: 'März',
            april: 'April',
            may: 'Mai',
            june: 'Juni',
            july: 'Juli',
            august: 'August',
            september: 'September',
            october: 'Oktober',
            november: 'November',
            december: 'Dezember'
        };

        /*
         * AM/PM in das 24-Stunden-Format umwandeln.
         */
        function convertTime(text) {
            return text.replace(
                /\b(1[0-2]|0?[1-9])(?::([0-5]\d))?\s*(AM|PM)\b/gi,
                function (_, hourValue, minuteValue, period) {
                    let hour = Number(hourValue);
                    const minutes = minuteValue || '00';

                    if (period.toUpperCase() === 'AM') {
                        if (hour === 12) {
                            hour = 0;
                        }
                    } else if (hour !== 12) {
                        hour += 12;
                    }

                    return (
                        String(hour).padStart(2, '0') +
                        ':' +
                        minutes
                    );
                }
            );
        }

        /*
         * Englisches Datumsformat in die deutsche Schreibweise
         * umwandeln.
         *
         * Beispiel:
         * „Freitag, August 7, 2026“
         * wird zu
         * „Freitag, 7. August 2026“
         */
        function convertDate(text) {
            return text.replace(
                /^([^,]+),\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s*(\d{4})$/i,
                function (_, weekday, month, day, year) {
                    return (
                        weekday +
                        ', ' +
                        day +
                        '. ' +
                        germanMonths[month.toLowerCase()] +
                        ' ' +
                        year
                    );
                }
            );
        }

        /*
         * „Space“ in beschreibenden HTML-Attributen
         * ebenfalls durch „Raum“ ersetzen.
         */
        function changeSpaceAttributes() {
            document.querySelectorAll(
                '[aria-label], [title], [placeholder]'
            ).forEach(function (element) {
                [
                    'aria-label',
                    'title',
                    'placeholder'
                ].forEach(function (attribute) {
                    const value = element.getAttribute(attribute);

                    if (value && /\bspace\b/i.test(value)) {
                        element.setAttribute(
                            attribute,
                            value.replace(/\bspace\b/gi, 'Raum')
                        );
                    }
                });
            });
        }

        /*
         * Bereits im 24-Stunden-Format dargestellte
         * Kalenderzeiten erkennen und markieren.
         */
        function markExistingCalendarTimes() {
            document.querySelectorAll(
                '.timeCellContent, [class*="timeCell"], [class*="time-cell"]'
            ).forEach(function (element) {
                const text = (element.textContent || '').trim();

                if (
                    /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(text)
                ) {
                    element.classList.add('wu-calendar-time');
                }
            });
        }

        /*
         * Sämtliche Textanpassungen durchführen.
         */
        function applyWuFixes() {
            if (!document.body) {
                return;
            }

            changeSpaceAttributes();

            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT
            );

            const textNodes = [];
            let node;

            while ((node = walker.nextNode())) {
                textNodes.push(node);
            }

            textNodes.forEach(function (textNode) {
                const parent = textNode.parentElement;
                const originalText = textNode.nodeValue || '';
                const trimmedText = originalText.trim();

                if (
                    !parent ||
                    !trimmedText ||
                    parent.closest(
                        'script, style, textarea, input, option'
                    )
                ) {
                    return;
                }

                /*
                 * AM/PM-Zeit umwandeln.
                 */
                if (
                    /\b(1[0-2]|0?[1-9])(?::[0-5]\d)?\s*(AM|PM)\b/i
                        .test(originalText)
                ) {
                    textNode.nodeValue = convertTime(originalText);
                    parent.classList.add('wu-calendar-time');
                }

                /*
                 * Bereits umgewandelte Kalenderzeiten markieren.
                 */
                if (
                    /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(trimmedText) &&
                    (
                        parent.closest('.timeCellContent') ||
                        parent.closest('[class*="timeCell"]') ||
                        parent.closest('[class*="time-cell"]') ||
                        parent.classList.contains('wu-calendar-time')
                    )
                ) {
                    parent.classList.add('wu-calendar-time');
                }

                /*
                 * Englisches Datum deutsch formatieren.
                 */
                const convertedDate = convertDate(trimmedText);

                if (convertedDate !== trimmedText) {
                    textNode.nodeValue = convertedDate;
                    parent.classList.add('wu-calendar-date');
                }
            });

            markExistingCalendarTimes();

            /*
             * Erfolgreich getestete Mindesthöhe anwenden.
             */
            document.querySelectorAll(
                '.wu-calendar-time'
            ).forEach(function (time) {
                if (time.parentElement) {
                    time.parentElement.style.setProperty(
                        'min-height',
                        '25px',
                        'important'
                    );
                }
            });
        }

        /*
         * Viele unmittelbar aufeinanderfolgende Änderungen
         * durch Angular in einem Durchlauf zusammenfassen.
         */
        let updatePending = false;

        function scheduleUpdate() {
            if (updatePending) {
                return;
            }

            updatePending = true;

            window.requestAnimationFrame(function () {
                updatePending = false;
                applyWuFixes();
            });
        }

        /*
         * Anpassungen sofort ausführen.
         */
        applyWuFixes();

        /*
         * Später geladene Angular-Inhalte automatisch bearbeiten.
         */
        window.wuCalendarObserver = new MutationObserver(
            scheduleUpdate
        );

        window.wuCalendarObserver.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        /*
         * Zusätzliche Sicherheitsprüfung für dynamisch
         * neu aufgebaute Kalenderbereiche.
         */
        window.wuCalendarInterval = window.setInterval(
            applyWuFixes,
            1000
        );

        /*
         * Zusätzliche Startdurchläufe für verzögertes Rendering.
         */
        [
            100,
            250,
            500,
            1000,
            2000,
            4000,
            8000
        ].forEach(function (delay) {
            window.setTimeout(applyWuFixes, delay);
        });

        console.log(
            'WU-Kalenderanpassungen wurden erfolgreich geladen.'
        );
    }

    /*
     * Bei einer extern eingebundenen Datei sicherstellen,
     * dass document.body bereits vorhanden ist.
     */
    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initializeWuCalendar,
            { once: true }
        );
    } else {
        initializeWuCalendar();
    }
})();
