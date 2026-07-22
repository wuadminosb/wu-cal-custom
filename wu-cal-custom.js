(function () {
  "use strict";

  /* =========================================================
     KONFIGURATION
     ========================================================= */

  const CSS_URL =
    "https://cdn.jsdelivr.net/gh/wuadminosb/wu-cal-custom@main/wu-cal-custom.css?v=4";


  /* =========================================================
     EXTERNES CSS LADEN
     ========================================================= */

  function loadExternalCss() {
    const existingLink = document.getElementById(
      "wu-cal-custom-css"
    );

    if (existingLink) {
      return;
    }

    const link = document.createElement("link");

    link.id = "wu-cal-custom-css";
    link.rel = "stylesheet";
    link.type = "text/css";
    link.href = CSS_URL;

    document.head.appendChild(link);
  }


  /* =========================================================
     TEXTE UND UHRZEITEN ANPASSEN
     ========================================================= */

  function replaceText(text) {
    if (!text) {
      return text;
    }

    /* SPACE durch RAUM ersetzen */
    let changedText = text.replace(/\bSPACE\b/gi, "RAUM");

    /* Uhrzeiten von AM/PM auf 24-Stunden-Format umstellen */
    changedText = changedText.replace(
      /\b(1[0-2]|[1-9])(?::([0-5][0-9]))?\s*(AM|PM)\b/gi,
      function (_, hour, minutes, period) {
        let convertedHour = Number(hour);
        const convertedMinutes = minutes || "00";

        if (period.toUpperCase() === "AM") {
          if (convertedHour === 12) {
            convertedHour = 0;
          }
        } else if (convertedHour !== 12) {
          convertedHour += 12;
        }

        return (
          String(convertedHour).padStart(2, "0") +
          ":" +
          convertedMinutes
        );
      }
    );

    return changedText;
  }

  function updateText(root) {
    if (!root) {
      return;
    }

    if (root.nodeType === Node.TEXT_NODE) {
      const parentTag = root.parentElement?.tagName;

      if (
        parentTag === "SCRIPT" ||
        parentTag === "STYLE" ||
        parentTag === "TEXTAREA"
      ) {
        return;
      }

      const changedText = replaceText(root.nodeValue);

      if (changedText !== root.nodeValue) {
        root.nodeValue = changedText;
      }

      return;
    }

    if (
      root.nodeType !== Node.ELEMENT_NODE &&
      root.nodeType !== Node.DOCUMENT_NODE &&
      root.nodeType !== Node.DOCUMENT_FRAGMENT_NODE
    ) {
      return;
    }

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT
    );

    let node;

    while ((node = walker.nextNode())) {
      const parentTag = node.parentElement?.tagName;

      if (
        parentTag === "SCRIPT" ||
        parentTag === "STYLE" ||
        parentTag === "TEXTAREA"
      ) {
        continue;
      }

      const changedText = replaceText(node.nodeValue);

      if (changedText !== node.nodeValue) {
        node.nodeValue = changedText;
      }
    }
  }


  /* =========================================================
     DYNAMISCH GELADENE INHALTE BEOBACHTEN
     ========================================================= */

  function observePage() {
    if (!document.body) {
      return;
    }

    updateText(document.body);

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach(function (node) {
            updateText(node);
          });
        }

        if (
          mutation.type === "characterData" &&
          mutation.target.nodeType === Node.TEXT_NODE
        ) {
          updateText(mutation.target);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }


  /* =========================================================
     START
     ========================================================= */

  function start() {
    loadExternalCss();
    observePage();
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      start,
      { once: true }
    );
  } else {
    start();
  }
})();
