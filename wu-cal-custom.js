(function () {
    'use strict';

    function changeDateLabel() {
        document
            .querySelectorAll('label[for="searchDatePicker"] mat-label')
            .forEach(function (label) {
                label.textContent = 'Datum';
            });
    }

    function arrangeRepeatAndWeekdays() {
        const dayGroup =
            document.querySelector(
                'mat-button-toggle-group.usi-dayOfWeekButtons'
            ) ||
            document.querySelector(
                'mat-button-toggle-group[aria-label="Days"]'
            );

        if (!dayGroup) {
            return;
        }

        /* Sonntag und Samstag entfernen */
        const toggles = dayGroup.querySelectorAll('mat-button-toggle');

        toggles.forEach(function (toggle, index) {
            const value = toggle.getAttribute('value');
            const text = toggle.textContent.replace(/\s+/g, '').trim();

            if (
                value === '0' ||
                value === '6' ||
                index === 0 ||
                index === toggles.length - 1 ||
                text === 'So.' ||
                text === 'Sa.'
            ) {
                toggle.style.setProperty('display', 'none', 'important');
            }
        });

        /* Feld „Wiederholt“ suchen */
        const repeatLabel = Array.from(
            document.querySelectorAll(
                'mat-label, label, .mdc-floating-label'
            )
        ).find(function (element) {
            return element.textContent
                .replace(/\s+/g, ' ')
                .trim()
                .startsWith('Wiederholt');
        });

        if (!repeatLabel) {
            return;
        }

        const repeatField =
            repeatLabel.closest('mat-form-field') ||
            repeatLabel.closest('.mat-mdc-form-field') ||
            repeatLabel.parentElement;

        if (!repeatField) {
            return;
        }

        /* Gemeinsame Zeile nur einmal erstellen */
        let row = document.getElementById('wu-repeat-weekday-row');

        if (!row) {
            row = document.createElement('div');
            row.id = 'wu-repeat-weekday-row';
            row.className = 'wu-repeat-weekday-row';

            repeatField.parentNode.insertBefore(row, repeatField);
            row.appendChild(repeatField);
            row.appendChild(dayGroup);
        } else {
            if (repeatField.parentElement !== row) {
                row.appendChild(repeatField);
            }

            if (dayGroup.parentElement !== row) {
                row.appendChild(dayGroup);
            }
        }

        repeatField.classList.add('wu-repeat-field');
        dayGroup.classList.add('wu-weekday-group');
    }

    function applyWuAdjustments() {
        changeDateLabel();
        arrangeRepeatAndWeekdays();
    }

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
