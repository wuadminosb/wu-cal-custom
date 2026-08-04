(() => {
    'use strict';

    window.__wuConditionalButtonGuardCleanup?.();

    const STYLE_ID = 'wu-conditional-button-guard-style';
    const DISABLED_CLASS = 'wu-conditional-overview-disabled';
    const BUTTON_TEXT = 'Zur übersicht gehen';

    const rules = [
        {
            source: 'Erheben Sie Teilnahmegebühren?',
            target: 'Wenn ja, in welcher Höhe?',
            required(value) {
                return normalize(value) === 'ja';
            }
        },
        {
            source: 'Handelt es sich um eine Kooperationsveranstaltung?',
            target: 'Wenn ja, bitte den /die Kooperationspartner*in angeben',
            required(value) {
                return normalize(value).startsWith('ja');
            }
        }
    ];

    const normalize = value =>
        String(value || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLocaleLowerCase('de');

    const findField = (root, labelText) =>
        Array.from(root.querySelectorAll('mat-form-field')).find(field => {
            const label = field.querySelector('mat-label');
            return normalize(label?.textContent) === normalize(labelText);
        });

    const getSelectedValue = field =>
        field?.querySelector(
            '.mat-mdc-select-value-text, .mat-mdc-select-min-line'
        )?.textContent?.trim() || '';

    const getInput = field =>
        field?.querySelector(
            'input:not([hidden]), textarea:not([hidden])'
        );

    const findButton = () =>
        Array.from(
            document.querySelectorAll('button, a, [role="button"]')
        ).find(
            element =>
                normalize(element.textContent) === normalize(BUTTON_TEXT)
        );

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .${DISABLED_CLASS} {
            opacity: 0.55 !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
        }
    `;
    document.head.appendChild(style);

    const managedButtons = new Set();
    const originalStates = new WeakMap();

    let observer = null;
    let intervalId = null;
    let framePending = false;
    let currentButton = null;

    const getInvalidRules = () => {
        const root = document.querySelector('app-dynamic-form');
        if (!root) {
            return [];
        }

        return rules
            .map(rule => {
                const sourceField = findField(root, rule.source);
                const targetField = findField(root, rule.target);
                const input = getInput(targetField);
                const selectedValue = getSelectedValue(sourceField);

                /*
                 * Die Auswahl kann von Angular Material etwas später
                 * in den sichtbaren DOM-Wert geschrieben werden.
                 * Das bereits gesetzte required/aria-required dient
                 * daher zus�tzlich als verlässliches Signal.
                 */
                const mustFill =
                    rule.required(selectedValue) ||
                    input?.required === true ||
                    input?.getAttribute('aria-required') === 'true';

                return {
                    rule,
                    input,
                    invalid:
                        Boolean(mustFill) &&
                        Boolean(input) &&
                        input.value.trim() === ''
                };
            })
            .filter(entry => entry.invalid);
    };

    const restoreButton = button => {
        const original = originalStates.get(button);
        if (!original) {
            return;
        }

        if ('disabled' in button) {
            button.disabled = original.disabled;
        }

        if (original.ariaDisabled === null) {
            button.removeAttribute('aria-disabled');
        } else {
            button.setAttribute(
                'aria-disabled',
                original.ariaDisabled
            );
        }

        if (original.tabindex === null) {
            button.removeAttribute('tabindex');
        } else {
            button.setAttribute('tabindex', original.tabindex);
        }

        button.classList.remove(DISABLED_CLASS);
        originalStates.delete(button);
        managedButtons.delete(button);
    };

    const setButtonState = (button, invalid) => {
        if (invalid) {
            if (!originalStates.has(button)) {
                originalStates.set(button, {
                    disabled:
                        'disabled' in button
                            ? button.disabled
                            : false,
                    ariaDisabled:
                        button.getAttribute('aria-disabled'),
                    tabindex:
                        button.getAttribute('tabindex')
                });
                managedButtons.add(button);
            }

            if ('disabled' in button) {
                button.disabled = true;
            }

            button.setAttribute('aria-disabled', 'true');
            button.setAttribute('tabindex', '-1');
            button.classList.add(DISABLED_CLASS);
            return;
        }

        restoreButton(button);
    };

    const update = () => {
        const button = findButton();

        if (currentButton && currentButton !== button) {
            restoreButton(currentButton);
        }

        currentButton = button;

        if (!button) {
            return;
        }

        setButtonState(button, getInvalidRules().length > 0);
    };

    const scheduleUpdate = () => {
        if (framePending) {
            return;
        }

        framePending = true;
        requestAnimationFrame(() => {
            framePending = false;
            update();
        });
    };

    /*
     * Nach einer Auswahl wird mehrfach geprüft, weil Angular Material
     * den sichtbaren Wert asynchron aktualisiert.
     */
    const scheduleUpdateBurst = () => {
        scheduleUpdate();

        [0, 50, 150, 300, 500].forEach(delay => {
            window.setTimeout(update, delay);
        });
    };

    const handleClick = event => {
        const target =
            event.target instanceof Element ? event.target : null;

        if (!target) {
            return;
        }

        const button = target.closest(
            'button, a, [role="button"]'
        );

        if (
            button &&
            normalize(button.textContent) === normalize(BUTTON_TEXT)
        ) {
            const invalidRules = getInvalidRules();

            if (!invalidRules.length) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();

            const firstInput = invalidRules[0].input;
            firstInput?.focus();
            firstInput?.reportValidity();
            setButtonState(button, true);

            console.warn(
                '[WU OSB] „Zur übersicht gehen“ wurde verhindert: ' +
                'Ein bedingtes Pflichtfeld ist leer.'
            );
            return;
        }

        if (
            target.closest(
                'mat-option, [role="option"], mat-select, .mat-mdc-select-panel'
            )
        ) {
            scheduleUpdateBurst();
        }
    };

    const handleKeydown = event => {
        if (event.key !== 'Enter' && event.key !== ' ') {
            return;
        }

        const target =
            event.target instanceof Element ? event.target : null;

        if (
            target?.closest(
                'mat-option, [role="option"], mat-select'
            )
        ) {
            scheduleUpdateBurst();
        }
    };

    const handleFormChange = () => {
        scheduleUpdateBurst();
    };

    observer = new MutationObserver(scheduleUpdate);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    document.addEventListener('input', handleFormChange, true);
    document.addEventListener('change', handleFormChange, true);
    document.addEventListener('click', handleClick, true);
    document.addEventListener('keydown', handleKeydown, true);

    /*
     * Sicherheitsprüfung für Angular-Zustandswechsel, die weder ein
     * natives change-Event noch eine passende Textmutation auslösen.
     */
    intervalId = window.setInterval(update, 250);

    window.__wuConditionalButtonGuardCleanup = () => {
        observer?.disconnect();
        window.clearInterval(intervalId);

        document.removeEventListener('input', handleFormChange, true);
        document.removeEventListener('change', handleFormChange, true);
        document.removeEventListener('click', handleClick, true);
        document.removeEventListener('keydown', handleKeydown, true);

        Array.from(managedButtons).forEach(restoreButton);

        document.getElementById(STILE_ID)?.remove();
        delete window.__wuConditionalButtonGuardCleanup;

        console.info(
            '[WU OSB] Korrigierte Button-Sperre wurde entfernt.'
        );
    };

    scheduleUpdateBurst();

    console.info(
        '[WU OSB] Korrigierte Button-Sperre ist aktiv.'
    );
})();
