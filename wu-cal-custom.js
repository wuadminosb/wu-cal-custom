(function () {
    'use strict';

    /**
     * Ändert „Daten“ in „Datum“.
     */
    function changeDateLabel() {
        document
            .querySelectorAll('label[for="searchDatePicker"] mat-label')
            .forEach(function (label) {
                label.textContent = 'Datum';
            });
    }

    /**
     * Blendet Sonntag (value="0") und Samstag (value="6")
     * ausschließlich in der Wochentagsauswahl aus.
     */
    function hideWeekendButtons() {
        const dayGroups = document.querySelectorAll(
            'mat-button-toggle-group[aria-label="Days"], ' +
            'mat-button-toggle-group.usi-dayOfWeekButtons'
        );

        dayGroups.forEach(function (group) {
            const weekendButtons = group.querySelectorAll(
                'mat-button-toggle[value="0"], ' +
                'mat-button-toggle[value="6"]'
            );

            weekendButtons.forEach(function (toggle) {
                toggle.style.setProperty(
                    'display',
                    'none',
                    'important'
                );

                toggle.setAttribute('aria-hidden', 'true');

                const button = toggle.querySelector('button');

                if (button) {
                    button.setAttribute('tabindex', '-1');
                    button.setAttribute('aria-hidden', 'true');
                }
            });
        });
    }

    /**
     * Führt alle Anpassungen aus.
     */
    function applyWuAdjustments() {
        changeDateLabel();
        hideWeekendButtons();
    }

    /**
     * Änderungen nach dem Laden anwenden.
     */
    function initialize() {
        applyWuAdjustments();

        [250, 500, 1000, 2000, 4000].forEach(function (delay) {
            window.setTimeout(applyWuAdjustments, delay);
        });

        const observer = new MutationObserver(function () {
            window.requestAnimationFrame(applyWuAdjustments);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
})();
