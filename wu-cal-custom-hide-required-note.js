(() => {
    'use strict';

    const TARGET_TEXT = 'Eine Notiz ist erforderlich';
    const SECTION_HEADING = 'Kurzbeschreibung Ihrer Veranstaltung';
    const STYLE_ID = 'wu-hide-required-note-style';
    const HIDDEN_CLASS = 'wu-hide-required-note';

    let observer = null;
    let scheduled = false;
    const hiddenElements = new Set();

    function normalize(value) {
        return String(value || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLocaleLowerCase('de');
    }

    function addStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = [
            'app-dynamic-form .' + HIDDEN_CLASS + ' {',
            '    display: none !important;',
            '}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function findSectionHeading(root) {
        return Array.from(
            root.querySelectorAll('h1, h2, h3, h4, h5, h6')
        ).find(heading =>
            normalize(heading.textContent) ===
            normalize(SECTION_HEADING)
        );
    }

    function findNextSectionHeading(root, startHeading) {
        const headings = Array.from(
            root.querySelectorAll('h1, h2, h3, h4, h5, h6')
        );
        const startIndex = headings.indexOf(startHeading);
        return headings.slice(startIndex + 1).find(heading =>
            Boolean(
                startHeading.compareDocumentPosition(heading) &
                Node.DOCUMENT_POSITION_FOLLOWING
            )
        );
    }

    function isInsideSection(element, startHeading, nextHeading) {
        const afterStart = Boolean((
            startHeading.compareDocumentPosition(element) &
            Node.DOCUMENT_POSITION_FOLLOWING
        ));
        const beforeNext = !nextHeading || Boolean(
            element.compareDocumentPosition(nextHeading) &
            Node.DOCUMENT_POSITION_FOLLOWING
        );
        return afterStart && beforeNext;
    }

    function hideMessage() {
        const root = document.querySelector('app-dynamic-form');
        if (!root) return;

        const startHeading = findSectionHeading(root);
        if (!startHeading) return;

        const nextHeading = findNextSectionHeading(root, startHeading);
        const candidates = Array.from(
            root.querySelectorAll('mat-error, [role="alert"], div, p, span')
        ).filter(element =>
            isInsideSection(element, startHeading, nextHeading) &&
            normalize(element.textContent) === normalize(TARGET_TEXT)
        );

        candidates.forEach(element => {
            const errorContainer = element.closest(
                'mat-error, .mat-mdc-form-field-error-wrapper'
            );
            const target =
                errorContainer &&
                isInsideSection(errorContainer, startHeading, nextHeading) &&
                normalize(errorContainer.textContent) === normalize(TARGET_TEXT)
                    ? errorContainer
                    : element;

            target.classList.add(HIDDEN_CLASS);
            hiddenElements.add(target);
        });
    }

    function schedule() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(() => {
            scheduled = false;
            hideMessage();
        });
    }

    function start() {
        addStyles();
        schedule();
        observer = new MutationObserver(schedule);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    function stop() {
        observer?.disconnect();
        observer = null;
        hiddenElements.forEach(element => {
            if (element.isConnected) {
                element.classList.remove(HIDDEN_CLASS);
            }
        });
        hiddenElements.clear();
        document.getElementById(STYLE_ID)?.remove();
    }

    window.__wuHideRequiredNoteCleanup?.();
    window.__wuHideRequiredNoteCleanup = stop;

    if (document.body) start();
    else document.addEventListener('DOMContentLoaded', start, { once: true });
})();
