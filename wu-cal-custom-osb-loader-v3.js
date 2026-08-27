(function () {
    'use strict';

    const CDN_BASE = 'https://cdn.jsdelivr.net/gh/wuadminosb/wu-cal-custom@main/';
    const VERSION = '20260826-3';

    const URLS = {
        base: CDN_BASE + 'wu-cal-custom.js',
        slider: CDN_BASE + 'wu-cal-custom-slider.js?v=20260805-1',
        room2: CDN_BASE + 'wu-cal-custom-room-details.js?v=' + VERSION,
        rooms36: CDN_BASE + 'wu-cal-custom-room-details-3-6.js?v=' + VERSION,
        eventFestsaal1: CDN_BASE + 'wu-cal-custom-room-details-event-spaces-data-festsaal-1.js?v=' + VERSION,
        eventFestsaal2: CDN_BASE + 'wu-cal-custom-room-details-event-spaces-data-festsaal-2.js?v=' + VERSION,
        eventGalerie: CDN_BASE + 'wu-cal-custom-room-details-event-spaces-data-galerie.js?v=' + VERSION,
        eventClubraum: CDN_BASE + 'wu-cal-custom-room-details-event-spaces-data-clubraum.js?v=' + VERSION,
        eventSkyLounge: CDN_BASE + 'wu-cal-custom-room-details-event-spaces-data-sky-lounge.js?v=' + VERSION,
        eventFoyer: CDN_BASE + 'wu-cal-custom-room-details-event-spaces-data-foyer.js?v=' + VERSION,
        eventTcHall: CDN_BASE + 'wu-cal-custom-room-details-event-spaces-data-tc-hall.js?v=' + VERSION,
        eventRuntime: CDN_BASE + 'wu-cal-custom-room-details-event-spaces.js?v=' + VERSION,
        accountChoice: CDN_BASE + 'wu-cal-custom-account-choice.js?v=20260805-1',
        calendarTabs: CDN_BASE + 'wu-cal-custom-calendar-tabs.js?v=20260805-1',
        header: CDN_BASE + 'wu-cal-custom-header.js?v=20260805-1',
        conditionalRequired: CDN_BASE + 'wu-cal-custom-conditional-required.js',
        hideRequiredNote: CDN_BASE + 'wu-cal-custom-hide-required-note.js',
        conditionalButtonGuard: CDN_BASE + 'wu-cal-custom-conditional-button-guard.js',
        termsLinks: CDN_BASE + 'wu-cal-custom-terms-links.js',
        requiredLegend: CDN_BASE + 'wu-cal-custom-required-legend.js',
        hideCourseOption: CDN_BASE + 'wu-cal-custom-hide-course-option.js'
    };

    function applyRequiredMarkerStyles() {
        const styleId = 'wu-required-marker-red';
        if (document.getElementById(styleId)) return;
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

    function loadScript(url, attributes) {
        return new Promise(function (resolve, reject) {
            const existing = Array.from(document.querySelectorAll('script[src]'))
                .find(function (script) { return script.src === url; });

            if (existing) {
                resolve(url);
                return;
            }

            const script = document.createElement('script');
            script.src = url;
            script.async = false;

            Object.entries(attributes || {}).forEach(function (entry) {
                script.setAttribute(entry[0], entry[1]);
            });

            script.onload = function () { resolve(url); };
            script.onerror = function () {
                reject(new Error('Datei konnte nicht geladen werden: ' + script.src));
            };

            document.head.appendChild(script);
        });
    }

    function safeLoad(url, attributes) {
        return loadScript(url, attributes).catch(function (error) {
            console.error('[WU OSB] Modul konnte nicht geladen werden.', error);
            return null;
        });
    }

    function loadEventSpaces() {
        return Promise.all([
            safeLoad(URLS.eventFestsaal1),
            safeLoad(URLS.eventFestsaal2),
            safeLoad(URLS.eventGalerie),
            safeLoad(URLS.eventClubraum),
            safeLoad(URLS.eventSkyLounge),
            safeLoad(URLS.eventFoyer),
            safeLoad(URLS.eventTcHall)
        ]).then(function () {
            return safeLoad(URLS.eventRuntime);
        });
    }

    applyRequiredMarkerStyles();

    safeLoad(URLS.room2);
    safeLoad(URLS.rooms36);
    loadEventSpaces();

    safeLoad(URLS.base, {
        'data-wu-cal-custom-base': 'true'
    }).then(function () {
        [
            URLS.slider,
            URLS.accountChoice,
            URLS.calendarTabs,
            URLS.header,
            URLS.conditionalRequired,
            URLS.hideRequiredNote,
            URLS.conditionalButtonGuard,
            URLS.termsLinks,
            URLS.requiredLegend,
            URLS.hideCourseOption
        ].forEach(function (url) {
            safeLoad(url);
        });
    });

    window.wuOsbLoaderVersion = VERSION;
    console.info('[WU OSB] Loader aktiv:', VERSION);
})();
