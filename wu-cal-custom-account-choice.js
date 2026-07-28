(function () {
    'use strict';

    const CARD_CLASS = 'wu-account-choice-card';
    const STYLE_ID = 'wu-account-choice-style';

    function normalize(value) {
        return String(value || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function findAccountChoiceCard() {
        return Array.from(
            document.querySelectorAll('mat-card, .mat-mdc-card')
        ).find(function (card) {
            return normalize(
                card.querySelector('h1')?.textContent
            ) === 'kontowahl';
        }) || null;
    }

    function applyAccountChoiceAdjustments() {
        const card = findAccountChoiceCard();

        if (!card) {
            return false;
        }

        card.classList.add(CARD_CLASS);

        const intro = Array.from(card.children).find(function (element) {
            return element.tagName === 'P';
        });

        if (intro) {
            intro.textContent =
                'Bitte wählen Sie das Konto aus, mit dem Sie fortfahren möchten.';
        }

        const continueButton = card.querySelector(
            '.usi-buttonGroup button.usi-button:not(.secondary)'
        );

        if (continueButton) {
            continueButton.textContent = 'Weiter';
            continueButton.setAttribute('aria-label', 'Weiter');
        }

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
            .${CARD_CLASS} .usi-orgOpt .usi-selectText {
                display: none !important;
            }

            .${CARD_CLASS} .usi-orgOpt {
                position: relative !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                min-height: 96px !important;
                text-align: center !important;
                box-sizing: border-box !important;
            }

            .${CARD_CLASS} .usi-orgOpt > .ng-fa-icon {
                position: absolute !important;
                left: 24px !important;
                top: 50% !important;
                transform: translateY(-50%) !important;
            }

            .${CARD_CLASS} .usi-orgOpt .usi-informationText {
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 100% !important;
                min-height: 100% !important;
                padding: 0 52px !important;
                text-align: center !important;
                box-sizing: border-box !important;
            }

            .${CARD_CLASS} .usi-orgOpt .usi-orgTitle {
                width: 100% !important;
                margin: 0 !important;
                text-align: center !important;
            }
        `;
    }

    function initialize() {
        ensureStyles();
        applyAccountChoiceAdjustments();

        let updatePending = false;

        const observer = new MutationObserver(function () {
            if (updatePending) {
                return;
            }

            updatePending = true;

            window.requestAnimationFrame(function () {
                updatePending = false;
                applyAccountChoiceAdjustments();
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
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
