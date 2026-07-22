(function () {
    'use strict';

    let observer;
    let updatePending = false;

    /* =========================================================
       DATUMSBESCHRIFTUNG ANPASSEN
       ========================================================= */

    function changeDateLabel() {
        document
            .querySelectorAll(
                'label[for="searchDatePicker"] mat-label, ' +
                'label[for="searchDatePicker"], ' +
                '#searchDatePicker mat-label'
            )
            .forEach(function (label) {
                const text = label.textContent
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


    /* =========================================================
       EINZELNEN WOCHENTAG ERMITTELN
       ========================================================= */

    function getDayText(element) {
        return element.textContent
            .replace(/\s+/g, '')
            .replace(/\u00a0/g, '')
            .trim()
            .toLowerCase();
    }


    function isSunday(text) {
        return (
            text === 'so.' ||
            text === 'so' ||
            text === 'sonntag' ||
            text === 'sun' ||
            text === 'sunday'
        );
    }


    function isSaturday(text) {
        return (
            text === 'sa.' ||
            text === 'sa' ||
            text === 'samstag' ||
            text === 'sat' ||
            text === 'saturday'
        );
    }


    function isWeekday(text) {
        return (
            text === 'mo.' ||
            text === 'mo' ||
            text === 'montag' ||
            text === 'di.' ||
            text === 'di' ||
            text === 'dienstag' ||
            text === 'mi.' ||
            text === 'mi' ||
            text === 'mittwoch' ||
            text === 'do.' ||
            text === 'do' ||
            text === 'donnerstag' ||
            text === 'fr.' ||
            text === 'fr' ||
            text === 'freitag'
        );
    }


    /* =========================================================
       TOGGLE-ELEMENT ZU EINER SCHALTFLÄCHE FINDEN
       ========================================================= */

    function findToggleContainer(element) {
        return (
            element.closest('mat-button-toggle') ||
            element.closest('.mat-button-toggle') ||
            element.closest('.mat-mdc-button-toggle') ||
            element.closest('[role="radio"]') ||
            element.closest('[role="button"]') ||
            element
        );
    }


    /* =========================================================
       SAMSTAG UND SONNTAG AUSBLENDEN
       ========================================================= */

    function hideWeekendDays() {
        const candidates = document.querySelectorAll(
            'mat-button-toggle, ' +
            '.mat-button-toggle, ' +
            '.mat-mdc-button-toggle, ' +
            'button, ' +
            '[role="radio"]'
        );

        candidates.forEach(function (candidate) {
            const text = getDayText(candidate);

            if (!isSunday(text) && !isSaturday(text)) {
                return;
            }

            const toggle = findToggleContainer(candidate);

            toggle.classList.add('wu-hidden-weekend');
            toggle.setAttribute('aria-hidden', 'true');
            toggle.hidden = true;

            toggle.style.setProperty(
                'display',
                'none',
                'important'
            );

            toggle.style.setProperty(
                'visibility',
                'hidden',
                'important'
            );

            toggle.style.setProperty(
                'width',
                '0',
                'important'
            );

            toggle.style.setProperty(
                'min-width',
                '0',
                'important'
            );

            toggle.style.setProperty(
                'max-width',
                '0',
                'important'
            );

            toggle.style.setProperty(
                'margin',
                '0',
                'important'
            );

            toggle.style.setProperty(
                'padding',
                '0',
                'important'
            );

            toggle.style.setProperty(
                'border',
                '0',
                'important'
            );

            const button = toggle.querySelector('button');

            if (button) {
                button.setAttribute('tabindex', '-1');
                button.setAttribute('aria-hidden', 'true');

                button.style.setProperty(
                    'display',
                    'none',
                    'important'
                );
            }
        });
    }


    /* =========================================================
       WOCHENTAGSGRUPPE KENNZEICHNEN
       ========================================================= */

    function markWeekdayGroup() {
        const groups = document.querySelectorAll(
            'mat-button-toggle-group, ' +
            '.mat-button-toggle-group, ' +
            '[role="group"]'
        );

        groups.forEach(function (group) {
            const children = group.querySelectorAll(
                'mat-button-toggle, ' +
                '.mat-button-toggle, ' +
                '.mat-mdc-button-toggle, ' +
                'button, ' +
                '[role="radio"]'
            );

            let weekdayCount = 0;

            children.forEach(function (child) {
                if (isWeekday(getDayText(child))) {
                    weekdayCount += 1;
                }
            });

            if (weekdayCount >= 3) {
                group.classList.add('wu-weekday-group');

                const possibleRow =
                    group.parentElement;

                if (possibleRow) {
                    possibleRow.classList.add(
                        'wu-repeat-weekday-native-row'
                    );
                }
            }
        });
    }


    /* =========================================================
       ALLE ANPASSUNGEN AUSFÜHREN
       ========================================================= */

    function applyWuAdjustments() {
        changeDateLabel();
        markWeekdayGroup();
        hideWeekendDays();
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


    /* =========================================================
       INITIALISIERUNG
       ========================================================= */

    function initialize() {
        applyWuAdjustments();

        [
            100,
            250,
            500,
            1000,
            2000,
            4000,
            8000
        ].forEach(function (delay) {
            window.setTimeout(
                applyWuAdjustments,
                delay
            );
        });

        observer = new MutationObserver(
            scheduleUpdate
        );

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        /*
         * Momentus baut die Auswahl teilweise neu auf,
         * ohne eine verwertbare DOM-Änderung auszulösen.
         */
        window.setInterval(
            applyWuAdjustments,
            1500
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
