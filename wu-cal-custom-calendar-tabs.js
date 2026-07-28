(function () {
    'use strict';

    const STYLE_ID = 'wu-calendar-tabs-style';
    const LABELS_CLASS = 'wu-calendar-two-tabs';
    const VISIBLE_CLASS = 'wu-calendar-visible-tab';
    const HIDDEN_CLASS = 'wu-calendar-hidden-tab';

    function normalize(value) {
        return String(value || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function findCalendarLabels() {
        return Array.from(
            document.querySelectorAll(
                '.mat-mdc-tab-labels, .mat-tab-labels'
            )
        ).find(function (labels) {
            const tabTexts = Array.from(
                labels.querySelectorAll(':scope > [role="tab"]')
            ).map(function (tab) {
                return normalize(tab.textContent);
            });

            return (
                tabTexts.includes('tag') &&
                tabTexts.includes('woche') &&
                tabTexts.includes('monat')
            );
        }) || null;
    }

    function applyChanges() {
        const labels = findCalendarLabels();

        if (!labels) {
            return false;
        }

        const tabs = Array.from(
            labels.querySelectorAll(':scope > [role="tab"]')
        );

        const dayTab = tabs.find(function (tab) {
            return normalize(tab.textContent) === 'tag';
        });

        const weekTab = tabs.find(function (tab) {
            return normalize(tab.textContent) === 'woche';
        });

        const monthTab = tabs.find(function (tab) {
            return normalize(tab.textContent) === 'monat';
        });

        if (!dayTab || !weekTab || !monthTab) {
            return false;
        }

        if (monthTab.getAttribute('aria-selected') === 'true') {
            dayTab.click();
        }

        labels.classList.add(LABELS_CLASS);
        dayTab.classList.add(VISIBLE_CLASS);
        weekTab.classList.add(VISIBLE_CLASS);
        monthTab.classList.add(HIDDEN_CLASS);

        dayTab.setAttribute('aria-posinset', '1');
        dayTab.setAttribute('aria-setsize', '2');
        weekTab.setAttribute('aria-posinset', '2');
        weekTab.setAttribute('aria-setsize', '2');
        monthTab.setAttribute('aria-hidden', 'true');
        monthTab.setAttribute('tabindex', '-1');

        return true;
    }

    function ensureStyles() {
        let style = document.getElementById(STYLE_ID);

        if (!style) {
            style = document.createElement('style');
            style.id = STYLE_ID;
            document.head.appendChild(style);
        }

        style.textContent = `
            .${LABELS_CLASS} {
                display: flex !important;
                width: 100% !important;
                min-width: 0 !important;
            }

            .${LABELS_CLASS}
            > .${VISIBLE_CLASS} {
                display: flex !important;
                flex: 1 1 50% !important;
                width: 50% !important;
                min-width: 0 !important;
                max-width: 50% !important;
            }

            .${LABELS_CLASS}
            > .${HIDDEN_CLASS} {
                display: none !important;
                flex: 0 0 0 !important;
                width: 0 !important;
                min-width: 0 !important;
                max-width: 0 !important;
                height: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                border: 0 !important;
                visibility: hidden !important;
                overflow: hidden !important;
                pointer-events: none !important;
            }

            .${LABELS_CLASS}
            > .${VISIBLE_CLASS}
            .mdc-tab__content {
                width: 100% !important;
                justify-content: center !important;
            }

            .${LABELS_CLASS}
            > .${VISIBLE_CLASS}
            .mdc-tab__text-label {
                width: 100% !important;
                text-align: center !important;
            }
        `;
    }

    function initialize() {
        ensureStyles();
        applyChanges();

        let updatePending = false;

        const observer = new MutationObserver(function () {
            if (updatePending) {
                return;
            }

            updatePending = true;

            window.requestAnimationFrame(function () {
                updatePending = false;
                applyChanges();
            });
        });

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
