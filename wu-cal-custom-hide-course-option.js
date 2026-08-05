(() => {
    'use strict';

    window.__wuHideCourseOptionCleanup?.();

    const TARGET_TEXT = 'Lehrveranstaltung';
    const HIDDEN_CLASS = 'wu-hidden-course-option';
    const STYLE_ID = 'wu-hidden-course-option-style';

    const hiddenElements = new Set();
    let observer = null;
    let scheduled = false;

    const normalize = value =>
        String(value || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLocaleLowerCase('de');

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
        .${HIDDEN_CLASS} {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    const hideOption = () => {
        document
            .querySelectorAll('.mdc-list-item__primary-text')
            .forEach(label => {
                if (normalize(label.textContent) !== normalize(TARGET_TEXT)) {
                    return;
                }

                const option =
                    label.closest(
                        'mat-option, [role="option"], .mat-mdc-option, .mdc-list-item'
                    ) || label;

                option.classList.add(HIDDEN_CLASS);
                hiddenElements.add(option);
            });
    };

    const scheduleUpdate = () => {
        if (scheduled) {
            return;
        }

        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            hideOption();
        });
    };

    hideOption();

    observer = new MutationObserver(scheduleUpdate);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
    });

    window.__wuHideCourseOptionCleanup = () => {
        observer?.disconnect();

        hiddenElements.forEach(element => {
            if (element.isConnected) {
                element.classList.remove(HIDDEN_CLASS);
            }
        });

        hiddenElements.clear();
        document.getElementById(STYLE_ID)?.remove();
        delete window.__wuHideCourseOptionCleanup;
    };
})();
