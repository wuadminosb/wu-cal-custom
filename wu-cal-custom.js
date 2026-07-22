(function () {
    'use strict';

    function replaceDateLabel() {
        const elements = document.querySelectorAll(
            'mat-label, label, .mdc-floating-label'
        );

        elements.forEach(function (element) {
            Array.from(element.childNodes).forEach(function (node) {
                if (
                    node.nodeType === Node.TEXT_NODE &&
                    /\bDaten\b/.test(node.textContent)
                ) {
                    node.textContent = node.textContent.replace(
                        /\bDaten\b/g,
                        'Datum'
                    );
                }
            });

            /* Falls Momentus den Text in weiteren Elementen verschachtelt */
            if (/\bDaten\b/.test(element.textContent)) {
                element.querySelectorAll('*').forEach(function (child) {
                    Array.from(child.childNodes).forEach(function (node) {
                        if (
                            node.nodeType === Node.TEXT_NODE &&
                            /\bDaten\b/.test(node.textContent)
                        ) {
                            node.textContent = node.textContent.replace(
                                /\bDaten\b/g,
                                'Datum'
                            );
                        }
                    });
                });
            }
        });
    }

    /* Mehrfach ausführen, da Momentus die Inhalte verzögert lädt */
    replaceDateLabel();
    setTimeout(replaceDateLabel, 500);
    setTimeout(replaceDateLabel, 1500);
    setTimeout(replaceDateLabel, 3000);

    const observer = new MutationObserver(replaceDateLabel);

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });
})();
