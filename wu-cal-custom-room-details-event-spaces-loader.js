(function () {
    'use strict';

    const CDN_BASE =
        'https://cdn.jsdelivr.net/gh/wuadminosb/wu-cal-custom@main/';
    const VERSION = '20260826-1';
    const FILES = [
        'wu-cal-custom-room-details-event-spaces-data-lc-core.js',
        'wu-cal-custom-room-details-event-spaces-data-lc-extra.js',
        'wu-cal-custom-room-details-event-spaces-data-ea.js',
        'wu-cal-custom-room-details-event-spaces-data-tc.js',
        'wu-cal-custom-room-details-event-spaces.js'
    ];

    function loadScript(file) {
        const url = CDN_BASE + file + '?v=' + VERSION;

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

    FILES.reduce(function (promise, file) {
        return promise.then(function () {
            return loadScript(file);
        });
    }, Promise.resolve()).catch(function (error) {
        console.error(
            '[WU OSB] Eventraum-Modul konnte nicht geladen werden.',
            error
        );
    });
})();
