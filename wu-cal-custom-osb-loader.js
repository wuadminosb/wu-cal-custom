(function () {
    'use strict';

    const CDN_BASE =
        'https://cdn.jsdelivr.net/gh/wuadminosb/wu-cal-custom@' +
        'ff55352c5714b5787f67d2feedb262b0034b286b/';

    function loadScript(fileName, attributes) {
        return new Promise(function (resolve, reject) {
            const script = document.createElement('script');

            script.src = CDN_BASE + fileName;
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

    loadScript('wu-cal-custom.js', {
        'data-wu-cal-custom-base': 'true'
    })
        .then(function () {
            return loadScript('wu-cal-custom-osb.js');
        })
        .catch(function (error) {
            console.error(
                '[WU OSB] JavaScript-Loader fehlgeschlagen.',
                error
            );
        });
})();
