(function () {
  "use strict";

  /* =========================================================
     TEXTE UND UHRZEITEN ANPASSEN
     ========================================================= */

  function replaceText(text) {
    if (!text) return text;

    /* SPACE durch RAUM ersetzen */
    text = text.replace(/\bSPACE\b/gi, "RAUM");

    /* Uhrzeiten von AM/PM auf 24-Stunden-Format umstellen */
    return text.replace(
      /\b(1[0-2]|[1-9])(?::([0-5][0-9]))?\s*(AM|PM)\b/gi,
      function (_, hour, minutes, period) {
        hour = Number(hour);
        minutes = minutes || "00";

        if (period.toUpperCase() === "AM") {
          if (hour === 12) {
            hour = 0;
          }
        } else if (hour !== 12) {
          hour += 12;
        }

        return (
          String(hour).padStart(2, "0") +
          ":" +
          minutes
        );
      }
    );
  }

  function updateText(root) {
    if (!root) return;

    if (root.nodeType === Node.TEXT_NODE) {
      const changedText = replaceText(root.nodeValue);

      if (changedText !== root.nodeValue) {
        root.nodeValue = changedText;
      }

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
     START UND DYNAMISCH GELADENE INHALTE
     ========================================================= */

  function start() {
    if (!document.body) return;

    updateText(document.body);

    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          updateText(node);
        });

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

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
