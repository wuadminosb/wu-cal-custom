(function () {
    'use strict';

    const MAIN_BRANCH = 'main';
    const CDN_BASE = 'https://cdn.jsdelivr.net/gh/wuadminosb/wu-cal-custom@' + MAIN_BRANCH + '/';

    const BASE_URL = CDN_BASE + 'wu-cal-custom.js';
    const SLIDER_URL = CDN_BASE + 'wu-cal-custom-slider.js?v=20260805-1';
    const ROOM_DETAILS_URL = CDN_BASE + 'wu-cal-custom-room-details.js?v=20260826-1';
    const ACCOUNT_CHOICE_URL = CDN_BASE + 'wu-cal-custom-account-choice.js?v=20260805-1';
    const CALENDAR_TABS_URL = CDN_BASE + 'wu-cal-custom-calendar-tabs.js?v=20260805-1';
    const HEADER_CUSTOM_URL = CDN_BASE + 'wu-cal-custom-header.js?v=20260805-1';
    const CONDITIONAL_REQUIRED_URL = CDN_BASE + 'wu-cal-custom-conditional-required.js';
    const HIDE_REQUIRED_NOTE_URL = CDN_BASE + 'wu-cal-custom-hide-required-note.js';
    const CONDITIONAL_BUTTON_GUARD_URL = CDN_BASE + 'wu-cal-custom-conditional-button-guard.js';
    const TERMS_LINKS_URL = CDN_BASE + 'wu-cal-custom-terms-links.js';
    const REQUIRED_LEGEND_URL = CDN_BASE + 'wu-cal-custom-required-legend.js';
    const HIDE_COURSE_OPTION_URL = CDN_BASE + 'wu-cal-custom-hide-course-option.js';

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
            return loadScript(ROOM_DETAILS_URL);
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
        .then(function () {
            return loadScript(CONDITIONAL_REQUIRED_URL);
        })
        .then(function () {
            return loadScript(HIDE_REQUIRED_NOTE_URL);
        })
        .then(function () {
            return loadScript(CONDITIONAL_BUTTON_GUARD_URL);
        })
        .then(function () {
            return loadScript(TERMS_LINKS_URL);
        })
        .then(function () {
            return loadScript(REQUIRED_LEGEND_URL);
        })
        .then(function () {
            return loadScript(HIDE_COURSE_OPTION_URL);
        })
        .catch(function (error) {
            console.error(
                '[WU OSB] JavaScript-Loader fehlgeschlagen.',
                error
            );
        });
})();
