(function () {
    'use strict';

    let updatePending = false;

    /* =========================================================
       DATEN → DATUM
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
       TEXTE VEREINHEITLICHEN
       ========================================================= */

    function normalizeText(element) {
        return element.textContent
            .replace(/\u00a0/g, '')
            .replace(/\s+/g, '')
            .trim()
            .toLowerCase();
    }


    function isWeekendText(text) {
        return (
            text === 'so' ||
            text === 'so.' ||
            text === 'sonntag' ||
            text === 'sun' ||
            text === 'sunday' ||
            text === 'sa' ||
            text === 'sa.' ||
            text === 'samstag' ||
            text === 'sat' ||
            text === 'saturday'
        );
    }


    function isWeekdayText(text) {
        return (
            text === 'mo' ||
            text === 'mo.' ||
            text === 'montag' ||
            text === 'di' ||
            text === 'di.' ||
            text === 'dienstag' ||
            text === 'mi' ||
            text === 'mi.' ||
            text === 'mittwoch' ||
            text === 'do' ||
            text === 'do.' ||
            text === 'donnerstag' ||
            text === 'fr' ||
            text === 'fr.' ||
            text === 'freitag'
        );
    }


    /* =========================================================
       WOCHENTAGSGRUPPE FINDEN
       ========================================================= */

    function findWeekdayGroups() {
        const groups = document.querySelectorAll(
            'mat-button-toggle-group, ' +
            '.mat-button-toggle-group, ' +
            '.usi-dayOfWeekButtons, ' +
            '[role="group"]'
        );

        return Array.from(groups).filter(function (group) {
            const controls = group.querySelectorAll(
                'mat-button-toggle, ' +
                '.mat-button-toggle, ' +
                '.mat-mdc-button-toggle, ' +
                'button, ' +
                '[role="radio"]'
            );

            let recognizedDays = 0;

            controls.forEach(function (control) {
                const text = normalizeText(control);

                if (
                    isWeekdayText(text) ||
                    isWeekendText(text)
                ) {
                    recognizedDays += 1;
                }
            });

            return recognizedDays >= 5;
        });
    }


    /* =========================================================
       SAMSTAG UND SONNTAG PHYSISCH ENTFERNEN
       ========================================================= */

    function removeWeekendButtons() {
        const groups = findWeekdayGroups();

        groups.forEach(function (group) {
            group.classList.add('wu-weekday-group');

            const toggles = Array.from(
                group.querySelectorAll(
                    'mat-button-toggle, ' +
                    '.mat-button-toggle, ' +
                    '.mat-mdc-button-toggle, ' +
                    '[role="radio"]'
                )
            );

            toggles.forEach(function (toggle) {
                const text = normalizeText(toggle);

                if (isWeekendText(text)) {
                    toggle.remove();
                }
            });

            /*
             * Ersatzregel: Falls Momentus keine eindeutigen Texte
             * liefert und genau sieben Tagesschaltflächen vorhanden
             * sind, werden die erste und letzte entfernt.
             */
            const remainingToggles = Array.from(
                group.querySelectorAll(
                    'mat-button-toggle, ' +
                    '.mat-button-toggle, ' +
                    '.mat-mdc-button-toggle, ' +
                    '[role="radio"]'
                )
            );

            if (remainingToggles.length === 7) {
                remainingToggles[6].remove();
                remainingToggles[0].remove();
            }
        });
    }


    /* =========================================================
       ALTERNATIVE SUCHE ÜBER SICHTBARE TEXTKNOTEN
       ========================================================= */

    function removeWeekendByTextNodes() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT
        );

        const nodesToCheck = [];
        let currentNode;

        while ((currentNode = walker.nextNode())) {
            const text = currentNode.nodeValue
                .replace(/\u00a0/g, '')
                .replace(/\s+/g, '')
                .trim()
                .toLowerCase();

            if (isWeekendText(text)) {
                nodesToCheck.push(currentNode);
            }
        }

        nodesToCheck.forEach(function (textNode) {
            const parent = textNode.parentElement;

            if (!parent) {
                return;
            }

            const toggle =
                parent.closest('mat-button-toggle') ||
                parent.closest('.mat-button-toggle') ||
                parent.closest('.mat-mdc-button-toggle') ||
                parent.closest('[role="radio"]');

            if (!toggle) {
                return;
            }

            const group =
                toggle.closest('mat-button-toggle-group') ||
                toggle.closest('.mat-button-toggle-group') ||
                toggle.closest('.usi-dayOfWeekButtons') ||
                toggle.closest('[role="group"]');

            if (!group) {
                return;
            }

            const groupText = normalizeText(group);

            if (
                groupText.includes('mo') &&
                groupText.includes('di') &&
                groupText.includes('fr')
            ) {
                toggle.remove();
            }
        });
    }


    /* =========================================================
       WIEDERHOLT UND WERKTAGE KENNZEICHNEN
       ========================================================= */

    function markRepeatAndWeekdayArea() {
        const groups = findWeekdayGroups();

        groups.forEach(function (group) {
            group.classList.add('wu-weekday-group');

            const parent = group.parentElement;

            if (parent) {
                parent.classList.add(
                    'wu-repeat-weekday-native-row'
                );
            }
        });

        const labels = document.querySelectorAll(
            'mat-label, label, .mdc-floating-label'
        );

        Array.from(labels).forEach(function (label) {
            const text = label.textContent
                .replace(/\s+/g, ' ')
                .trim();

            if (!text.startsWith('Wiederholt')) {
                return;
            }

            const field =
                label.closest('mat-form-field') ||
                label.closest('.mat-mdc-form-field');

            if (field) {
                field.classList.add('wu-repeat-field');
            }
        });
    }


    /* =========================================================
       ANPASSUNGEN AUSFÜHREN
       ========================================================= */

    function applyWuAdjustments() {
        changeDateLabel();
        removeWeekendByTextNodes();
        removeWeekendButtons();
        markRepeatAndWeekdayArea();
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

        const observer = new MutationObserver(
            scheduleUpdate
        );

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        /*
         * Erneute Kontrolle, falls Momentus die Schaltflächen
         * nachträglich vollständig neu erzeugt.
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
