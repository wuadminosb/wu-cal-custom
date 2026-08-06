(function () {
    'use strict';

    /*
     * Standard-Kalenderansicht erzwingen:
     *   1. Monats-Tab wird nie zur aktiven Ansicht (schon in
     *      wu-cal-custom-calendar-tabs.js behandelt, hier als
     *      zusätzliche Sicherung nach SPA-Navigation).
     *   2. Nach dem Öffnen des Kalenders automatisch zum heutigen
     *      Datum springen, wenn der angezeigte Tag in der
     *      Vergangenheit liegt.
     */

    const READY_ATTRIBUTE = 'data-wu-default-view-ready';

    function normalize(value) {
        return String(value || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    /*
     * Kalender-Tab-Leiste suchen – dieselbe Logik wie in
     * wu-cal-custom-calendar-tabs.js, aber unabhängig, damit
     * dieses Modul auch einzeln lauffähig ist.
     */
    function findCalendarLabels() {
        return Array.from(
            document.querySelectorAll(
                '.mat-mdc-tab-labels, .mat-tab-labels'
            )
        ).find(function (labels) {
            const tabTexts = Array.from(
                labels.querySelectorAll(':scope > [role="tab"]')
            ).map(function (tab) {
                return normalize(tab.textContent);
            });

            return (
                tabTexts.includes('tag') &&
                tabTexts.includes('woche') &&
                tabTexts.includes('monat')
            );
        }) || null;
    }

    /*
     * Sicherstellen dass die Monatsansicht nicht aktiv ist.
     * Wenn sie aktiv ist, zur Tagesansicht wechseln.
     */
    function enforceDefaultTab() {
        const labels = findCalendarLabels();

        if (!labels) {
            return false;
        }

        const tabs = Array.from(
            labels.querySelectorAll(':scope > [role="tab"]')
        );

        const dayTab = tabs.find(function (tab) {
            return normalize(tab.textContent) === 'tag';
        });

        const monthTab = tabs.find(function (tab) {
            return normalize(tab.textContent) === 'monat';
        });

        if (!dayTab || !monthTab) {
            return false;
        }

        if (monthTab.getAttribute('aria-selected') === 'true') {
            dayTab.click();
        }

        return true;
    }

    /*
     * „Heute"-Button suchen und anklicken.
     * Versucht mehrere bekannte Beschriftungen und Attribute.
     */
    function clickTodayButton() {
        const calendarRoot = document.querySelector(
            'app-availability-calendar, app-calendar-day-view, ' +
            '.usi-calendarSection, .usi-calendarParent'
        );

        const scope = calendarRoot || document;

        const todayButton = Array.from(
            scope.querySelectorAll('button')
        ).find(function (button) {
            const label = normalize(
                button.getAttribute('aria-label') ||
                button.getAttribute('title') ||
                button.textContent
            );

            return (
                label === 'heute' ||
                label === 'today' ||
                label.startsWith('heute') ||
                label.startsWith('today')
            );
        });

        if (todayButton) {
            todayButton.click();
            return true;
        }

        return false;
    }

    /*
     * Prüfen ob das aktuell angezeigte Datum in der Vergangenheit liegt.
     * OSB zeigt das aktuelle Datum typischerweise in der Kalender-Toolbar
     * als Text oder als aria-label auf einem Datum-Element.
     */
    function isShowingPastDate() {
        const calendarRoot = document.querySelector(
            'app-availability-calendar, app-calendar-day-view, ' +
            '.usi-calendarSection'
        );

        if (!calendarRoot) {
            return false;
        }

        /*
         * Datum-Anzeige in der Toolbar finden.
         * OSB rendert das angezeigte Datum oft in einem Element mit
         * Klasse wie „chadmo-toolbar-title", „usi-calendarDate" oder
         * als aria-label auf einem Navigations-Wrapper.
         */
        const dateDisplay = calendarRoot.querySelector(
            '.chadmo-toolbar-title, ' +
            '[class*="calendarDate"], ' +
            '[class*="toolbar"] [class*="title"], ' +
            '[class*="toolbar"] [class*="date"], ' +
            '[class*="nav"] [class*="title"]'
        );

        if (!dateDisplay) {
            return false;
        }

        const text = normalize(dateDisplay.textContent);

        /*
         * Einfache Heuristik: Datum im Format „D. Monat YYYY" oder
         * „D. Monat" parsen. Wenn das Jahr oder Monat kleiner als
         * heute ist, gilt das Datum als Vergangenheit.
         */
        const MONTHS = {
            januar: 0, february: 0, jan: 0,
            februar: 1, february2: 1, feb: 1,
            'märz': 2, march: 2, mar: 2,
            april: 3, apr: 3,
            mai: 4, may: 4,
            juni: 5, june: 5, jun: 5,
            juli: 6, july: 6, jul: 6,
            august: 7, aug: 7,
            september: 8, sep: 8,
            oktober: 9, october: 9, oct: 9,
            november: 10, nov: 10,
            dezember: 11, december: 11, dec: 11
        };

        let displayMonth = -1;
        let displayYear = -1;

        Object.keys(MONTHS).forEach(function (name) {
            if (text.includes(name)) {
                displayMonth = MONTHS[name];
            }
        });

        const yearMatch = text.match(/\b(20\d{2})\b/);

        if (yearMatch) {
            displayYear = parseInt(yearMatch[1], 10);
        }

        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();

        if (displayYear > 0 && displayYear < currentYear) {
            return true;
        }

        if (
            displayYear === currentYear &&
            displayMonth >= 0 &&
            displayMonth < currentMonth
        ) {
            return true;
        }

        return false;
    }

    /*
     * Hauptfunktion: Standard-Ansicht durchsetzen und zum heutigen
     * Datum springen, wenn der Kalender auf einem vergangenen Datum
     * startet.
     *
     * Der Marker-Attribut verhindert doppeltes Auslösen für dieselbe
     * Kalender-Instanz. Er wird beim Klick auf einen anderen Tab oder
     * bei SPA-Navigation (DOM-Entfernung des Kalenders) automatisch
     * zurückgesetzt.
     */
    function applyDefaultView() {
        const calendarRoot = document.querySelector(
            'app-availability-calendar, app-calendar-day-view'
        );

        if (!calendarRoot) {
            return false;
        }

        const alreadyHandled =
            calendarRoot.getAttribute(READY_ATTRIBUTE) === 'true';

        enforceDefaultTab();

        if (!alreadyHandled) {
            if (isShowingPastDate()) {
                clickTodayButton();
            }

            calendarRoot.setAttribute(READY_ATTRIBUTE, 'true');
        }

        return true;
    }

    function initialize() {
        applyDefaultView();

        let updatePending = false;

        const observer = new MutationObserver(function () {
            if (updatePending) {
                return;
            }

            updatePending = true;

            window.requestAnimationFrame(function () {
                updatePending = false;
                applyDefaultView();
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    const RETRY_DELAYS = [0, 100, 300, 700, 1500, 3000];

    RETRY_DELAYS.forEach(function (delay) {
        window.setTimeout(applyDefaultView, delay);
    });

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
