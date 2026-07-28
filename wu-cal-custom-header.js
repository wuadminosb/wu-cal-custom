(function () {
    'use strict';

    const TOP_BAR_CLASS = 'wu-header-top-custom';
    const HIDDEN_MENU_CLASS = 'wu-hidden-manage-menu-item';

    function normalize(value) {
        return String(value || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function applyHeaderLayout() {
        const topBar = document.querySelector(
            'app-header .usi-headerTop.usi-headerTopBar'
        );

        if (topBar) {
            topBar.classList.add(TOP_BAR_CLASS);
        }

        const accountButton = document.querySelector(
            'app-header #accountdropdown'
        );

        if (accountButton) {
            accountButton.classList.add('wu-account-contact-hover');
        }

        document.querySelectorAll(
            '.mat-mdc-menu-item-text, .mat-menu-item-text'
        ).forEach(function (label) {
            if (normalize(label.textContent) !== 'verwalten') {
                return;
            }

            const item = label.closest(
                '.mat-mdc-menu-item, .mat-menu-item, [role="menuitem"]'
            );

            if (!item) {
                return;
            }

            item.classList.add(HIDDEN_MENU_CLASS);
            item.setAttribute('aria-hidden', 'true');
            item.setAttribute('tabindex', '-1');
        });
    }

    let updatePending = false;

    function scheduleApply() {
        if (updatePending) {
            return;
        }

        updatePending = true;

        window.requestAnimationFrame(function () {
            updatePending = false;
            applyHeaderLayout();
        });
    }

    const observer = new MutationObserver(scheduleApply);

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    applyHeaderLayout();
})();
