(() => {
  'use strict';

  const STYLE_ID = 'wu-calendar-forum-note-style';
  const NOTE_CLASS = 'wu-calendar-forum-note';
  const TARGET_TEXT = 'Das Forum kann nicht über SpaceBert angefragt werden';
  const INTRO_TEXT = 'Der untenstehende Kalender bietet eine Übersicht';
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
    note.className = NOTE_CLASS;

    note.append(document.createTextNode('Hinweis: Das '));

    const forum = document.createElement('strong');
    forum.className = 'wu-calendar-forum-name';
    forum.textContent = 'Forum';
    note.append(forum);

    note.append(document.createTextNode(
      ' kann nicht über SpaceBert angefragt werden. Die Verfügbarkeit erfragen Sie bitte unter '
    ));

    const mail = document.createElement('a');
    mail.className = 'wu-calendar-forum-mail';
    mail.href = 'mailto:events@wu.ac.at';
    mail.textContent = 'events@wu.ac.at';
    note.append(mail, document.createTextNode('.'));

    return note;
  }

  function applyCalendarNote() {
    ensureStyles();

    const paragraphs = Array.from(document.querySelectorAll('p'));
    const target = paragraphs.find(paragraph => {
      const text = paragraph.textContent || '';
      return text.includes(INTRO_TEXT) && text.includes(TARGET_TEXT);
    });

    if (!target) return false;

    if (target.nextElementSibling?.classList.contains(NOTE_CLASS)) {
      return true;
    }

    const fullText = (target.textContent || '').replace(/\s+/g, ' ').trim();
    const noteStart = fullText.indexOf('Hinweis:');

    if (noteStart === -1) return false;

    const intro = fullText.slice(0, noteStart).trim();
    if (!intro) return false;

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
