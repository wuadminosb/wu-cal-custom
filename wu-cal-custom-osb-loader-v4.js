(function () {
    'use strict';

    const CDN_BASE = 'https://cdn.jsdelivr.net/gh/wuadminosb/wu-cal-custom@main/';
    const VERSION = '20260827-1';
    const versioned = file => CDN_BASE + file + '?v=' + VERSION;
    const fixed = (file, version) => CDN_BASE + file + (version ? '?v=' + version : '');

    function loadScript(url, attributes) {
        const existing = Array.from(document.querySelectorAll('script[src]'))
            .find(script => script.src === url);
        if (existing) return Promise.resolve(url);

        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = false;
            Object.entries(attributes || {}).forEach(([key, value]) => script.setAttribute(key, value));
            script.onload = () => resolve(url);
            script.onerror = () => reject(new Error('Datei konnte nicht geladen werden: ' + script.src));
            document.head.appendChild(script);
        });
    }

    function safeLoad(url, attributes) {
        return loadScript(url, attributes).catch(error => {
            console.error('[WU OSB] Modul konnte nicht geladen werden.', error);
            return null;
        });
    }

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

    applyRequiredMarkerStyles();

    safeLoad(versioned('wu-cal-custom-room-details.js'));
    safeLoad(versioned('wu-cal-custom-room-details-3-6.js'));

    Promise.all([
        'festsaal-1',
        'festsaal-2',
        'galerie',
        'clubraum',
        'sky-lounge',
        'foyer',
        'tc-hall'
    ].map(name => safeLoad(versioned('wu-cal-custom-room-details-event-spaces-data-' + name + '.js'))))
        .then(() => safeLoad(versioned('wu-cal-custom-room-details-event-spaces.js')));

    safeLoad(fixed('wu-cal-custom.js'), {
        'data-wu-cal-custom-base': 'true'
    }).then(() => {
        [
            fixed('wu-cal-custom-slider.js', '20260805-1'),
            fixed('wu-cal-custom-account-choice.js', '20260805-1'),
            fixed('wu-cal-custom-calendar-tabs.js', '20260805-1'),
            fixed('wu-cal-custom-header.js', '20260805-1'),
            fixed('wu-cal-custom-conditional-required.js'),
            fixed('wu-cal-custom-hide-required-note.js'),
            fixed('wu-cal-custom-conditional-button-guard.js'),
            fixed('wu-cal-custom-terms-links.js'),
            fixed('wu-cal-custom-required-legend.js'),
            fixed('wu-cal-custom-hide-course-option.js')
        ].forEach(url => safeLoad(url));
    });

    window.wuOsbLoaderVersion = VERSION;
    console.info('[WU OSB] Loader aktiv:', VERSION);
})();
