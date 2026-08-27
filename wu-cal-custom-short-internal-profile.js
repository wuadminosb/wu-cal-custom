(() => {
  'use strict';

  const LOG = '[WU OSB Kurzprofil]';
  const SHORT = ['Besprechung', 'Workshop', 'Interne Weiterbildung'];
  const MANAGED = [
    ['Ist ein Besichtigungstermin erwünscht', 'Nein'],
    ['Handelt es sich um eine geschlossene oder öffentliche Veranstaltung', 'geschlossene'],
    ['Handelt es sich um eine wissenschaftliche Veranstaltung', 'Nein'],
    ['Handelt es sich bei Ihrer Veranstaltung um ein zertifiziertes Green Event', 'Nein'],
    ['Nehmen Sie für Ihre Veranstaltung eine Förderung in Anspruch', 'Nein'],
    ['Erheben Sie Teilnahmegebühren', 'Nein'],
    ['Handelt es sich um eine Kooperationsveranstaltung', 'Nein']
  ];
  const HIDE = [
    ...MANAGED.map(x => x[0]),
    'Wenn ja, in welcher Höhe',
    'Wenn ja, bitte den /die Kooperationspartner',
    'Wenn ja, bitte den / die Kooperationspartner',
    'Im Falle einer kostenpflichtigen Kooperationsveranstaltung',
    'Offizieller Firmenwortlaut',
    'Rechnungsadresse',
    'E-Mail: (für die Versendung der Rechnung)',
    'UID Nummer',
    'Umsatzsteuerbefreit'
  ];
  const HIDE_TEXT = [
    'Informationen für die Definierung der Kosteneinstufung',
    'Wenn eine externe Rechnung benötigt wird sind folgende Daten bekannt zu geben'
  ];
  const BTN = 'Zur Übersicht gehen';
  const CLS = 'wu-short-internal-hidden';
  const STYLE = 'wu-short-internal-style';
  const MASK = 'wu-short-internal-mask';

  let stopped = false, busy = false, timer = null, lastType = null;
  let snapshot = null, autoApplied = false, allowNative = false;

  const norm = v => String(v ?? '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ')
    .trim().toLocaleLowerCase('de').replace(/[.!?:;,]+$/g, '');
  const same = (a, b) => norm(a) === norm(b);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const paint = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  function fields() {
    const root = document.querySelector('app-dynamic-form');
    return root ? [...root.querySelectorAll('mat-form-field')] : [];
  }
  function label(f) {
    return (f?.querySelector('mat-label,label,.mat-mdc-floating-label')?.textContent || '')
      .replace(/\s+/g, ' ').trim();
  }
  function field(text) {
    const w = norm(text);
    return fields().filter(f => norm(label(f)).includes(w))
      .sort((a, b) => label(a).length - label(b).length)[0] || null;
  }
  function value(f) {
    if (!f) return '';
    const s = f.querySelector('mat-select');
    if (s) {
      const n = s.querySelector('.mat-mdc-select-value-text,.mat-select-value-text,.mat-mdc-select-min-line,.mat-select-value');
      return (n?.textContent || s.textContent || '').replace(/\s+/g, ' ').trim();
    }
    return f.querySelector('input,textarea')?.value?.trim() || '';
  }
  const type = () => value(field('Art der Veranstaltung'));
  const isShort = t => SHORT.some(x => same(t, x));

  function addStyle() {
    if (document.getElementById(STYLE)) return;
    const s = document.createElement('style');
    s.id = STYLE;
    s.textContent = `.${CLS}{display:none!important}#${MASK}{position:fixed;inset:0;z-index:2147483646;background:rgba(255,255,255,.98);display:flex;align-items:center;justify-content:center;font:600 16px Arial,sans-serif;color:#333;cursor:wait}`;
    document.head.appendChild(s);
  }
  function mask(text) {
    let m = document.getElementById(MASK);
    if (!m) { m = document.createElement('div'); m.id = MASK; document.body.appendChild(m); }
    m.textContent = text;
  }
  const unmask = () => document.getElementById(MASK)?.remove();
  const clearHide = () => document.querySelectorAll('.' + CLS).forEach(x => x.classList.remove(CLS));

  function hideText(text) {
    const w = norm(text);
    [...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,strong,span,div')]
      .filter(x => norm(x.textContent) === w)
      .filter(x => ![...x.children].some(c => norm(c.textContent) === w))
      .forEach(x => x.classList.add(CLS));
  }
  function shortView() {
    HIDE.forEach(x => field(x)?.classList.add(CLS));
    HIDE_TEXT.forEach(hideText);
  }
  function normalView() { clearHide(); }

  function takeSnapshot() {
    snapshot = new Map(MANAGED.map(([name]) => [name, value(field(name))]));
    autoApplied = false;
    console.info(LOG, 'Originalwerte gespeichert.');
  }

  function esc() {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Escape', code: 'Escape', keyCode: 27, which: 27,
      bubbles: true, cancelable: true
    }));
  }
  async function panel(select) {
    for (let i = 0; i < 30; i++) {
      await sleep(40);
      const id = select.getAttribute('aria-controls') || select.getAttribute('aria-owns');
      const p = id && document.getElementById(id);
      if (p) return p;
    }
    return null;
  }
  async function setSelect(name, wanted) {
    for (let attempt = 0; attempt < 4; attempt++) {
      let f = field(name);
      if (!f) return false;
      const cur = value(f);
      if (wanted === '' ? cur === '' : same(cur, wanted)) return true;

      f.classList.remove(CLS);
      const s = f.querySelector('mat-select');
      if (!s) return false;
      esc(); await sleep(50); s.click();
      const p = await panel(s);
      if (!p) { await sleep(120); continue; }

      const opts = [...p.querySelectorAll('mat-option,[role="option"]')];
      const opt = wanted === ''
        ? opts.find(o => !o.textContent.replace(/\s+/g, ' ').trim())
        : opts.find(o => same(o.textContent, wanted));
      if (!opt) { esc(); await sleep(100); continue; }
      opt.click();

      for (let i = 0; i < 40; i++) {
        await sleep(50);
        f = field(name);
        if (!f) continue;
        const actual = value(f);
        if (wanted === '' ? actual === '' : same(actual, wanted)) return true;
      }
      await sleep(150);
    }
    return false;
  }

  async function fillDefaults() {
    autoApplied = true;
    const out = [];
    for (const [name, wanted] of MANAGED) {
      const ok = await setSelect(name, wanted);
      const actual = value(field(name));
      out.push({ name, wanted, actual, ok: ok && same(actual, wanted) });
      await sleep(100);
    }
    shortView();
    return out;
  }

  async function restore() {
    if (!snapshot) { normalView(); return true; }
    if (!autoApplied) { snapshot = null; normalView(); return true; }

    mask('Angaben werden angepasst …'); await paint();
    const out = [];
    try {
      for (const [name] of MANAGED) {
        const wanted = snapshot.get(name) ?? '';
        const ok = await setSelect(name, wanted);
        const actual = value(field(name));
        out.push({ name, wanted, actual, ok: ok && (wanted === '' ? actual === '' : same(actual, wanted)) });
        await sleep(180);
      }
    } finally { unmask(); normalView(); }

    const pass = out.every(x => x.ok);
    if (pass) {
      snapshot = null; autoApplied = false;
      console.info(LOG, 'Ursprünglicher Formularzustand wiederhergestellt.');
    } else console.error(LOG, 'Restore unvollständig.', out);
    return pass;
  }

  async function onType(prev, cur) {
    const was = isShort(prev), now = isShort(cur);
    if (!was && now) { takeSnapshot(); shortView(); return; }
    if (was && now) { shortView(); return; }
    if (was && !now) { await restore(); return; }
    normalView();
  }

  async function reconcile() {
    if (stopped || busy) return;
    const cur = type();
    if (!cur) return; // Angular-SPA-Zwischenzustand
    if (!lastType || !same(cur, lastType)) {
      const prev = lastType; lastType = cur; busy = true;
      try { await onType(prev, cur); } finally { busy = false; }
      return;
    }
    if (isShort(cur)) shortView(); // idempotent nach Re-Render
  }

  function overviewButton() {
    return [...document.querySelectorAll('button,a,[role="button"]')]
      .find(x => same(x.textContent, BTN)) || null;
  }
  async function onClick(e) {
    const b = e.target.closest('button,a,[role="button"]');
    if (!b || !same(b.textContent, BTN)) return;
    if (allowNative) { allowNative = false; return; }
    if (!isShort(type())) return;

    e.preventDefault(); e.stopImmediatePropagation();
    if (busy) return;
    busy = true;
    try {
      if (!snapshot) takeSnapshot();
      mask('Angaben werden geprüft …'); await paint();

      const out = await fillDefaults();
      if (!out.every(x => x.ok)) {
        console.error(LOG, 'Hintergrundwerte unvollständig; Navigation gestoppt.', out);
        unmask(); shortView(); return;
      }

      shortView(); await paint();
      const fresh = overviewButton();
      if (!fresh) { console.error(LOG, 'Übersichts-Button nicht gefunden.'); unmask(); return; }

      allowNative = true;
      fresh.click();
      setTimeout(unmask, 1800);
    } catch (err) {
      console.error(LOG, err); unmask(); shortView();
    } finally { busy = false; }
  }

  function audit() {
    const rows = MANAGED.map(([name, def]) => {
      const f = field(name), orig = snapshot?.get(name);
      return {
        Feld: name, Default: def, Aktuell: value(f) || '(leer)',
        Original: snapshot ? (orig || '(leer)') : '(kein Snapshot)',
        Versteckt: !!f?.classList.contains(CLS)
      };
    });
    console.table(rows);
    return { type: type(), short: isShort(type()), snapshot: !!snapshot, autoApplied, busy, rows };
  }

  function stop() {
    stopped = true; clearInterval(timer);
    document.removeEventListener('click', onClick, true);
    unmask(); clearHide(); document.getElementById(STYLE)?.remove();
  }
  function start() {
    addStyle();
    document.addEventListener('click', onClick, true);
    timer = setInterval(reconcile, 250);
    reconcile();
    console.info(LOG, 'aktiv:', SHORT.join(', '));
  }

  window.__wuShortInternalProfileCleanup?.();
  window.__wuShortInternalProfileCleanup = stop;
  window.wuShortInternalProfile = { audit, reconcile, restore, stop };

  document.body ? start() : document.addEventListener('DOMContentLoaded', start, { once: true });
})();
