(function () {
    'use strict';

    let updatePending = false;

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

    function hideWeekendButtons() {
        document.querySelectorAll(
            '.usi-dayOfWeekButtons mat-button-toggle[value="0"], ' +
            '.usi-dayOfWeekButtons mat-button-toggle[value="6"]'
        ).forEach(function (element) {
            element.style.display = 'none';
        });
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

        [
            100,
            250,
            500,
            1000,
            2000,
            4000,
            8000
        ].forEach(function (delay) {
            setTimeout(
                applyWuAdjustments,
                delay
            );
        });

        const observer = new MutationObserver(
            scheduleUpdate
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
