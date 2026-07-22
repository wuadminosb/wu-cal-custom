(function () {
    'use strict';

    function injectCss() {

        if (document.getElementById('wu-hide-weekends')) {
            return;
        }

        const style = document.createElement('style');

        style.id = 'wu-hide-weekends';

        style.textContent = `
            .usi-dayOfWeekButtons mat-button-toggle[value="0"],
            .usi-dayOfWeekButtons mat-button-toggle[value="6"] {
                display: none !important;
            }
        `;

        document.head.appendChild(style);
    }

    function changeDateLabel() {

        document.querySelectorAll(
            'label[for="searchDatePicker"] mat-label,' +
            'label[for="searchDatePicker"],' +
            '#searchDatePicker mat-label'
        ).forEach(function (label) {

            const text = label.textContent.trim();

            if (
                text === 'Daten' ||
                text === 'Date'
            ) {
                label.textContent = 'Datum';
            }
        });
    }

    function applyWuAdjustments() {
        injectCss();
        changeDateLabel();
    }

    function initialize() {

        applyWuAdjustments();

        const observer = new MutationObserver(
            applyWuAdjustments
        );

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
