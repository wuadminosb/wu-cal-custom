(function () {
    'use strict';

    const DATE_LABEL_SELECTOR =
        'label[for="searchDatePicker"] mat-label';

    /**
     * Ändert die Feldbezeichnung „Daten“ in „Datum“.
     */
    function changeDateLabel() {
        const dateLabels = document.querySelectorAll(
            DATE_LABEL_SELECTOR
        );

        dateLabels.forEach(function (dateLabel) {
            if (dateLabel.textContent.trim() !== 'Datum') {
                dateLabel.textContent = 'Datum';
            }
        });
    }

    /**
     * Führt alle Anpassungen aus.
     */
    function applyWuAdjustments() {
        changeDateLabel();
    }

    /**
     * Erste Ausführung nach dem Laden der Seite.
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
     * Zusätzliche Wiederholungen, weil Momentus die App
     * möglicherweise zeitverzögert lädt.
     */
    window.setTimeout(applyWuAdjustments, 250);
    window.setTimeout(applyWuAdjustments, 500);
    window.setTimeout(applyWuAdjustments, 1000);
    window.setTimeout(applyWuAdjustments, 2000);
    window.setTimeout(applyWuAdjustments, 4000);

    /**
     * Überwacht dynamische Änderungen der Momentus-App.
     * Dadurch wird „Datum“ auch nach einem Seitenwechsel
     * oder erneuten Rendern beibehalten.
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
