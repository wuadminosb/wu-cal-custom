(() => {
    'use strict';

    const STYLE_ID = 'wu-conditional-button-guard-style';
    const BUTTON_TEXT = 'Zur übersicht gehen';

    const rules = [
        {
            source: 'Erheben Sie Teilnahmegebühren?',
            target: 'Wenn ja, in welcher Höhe?',
            required: value => normalize(value) === 'ja'
        },
        {
            source: 'Handelt es sich um eine Kooperationsveranstaltung?',
            target: 'Wenn ja, bitte den /die Kooperationspartner*in angeben',
            required: value => normalize(value).startsWith('ja')
        }
    ];

    let observer = null;
    let scheduled = false;
    let currentButton = null;
    let originalButtonState = null;

    function normalize(value) {
        return String(value || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLocaleLowerCase('de');
    }

    function findField(root, labelText) {
        return Array.from(
            root.querySelectorAll('mat-form-field')
        ).find(field =>
            normalize(field.querySelector('mat-label')?.textContent) ===
            normalize(labelText)
        );
    }

    function getSelectedValue(field) {
        return field?.querySelector(
            '.mat-mdc-select-value-text, .mat-mdc-select-min-line'
        )?.textContent?.trim() || '';
    }

    function getInput(field) {
        return field?.querySelector(
            'input:not([hidden]), textarea:not([hidden])'
        );
    }

    function findButton() {
        return Array.from(
            document.querySelectorAll('button, a, [role="button"]')
        ).find(element =>
            normalize(element.textContent) === normalize(BUTTON_TEXT)
        );
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) return;
        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            '.wu-conditional-overview-disabled {',
            '    opacity: 0.55 !important;',
            '    cursor: not-allowed !important;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function getInvalidRules() {
        const root = document.querySelector('app-dynamic-form');
        if (!root) return [];

        return rules.map(rule => {
            const sourceField = findField(root, rule.source);
            const targetField = findField(root, rule.target);
            const input = getInput(targetField);
            const mustFill = rule.required(getSelectedValue(sourceField));
            return {
                rule,
                input,
                invalid: Boolean(
                    mustFill && input && input.value.trim() === ''
                )
            };
        }).filter(entry => entry.invalid);
    }

    function restoreButton() {
        if (!currentButton || !originalButtonState) return;
        if ('disabled' in currentButton) {
            currentButton.disabled = originalButtonState.disabled;
        }
        if (originalButtonState.ariaDisabled === null) {
            currentButton.removeAttribute('aria-disabled');
        } else {
            currentButton.setAttribute('aria-disabled', originalButtonState.ariaDisabled);
        }
        if (originalButtonState.tabindex === null) {
            currentButton.removeAttribute('tabindex');
        } else {
            currentButton.setAttribute('tabindex', originalButtonState.tabindex);
        }
        currentButton.classList.remove('wu-conditional-overview-disabled');
    }

    function rememberButton(button) {
        if (button === currentButton) return;
        restoreButton();
        currentButton = button;
        originalButtonState = button ? {
            disabled: 'disabled' in button ? button.disabled : false,
            ariaDisabled: button.getAttribute('aria-disabled'),
            tabindex: button.getAttribute('tabindex')
        } : null;
    }

    function update() {
        const button = findButton();
        rememberButton(button);
        if (!button) return;

        const invalid = getInvalidRules().length > 0;
        if ('disabled' in button) button.disabled = invalid;
        button.setAttribute('aria-disabled', String(invalid));
        button.classList.toggle('wu-conditional-overview-disabled', invalid);
        if (!invalid && !('disabled' in button)) {
            if (originalButtonState?.tabindex === null) button.removeAttribute('tabindex');
            else button.setAttribute('tabindex', originalButtonState.tabindex);
        } else if (invalid && !('disabled' in button)) {
            button.setAttribute('tabindex', '-1');
        }
    }

    function scheduleUpdate() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            update();
        });
    }

    function handleClick(event) {
        const button = event.target.closest('button, a, [role="button"]');
        if (!button || normalize(button.textContent) !== normalize(BUTTON_TEXT)) {
            scheduleUpdate();
            return;
        }

        const invalidRules = getInvalidRules();
        if (!invalidRules.length) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        invalidRules[0].input?.focus();
        invalidRules[0].input?.reportValidity();
        console.warn(
            '[WU OSB] "Zur übersicht gehen" wurde verhindert: ' +
            'Ein bedingtes Pflichtfeld ist leer.'
        );
    }

    function start() {
        addStyles();
        update();
        observer = new MutationObserver(scheduleUpdate);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
        document.addEventListener('input', scheduleUpdate, true);
        document.addEventListener('change', scheduleUpdate, true);
        document.addEventListener('click', handleClick, true);
    }

    function stop() {
        observer?.disconnect();
        observer = null;
        document.removeEventListener('input', scheduleUpdate, true);
        document.removeEventListener('change', scheduleUpdate, true);
        document.removeEventListener('click', handleClick, true);
        restoreButton();
        document.getElementById(STYLE_ID)?.remove();
    }

    window.__wuConditionalButtonGuardCleanup?.();
    window.__wuConditionalButtonGuardCleanup = stop;

    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
