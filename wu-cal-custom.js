(function () {
  "use strict";

  function replaceText(text) {
    if (text.trim().toUpperCase() === "SPACE") {
      text = text.replace(/SPACE/i, "RAUM");
    }

    return text.replace(
      /\b(1[0-2]|[1-9])\s*(AM|PM)\b/gi,
      function (_, hour, period) {
        hour = Number(hour);

        if (period.toUpperCase() === "AM") {
          if (hour === 12) hour = 0;
        } else if (hour !== 12) {
          hour += 12;
        }

        return String(hour).padStart(2, "0") + ":00";
      }
    );
  }

  function update(root) {
    if (!root) return;

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT
    );

    let node;

    while ((node = walker.nextNode())) {
      if (["SCRIPT", "STYLE", "TEXTAREA"].includes(
        node.parentElement?.tagName
      )) continue;

      const changed = replaceText(node.nodeValue);

      if (changed !== node.nodeValue) {
        node.nodeValue = changed;
      }
    }
  }

  function start() {
    update(document.body);

    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === Node.TEXT_NODE) {
            const changed = replaceText(node.nodeValue);
            if (changed !== node.nodeValue) node.nodeValue = changed;
          } else {
            update(node);
          }
        });
      });
    }).observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
