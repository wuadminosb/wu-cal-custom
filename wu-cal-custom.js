(function () {
    'use strict';

    const styleId = 'wu-calendar-console-test';

    document.getElementById(styleId)?.remove();

    if (window.wuConsoleObserver) {
        window.wuConsoleObserver.disconnect();
    }

    if (window.wuConsoleInterval) {
        window.clearInterval(window.wuConsoleInterval);
    }

    const style = document.createElement('style');
    style.id = styleId;

    style.textContent = `
        /* Ursprüngliche Beschriftung „Space“ ausblenden */
        span.originCellContent {
            font-size: 0 !important;
        }

        /* „Raum“ anzeigen */
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

        /* Uhrzeiten */
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

        /* Deutsches Kalenderdatum */
        .wu-calendar-date {
            font-family: Verdana, Geneva, sans-serif !important;
        }
    `;

    document.head.appendChild(style);

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

                return String(hour).padStart(2, '0') + ':' + minutes;
            }
        );
    }

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

    function applyWuFixes() {
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
                parent.closest('script, style, textarea, input')
            ) {
                return;
            }

            /* AM/PM in 24-Stunden-Format umwandeln */
            if (
                /\b(1[0-2]|0?[1-9])(?::[0-5]\d)?\s*(AM|PM)\b/i
                    .test(originalText)
            ) {
                textNode.nodeValue = convertTime(originalText);
                parent.classList.add('wu-calendar-time');
            }

            /* Bereits umgewandelte Kalenderzeiten ebenfalls markieren */
            if (
                /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(trimmedText) &&
                (
                    parent.closest('.timeCellContent') ||
                    parent.closest('[class*="time"]') ||
                    parent.classList.contains('wu-calendar-time')
                )
            ) {
                parent.classList.add('wu-calendar-time');
            }

            /* Englisches Datum deutsch formatieren */
            const convertedDate = convertDate(trimmedText);

            if (convertedDate !== trimmedText) {
                textNode.nodeValue = convertedDate;
                parent.classList.add('wu-calendar-date');
            }
        });

        /* Mindesthöhe der Zeitspalten */
        document.querySelectorAll('.wu-calendar-time').forEach(function (time) {
            time.parentElement?.style.setProperty(
                'min-height',
                '25px',
                'important'
            );
        });
    }

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

    applyWuFixes();

    window.wuConsoleObserver = new MutationObserver(scheduleUpdate);

    window.wuConsoleObserver.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    window.wuConsoleInterval = window.setInterval(
        applyWuFixes,
        1000
    );

    console.log(
        'WU-Test aktiv: Raum, Uhrzeiten, Farbe und Mindesthöhe wurden angepasst.'
    );
})();
