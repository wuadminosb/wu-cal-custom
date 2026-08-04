(() => {
    'use strict';

    const rules = [
        {
            source: 'Erheben Sie Teilnahmegebühren?',
            target: 'Wenn ja, in welcher Höhe?',
            required: value => norm(value) === 'ja',
            message: 'Bitte geben Sie die Höhe der Teilnahmegebühren an.'
        },
        {
            source: 'Handelt es sich um eine Kooperationsveranstaltung?',
            target: 'Wenn ja, bitte den /die Kooperationspartner*in angeben',
            required: value => norm(value).startsWith('ja'),
            message: 'Bitte geben Sie den/die Kooperationspartner*in an.'
        }
    ];
    const styleId = 'wu-conditional-required-style';
    const invalidClass = 'wu-conditional-invalid';
    const markerClass = 'wu-conditional-required-marker';
    const errorClass = 'wu-conditional-required-error';
    let active = null;
    let pageObserver = null;
    let scheduled = false;

    function norm(value) {
        return String(value || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLocaleLowerCase('de');
    }

    function addStyles() {
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
app-dynamic-form mat-form-field.${invalidClass} .mdc-notched-outline__leading,
app-dynamic-form mat-form-field.${invalidClass} .mdc-notched-outline__notch,
app-dynamic-form mat-form-field.${invalidClass} .mdc-notched-outline__trailing {
    border-color: #d32f2f !important;
}
app-dynamic-form mat-form-field.${invalidClass} .mdc-floating-label,
app-dynamic-form mat-form-field.${invalidClass} mat-label {
    color: #d32f2f !important;
}
app-dynamic-form mat-form-field.${invalidClass}
.mat-mdc-form-field-hint-wrapper {
    display: none !important;
}
app-dynamic-form .${errorClass} {
    display: block;
    padding: 0 16px;
    color: #d32f2f;
    font-size: 12px;
    line-height: 16px;
}
app-dynamic-form .${errorClass}[hidden] {
    display: none !important;
}`;
        document.head.appendChild(style);
    }

    function field(root, text) {
        return [...root.querySelectorAll('mat-form-field')].find(item =>
            norm(item.querySelector('mat-label')?.textContent) === norm(text)
        );
    }

    function resolve(root, rule, index) {
        const sourceField = field(root, rule.source);
        const targetField = field(root, rule.target);
        const select = sourceField?.querySelector('mat-select');
        const input = targetField?.querySelector(
            'input:not([hidden]),textarea:not([hidden])'
        );
        const label = targetField?.querySelector('label.mdc-floating-label');
        if (!sourceField || !targetField || !select || !input || !label) {
            return null;
        }
        return {
            rule,
            select,
            field: targetField,
            input,
            label,
            errorId: `wu-conditional-required-error-${index}`,
            original: {
                required: input.getAttribute('required'),
                ariaRequired: input.getAttribute('aria-required'),
                describedBy: input.getAttribute('aria-describedby')
            }
        };
    }

    function selected(select) {
        return select.querySelector(
            '.mat-mdc-select-value-text,.mat-mdc-select-min-line'
        )?.textContent?.trim() || '';
    }

    function restore(element, name, value) {
        if (value === null) element.removeAttribute(name);
        else element.setAttribute(name, value);
    }

    function install(item) {
        let touched = false;
        const required = () => item.rule.required(selected(item.select));
        const empty = () => item.input.value.trim() === '';

        function setMarker(show) {
            let own = item.label.querySelector(`.${markerClass}`);
            const native = item.label.querySelector(
                '.mat-mdc-form-field-required-marker,' +
                '.mat-form-field-required-marker'
            );
            if (show && !native && !own) {
                own = document.createElement('span');
                own.className =
                    'mat-mdc-form-field-required-marker ' +
                    'mdc-floating-label--required ' +
                    markerClass;
                own.setAttribute('aria-hidden', 'true');
                item.label.appendChild(own);
            } else if (!show) {
                own?.remove();
            }
        }

        function getError() {
            let error = item.field.querySelector(`#${item.errorId}`);
            if (error) return error;
            error = document.createElement('div');
            error.id = item.errorId;
            error.className = errorClass;
            error.setAttribute('role', 'alert');
            error.textContent = item.rule.message;
            error.hidden = true;
            const wrapper = item.field.querySelector(
                '.mat-mdc-form-field-subscript-wrapper'
            );
            (wrapper || item.field).appendChild(error);
            return error;
        }

        function setDescription(show) {
            const ids = new Set(
                String(item.original.describedBy || '')
                    .split(/\s+/)
                    .filter(Boolean)
            );
            if (show) ids.add(item.errorId);
            if (ids.size) {
                item.input.setAttribute(
                    'aria-describedby',
                    [...ids].join(' ')
                );
            } else {
                item.input.removeAttribute('aria-describedby');
            }
        }

        function update(force = false) {
            const mustFill = required();
            const invalid = mustFill && empty() && (touched || force);
            item.input.toggleAttribute('required', mustFill);
            item.input.setAttribute('aria-required', String(mustFill));
            setMarker(mustFill);
            item.input.setCustomValidity(
                mustFill && empty() ? item.rule.message : ''
            );
            item.field.classList.toggle(invalidClass, invalid);
            getError().hidden = !invalid;
            setDescription(invalid);
        }

        const touch = () => {
            touched = true;
            update();
        };
        const invalid = () => {
            touched = true;
            update(true);
        };

        item.input.addEventListener('input', touch);
        item.input.addEventListener('blur', touch);
        item.input.addEventListener('invalid', invalid);

        const observer = new MutationObserver(() => update());
        observer.observe(item.select, {
            childList: true,
            characterData: true,
            subtree: true
        });

        item.update = update;
        item.isInvalid = () => required() && empty();
        item.connected = () =>
            item.select.isConnected &&
            item.field.isConnected &&
            item.input.isConnected &&
            item.label.isConnected;
        item.cleanup = () => {
            observer.disconnect();
            item.input.removeEventListener('input', touch);
            item.input.removeEventListener('blur', touch);
            item.input.removeEventListener('invalid', invalid);
            item.label.querySelector(`.${markerClass}`)?.remove();
            item.field.querySelector(`#${item.errorId}`)?.remove();
            item.field.classList.remove(invalidClass);
            item.input.setCustomValidity('');
            restore(item.input, 'required', item.original.required);
            restore(
                item.input,
                'aria-required',
                item.original.ariaRequired
            );
            restore(
                item.input,
                'aria-describedby',
                item.original.describedBy
            );
        };

        update();
        return item;
    }

    function cleanup() {
        if (!active) return;
        active.form.removeEventListener('submit', active.submit, true);
        active.items.forEach(item => item.cleanup());
        active = null;
    }

    function refresh() {
        const root = document.querySelector('app-dynamic-form');
        const form = root?.querySelector('form') || root?.closest('form');
        if (!root || !form) {
            cleanup();
            return;
        }

        if (
            active?.form === form &&
            active.items.every(item => item.connected())
        ) {
            active.items.forEach(item => item.update());
            return;
        }

        const found = rules.map((rule, index) =>
            resolve(root, rule, index)
        );
        if (found.some(item => !item)) return;

        cleanup();
        const items = found.map(install);
        const submit = event => {
            items.forEach(item => item.update(true));
            const first = items.find(item => item.isInvalid());
            if (!first) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            first.input.focus();
            first.input.reportValidity();
            console.warn(
                '[WU OSB] Absenden verhindert:',
                first.rule.message
            );
        };

        form.addEventListener('submit', submit, true);
        active = { form, items, submit };
        console.info(
            '[WU OSB] Bedingte Pflichtfelder wurden aktiviert.'
        );
    }

    function schedule() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            refresh();
        });
    }

    function start() {
        addStyles();
        schedule();
        pageObserver = new MutationObserver(schedule);
        pageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function stop() {
        cleanup();
        pageObserver?.disconnect();
        pageObserver = null;
        document.getElementById(styleId)?.remove();
    }

    window.__wuConditionalRequiredCleanup?.();
    window.__wuConditionalRequiredCleanup = stop;

    if (document.body) start();
    else {
        document.addEventListener('DOMContentLoaded', start, {
            once: true
        });
    }
})();
