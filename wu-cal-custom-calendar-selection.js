(function () {
    'use strict';

    /*
     * wu-cal-custom-calendar-selection.js
     *
     * Ermöglicht das Auswählen freier Zeitslots im OSB-Kalender:
     *
     *   – Freie Zellen (weiß, kein .chadmo-merged-cell / .unavailable)
     *     werden mit cursor:pointer und Hover-Hervorhebung versehen.
     *
     *   – Klick auf eine freie Zelle → Zelle wird WU-blau markiert
     *     (Klasse wu-cal-selected). Erneuter Klick hebt die Markierung
     *     wieder auf. Mehrere Zellen verschiedener Räume können
     *     gleichzeitig ausgewählt sein.
     *
     *   – Rechts neben dem Kalender erscheint ein Auswahl-Panel
     *     mit der Liste der gewählten Zeiträume und einem Button
     *     „Weiter zum Ansuchen".
     *
     *   – Der Button feuert ein CustomEvent „wu-cal-selection-submit"
     *     auf document und loggt die Selektion, damit die Weiterleitung
     *     zur Buchungsseite einfach nachgerüstet werden kann.
     */

    /* ── Konstanten ─────────────────────────────────────────────────── */

    const STYLE_ID        = 'wu-cal-selection-style';
    const WRAPPER_CLASS   = 'wu-cal-wrapper';
    const FREE_CLASS      = 'wu-cal-free-cell';
    const SELECTED_CLASS  = 'wu-cal-selected';
    const PANEL_ID        = 'wu-cal-selection-panel';
    const PANEL_ATTR      = 'data-wu-sel-panel';

    const CALENDAR_ROOT_SELECTOR =
        'app-availability-calendar, app-calendar-day-view';

    const CELL_SELECTOR =
        '.calCell, .chadmo-cell, ' +
        '.chadmo-gridsView td, ' +
        '.chadmo-gridsView [role="gridcell"], ' +
        '[role="gridcell"]';

    /*
     * Aktuell gewählte Zeitslots.
     * Jeder Eintrag: { cell, room, date, timeStart, timeEnd, label }
     */
    let selections = [];

    /* ── Hilfsfunktionen ─────────────────────────────────────────────── */

    function normalize(value) {
        return String(value || '')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function isBooked(cell) {
        return (
            cell.classList.contains('chadmo-merged-cell') ||
            cell.closest('.chadmo-merged-cell') !== null
        );
    }

    function isUnavailable(cell) {
        return (
            cell.classList.contains('unavailable') ||
            cell.closest('.unavailable') !== null
        );
    }

    function isFreeCell(cell) {
        return !isBooked(cell) && !isUnavailable(cell);
    }

    /* ── Datum / Zeit / Raum aus einer Zelle auslesen ───────────────── */

    /*
     * Raumname: aus der linken Kopfspalte derselben Grid-Zeile.
     *
     * Im chadmo-Grid befindet sich jede Zeile in einem <tr> oder einem
     * Flex-/Grid-Container. Die linke Zelle enthält .rowHeadLeftCss3
     * mit .rowHeaderContent.
     *
     * Fallback-Kette:
     *   1. aria-label der Zelle selbst
     *   2. .rowHeadLeftCss3 in derselben <tr>
     *   3. .rowHeadLeftCss3 im nächsten übergeordneten Zeilen-Element
     *   4. leer → „Unbekannter Raum"
     */
    function getRoomName(cell) {
        const direct =
            cell.getAttribute('aria-label') ||
            cell.getAttribute('data-room') ||
            cell.getAttribute('data-space');

        if (direct) {
            return normalize(direct);
        }

        /* Suche nach der linken Kopfzelle in derselben Zeile */
        const row =
            cell.closest('tr') ||
            cell.closest('[role="row"]') ||
            cell.parentElement;

        if (row) {
            const header =
                row.querySelector(
                    '.rowHeadLeftCss3 .rowHeaderContent, ' +
                    '.rowHeaderContent, ' +
                    '[class*="rowHeader"] .rowHeaderContent, ' +
                    '[class*="rowHeader"]'
                );

            if (header) {
                /*
                 * wu-cal-custom.js teilt den Inhalt in
                 * .wu-room-number + .wu-room-name auf.
                 * Wenn das der Fall ist, nur den Raumnamen nehmen.
                 */
                const namePart = header.querySelector('.wu-room-name');

                if (namePart) {
                    return normalize(namePart.textContent);
                }

                return normalize(header.textContent);
            }
        }

        return 'Unbekannter Raum';
    }

    /*
     * Zeit: aus dem Spalten-Header der zugehörigen Spalte.
     *
     * Im chadmo-Grid gibt es eine Header-Zeile (.headerCell oder <th>),
     * deren Spaltenindex dem der Datenzelle entspricht.
     *
     * Fallback-Kette:
     *   1. data-time / data-hour / data-start auf der Zelle
     *   2. aria-label der Zelle
     *   3. Spalten-Header desselben Index
     *   4. leer → „Unbekannte Zeit"
     */
    function getTimeLabel(cell) {
        const directTime =
            cell.getAttribute('data-time') ||
            cell.getAttribute('data-hour') ||
            cell.getAttribute('data-start');

        if (directTime) {
            return normalize(directTime);
        }

        const cellLabel = cell.getAttribute('aria-label');

        if (cellLabel) {
            /* aria-label enthält oft „HH:MM – HH:MM Raumname" */
            const timeMatch = cellLabel.match(
                /\b(\d{1,2}[:h]\d{2})\s*[-–]\s*(\d{1,2}[:h]\d{2})\b/
            );

            if (timeMatch) {
                return timeMatch[1] + ' – ' + timeMatch[2];
            }
        }

        /* Spaltenindex bestimmen */
        const row =
            cell.closest('tr') ||
            cell.closest('[role="row"]') ||
            cell.parentElement;

        if (!row) {
            return 'Unbekannte Zeit';
        }

        const siblings = Array.from(
            row.querySelectorAll(
                ':scope > td, :scope > th, :scope > [role="gridcell"], :scope > [role="columnheader"]'
            )
        );

        const colIndex = siblings.indexOf(cell);

        if (colIndex < 0) {
            return 'Unbekannte Zeit';
        }

        /* Kopfzeile des Grids suchen */
        const grid =
            cell.closest('.chadmo-gridsView') ||
            cell.closest('table') ||
            cell.closest('[role="grid"]');

        if (!grid) {
            return 'Unbekannte Zeit';
        }

        const headerRow =
            grid.querySelector(
                'tr:first-child, [role="row"]:first-child, .headerRow'
            );

        if (!headerRow) {
            return 'Unbekannte Zeit';
        }

        const headerCells = Array.from(
            headerRow.querySelectorAll(
                'th, [role="columnheader"], .headerCell'
            )
        );

        const headerCell = headerCells[colIndex];

        if (!headerCell) {
            return 'Unbekannte Zeit';
        }

        return normalize(headerCell.textContent) || 'Unbekannte Zeit';
    }

    /*
     * Datum: aus dem Kalender-Toolbar-Titel oder dem Spalten-Header
     * (bei Wochenansicht enthält jede Spalte das Datum).
     */
    function getDateLabel(cell) {
        /* 1. data-date auf der Zelle */
        const directDate =
            cell.getAttribute('data-date') ||
            cell.getAttribute('data-day');

        if (directDate) {
            return normalize(directDate);
        }

        /* 2. Spalten-Header in der Wochenansicht enthält das Datum */
        const headerCell = (function () {
            const row =
                cell.closest('tr') ||
                cell.closest('[role="row"]') ||
                cell.parentElement;

            if (!row) {
                return null;
            }

            const siblings = Array.from(
                row.querySelectorAll(
                    ':scope > td, :scope > th, ' +
                    ':scope > [role="gridcell"], :scope > [role="columnheader"]'
                )
            );

            const colIndex = siblings.indexOf(cell);

            if (colIndex < 0) {
                return null;
            }

            const grid =
                cell.closest('.chadmo-gridsView') ||
                cell.closest('table') ||
                cell.closest('[role="grid"]');

            if (!grid) {
                return null;
            }

            const headerRow = grid.querySelector(
                'tr:first-child, [role="row"]:first-child, .headerRow'
            );

            if (!headerRow) {
                return null;
            }

            const headerCells = Array.from(
                headerRow.querySelectorAll(
                    'th, [role="columnheader"], .headerCell'
                )
            );

            return headerCells[colIndex] || null;
        })();

        if (headerCell) {
            const headerText = normalize(headerCell.textContent);
            /* Wochenansicht: Kopf enthält „Mo 07.08." o.ä. */
            const dateMatch = headerText.match(
                /\b(\d{1,2}[./]\d{1,2}(?:[./]\d{2,4})?)\b/
            );

            if (dateMatch) {
                return dateMatch[1];
            }
        }

        /* 3. Kalender-Toolbar-Titel */
        const calRoot = cell.closest(
            'app-availability-calendar, app-calendar-day-view, ' +
            '.usi-calendarSection, .usi-calendarParent'
        );

        if (calRoot) {
            const toolbar = calRoot.querySelector(
                '.chadmo-toolbar-title, ' +
                '[class*="calendarDate"], ' +
                '[class*="toolbar"] [class*="title"], ' +
                '[class*="toolbar"] [class*="date"], ' +
                '[class*="nav"] [class*="title"]'
            );

            if (toolbar) {
                return normalize(toolbar.textContent);
            }
        }

        return '';
    }

    /* ── Panel-DOM ───────────────────────────────────────────────────── */

    function buildPanel() {
        const panel = document.createElement('aside');
        panel.id = PANEL_ID;
        panel.setAttribute('aria-label', 'Ausgewählte Zeiträume');
        panel.setAttribute(PANEL_ATTR, 'true');

        const heading = document.createElement('h2');
        heading.textContent = 'Ausgewählte Zeiträume';
        panel.appendChild(heading);

        const list = document.createElement('ul');
        list.id = 'wu-cal-selection-list';
        panel.appendChild(list);

        const placeholder = document.createElement('p');
        placeholder.id = 'wu-cal-selection-placeholder';
        placeholder.textContent = 'Noch keine Zeiträume ausgewählt.';
        panel.appendChild(placeholder);

        const submitButton = document.createElement('button');
        submitButton.id = 'wu-cal-selection-submit';
        submitButton.type = 'button';
        submitButton.textContent = 'Weiter zum Ansuchen';
        submitButton.disabled = true;
        submitButton.setAttribute('aria-disabled', 'true');

        submitButton.addEventListener('click', function () {
            if (selections.length === 0) {
                return;
            }

            const payload = selections.map(function (entry) {
                return {
                    room: entry.room,
                    date: entry.date,
                    timeStart: entry.timeStart,
                    timeEnd: entry.timeEnd,
                    label: entry.label
                };
            });

            /*
             * CustomEvent für externe Integration.
             * Nachrüsten der Weiterleitung zur Buchungsseite hier:
             *   window.location.href = '/booking/new?...'
             */
            document.dispatchEvent(
                new CustomEvent('wu-cal-selection-submit', {
                    detail: { selections: payload },
                    bubbles: true
                })
            );

            console.info(
                '[WU Kalender] Ausgewählte Zeiträume:',
                payload
            );
        });

        panel.appendChild(submitButton);

        return panel;
    }

    function getOrCreatePanel(calendarRoot) {
        const existing = document.getElementById(PANEL_ID);

        if (existing) {
            return existing;
        }

        const panel = buildPanel();

        /*
         * Das Panel wird hinter dem Kalender-Root als Geschwister-Element
         * eingefügt. Der gemeinsame Elternteil erhält die Wrapper-Klasse
         * für das Flex-Layout (Kalender links, Panel rechts).
         */
        const parent = calendarRoot.parentElement;

        if (parent) {
            parent.classList.add(WRAPPER_CLASS);
            parent.insertBefore(panel, calendarRoot.nextSibling);
        } else {
            calendarRoot.insertAdjacentElement('afterend', panel);
        }

        return panel;
    }

    function removePanel() {
        const panel = document.getElementById(PANEL_ID);

        if (!panel) {
            return;
        }

        const parent = panel.parentElement;

        if (parent) {
            parent.classList.remove(WRAPPER_CLASS);
        }

        panel.remove();
    }

    /* ── Panel-Inhalt aktualisieren ─────────────────────────────────── */

    function renderSelectionList(panel) {
        const list = panel.querySelector('#wu-cal-selection-list');
        const placeholder = panel.querySelector(
            '#wu-cal-selection-placeholder'
        );
        const submitButton = panel.querySelector(
            '#wu-cal-selection-submit'
        );

        if (!list || !placeholder || !submitButton) {
            return;
        }

        list.innerHTML = '';

        if (selections.length === 0) {
            placeholder.style.display = '';
            submitButton.disabled = true;
            submitButton.setAttribute('aria-disabled', 'true');
            return;
        }

        placeholder.style.display = 'none';
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-disabled');

        selections.forEach(function (entry, index) {
            const li = document.createElement('li');
            li.className = 'wu-cal-selection-entry';

            const info = document.createElement('div');
            info.className = 'wu-cal-selection-info';

            const roomSpan = document.createElement('span');
            roomSpan.className = 'wu-cal-sel-room';
            roomSpan.textContent = entry.room;

            const timeSpan = document.createElement('span');
            timeSpan.className = 'wu-cal-sel-time';
            timeSpan.textContent = [entry.date, entry.label]
                .filter(Boolean)
                .join(', ');

            info.appendChild(roomSpan);
            info.appendChild(timeSpan);

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'wu-cal-sel-remove';
            removeBtn.setAttribute(
                'aria-label',
                'Auswahl entfernen: ' + entry.room
            );
            removeBtn.textContent = '×';

            removeBtn.addEventListener('click', function () {
                deselectEntry(index);
            });

            li.appendChild(info);
            li.appendChild(removeBtn);
            list.appendChild(li);
        });
    }

    function refreshPanel() {
        const calRoot = document.querySelector(CALENDAR_ROOT_SELECTOR);

        if (!calRoot) {
            removePanel();
            return;
        }

        const panel = getOrCreatePanel(calRoot);
        renderSelectionList(panel);
    }

    /* ── Selektion verwalten ────────────────────────────────────────── */

    function deselectEntry(index) {
        const entry = selections[index];

        if (!entry) {
            return;
        }

        if (entry.cell && entry.cell.isConnected) {
            entry.cell.classList.remove(SELECTED_CLASS);
        }

        selections.splice(index, 1);
        refreshPanel();
    }

    function deselectCell(cell) {
        const index = selections.findIndex(function (e) {
            return e.cell === cell;
        });

        if (index >= 0) {
            deselectEntry(index);
        }
    }

    function selectCell(cell) {
        if (selections.some(function (e) { return e.cell === cell; })) {
            deselectCell(cell);
            return;
        }

        cell.classList.add(SELECTED_CLASS);

        const timeLabel = getTimeLabel(cell);
        const dateLabel = getDateLabel(cell);

        /*
         * Von–Bis aus dem Zeitlabel extrahieren, wenn möglich.
         * Format: „08:00 – 09:00" oder „8:00-9:00"
         */
        let timeStart = '';
        let timeEnd = '';

        const rangeMatch = timeLabel.match(
            /(\d{1,2}[:h]\d{2})\s*[-–]\s*(\d{1,2}[:h]\d{2})/
        );

        if (rangeMatch) {
            timeStart = rangeMatch[1];
            timeEnd   = rangeMatch[2];
        } else {
            timeStart = timeLabel;
        }

        selections.push({
            cell: cell,
            room: getRoomName(cell),
            date: dateLabel,
            timeStart: timeStart,
            timeEnd: timeEnd,
            label: timeLabel
        });

        refreshPanel();
    }

    /* ── Zellen markieren ───────────────────────────────────────────── */

    function markCells(calendar) {
        const cells = calendar.querySelectorAll(CELL_SELECTOR);

        cells.forEach(function (cell) {
            if (!isFreeCell(cell)) {
                /* Gebuchte oder nicht-verfügbare Zellen bereinigen */
                cell.classList.remove(FREE_CLASS, SELECTED_CLASS);

                /*
                 * Wenn die Zelle noch in selections ist (z.B. wurde
                 * sie nachträglich gebucht), Eintrag entfernen und
                 * Panel aktualisieren.
                 */
                const staleIndex = selections.findIndex(function (e) {
                    return e.cell === cell;
                });

                if (staleIndex >= 0) {
                    selections.splice(staleIndex, 1);
                    refreshPanel();
                }

                return;
            }

            if (!cell.classList.contains(FREE_CLASS)) {
                cell.classList.add(FREE_CLASS);
            }
        });
    }

    function markAllCalendars() {
        document.querySelectorAll(
            '.chadmo, app-availability-calendar, app-calendar-day-view'
        ).forEach(markCells);
    }

    /* ── Klick-Handler ─────────────────────────────────────────────── */

    function handleCalendarClick(event) {
        const cell = event.target.closest(CELL_SELECTOR);

        if (!cell || !cell.classList.contains(FREE_CLASS)) {
            return;
        }

        /*
         * Klicks auf den Entfernen-Button im Panel nicht als
         * Zell-Klick werten (das Panel liegt außerhalb, aber
         * sicherheitshalber prüfen).
         */
        if (event.target.closest('#' + PANEL_ID)) {
            return;
        }

        selectCell(cell);
    }

    /* ── Selektion bei Ansichtswechsel leeren ───────────────────────── */

    function clearSelections() {
        selections.forEach(function (entry) {
            if (entry.cell && entry.cell.isConnected) {
                entry.cell.classList.remove(SELECTED_CLASS);
            }
        });

        selections = [];
        refreshPanel();
    }

    /* ── Styles ─────────────────────────────────────────────────────── */

    function ensureStyles() {
        if (document.getElementById(STYLE_ID)) {
            return;
        }

        const style = document.createElement('style');
        style.id = STYLE_ID;
        style.textContent = `
            /* ── Freie Zellen ──────────────────────────────────── */
            .${FREE_CLASS} {
                cursor: pointer !important;
                transition: background-color 0.1s ease !important;
            }

            .${FREE_CLASS}:hover {
                background-color: rgba(11, 128, 167, 0.12) !important;
                outline: 1px solid rgba(11, 128, 167, 0.35) !important;
                outline-offset: -1px !important;
            }

            .${FREE_CLASS}:focus-visible {
                outline: 2px solid #0b80a7 !important;
                outline-offset: -2px !important;
            }

            /* ── Ausgewählte Zellen ────────────────────────────── */
            .${SELECTED_CLASS} {
                background-color: #0b80a7 !important;
                color: #ffffff !important;
                outline: 2px solid #075f7d !important;
                outline-offset: -2px !important;
            }

            .${SELECTED_CLASS}:hover {
                background-color: #075f7d !important;
                outline-color: #054d63 !important;
            }

            /* ── Wrapper: Kalender + Panel nebeneinander ────────── */
            .${WRAPPER_CLASS} {
                display: flex !important;
                flex-direction: row !important;
                align-items: flex-start !important;
                gap: 16px !important;
                width: 100% !important;
                box-sizing: border-box !important;
            }

            .${WRAPPER_CLASS} > app-availability-calendar,
            .${WRAPPER_CLASS} > app-calendar-day-view,
            .${WRAPPER_CLASS} > .usi-calendarSection,
            .${WRAPPER_CLASS} > .usi-calendarParent {
                flex: 1 1 auto !important;
                min-width: 0 !important;
            }

            /* ── Auswahl-Panel ─────────────────────────────────── */
            #${PANEL_ID} {
                flex: 0 0 280px !important;
                width: 280px !important;
                min-width: 280px !important;
                max-width: 280px !important;
                padding: 16px !important;
                background: #ffffff !important;
                border: 1px solid #d2d2d2 !important;
                box-sizing: border-box !important;
                font-family: Verdana, Arial, sans-serif !important;
                font-size: 13px !important;
                color: #262626 !important;
            }

            #${PANEL_ID} h2 {
                margin: 0 0 12px !important;
                padding: 0 0 10px !important;
                border-bottom: 3px solid #0b80a7 !important;
                font-size: 15px !important;
                font-weight: 700 !important;
                color: #262626 !important;
            }

            #wu-cal-selection-list {
                list-style: none !important;
                margin: 0 0 12px !important;
                padding: 0 !important;
            }

            .wu-cal-selection-entry {
                display: flex !important;
                align-items: flex-start !important;
                justify-content: space-between !important;
                gap: 8px !important;
                padding: 8px 0 !important;
                border-bottom: 1px solid #ebebeb !important;
            }

            .wu-cal-selection-info {
                display: flex !important;
                flex-direction: column !important;
                gap: 2px !important;
                min-width: 0 !important;
            }

            .wu-cal-sel-room {
                font-weight: 700 !important;
                font-size: 12px !important;
                white-space: normal !important;
                word-break: break-word !important;
            }

            .wu-cal-sel-time {
                font-size: 11px !important;
                color: #555555 !important;
            }

            .wu-cal-sel-remove {
                flex: 0 0 auto !important;
                display: inline-flex !important;
                align-items: center !important;
                justify-content: center !important;
                width: 22px !important;
                height: 22px !important;
                padding: 0 !important;
                border: 1px solid #b0b0b0 !important;
                background: transparent !important;
                color: #555555 !important;
                font-size: 16px !important;
                line-height: 1 !important;
                cursor: pointer !important;
                border-radius: 50% !important;
            }

            .wu-cal-sel-remove:hover {
                border-color: #d32f2f !important;
                color: #d32f2f !important;
                background: rgba(211, 47, 47, 0.06) !important;
            }

            #wu-cal-selection-placeholder {
                font-size: 12px !important;
                color: #888888 !important;
                margin: 0 0 12px !important;
                font-style: italic !important;
            }

            #wu-cal-selection-submit {
                display: block !important;
                width: 100% !important;
                padding: 10px 16px !important;
                border: 0 !important;
                background: #0b80a7 !important;
                color: #ffffff !important;
                font-family: Verdana, Arial, sans-serif !important;
                font-size: 13px !important;
                font-weight: 700 !important;
                cursor: pointer !important;
                box-sizing: border-box !important;
                text-align: center !important;
                margin-top: 4px !important;
            }

            #wu-cal-selection-submit:hover:not(:disabled) {
                background: #075f7d !important;
            }

            #wu-cal-selection-submit:focus-visible {
                outline: 3px solid #0b80a7 !important;
                outline-offset: 2px !important;
            }

            #wu-cal-selection-submit:disabled,
            #wu-cal-selection-submit[aria-disabled="true"] {
                background: #b0b0b0 !important;
                cursor: default !important;
                opacity: 0.7 !important;
            }

            /* ── Responsive: Panel unter den Kalender ──────────── */
            @media (max-width: 900px) {
                .${WRAPPER_CLASS} {
                    flex-direction: column !important;
                }

                #${PANEL_ID} {
                    flex: none !important;
                    width: 100% !important;
                    min-width: 0 !important;
                    max-width: none !important;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* ── Initialisierung ────────────────────────────────────────────── */

    function initialize() {
        ensureStyles();
        markAllCalendars();
        refreshPanel();

        document.addEventListener('click', handleCalendarClick);

        let mutationPending = false;
        let previousCalendarKey = '';

        const observer = new MutationObserver(function () {
            if (mutationPending) {
                return;
            }

            mutationPending = true;

            window.requestAnimationFrame(function () {
                mutationPending = false;
                markAllCalendars();

                /*
                 * Erkennen ob der Kalender durch SPA-Navigation
                 * gewechselt hat (z.B. anderer Tag / andere Woche).
                 * Wenn das angezeigte Datum sich geändert hat,
                 * Selektionen leeren.
                 */
                const calRoot = document.querySelector(
                    CALENDAR_ROOT_SELECTOR
                );

                const toolbar = calRoot && calRoot.querySelector(
                    '.chadmo-toolbar-title, ' +
                    '[class*="calendarDate"], ' +
                    '[class*="toolbar"] [class*="title"], ' +
                    '[class*="nav"] [class*="title"]'
                );

                const currentKey = toolbar
                    ? (toolbar.textContent || '').trim()
                    : '';

                if (
                    previousCalendarKey !== '' &&
                    currentKey !== '' &&
                    currentKey !== previousCalendarKey
                ) {
                    clearSelections();
                }

                if (currentKey) {
                    previousCalendarKey = currentKey;
                }

                refreshPanel();
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initialize,
            { once: true }
        );
    } else {
        initialize();
    }
})();
