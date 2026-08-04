(function () {
    'use strict';

    const BASE_URL =
        'https://cdn.jsdelivr.net/gh/wuadminosb/' +
        'wu-cal-custom@3985978a99a25dcbee7f5eaa3775b18a7d481eaa/' +
        'wu-cal-custom.js';

    const SLIDER_URL =
        'https://cdn.jsdelivr.net/gh/wuadminosb/' +
        'wu-cal-custom@main/wu-cal-custom-slider.js' +
        '?v=20260728-1';

    const ACCOUNT_CHOICE_URL =
        'https://cdn.jsdelivr.net/gh/wuadminosb/' +
        'wu-cal-custom@main/wu-cal-custom-account-choice.js' +
        '?v=20260728-1';

    const CALENDAR_TABS_URL =
        'https://cdn.jsdelivr.net/gh/wuadminosb/' +
        'wu-cal-custom@main/wu-cal-custom-calendar-tabs.js' +
        '?v=20260728-1';

    const HEADER_CUSTOM_URL =
        'https://cdn.jsdelivr.net/gh/wuadminosb/' +
        'wu-cal-custom@main/wu-cal-custom-header.js' +
        '?v=20260728-1';

    function applyRequiredMarkerStyles() {
        const styleId = 'wu-required-marker-red';

        if (document.getElementById(styleId)) {
            return;
      }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = [
            'app-dynamic-form .mat-mdc-form-field-required-marker,',
            'app-dynamic-form .mat-mdc-form-field-required-marker::after,',
            'app-dynamic-form .mdc-floating-label--required,',
            'app-dynamic-form .mdc-floating-label--required::after {',
            '    color: #d32f2f !important;',
            '}'
        ].join('\n');

        document.head.appendChild(style);
    }

    applyRequiredMarkerStyles();

    function loadScript(url, attributes) {
        return new Promise(function (resolve, reject) {
            const existing = Array.from(
                document.querySelectorAll('script[src]')
            ).find(function (script) {
                return script.src === url;
            });

            if (existing) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = url;
            script.async = false;

            Object.entries(attributes || {}).forEach(function (entry) {
                script.setAttribute(entry[0], entry[1]);
            });

            script.onload = resolve;
            script.onerror = function () {
                reject(
                    new Error(
                        'Datei konnte nicht geladen werden: ' +
                        script.src
                    )
                );
            };

            document.head.appendChild(script);
        });
    }

    loadScript(BASE_URL, {
        'data-wu-cal-custom-base': 'true'
    })
        .then(function () {
            return loadScript(SLIDER_URL);
        })
        .then(function () {
            return loadScript(ACCOUNT_CHOICE_URL);
        })
        .then(function () {
            return loadScript(CALENDAR_TABS_URL);
        })
        .then(function () {
            return loadScript(HEADER_CUSTOM_URL);
        })
        .catch(function (error) {
            console.error(
                '[WU OSB] JavaScript-Loader fehlgeschlagen.',
                error
            );
        });
})();
