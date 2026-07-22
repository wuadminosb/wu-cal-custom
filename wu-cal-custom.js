(function () {
    'use strict';

    let updateScheduled = false;

    /**
     * Ändert die Feldbezeichnung „Daten“ in „Datum“.
     */
    function changeDateLabel() {
        document
            .querySelectorAll(
                'label[for="searchDatePicker"] mat-label'
            )
            .forEach(function (label) {
                if (label.textContent.trim() !== 'Datum') {
                    label.textContent = 'Datum';
                }
            });
    }

    /**
     * Sucht die Wochentagsauswahl.
     */
    function findWeekdayGroup() {
        const groups = document.querySelectorAll(
            'mat-button-toggle-group'
        );

        return Array.from(groups).find(function (group) {
            const text = group.textContent
                .replace(/\s+/g, ' ')
                .trim();

            return (
                group.classList.contains('usi-dayOfWeekButtons') ||
                group.getAttribute('aria-label') === 'Days' ||
                (
                    text.includes('Mo.') &&
                    text.includes('Di.') &&
                    text.includes('Fr.')
                )
            );
        });
    }

    /**
     * Blendet Sonntag und Samstag aus.
     */
    function hideWeekendDays(dayGroup) {
        if (!dayGroup) {
            return;
        }

        const toggles = Array.from(
            dayGroup.querySelectorAll('mat-button-toggle')
        );

        toggles.forEach(function (toggle, index) {
            const value =
                toggle.getAttribute('value') ||
                toggle.getAttribute('ng-reflect-value') ||
                '';

            const text = toggle.textContent
                .replace(/\s+/g, '')
                .trim();

            const isSunday =
                value === '0' ||
                text === 'So.' ||
                text === 'So' ||
                text === 'Sonntag';

            const isSaturday =
                value === '6' ||
                text === 'Sa.' ||
                text === 'Sa' ||
                text === 'Samstag';

            const isFirstOrLast =
                toggles.length === 7 &&
                (index === 0 || index === toggles.length - 1);

            if (isSunday || isSaturday || isFirstOrLast) {
                toggle.classList.add('wu-hidden-weekend');
                toggle.setAttribute('aria-hidden', 'true');

                const button = toggle.querySelector('button');

                if (button) {
                    button.setAttribute('tabindex', '-1');
                    button.setAttribute('aria-hidden', 'true');
                }
            } else {
                toggle.classList.add('wu-visible-weekday');
            }
        });
    }

    /**
     * Sucht das Feld „Wiederholt“.
     */
    function findRepeatField() {
        const labels = document.querySelectorAll(
            'mat-label, label, .mdc-floating-label'
        );

        const repeatLabel = Array.from(labels).find(
            function (element) {
                const text = element.textContent
                    .replace(/\s+/g, ' ')
                    .trim();

                return text.startsWith('Wiederholt');
            }
        );

        if (!repeatLabel) {
            return null;
        }

        return (
            repeatLabel.closest('mat-form-field') ||
            repeatLabel.closest('.mat-mdc-form-field') ||
            null
        );
    }

    /**
     * Ordnet „Wiederholt“ und die Werktage in einer Zeile an.
     */
    function arrangeRepeatAndWeekdays() {
        const dayGroup = findWeekdayGroup();
        const repeatField = findRepeatField();

        if (!dayGroup) {
            return;
        }

        hideWeekendDays(dayGroup);
        dayGroup.classList.add('wu-weekday-group');

        if (!repeatField) {
            return;
        }

        repeatField.classList.add('wu-repeat-field');

        let row = document.getElementById(
            'wu-repeat-weekday-row'
        );

        if (!row) {
            row = document.createElement('div');
            row.id = 'wu-repeat-weekday-row';
            row.className = 'wu-repeat-weekday-row';

            const insertionParent = repeatField.parentNode;

            if (!insertionParent) {
                return;
            }

            insertionParent.insertBefore(row, repeatField);
        }

        if (repeatField.parentElement !== row) {
            row.appendChild(repeatField);
        }

        if (dayGroup.parentElement !== row) {
            row.appendChild(dayGroup);
        }
    }

    /**
     * Führt alle Anpassungen aus.
     */
    function applyWuAdjustments() {
        changeDateLabel();
        arrangeRepeatAndWeekdays();
    }

    /**
     * Verhindert unnötig viele gleichzeitige Ausführungen.
     */
    function scheduleUpdate() {
        if (updateScheduled) {
            return;
        }

        updateScheduled = true;

        window.requestAnimationFrame(function () {
            updateScheduled = false;
            applyWuAdjustments();
        });
    }

    /**
     * Initialisierung.
     */
    function initialize() {
        applyWuAdjustments();

        [250, 500, 1000, 2000, 4000].forEach(
            function (delay) {
                window.setTimeout(
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
