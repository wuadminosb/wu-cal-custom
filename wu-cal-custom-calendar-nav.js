(function () {
    'use strict';

    /*
     * Kalender-Navigation verbessern:
     *   - „Heute"-Button in WU-Blau hervorheben
     *   - Tastatur-Shortcuts im Kalender-Kontext:
     *       ArrowLeft  → einen Tag zurück
     *       ArrowRight → einen Tag vor
     *       t          → „Heute" (springt zum aktuellen Datum)
     */

    const STYLE_ID = 'wu-calendar-nav-style';
    const TODAY_CLASS = 'wu-calendar-today-button';
    const PREV_CLASS = 'wu-calendar-prev-button';
    const NEXT_CLASS = 'wu-calendar-next-button';

    const CALENDAR_ROOT_SELECTORS = [
        'app-availability-calendar',
        'app-calendar-day-view',
        '.usi-calendarSection',
        '.usi-calendarParent'
    ].join(', ');

    function normalize(value) {
        return String(value || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            /* „Heute"-Button – WU-Blau-Hervorhebung */
            .${TODAY_CLASS} {
                color: #ffffff !important;
                background-color: #0b80a7 !important;
                border-color: #0b80a7 !important;
            }

            .${TODAY_CLASS}:hover {
                background-color: #075f7d !important;
                border-color: #075f7d !important;
            }

            .${TODAY_CLASS}:focus-visible {
                outline: 3px solid #0b80a7 !important;
                outline-offset: 2px !important;
            }

            /* Vor/Zurück-Buttons – dezente WU-Blau-Umrandung */
            .${PREV_CLASS},
            .${NEXT_CLASS} {
                border-color: #0b80a7 !important;
                color: #0b80a7 !important;
            }

            .${PREV_CLASS}:hover,
            .${NEXT_CLASS}:hover {
                background-color: rgba(11, 128, 167, 0.08) !important;
            }

            .${PREV_CLASS}:focus-visible,
            .${NEXT_CLASS}:focus-visible {
                outline: 3px solid #0b80a7 !important;
                outline-offset: 2px !important;
            }
        `;

        document.head.appendChild(style);
    }

    /*
     * Navigations-Buttons in der Kalender-Toolbar finden und klassifizieren.
     * OSB verwendet unterschiedliche Markierungen je nach Version:
     *   - aria-label / title mit „zurück", „weiter", „heute"
     *   - mat-icon-button mit mat-icon-Inhalt „chevron_left" / „chevron_right"
     *   - Ein Button, dessen Text genau „Heute" oder „Today" enthält
     */
    function classifyNavButtons() {
        const calendarRoots = document.querySelectorAll(
            CALENDAR_ROOT_SELECTORS
        );

        const scopes = calendarRoots.length
            ? Array.from(calendarRoots)
            : [document];

        scopes.forEach(function (scope) {
            const buttons = scope.querySelectorAll('button');

            buttons.forEach(function (button) {
                const label = normalize(
                    button.getAttribute('aria-label') ||
                    button.getAttribute('title') ||
                    button.textContent
                );

                const icon = button.querySelector('mat-icon, .mat-icon');
                const iconText = icon ? normalize(icon.textContent) : '';

                const isToday =
                    label === 'heute' ||
                    label === 'today' ||
                    label.startsWith('heute') ||
                    label.startsWith('today');

                const isPrev =
                    label.includes('zurück') ||
                    label.includes('previous') ||
                    label.includes('prev') ||
                    label.includes('back') ||
                    iconText === 'chevron_left' ||
                    iconText === 'navigate_before' ||
                    iconText === 'arrow_back' ||
                    iconText === 'keyboard_arrow_left';

                const isNext =
                    label.includes('weiter') ||
                    label.includes('next') ||
                    label.includes('forward') ||
                    iconText === 'chevron_right' ||
                    iconText === 'navigate_next' ||
                    iconText === 'arrow_forward' ||
                    iconText === 'keyboard_arrow_right';

                if (isToday) {
                    button.classList.add(TODAY_CLASS);
                    button.classList.remove(PREV_CLASS, NEXT_CLASS);
                } else if (isPrev) {
                    button.classList.add(PREV_CLASS);
                    button.classList.remove(TODAY_CLASS, NEXT_CLASS);
                } else if (isNext) {
                    button.classList.add(NEXT_CLASS);
                    button.classList.remove(TODAY_CLASS, PREV_CLASS);
                }
            });
        });
    }

    /*
     * Prüfen ob der Fokus innerhalb eines Kalenders liegt
     * oder kein Formular-Element fokussiert ist.
     */
    function isCalendarContext() {
        const active = document.activeElement;

        if (!active || active === document.body) {
            return true;
        }

        const isInput =
            active.tagName === 'INPUT' ||
            active.tagName === 'TEXTAREA' ||
            active.tagName === 'SELECT' ||
            active.isContentEditable;

        if (isInput) {
            return false;
        }

        const inCalendar = Boolean(
            active.closest(CALENDAR_ROOT_SELECTORS)
        );

        return inCalendar || active.tagName === 'BODY';
    }

    function clickButton(cssClass) {
        const button = document.querySelector('.' + cssClass);

        if (button) {
            button.click();
        }
    }

    function handleKeydown(event) {
        if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }

        if (!isCalendarContext()) {
            return;
        }

        if (event.key === 'ArrowLeft') {
            clickButton(PREV_CLASS);
            event.preventDefault();
        } else if (event.key === 'ArrowRight') {
            clickButton(NEXT_CLASS);
            event.preventDefault();
        } else if (event.key === 't' || event.key === 'T') {
            clickButton(TODAY_CLASS);
            event.preventDefault();
        }
    }

    function initialize() {
        ensureStyles();
        classifyNavButtons();

        document.addEventListener('keydown', handleKeydown);

        let updatePending = false;

        const observer = new MutationObserver(function () {
            if (updatePending) {
                return;
            }

            updatePending = true;

            window.requestAnimationFrame(function () {
                updatePending = false;
                classifyNavButtons();
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
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
