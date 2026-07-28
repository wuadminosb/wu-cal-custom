(function () {
    'use strict';

    const currentScript = document.currentScript;

    if (!currentScript || !currentScript.src) {
        console.error('[WU OSB] Loader-URL konnte nicht ermittelt werden.');
        return;
    }

    const baseUrl = new URL('.', currentScript.src);

    function loadScript(fileName, attributes) {
        return new Promise(function (resolve, reject) {
            const script = document.createElement('script');
            script.src = new URL(fileName, baseUrl).href;
            script.async = false;

            Object.entries(attributes || {}).forEach(function (entry) {
                script.setAttribute(entry[0], entry[1]);
            });

            script.onload = resolve;
            script.onerror = function () {
                reject(new Error('Datei konnte nicht geladen werden: ' + script.src));
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
            console.error('[WU OSB] JavaScript-Loader fehlgeschlagen.', error);
        });
})();
