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
          if (hour === 12) hour = 0;
        } else if (hour !== 12) {
          hour += 12;
        }

        return String(hour).padStart(2, "0") + ":" + minutes;
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
     RAUMSPALTE AUTOMATISCH VERBREITERN
     ========================================================= */

  function adjustRoomColumnWidth() {
    const contents = document.querySelectorAll(
      ".rowHeadLeftCss3 .rowHeaderContent"
    );

    if (!contents.length) return;

    let widestContent = 0;

    contents.forEach(function (element) {
      const width = Math.max(
        element.scrollWidth,
        Math.ceil(element.getBoundingClientRect().width)
      );

      widestContent = Math.max(widestContent, width);
    });

    if (widestContent === 0) return;

    /* Innenabstände und Abstand rechts */
    const columnWidth = Math.ceil(widestContent + 32);

    document
      .querySelectorAll(".rowHeadLeftCss3")
      .forEach(function (element) {
        element.style.setProperty(
          "width",
          columnWidth + "px",
          "important"
        );

        element.style.setProperty(
          "min-width",
          columnWidth + "px",
          "important"
        );

        element.style.setProperty(
          "max-width",
          columnWidth + "px",
          "important"
        );
      });
  }

  let adjustmentPending = false;

  function scheduleAdjustment() {
    if (adjustmentPending) return;

    adjustmentPending = true;

    window.requestAnimationFrame(function () {
      adjustmentPending = false;
      adjustRoomColumnWidth();
    });
  }

  /* =========================================================
     START UND DYNAMISCHE ÄNDERUNGEN
     ========================================================= */

  function start() {
    if (!document.body) return;

    updateText(document.body);
    scheduleAdjustment();

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

      scheduleAdjustment();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    window.addEventListener("resize", scheduleAdjustment);
    window.addEventListener("load", scheduleAdjustment);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
