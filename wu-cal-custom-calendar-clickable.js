(function () {
    'use strict';

    /*
     * Freie Kalender-Zellen als klickbar kennzeichnen und sicherstellen,
     * dass die native OSB-Klick-Logik ausgelöst wird.
     *
     * Gebuchte Bereiche (.chadmo-merged-cell) bleiben unberührt und
     * erhalten weiterhin pointer-events: none über das globale CSS.
     */

    const STYLE_ID = 'wu-calendar-clickable-style';
    const FREE_CLASS = 'wu-cal-free-cell';
    const CALENDAR_SELECTORS = [
        '.chadmo',
        'app-availability-calendar',
        'app-calendar-day-view'
    ].join(', ');

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            /* Freie Zellen: Zeiger und Hover-Hervorhebung */
            .${FREE_CLASS} {
                cursor: pointer !important;
            }

            .${FREE_CLASS}:hover {
                background-color: rgba(11, 128, 167, 0.10) !important;
                outline: 1px solid rgba(11, 128, 167, 0.30) !important;
                outline-offset: -1px !important;
            }

            .${FREE_CLASS}:focus-visible {
                outline: 2px solid #0b80a7 !important;
                outline-offset: -2px !important;
            }
        `;

        document.head.appendChild(style);
    }

    function isBookedCell(element) {
        return (
            element.classList.contains('chadmo-merged-cell') ||
            element.closest('.chadmo-merged-cell') !== null
        );
    }

    function isUnavailableCell(element) {
        return (
            element.classList.contains('unavailable') ||
            element.closest('.unavailable') !== null
        );
    }

    /*
     * Alle Kalender-Gitter suchen und freie Zellen markieren.
     * Nur tatsächliche Datenzellen (nicht Kopfzeilen) werden
     * berücksichtigt.
     */
    function markFreeCells() {
        const calendars = document.querySelectorAll(CALENDAR_SELECTORS);

        calendars.forEach(function (calendar) {
            /*
             * Datenzellen im chadmo-Grid sind typischerweise
             * .calCell, .chadmo-cell oder td-Elemente innerhalb
             * von .chadmo-gridsView / .chadmo-viewport.
             * Der Selektor deckt alle bekannten OSB-Varianten ab.
             */
            const cells = calendar.querySelectorAll(
                '.calCell, .chadmo-cell, ' +
                '.chadmo-gridsView td, .chadmo-gridsView [role="gridcell"], ' +
                '[role="gridcell"]'
            );

            cells.forEach(function (cell) {
                if (isBookedCell(cell) || isUnavailableCell(cell)) {
                    cell.classList.remove(FREE_CLASS);
                    return;
                }

                /*
                 * Zellen ohne interaktiven Inhalt werden als frei
                 * eingestuft. Zellen, die selbst ein Buchungselement
                 * enthalten, überspringen.
                 */
                if (!cell.classList.contains(FREE_CLASS)) {
                    cell.classList.add(FREE_CLASS);
                }
            });
        });
    }

    function initialize() {
        ensureStyles();
        markFreeCells();

        let updatePending = false;

        const observer = new MutationObserver(function () {
            if (updatePending) {
                return;
            }

            updatePending = true;

            window.requestAnimationFrame(function () {
                updatePending = false;
                markFreeCells();
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
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
