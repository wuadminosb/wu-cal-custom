(function () {
    'use strict';

    function changeDateLabel() {
        const labels = document.querySelectorAll(
            'mat-label, label, .mdc-floating-label'
        );

        labels.forEach(function (label) {
            const text = label.textContent.trim();

            if (text === 'Daten' || text === 'Daten*') {
                label.childNodes.forEach(function (node) {
                    if (
                        node.nodeType === Node.TEXT_NODE &&
                        node.textContent.includes('Daten')
                    ) {
                        node.textContent =
                            node.textContent.replace('Daten', 'Datum');
                    }
                });

                /* Falls der Text nicht in einem eigenen Textknoten liegt */
                if (label.textContent.trim().startsWith('Daten')) {
                    label.innerHTML =
                        label.innerHTML.replace('Daten', 'Datum');
                }
            }
        });
    }

    /* Nach dem ersten Laden ausführen */
    changeDateLabel();

    /*
       Momentus lädt Teile der Seite dynamisch nach.
       Daher wird die Änderung nach jedem Neuaufbau erneut geprüft.
    */
    const observer = new MutationObserver(function () {
        changeDateLabel();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
