(() => {
  'use strict';

  const STYLE_ID = 'wu-series-weekday-state-style';

  function ensureStyles() {
    let style = document.getElementById(STYLE_ID);
    if (style) return style;

    style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      /* WU OSB: Veranstaltung-Serie – Wochentage nach aria-pressed darstellen */
      .wu-series-form .wu-series-weekdays mat-button-toggle:not(.wu-hidden-weekend),
      .wu-series-form .wu-series-weekdays .mat-button-toggle:not(.wu-hidden-weekend) {
        background: #ffffff !important;
        color: #0085AD !important;
        border-color: #0085AD !important;
      }

      .wu-series-form .wu-series-weekdays
      .mat-button-toggle-button[aria-pressed="false"] {
        background: #ffffff !important;
        color: #0085AD !important;
      }

      .wu-series-form .wu-series-weekdays
      .mat-button-toggle-button[aria-pressed="true"] {
        background: #0085AD !important;
        color: #ffffff !important;
      }

      .wu-series-form .wu-series-weekdays
      .mat-button-toggle-button[aria-pressed="false"]
      .mat-button-toggle-label-content {
        color: #0085AD !important;
      }

      .wu-series-form .wu-series-weekdays
      .mat-button-toggle-button[aria-pressed="true"]
      .mat-button-toggle-label-content {
        color: #ffffff !important;
      }

      .wu-series-form .wu-series-weekdays
      .mat-button-toggle-button[aria-pressed="false"]:hover {
        background: rgba(0, 133, 173, 0.08) !important;
      }

      .wu-series-form .wu-series-weekdays
      .mat-button-toggle-button:focus-visible {
        outline: 2px solid #0085AD !important;
        outline-offset: 2px !important;
      }
    `;

    document.head.appendChild(style);
    return style;
  }

  ensureStyles();
})();
