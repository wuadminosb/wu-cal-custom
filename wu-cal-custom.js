(function () {
    'use strict';

    /**
     * Ändert die Feldbezeichnung „Daten“ in „Datum“.
     */
    function changeDateLabel() {
        const dateLabels = document.querySelectorAll(
            'label[for="searchDatePicker"] mat-label'
        );

        dateLabels.forEach(function (dateLabel) {
            if (dateLabel.textContent.trim() !== 'Datum') {
                dateLabel.textContent = 'Datum';
            }
        });
    }

    /**
     * Entfernt Samstag und Sonntag aus der Wochentagsauswahl
     * bei der Veranstaltungs-Serie.
     */
    function removeWeekendButtons() {
        const elements = document.querySelectorAll(
            'button, mat-button-toggle, .mat-button-toggle, .mat-mdc-button'
        );

        elements.forEach(function (element) {
            const text = element.textContent
                .replace(/\s+/g, ' ')
                .trim();

            const isSunday =
                text === 'So.' ||
                text === 'So' ||
                text === 'Sonntag';

            const isSaturday =
                text === 'Sa.' ||
                text === 'Sa' ||
                text === 'Samstag';

            if (isSunday || isSaturday) {
                const button =
                    element.closest('mat-button-toggle') ||
                    element.closest('.mat-button-toggle') ||
                    element.closest('button') ||
                    element;

                button.style.setProperty(
                    'display',
                    'none',
                    'important'
                );

                button.setAttribute('aria-hidden', 'true');
                button.setAttribute('tabindex', '-1');
            }
        });
    }

    /**
     * Führt alle WU-Anpassungen aus.
     */
    function applyWuAdjustments() {
        changeDateLabel();
        removeWeekendButtons();
    }

    /**
     * Anpassungen nach dem Laden starten.
     */
    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            applyWuAdjustments
        );
    } else {
        applyWuAdjustments();
    }

    /**
     * Wiederholungen wegen des verzögerten Ladens der OSB-App.
     */
    [250, 500, 1000, 2000, 4000].forEach(function (delay) {
        window.setTimeout(applyWuAdjustments, delay);
    });

    /**
     * Anpassungen nach dynamischen Seitenänderungen wiederholen.
     */
    const observer = new MutationObserver(function () {
        window.requestAnimationFrame(applyWuAdjustments);
    });

    function startObserver() {
        if (!document.body) {
            window.setTimeout(startObserver, 100);
            return;
        }

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    startObserver();
})();
