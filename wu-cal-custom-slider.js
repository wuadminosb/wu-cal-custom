(function () {
    'use strict';

    const GLOBAL_NAME = 'wuSs1ImageSlider';
    const STYLE_ID = 'wu-ss1-image-slider-style';
    const READY_ATTRIBUTE = 'data-wu-ss1-slider-ready';
    const RETRY_DELAYS = [0, 100, 300, 700, 1500, 3000, 5000];

    function normalize(value) {
        return String(value || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function isSitzungssaalOne(root) {
        const title = normalize(
            root.querySelector(
                '.usi-spaceDetailsTopRow .usi-detailsTitle, ' +
                '.usi-detailsTitle, h1'
            )?.textContent
        );

        return (
            /\bad\s*\.?\s*0\s*\.?\s*114\b/i.test(title) ||
            /\bsitzungssaal\s*(?:1|i|eins)\b/i.test(title)
        );
    }

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            .wu-ss1-gallery-navigation {
                display: grid !important;
                grid-template-columns:
                    minmax(110px, auto)
                    1fr
                    minmax(110px, auto) !important;
                align-items: center !important;
                gap: 12px !important;
                width: 100% !important;
                margin: 12px 0 !important;
                box-sizing: border-box !important;
            }

            .wu-ss1-gallery-button {
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                gap: 8px !important;
                min-height: 44px !important;
                padding: 9px 16px !important;
                border: 0 !important;
                color: #ffffff !important;
                background: #0b80a7 !important;
                font-family: Verdana, Arial, sans-serif !important;
                font-size: 14px !important;
                font-weight: 700 !important;
                line-height: 1.2 !important;
                cursor: pointer !important;
            }

            .wu-ss1-gallery-button:hover {
                background: #075f7d !important;
            }

            .wu-ss1-gallery-button:focus-visible {
                outline: 3px solid #075f7d !important;
                outline-offset: 3px !important;
            }

            .wu-ss1-gallery-button span {
                font-family: Arial, sans-serif !important;
                font-size: 26px !important;
                line-height: 0.8 !important;
            }

            .wu-ss1-gallery-counter {
                display: block !important;
                color: #444444 !important;
                font-family: Verdana, Arial, sans-serif !important;
                font-size: 13px !important;
                font-weight: 700 !important;
                text-align: center !important;
            }

            .wu-room-gallery .usi-thumbnailButtons {
                opacity: 0.68 !important;
                box-sizing: border-box !important;
            }

            .wu-room-gallery
            .usi-thumbnailButtons.wu-ss1-active-thumbnail {
                opacity: 1 !important;
                box-shadow: 0 0 0 3px #0b80a7 !important;
            }

            @media (max-width: 550px) {
                .wu-ss1-gallery-navigation {
                    grid-template-columns: 1fr 1fr !important;
                }

                .wu-ss1-gallery-counter {
                    grid-column: 1 / -1 !important;
                    grid-row: 1 !important;
                }

                .wu-ss1-gallery-previous,
                .wu-ss1-gallery-next {
                    grid-row: 2 !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    function applySlider() {
        const root = document.querySelector('app-space-details');

        if (!root || !isSitzungssaalOne(root)) {
            window[GLOBAL_NAME]?.cleanup?.();
            return false;
        }

        const gallery = root.querySelector(
            '.usi-op-imageViewerContainer'
        );
        const mainButton = gallery?.querySelector(
            '.usi-desktopSpaceImg'
        );
        const mainImage = mainButton?.querySelector('img');

        if (!gallery || !mainButton || !mainImage) {
            return false;
        }

        if (gallery.getAttribute(READY_ATTRIBUTE) === 'true') {
            return true;
        }

        const thumbnailButtons = Array.from(
            gallery.querySelectorAll('.usi-thumbnailButtons')
        ).filter(function (button) {
            return Boolean(button.querySelector('img'));
        });

        if (!thumbnailButtons.length) {
            return false;
        }

        const slides = thumbnailButtons.map(function (button) {
            const image = button.querySelector('img');

            return {
                src: image.currentSrc || image.src,
                alt: image.getAttribute('alt') || 'Raumbild'
            };
        });

        const original = {
            src: mainImage.getAttribute('src'),
            alt: mainImage.getAttribute('alt'),
            srcset: mainImage.getAttribute('srcset'),
            tabindex: mainButton.getAttribute('tabindex'),
            ariaLabel: mainButton.getAttribute('aria-label'),
            cursor: mainButton.style.cursor
        };

        let currentIndex = Math.max(
            0,
            slides.findIndex(function (slide) {
                return normalize(slide.alt) === normalize(original.alt);
            })
        );
        let autoplayId = null;

        const navigation = document.createElement('div');
        navigation.className = 'wu-ss1-gallery-navigation';

        const previousButton = document.createElement('button');
        previousButton.type = 'button';
        previousButton.className =
            'wu-ss1-gallery-button wu-ss1-gallery-previous';
        previousButton.innerHTML =
            '<span aria-hidden="true">‹</span> Zurück';
        previousButton.setAttribute(
            'aria-label',
            'Vorheriges Raumbild anzeigen'
        );

        const counter = document.createElement('span');
        counter.className = 'wu-ss1-gallery-counter';
        counter.setAttribute('aria-live', 'polite');

        const nextButton = document.createElement('button');
        nextButton.type = 'button';
        nextButton.className =
            'wu-ss1-gallery-button wu-ss1-gallery-next';
        nextButton.innerHTML =
            'Weiter <span aria-hidden="true">›</span>';
        nextButton.setAttribute(
            'aria-label',
            'Nächstes Raumbild anzeigen'
        );

        navigation.append(previousButton, counter, nextButton);
        mainButton.insertAdjacentElement('afterend', navigation);

        function showSlide(index) {
            currentIndex =
                ((index % slides.length) + slides.length) %
                slides.length;

            const slide = slides[currentIndex];

            mainImage.removeAttribute('srcset');
            mainImage.src = slide.src;
            mainImage.alt = slide.alt;

            thumbnailButtons.forEach(function (button, indexOfButton) {
                const active = indexOfButton === currentIndex;

                button.classList.toggle(
                    'wu-ss1-active-thumbnail',
                    active
                );

                if (active) {
                    button.setAttribute('aria-current', 'true');
                } else {
                    button.removeAttribute('aria-current');
                }
            });

            counter.textContent =
                (currentIndex + 1) + ' von ' + slides.length;
        }

        function stopAutoplay() {
            if (autoplayId !== null) {
                window.clearInterval(autoplayId);
                autoplayId = null;
            }
        }

        function startAutoplay() {
            stopAutoplay();

            if (document.hidden) {
                return;
            }

            autoplayId = window.setInterval(function () {
                showSlide(currentIndex + 1);
            }, 5000);
        }

        function previous(event) {
            event?.preventDefault();
            event?.stopPropagation();
            showSlide(currentIndex - 1);
            startAutoplay();
        }

        function next(event) {
            event?.preventDefault();
            event?.stopPropagation();
            showSlide(currentIndex + 1);
            startAutoplay();
        }

        function blockPopup(event) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }

        function handleThumbnailClick(event) {
            const thumbnail = event.target.closest(
                '.usi-thumbnailButtons'
            );

            if (!thumbnail) {
                return;
            }

            const index = thumbnailButtons.indexOf(thumbnail);

            if (index < 0) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            showSlide(index);
            startAutoplay();
        }

        function handleFocusOut(event) {
            if (
                !event.relatedTarget ||
                !gallery.contains(event.relatedTarget)
            ) {
                startAutoplay();
            }
        }

        function handleVisibilityChange() {
            if (document.hidden) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        }

        previousButton.addEventListener('click', previous);
        nextButton.addEventListener('click', next);
        mainButton.addEventListener('click', blockPopup, true);
        gallery.addEventListener(
            'click',
            handleThumbnailClick,
            true
        );
        gallery.addEventListener('mouseenter', stopAutoplay);
        gallery.addEventListener('mouseleave', startAutoplay);
        gallery.addEventListener('focusin', stopAutoplay);
        gallery.addEventListener('focusout', handleFocusOut);
        document.addEventListener(
            'visibilitychange',
            handleVisibilityChange
        );

        mainButton.setAttribute('tabindex', '-1');
        mainButton.setAttribute(
            'aria-label',
            'Raumbild. Navigation über Zurück und Weiter.'
        );
        mainButton.style.cursor = 'default';

        ensureStyles();
        gallery.setAttribute(READY_ATTRIBUTE, 'true');
        showSlide(currentIndex);
        startAutoplay();

        window[GLOBAL_NAME] = {
            cleanup: function () {
                stopAutoplay();

                previousButton.removeEventListener(
                    'click',
                    previous
                );
                nextButton.removeEventListener('click', next);
                mainButton.removeEventListener(
                    'click',
                    blockPopup,
                    true
                );
                gallery.removeEventListener(
                    'click',
                    handleThumbnailClick,
                    true
                );
                gallery.removeEventListener(
                    'mouseenter',
                    stopAutoplay
                );
                gallery.removeEventListener(
                    'mouseleave',
                    startAutoplay
                );
                gallery.removeEventListener(
                    'focusin',
                    stopAutoplay
                );
                gallery.removeEventListener(
                    'focusout',
                    handleFocusOut
                );
                document.removeEventListener(
                    'visibilitychange',
                    handleVisibilityChange
                );

                navigation.remove();
                gallery.removeAttribute(READY_ATTRIBUTE);

                thumbnailButtons.forEach(function (button) {
                    button.classList.remove(
                        'wu-ss1-active-thumbnail'
                    );
                    button.removeAttribute('aria-current');
                });

                if (original.src !== null) {
                    mainImage.setAttribute('src', original.src);
                }

                if (original.alt !== null) {
                    mainImage.setAttribute('alt', original.alt);
                }

                if (original.srcset !== null) {
                    mainImage.setAttribute(
                        'srcset',
                        original.srcset
                    );
                }

                if (original.tabindex === null) {
                    mainButton.removeAttribute('tabindex');
                } else {
                    mainButton.setAttribute(
                        'tabindex',
                        original.tabindex
                    );
                }

                if (original.ariaLabel === null) {
                    mainButton.removeAttribute('aria-label');
                } else {
                    mainButton.setAttribute(
                        'aria-label',
                        original.ariaLabel
                    );
                }

                mainButton.style.cursor = original.cursor;
                delete window[GLOBAL_NAME];
            }
        };

        return true;
    }

    function initialize() {
        let updatePending = false;

        function scheduleApply() {
            if (updatePending) {
                return;
            }

            updatePending = true;

            window.requestAnimationFrame(function () {
                updatePending = false;
                applySlider();
            });
        }

        RETRY_DELAYS.forEach(function (delay) {
            window.setTimeout(applySlider, delay);
        });

        const observer = new MutationObserver(scheduleApply);

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    initialize();
})();
