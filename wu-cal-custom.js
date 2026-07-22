(function () {
    'use strict';

    let updatePending = false;

    function changeDateLabel() {
        document.querySelectorAll(
            'label[for="searchDatePicker"] mat-label,' +
            'label[for="searchDatePicker"],' +
            '#searchDatePicker mat-label'
        ).forEach(function (label) {

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

    function hideWeekendButtons() {

        const group = document.querySelector(
            '.usi-dayOfWeekButtons'
        );

        if (!group) {
            return;
        }

        const toggles = group.querySelectorAll(
            'mat-button-toggle'
        );

        if (toggles.length >= 7) {

            toggles[0].style.display = 'none'; // Sonntag
            toggles[6].style.display = 'none'; // Samstag

        }
    }

    function applyWuAdjustments() {
        changeDateLabel();
        hideWeekendButtons();
    }

    function scheduleUpdate() {

        if (updatePending) {
            return;
        }

        updatePending = true;

        requestAnimationFrame(function () {

            updatePending = false;

            applyWuAdjustments();

        });
    }

    function initialize() {

        applyWuAdjustments();

        [100, 250, 500, 1000, 2000, 4000, 8000].forEach(
            function (delay) {
                setTimeout(
                    applyWuAdjustments,
                    delay
                );
            }
        );

        const observer = new MutationObserver(
            scheduleUpdate
        );

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        setInterval(
            applyWuAdjustments,
            1000
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
