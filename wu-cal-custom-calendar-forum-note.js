(() => {
  'use strict';

  const STYLE_ID = 'wu-calendar-forum-note-style';
  const NOTE_CLASS = 'wu-calendar-forum-note';
  const HEADER_SELECTOR = '.usi-subpageHeader';
  const HEADING_SELECTOR = '.usi-subHeading';
  const DESKTOP_PARAGRAPH_SELECTOR = 'p.usi-desktop';
  const TARGET_HEADING = 'Verfügbarkeitskalender';
  const NOTE_MARKER = 'Hinweis: Das Forum';
  let updatePending = false;

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .${NOTE_CLASS} {
        margin-top: 12px;
      }

      .${NOTE_CLASS} .wu-calendar-forum-name {
        color: #0085ad;
        font-weight: 700;
      }

      .${NOTE_CLASS} .wu-calendar-forum-mail {
        color: #0085ad;
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);
  }

  function buildNote() {
    const note = document.createElement('p');
    note.className = `usi-desktop ${NOTE_CLASS}`;

    note.appendChild(document.createTextNode('Hinweis: Das '));

    const forum = document.createElement('strong');
    forum.className = 'wu-calendar-forum-name';
    forum.textContent = 'Forum';
    note.appendChild(forum);

    note.appendChild(document.createTextNode(
      ' kann nicht über SpaceBert angefragt werden. Die Verfügbarkeit erfragen Sie bitte unter '
    ));

    const mail = document.createElement('a');
    mail.className = 'wu-calendar-forum-mail';
    mail.href = 'mailto:events@wu.ac.at';
    mail.textContent = 'events@wu.ac.at';
    note.appendChild(mail);

    note.appendChild(document.createTextNode('.'));

    return note;
  }

  function findCalendarHeader() {
    return Array.from(document.querySelectorAll(HEADER_SELECTOR)).find(header => {
      const heading = header.querySelector(HEADING_SELECTOR);
      return heading?.textContent.trim() === TARGET_HEADING;
    }) || null;
  }

  function applyCalendarNote() {
    ensureStyles();

    const header = findCalendarHeader();
    if (!header) return false;

    const target = header.querySelector(DESKTOP_PARAGRAPH_SELECTOR);
    if (!target) return false;

    if (target.nextElementSibling?.classList.contains(NOTE_CLASS)) {
      return true;
    }

    const text = (target.textContent || '').replace(/\s+/g, ' ').trim();
    const noteStart = text.indexOf(NOTE_MARKER);
    if (noteStart === -1) return false;

    const intro = text.slice(0, noteStart).trim();
    if (!intro) return false;

    header.querySelector(`.${NOTE_CLASS}`)?.remove();

    target.textContent = intro;
    target.insertAdjacentElement('afterend', buildNote());

    return true;
  }

  function scheduleUpdate() {
    if (updatePending) return;
    updatePending = true;

    window.requestAnimationFrame(() => {
      updatePending = false;
      applyCalendarNote();
    });
  }

  function initialize() {
    applyCalendarNote();

    const observer = new MutationObserver(scheduleUpdate);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
