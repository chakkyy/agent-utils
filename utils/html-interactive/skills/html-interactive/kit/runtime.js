(function (root, factory) {
  const HI = factory();
  if (typeof module === 'object' && module.exports) module.exports = HI;
  else {
    root.HI = HI;
    if (root.document) HI.boot(root.document, root);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const SCHEMA = 1;
  const KIT_VERSION = '1.1.2';
  const ID_RE = /^[a-z0-9][a-z0-9-]*$/;
  const POSITIONAL_RE = /^(item|q|question|d|decision|opt|option|row|n)?-?\d+$/;
  const CONTROLS = ['choice', 'yesno', 'check', 'score', 'text'];
  const LAYOUTS = ['list', 'matrix', 'focus'];
  const NOTE_BY_DEFAULT = { choice: true, yesno: true, score: true, check: false, text: false };

  const STRINGS = {
    en: {
      answersHeading: 'Answers',
      answered: '{a} of {t} answered',
      statAnswered: 'answered',
      statPending: 'pending',
      statTotal: 'in total',
      sectionPending: '{n} to go',
      sectionDone: 'all answered',
      pending: 'PENDING',
      noteOnly: '(note only)',
      note: 'note',
      notePlaceholder: 'Something else, or a comment (optional)',
      noteShort: 'Comment',
      textPlaceholder: 'Write here',
      recommended: 'recommended',
      recommendedBulk: 'recommended, accepted in bulk',
      recommendedWas: 'recommended was: {x}',
      tradeoff: 'What you give up with the recommended option:',
      yes: 'Yes', no: 'No', unsure: 'Not sure',
      done: 'Done',
      notesTitle: 'Notes',
      notesHint: 'Anything that did not fit above.',
      orphansTitle: 'Earlier answers that no longer match this page',
      orphansExport: 'Orphaned answers (the page changed after they were given)',
      orphansBanner: 'Saved answers that no longer match this page: {n}. They are kept and go out with the export.',
      orphansDiscard: 'Discard them',
      incompatibleBanner: 'This browser holds answers saved by a newer version of this page. They are untouched, and this page is not saving so it cannot overwrite them. Copy or download what you answer here.',
      clearBlocked: 'Nothing was changed: the browser has no room to keep an undo copy. Download a backup first.',
      storageError: 'This browser is not saving. Copy or download your answers before closing the tab.',
      saved: 'Saved {time}',
      autosave: 'Saves automatically',
      copy: 'Copy answers',
      copied: 'Copied. Paste it in the chat',
      acceptRecommended: 'Accept recommended for the rest',
      accepted: 'Recommendations accepted: {n}',
      pendingOnly: 'Pending only',
      more: 'More',
      downloadMd: 'Download answers (.md)',
      backup: 'Download backup (.json)',
      importBackup: 'Import backup (.json)',
      clear: 'Clear all answers',
      undoClear: 'Restore what was cleared',
      clearTitle: 'Clear all answers?',
      clearBody: 'This removes the {n} answers and notes on this page. You can restore them from the menu until the next clear.',
      cancel: 'Cancel',
      confirmClear: 'Clear',
      cleared: 'Cleared',
      restored: 'Restored',
      undo: 'Undo',
      manualTitle: 'Copy it by hand',
      manualBody: 'This browser blocked the clipboard. The text is selected: copy it, or download it.',
      close: 'Close',
      importMismatch: 'That backup belongs to another page ({x}).',
      importInvalid: 'That file is not a backup of this page.',
      importTitle: 'Replace the current answers?',
      importBody: 'The backup from {time} will replace what is on screen now.',
      confirmImport: 'Replace',
      imported: 'Backup imported',
      theme: 'Switch between light and dark',
      invalidTitle: 'This page cannot be shown',
      sections: 'Sections',
    },
    es: {
      answersHeading: 'Respuestas',
      answered: '{a} de {t} respondidas',
      statAnswered: 'respondidas',
      statPending: 'pendientes',
      statTotal: 'en total',
      sectionPending: '{n} sin responder',
      sectionDone: 'todo respondido',
      pending: 'PENDIENTE',
      noteOnly: '(solo nota)',
      note: 'nota',
      notePlaceholder: 'Otra cosa o un comentario (opcional)',
      noteShort: 'Comentario',
      textPlaceholder: 'Escribir acá',
      recommended: 'recomendada',
      recommendedBulk: 'recomendada, aceptada en bloque',
      recommendedWas: 'la recomendada era: {x}',
      tradeoff: 'Qué se resigna con la recomendada:',
      yes: 'Sí', no: 'No', unsure: 'No sé',
      done: 'Hecho',
      notesTitle: 'Notas',
      notesHint: 'Lo que no entró en ninguna pregunta.',
      orphansTitle: 'Respuestas anteriores que ya no coinciden con esta página',
      orphansExport: 'Respuestas huérfanas (la página cambió después de darlas)',
      orphansBanner: 'Respuestas guardadas que ya no coinciden con esta página: {n}. Se conservan y salen en el export.',
      orphansDiscard: 'Descartarlas',
      incompatibleBanner: 'Este navegador tiene respuestas guardadas por una versión más nueva de esta página. Siguen intactas, y esta página no guarda para no pisarlas. Copiá o descargá lo que respondas acá.',
      clearBlocked: 'No se cambió nada: el navegador no tiene lugar para guardar la copia de deshacer. Descargá un respaldo primero.',
      storageError: 'Este navegador no está guardando. Copiá o descargá las respuestas antes de cerrar la pestaña.',
      saved: 'Guardado {time}',
      autosave: 'Se guarda solo',
      copy: 'Copiar respuestas',
      copied: 'Copiado. Pegalo en el chat',
      acceptRecommended: 'Aceptar recomendadas en las que faltan',
      accepted: 'Recomendadas aceptadas: {n}',
      pendingOnly: 'Solo pendientes',
      more: 'Más',
      downloadMd: 'Descargar respuestas (.md)',
      backup: 'Descargar respaldo (.json)',
      importBackup: 'Importar respaldo (.json)',
      clear: 'Borrar todas las respuestas',
      undoClear: 'Restaurar lo borrado',
      clearTitle: '¿Borrar todas las respuestas?',
      clearBody: 'Se quitan las {n} respuestas y notas de esta página. Se pueden restaurar desde el menú hasta el próximo borrado.',
      cancel: 'Cancelar',
      confirmClear: 'Borrar',
      cleared: 'Borrado',
      restored: 'Restaurado',
      undo: 'Deshacer',
      manualTitle: 'Copiar a mano',
      manualBody: 'Este navegador bloqueó el portapapeles. El texto está seleccionado: copialo o descargalo.',
      close: 'Cerrar',
      importMismatch: 'Ese respaldo es de otra página ({x}).',
      importInvalid: 'Ese archivo no es un respaldo de esta página.',
      importTitle: '¿Reemplazar las respuestas actuales?',
      importBody: 'El respaldo del {time} reemplaza lo que hay ahora en pantalla.',
      confirmImport: 'Reemplazar',
      imported: 'Respaldo importado',
      theme: 'Cambiar entre claro y oscuro',
      invalidTitle: 'Esta página no se puede mostrar',
      sections: 'Secciones',
    },
  };

  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const fill = (s, vars) => s.replace(/\{(\w+)\}/g, (_, k) => (vars && k in vars ? vars[k] : ''));
  const oneLine = (s) => String(s == null ? '' : s).replace(/\s*\n+\s*/g, ' ').replace(/\|/g, '/').trim();

  function slug(s) {
    return String(s == null ? '' : s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function strings(page) {
    const base = STRINGS[page && page.lang] || STRINGS.en;
    return Object.assign({}, base, isObj(page && page.strings) ? page.strings : {});
  }

  function controlOf(item) {
    const c = item && item.control;
    return isObj(c) ? c.type : c;
  }

  function findRecommended(options, rec) {
    if (rec == null) return null;
    const r = String(rec);
    return options.find((o) => o.id === r) || options.find((o) => o.label === r) || options.find((o) => o.id === slug(r)) || null;
  }

  function normalizeOptions(item, t) {
    const type = controlOf(item);
    if (type === 'yesno') return ['yes', 'no', 'unsure'].map((id) => ({ id, label: t[id] }));
    if (type !== 'choice') return [];
    const src = isObj(item.control) && item.control.options ? item.control.options : item.options;
    return (Array.isArray(src) ? src : []).map((o) =>
      isObj(o)
        ? { id: String(o.id == null ? slug(o.label) : o.id), label: String(o.label == null ? o.id : o.label), detail: o.detail ? String(o.detail) : '' }
        : { id: slug(o), label: String(o), detail: '' });
  }

  function normalizePage(raw) {
    const t = strings(raw);
    const page = Object.assign({}, raw, { lang: STRINGS[raw.lang] ? raw.lang : 'en' });
    page.sections = (Array.isArray(raw.sections) ? raw.sections : []).map((s) => Object.assign({}, s, {
      items: (Array.isArray(s.items) ? s.items : []).map((it) => {
        const type = controlOf(it);
        const cfg = isObj(it.control) ? it.control : {};
        const pick = (k, d) => (cfg[k] !== undefined ? cfg[k] : it[k] !== undefined ? it[k] : d);
        const options = normalizeOptions(it, t);
        const recOpt = findRecommended(options, pick('recommended', null));
        const para = (x) => (Array.isArray(x) ? x : x ? [x] : []).map(String);
        return {
          id: it.id,
          title: String(it.title == null ? '' : it.title),
          context: para(it.context),
          tradeoff: it.tradeoff ? String(it.tradeoff) : '',
          evidence: (Array.isArray(it.evidence) ? it.evidence : []).map((e) => (isObj(e) ? { src: e.src, caption: e.caption ? String(e.caption) : '' } : { src: e, caption: '' })),
          links: (Array.isArray(it.links) ? it.links : []).filter(isObj).map((l) => ({ label: String(l.label || l.href), href: String(l.href) })),
          type,
          options,
          recommended: recOpt ? recOpt.id : null,
          min: Number(pick('min', 0)),
          max: Number(pick('max', 3)),
          rubric: (Array.isArray(pick('rubric', [])) ? pick('rubric', []) : []).map(String),
          checkLabel: it.checkLabel ? String(it.checkLabel) : '',
          placeholder: it.placeholder ? String(it.placeholder) : '',
          note: it.note === undefined ? !!NOTE_BY_DEFAULT[type] : !!it.note,
        };
      }),
    }));
    return page;
  }

  function validatePage(raw) {
    const errors = [];
    const warnings = [];
    if (!isObj(raw)) return { errors: ['page: must be a JSON object'], warnings };
    if (typeof raw.id !== 'string' || !ID_RE.test(raw.id)) errors.push('page: "id" is required and must be a lowercase slug (a-z, 0-9, hyphens); it namespaces the saved answers');
    if (!raw.title || typeof raw.title !== 'string') errors.push('page: "title" is required');
    if (raw.lang && !STRINGS[raw.lang]) warnings.push(`page: lang "${raw.lang}" has no built-in strings; falling back to English (override with "strings")`);
    if (raw.layout === 'focus' && Array.isArray(raw.sections)) raw.sections.forEach((s) => (s && Array.isArray(s.items) ? s.items : []).forEach((it) => {
      if (!isObj(it)) return;
      const n = Array.isArray(it.options) ? it.options.length : 0;
      const ctx = [].concat(it.context || []).join(' ').length;
      if (n > 7) warnings.push(`item "${it.id}": ${n} options is too many for the focus layout; keep it to 7 or use list`);
      if (ctx > 320) warnings.push(`item "${it.id}": context is ${ctx} characters; in focus it is clamped to 4 lines, so shorten it or move detail into option details`);
    }));
    if (raw.layout !== undefined && !LAYOUTS.includes(raw.layout)) warnings.push(`page: layout "${raw.layout}" is unknown; use one of ${LAYOUTS.join(', ')} (falling back to list)`);
    if (!Array.isArray(raw.sections) || !raw.sections.length) {
      errors.push('page: "sections" must be a non-empty array');
      return { errors, warnings };
    }
    const sectionIds = new Set();
    const itemIds = new Map();
    raw.sections.forEach((s, si) => {
      const sw = `section[${si}]`;
      if (!isObj(s)) return errors.push(`${sw}: must be an object`);
      if (typeof s.id !== 'string' || !ID_RE.test(s.id)) errors.push(`${sw}: "id" is required and must be a lowercase slug`);
      else if (sectionIds.has(s.id)) errors.push(`${sw}: duplicate section id "${s.id}"`);
      else sectionIds.add(s.id);
      if (!s.title) errors.push(`${sw}: "title" is required`);
      if (s.layout !== undefined && (s.layout !== 'list' && s.layout !== 'matrix')) warnings.push(`${sw}: layout "${s.layout}" is not valid for a section; use list or matrix (focus is page-level only)`);
      if (!Array.isArray(s.items) || !s.items.length) return errors.push(`${sw}: "items" must be a non-empty array`);
      s.items.forEach((it, ii) => {
        const iw = `${sw}.items[${ii}]`;
        if (!isObj(it)) return errors.push(`${iw}: must be an object`);
        if (typeof it.id !== 'string' || !ID_RE.test(it.id)) errors.push(`${iw}: "id" is required and must be a lowercase slug`);
        else if (itemIds.has(it.id)) errors.push(`${iw}: duplicate item id "${it.id}" (already used at ${itemIds.get(it.id)}); item ids are unique across the whole page`);
        else {
          itemIds.set(it.id, iw);
          if (POSITIONAL_RE.test(it.id)) warnings.push(`${iw}: id "${it.id}" looks like a position; name the subject instead ("venue-city"), so reordering never crosses answers`);
        }
        if (!it.title) errors.push(`${iw}: "title" is required`);
        const type = controlOf(it);
        if (!CONTROLS.includes(type)) return errors.push(`${iw}: "control" must be one of ${CONTROLS.join(', ')}`);
        const cfg = isObj(it.control) ? it.control : {};
        const pick = (k) => (cfg[k] !== undefined ? cfg[k] : it[k]);
        if (type === 'choice') {
          const opts = normalizeOptions(it, STRINGS.en);
          if (opts.length < 2) errors.push(`${iw}: a choice needs at least two options`);
          const seen = new Set();
          const labels = new Set();
          opts.forEach((o) => {
            if (!o.id) errors.push(`${iw}: an option has an empty id`);
            else if (seen.has(o.id)) errors.push(`${iw}: duplicate option id "${o.id}"`);
            else if (labels.has(oneLine(o.label))) errors.push(`${iw}: two options share the same label "${oneLine(o.label)}"; the export could not tell them apart`);
            seen.add(o.id);
            labels.add(oneLine(o.label));
          });
        }
        if (type === 'choice' || type === 'yesno') {
          const rec = pick('recommended');
          if (rec != null) {
            if (!findRecommended(normalizeOptions(it, STRINGS.en), rec)) errors.push(`${iw}: "recommended" (${rec}) does not match any option id or label`);
          }
        } else if (pick('recommended') != null) warnings.push(`${iw}: "recommended" is ignored on a ${type} control`);
        if (type === 'score') {
          const min = pick('min') === undefined ? 0 : pick('min');
          const max = pick('max') === undefined ? 3 : pick('max');
          if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min >= max) errors.push(`${iw}: score needs integer "min" < "max"`);
          else if (max - min > 10) errors.push(`${iw}: score range is capped at 11 steps`);
          const rubric = pick('rubric');
          if (rubric !== undefined && (!Array.isArray(rubric) || rubric.length !== max - min + 1)) errors.push(`${iw}: "rubric" needs exactly one entry per score step (${max - min + 1})`);
        }
        if (it.evidence !== undefined) {
          if (!Array.isArray(it.evidence)) errors.push(`${iw}: "evidence" must be an array`);
          else it.evidence.forEach((e, ei) => {
            const src = isObj(e) ? e.src : e;
            if (typeof src !== 'string' || !src) errors.push(`${iw}.evidence[${ei}]: "src" is required`);
          });
        }
      });
    });
    return { errors, warnings };
  }

  const storageKey = (pageId) => `html-interactive:v${SCHEMA}:${pageId}`;

  function blankState(page) {
    return { schema: SCHEMA, page: page.id, updatedAt: null, answers: {}, notes: '', orphans: [], ui: {} };
  }

  function eachItem(page, fn) {
    page.sections.forEach((s) => s.items.forEach((it) => fn(it, s)));
  }

  function valueFits(item, v) {
    if (v == null) return true;
    if (item.type === 'choice' || item.type === 'yesno') return item.options.some((o) => o.id === v);
    if (item.type === 'score') return Number.isInteger(v) && v >= item.min && v <= item.max;
    if (item.type === 'check') return typeof v === 'boolean';
    if (item.type === 'text') return typeof v === 'string';
    return false;
  }

  function reconcile(page, saved) {
    const state = blankState(page);
    const out = { state, newOrphans: 0, incompatible: false };
    if (!isObj(saved)) return out;
    if (saved.schema !== SCHEMA) {
      out.incompatible = typeof saved.schema === 'number' && saved.schema > SCHEMA;
      return out;
    }
    if (saved.page && saved.page !== page.id) return out;
    const items = new Map();
    eachItem(page, (it) => items.set(it.id, it));
    const clean = (a) => {
      const r = { v: a.v === undefined ? null : a.v };
      if (typeof a.note === 'string' && a.note) r.note = a.note;
      if (a.via) r.via = a.via;
      if (a.t) r.t = a.t;
      if (a.l) r.l = a.l;
      if (a.at) r.at = a.at;
      return r;
    };
    const orphans = [];
    if (Array.isArray(saved.orphans)) saved.orphans.filter(isObj).forEach((o) => orphans.push(Object.assign({}, o)));
    if (isObj(saved.answers)) {
      Object.keys(saved.answers).forEach((id) => {
        const a = saved.answers[id];
        if (!isObj(a)) return;
        const it = items.get(id);
        const kept = clean(a);
        if (!it || !valueFits(it, kept.v)) {
          orphans.push(Object.assign({ id }, kept));
          out.newOrphans += 1;
          return;
        }
        if (kept.note && !it.note) {
          orphans.push({ id, v: null, note: kept.note, t: kept.t || it.title });
          out.newOrphans += 1;
          delete kept.note;
        }
        if (kept.v != null || kept.note) state.answers[id] = kept;
      });
    }
    orphans.forEach((o) => {
      const it = items.get(o.id);
      if (it && !state.answers[o.id] && valueFits(it, o.v === undefined ? null : o.v) && (!o.note || it.note)) {
        const a = clean(o);
        state.answers[o.id] = a;
      } else state.orphans.push(o);
    });
    if (typeof saved.notes === 'string') state.notes = saved.notes;
    if (isObj(saved.ui)) state.ui = Object.assign({}, saved.ui);
    if (saved.updatedAt) state.updatedAt = saved.updatedAt;
    return out;
  }

  const importable = (saved) => isObj(saved) && saved.schema === SCHEMA && isObj(saved.answers);

  function isAnswered(item, a) {
    if (!a) return false;
    const hasNote = item.note && typeof a.note === 'string' && a.note.trim() !== '';
    if (item.type === 'check') return a.v === true;
    if (item.type === 'text') return typeof a.v === 'string' && a.v.trim() !== '';
    return a.v != null || hasNote;
  }

  function progress(page, state) {
    const out = { total: 0, answered: 0, pending: 0, sections: {} };
    page.sections.forEach((s) => {
      const sec = { total: 0, answered: 0 };
      s.items.forEach((it) => {
        sec.total += 1;
        if (isAnswered(it, state.answers[it.id])) sec.answered += 1;
      });
      out.sections[s.id] = sec;
      out.total += sec.total;
      out.answered += sec.answered;
    });
    out.pending = out.total - out.answered;
    return out;
  }

  function labelOf(item, v) {
    if (item.type === 'choice' || item.type === 'yesno') {
      const o = item.options.find((x) => x.id === v);
      return oneLine(o ? o.label : v);
    }
    if (item.type === 'score') return `${v}/${item.max}` + (item.rubric[v - item.min] ? ` — ${oneLine(item.rubric[v - item.min])}` : '');
    return String(v);
  }

  function acceptRecommended(page, state) {
    let n = 0;
    eachItem(page, (it) => {
      if (!it.recommended || isAnswered(it, state.answers[it.id])) return;
      state.answers[it.id] = { v: it.recommended, via: 'bulk', t: it.title, l: labelOf(it, it.recommended), at: Date.now() };
      n += 1;
    });
    return n;
  }

  function exportMarkdown(page, state, opts) {
    const t = strings(page);
    const now = (opts && opts.now) || new Date();
    const pr = progress(page, state);
    const stamp = now.toISOString().slice(0, 16) + 'Z';
    const L = [];
    L.push(`<!-- html-interactive v${SCHEMA} · page=${page.id} · answered=${pr.answered}/${pr.total} · ${stamp} -->`);
    L.push(`# ${t.answersHeading} · ${oneLine(page.title)}`, '');
    L.push(fill(t.answered, { a: pr.answered, t: pr.total }) + (pr.pending ? ` · ${pr.pending} ${t.statPending}` : ''));
    page.sections.forEach((s) => {
      L.push('', `## ${oneLine(s.title)}`);
      s.items.forEach((it) => {
        const a = state.answers[it.id];
        let value;
        if (!isAnswered(it, a)) value = t.pending;
        else if (it.type === 'check') value = `**${t.done}**`;
        else if (it.type === 'text') value = `**${oneLine(a.v)}**`;
        else if (a.v == null) value = t.noteOnly;
        else {
          value = `**${labelOf(it, a.v)}**`;
          if (it.recommended) {
            if (a.v === it.recommended) value += ` (${a.via === 'bulk' ? t.recommendedBulk : t.recommended})`;
            else value += ` (${fill(t.recommendedWas, { x: labelOf(it, it.recommended) })})`;
          }
        }
        L.push(`- \`${it.id}\` ${oneLine(it.title)} → ${value}`);
        if (it.note && a && a.note && a.note.trim()) L.push(`  - ${t.note}: ${oneLine(a.note)}`);
      });
    });
    if (state.notes && state.notes.trim()) L.push('', `## ${t.notesTitle}`, ...state.notes.trim().split('\n').map((l) => `> ${l}`));
    if (state.orphans.length) {
      L.push('', `## ${t.orphansExport}`);
      state.orphans.forEach((o) => {
        const value = o.v == null ? t.noteOnly : oneLine(o.l || o.v);
        L.push(`- \`${o.id}\` ${oneLine(o.t || '')} → ${value}`.replace(/\s+→/, ' →'));
        if (o.note && String(o.note).trim()) L.push(`  - ${t.note}: ${oneLine(o.note)}`);
      });
    }
    return L.join('\n');
  }

  function boot(doc, win) {
    const host = doc.getElementById('hi-root');
    const dataEl = doc.getElementById('hi-data');
    if (!host || !dataEl) return;
    let raw;
    try {
      raw = JSON.parse(dataEl.textContent);
    } catch (e) {
      raw = null;
    }
    const check = validatePage(raw);
    if (check.errors.length) {
      const box = doc.createElement('div');
      box.className = 'hi-invalid';
      const h = doc.createElement('h1');
      h.textContent = strings(raw || {}).invalidTitle;
      const ul = doc.createElement('ul');
      check.errors.forEach((e) => {
        const li = doc.createElement('li');
        li.textContent = e;
        ul.appendChild(li);
      });
      box.append(h, ul);
      host.replaceChildren(box);
      return;
    }
    mount(normalizePage(raw), host, doc, win);
  }

  function mount(page, host, doc, win) {
    const t = strings(page);
    const KEY = storageKey(page.id);
    const UNDO_KEY = KEY + ':undo';
    const store = {
      ok: true,
      read(k) {
        try {
          const s = win.localStorage.getItem(k);
          return s ? JSON.parse(s) : null;
        } catch (e) {
          return null;
        }
      },
      write(k, v) {
        try {
          win.localStorage.setItem(k, JSON.stringify(v));
          return true;
        } catch (e) {
          return false;
        }
      },
      remove(k) {
        try {
          win.localStorage.removeItem(k);
        } catch (e) { /* storage unavailable */ }
      },
    };
    try {
      win.localStorage.setItem(KEY + ':probe', '1');
      win.localStorage.removeItem(KEY + ':probe');
    } catch (e) {
      store.ok = false;
    }

    const savedRaw = store.read(KEY);
    const rec = reconcile(page, savedRaw);
    let state = rec.state;
    const frozen = rec.incompatible;

    const el = (tag, attrs, ...kids) => {
      const n = doc.createElement(tag);
      if (attrs) Object.keys(attrs).forEach((k) => {
        const v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') n.className = v;
        else if (k === 'text') n.textContent = v;
        else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? '' : v);
      });
      kids.flat().forEach((c) => c != null && c !== false && n.append(c));
      return n;
    };
    const items = new Map();
    eachItem(page, (it) => items.set(it.id, it));
    const painters = [];
    const hasRecommended = [...items.values()].some((it) => it.recommended);

    const savedEl = el('span', { class: 'hi-saved', 'aria-live': 'polite', text: t.autosave });
    const toastEl = el('div', { class: 'hi-toast', role: 'status' });
    let toastTimer;
    function toast(msg, action) {
      toastEl.replaceChildren(el('span', { text: msg }));
      if (action) toastEl.append(el('button', { type: 'button', text: action.label, onclick: () => { action.run(); toastEl.classList.remove('on'); } }));
      toastEl.classList.add('on');
      win.clearTimeout(toastTimer);
      toastTimer = win.setTimeout(() => toastEl.classList.remove('on'), action ? 9000 : 2600);
    }

    function save() {
      state.updatedAt = Date.now();
      if (!frozen) store.ok = store.write(KEY, state);
      paintChrome();
    }

    function setAnswer(it, patch) {
      const cur = state.answers[it.id] || { v: null };
      const next = Object.assign({}, cur, patch);
      if ('v' in patch) {
        delete next.via;
        next.at = Date.now();
        next.t = it.title;
        if (patch.v != null && it.type !== 'text' && it.type !== 'check') next.l = labelOf(it, patch.v);
        else delete next.l;
      }
      const empty = (next.v == null || next.v === false || next.v === '') && !(next.note && next.note.trim());
      if (empty) delete state.answers[it.id];
      else state.answers[it.id] = next;
      save();
      paintItem(it.id);
    }

    function renderControl(it) {
      const name = `hi-${it.id}`;
      if (it.type === 'choice' || it.type === 'yesno') {
        const seg = it.type === 'yesno';
        const wrap = el('div', { class: seg ? 'hi-seg' : 'hi-opts', role: 'radiogroup', 'aria-label': it.title });
        const inputs = it.options.map((o) => {
          const input = el('input', { type: 'radio', name, value: o.id });
          input.addEventListener('click', () => {
            const cur = state.answers[it.id];
            setAnswer(it, { v: cur && cur.v === o.id ? null : o.id });
          });
          const isRec = it.recommended === o.id;
          wrap.append(el('label', { class: 'hi-opt' + (isRec ? ' is-rec' : '') }, input,
            el('span', { class: 'hi-opt-body' },
              el('span', { class: 'hi-opt-label', text: o.label }),
              isRec ? el('span', { class: 'hi-tag', text: t.recommended }) : null,
              o.detail ? el('span', { class: 'hi-opt-detail', text: o.detail }) : null)));
          return input;
        });
        painters.push([it.id, (a) => inputs.forEach((i) => { i.checked = !!a && a.v === i.value; })]);
        return wrap;
      }
      if (it.type === 'score') {
        const wrap = el('div', { class: 'hi-score' });
        const seg = el('div', { class: 'hi-seg', role: 'radiogroup', 'aria-label': it.title });
        const inputs = [];
        const rows = [];
        for (let v = it.min; v <= it.max; v += 1) {
          const input = el('input', { type: 'radio', name, value: String(v) });
          input.addEventListener('click', () => {
            const cur = state.answers[it.id];
            setAnswer(it, { v: cur && cur.v === v ? null : v });
          });
          inputs.push(input);
          seg.append(el('label', { class: 'hi-opt' }, input, el('span', { class: 'hi-opt-body' }, el('span', { class: 'hi-opt-label hi-num', text: String(v) }))));
        }
        wrap.append(seg);
        if (it.rubric.length) {
          const dl = el('dl', { class: 'hi-rubric' });
          it.rubric.forEach((r, i) => {
            const row = el('div', {}, el('dt', { class: 'hi-num', text: String(it.min + i) }), el('dd', { text: r }));
            rows.push(row);
            dl.append(row);
          });
          wrap.append(dl);
        }
        painters.push([it.id, (a) => {
          inputs.forEach((i) => { i.checked = !!a && String(a.v) === i.value; });
          rows.forEach((r, i) => r.classList.toggle('is-on', !!a && a.v === it.min + i));
        }]);
        return wrap;
      }
      if (it.type === 'check') {
        const input = el('input', { type: 'checkbox', id: name });
        input.addEventListener('change', () => setAnswer(it, { v: input.checked }));
        painters.push([it.id, (a) => { input.checked = !!a && a.v === true; }]);
        return el('label', { class: 'hi-check' }, input, el('span', { text: it.checkLabel || t.done }));
      }
      const ta = el('textarea', { class: 'hi-text', rows: '3', placeholder: it.placeholder || t.textPlaceholder, 'aria-label': it.title });
      ta.addEventListener('input', () => setAnswer(it, { v: ta.value }));
      painters.push([it.id, (a) => { if (doc.activeElement !== ta) ta.value = a && typeof a.v === 'string' ? a.v : ''; }]);
      return ta;
    }

    const lightbox = el('dialog', { class: 'hi-dialog hi-lightbox' });
    lightbox.addEventListener('click', () => lightbox.close());

    let counter = 0;
    function renderItem(it) {
      counter += 1;
      const rich = it.context.length || it.tradeoff || it.evidence.length;
      const q = el('div', { class: 'hi-q' },
        el('span', { class: 'hi-k hi-num', text: String(counter).padStart(2, '0') }),
        el('h3', { text: it.title }),
        it.context.map((p) => el('p', { text: p })),
        it.tradeoff ? el('p', { class: 'hi-tradeoff' }, el('strong', { text: t.tradeoff + ' ' }), it.tradeoff) : null,
        it.links.length ? el('p', { class: 'hi-links' }, it.links.map((l) => el('a', { href: l.href, target: '_blank', rel: 'noopener', text: l.label }))) : null,
        it.evidence.length ? el('div', { class: 'hi-ev' }, it.evidence.map((e) => {
          const img = el('img', { src: e.src, alt: e.caption, loading: 'lazy' });
          const btn = el('button', { type: 'button', class: 'hi-ev-btn', 'aria-label': e.caption || it.title }, img);
          btn.addEventListener('click', () => {
            lightbox.replaceChildren(el('img', { src: e.src, alt: e.caption }));
            lightbox.showModal();
          });
          return el('figure', {}, btn, e.caption ? el('figcaption', { text: e.caption }) : null);
        })) : null);
      const a = el('div', { class: 'hi-a' }, renderControl(it));
      if (it.note) {
        const ta = el('textarea', { class: 'hi-note', rows: rich ? '2' : '1', placeholder: rich ? t.notePlaceholder : t.noteShort, 'aria-label': `${t.note}: ${it.title}` });
        ta.addEventListener('input', () => setAnswer(it, { note: ta.value }));
        painters.push([it.id, (ans) => { if (doc.activeElement !== ta) ta.value = ans && ans.note ? ans.note : ''; }]);
        a.append(ta);
      }
      const cmp = it.type === 'choice' && it.evidence.length > 1 && it.evidence.length === it.options.length;
      return el('article', { class: 'hi-item' + (rich ? '' : ' is-compact') + (cmp ? ' is-compare' : ''), style: cmp ? `--n:${it.options.length}` : null, id: `hi-item-${it.id}`, 'data-id': it.id, 'data-control': it.type }, q, a);
    }

    function paintItem(id) {
      const it = items.get(id);
      const a = state.answers[id];
      painters.forEach(([pid, fn]) => pid === id && fn(a));
      const node = doc.getElementById(`hi-item-${id}`);
      if (node) node.dataset.state = isAnswered(it, a) ? 'done' : 'pending';
    }

    const stat = (cls, label) => {
      const b = el('b', { class: 'hi-num', text: '0' });
      return [el('div', { class: cls }, b, el('span', { text: label })), b];
    };
    const [statA, nA] = stat('hi-stat', t.statAnswered);
    const [statP, nP] = stat('hi-stat', t.statPending);
    const [statT, nT] = stat('hi-stat', t.statTotal);
    const barText = el('span', { class: 'hi-bar-text' });
    const barFill = el('span', { class: 'hi-track-fill' });
    const pills = el('nav', { class: 'hi-pills', 'aria-label': t.sections });
    const sectionCounts = {};
    const pillCounts = {};
    const banner = el('div', { class: 'hi-banners' });
    const recBtn = hasRecommended ? el('button', { type: 'button', class: 'hi-btn', text: t.acceptRecommended, onclick: () => {
      const n = acceptRecommended(page, state);
      save();
      paintAll();
      toast(fill(t.accepted, { n }));
    } }) : null;

    function paintBanners() {
      banner.replaceChildren();
      if (!store.ok) banner.append(el('p', { class: 'hi-banner is-err', text: t.storageError }));
      if (rec.incompatible) banner.append(el('p', { class: 'hi-banner is-warn', text: t.incompatibleBanner }));
      if (state.orphans.length) {
        const list = el('ul', {}, state.orphans.map((o) => el('li', {}, el('code', { text: o.id }), ` ${o.t || ''} → ${o.v == null ? t.noteOnly : o.l || o.v}${o.note ? ` · ${t.note}: ${o.note}` : ''}`)));
        banner.append(el('details', { class: 'hi-banner is-warn' },
          el('summary', { text: fill(t.orphansBanner, { n: state.orphans.length }) }), list,
          el('button', { type: 'button', class: 'hi-btn', text: t.orphansDiscard, onclick: () => { state.orphans = []; save(); } })));
      }
    }

    function paintChrome() {
      const pr = progress(page, state);
      nA.textContent = pr.answered;
      nP.textContent = pr.pending;
      nT.textContent = pr.total;
      barText.textContent = fill(t.answered, { a: pr.answered, t: pr.total });
      barFill.style.transform = `scaleX(${pr.total ? pr.answered / pr.total : 0})`;
      page.sections.forEach((s) => {
        const left = pr.sections[s.id].total - pr.sections[s.id].answered;
        sectionCounts[s.id].textContent = left ? fill(t.sectionPending, { n: left }) : t.sectionDone;
        pillCounts[s.id].textContent = left ? String(left) : '✓';
        pillCounts[s.id].parentNode.classList.toggle('is-clear', !left);
      });
      if (recBtn) {
        let open = 0;
        eachItem(page, (it) => { if (it.recommended && !isAnswered(it, state.answers[it.id])) open += 1; });
        recBtn.disabled = !open;
      }
      if (!store.ok || frozen) {
        savedEl.textContent = t.storageError;
        savedEl.classList.add('is-err');
      } else {
        savedEl.classList.remove('is-err');
        savedEl.textContent = state.updatedAt ? fill(t.saved, { time: new Date(state.updatedAt).toLocaleTimeString(page.lang, { hour: '2-digit', minute: '2-digit' }) }) : t.autosave;
      }
      undoItem.hidden = !store.read(UNDO_KEY);
      paintBanners();
    }

    function paintAll() {
      items.forEach((_, id) => paintItem(id));
      if (doc.activeElement !== notesTa) notesTa.value = state.notes || '';
      doc.body.classList.toggle('hi-pending-only', !!state.ui.pendingOnly);
      pendingToggle.setAttribute('aria-pressed', String(!!state.ui.pendingOnly));
      paintChrome();
    }

    function download(text, ext, mime) {
      const a = el('a', { href: URL.createObjectURL(new Blob([text], { type: mime })), download: `${page.id}-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.${ext}` });
      doc.body.append(a);
      a.click();
      a.remove();
    }

    const manual = el('dialog', { class: 'hi-dialog' });
    function showManual(text) {
      const ta = el('textarea', { class: 'hi-manual', rows: '12', readonly: true });
      ta.value = text;
      manual.replaceChildren(
        el('h2', { text: t.manualTitle }), el('p', { text: t.manualBody }), ta,
        el('div', { class: 'hi-dialog-actions' },
          el('button', { type: 'button', class: 'hi-btn', text: t.downloadMd, onclick: () => download(text, 'md', 'text/markdown') }),
          el('button', { type: 'button', class: 'hi-btn is-primary', text: t.close, onclick: () => manual.close() })));
      manual.showModal();
      ta.focus();
      ta.select();
    }

    async function copyAnswers() {
      const text = exportMarkdown(page, state, {});
      let ok = false;
      try {
        if (win.navigator.clipboard && win.navigator.clipboard.writeText) {
          await Promise.race([
            win.navigator.clipboard.writeText(text),
            new Promise((_, reject) => win.setTimeout(() => reject(new Error('clipboard timeout')), 800)),
          ]);
          ok = true;
        }
      } catch (e) {
        ok = false;
      }
      if (!ok) {
        const ta = el('textarea', { class: 'hi-offscreen' });
        ta.value = text;
        doc.body.append(ta);
        ta.select();
        try {
          ok = doc.execCommand('copy');
        } catch (e) {
          ok = false;
        }
        ta.remove();
      }
      if (ok) toast(t.copied);
      else showManual(text);
    }

    const confirmDlg = el('dialog', { class: 'hi-dialog' });
    function confirmBox(title, body, okLabel, run) {
      confirmDlg.replaceChildren(
        el('h2', { text: title }), el('p', { text: body }),
        el('div', { class: 'hi-dialog-actions' },
          el('button', { type: 'button', class: 'hi-btn', text: t.cancel, onclick: () => confirmDlg.close() }),
          el('button', { type: 'button', class: 'hi-btn is-danger', text: okLabel, onclick: () => { confirmDlg.close(); run(); } })));
      confirmDlg.showModal();
    }

    function restoreUndo() {
      const prev = store.read(UNDO_KEY);
      if (!prev) return;
      state = reconcile(page, prev).state;
      store.remove(UNDO_KEY);
      save();
      paintAll();
      toast(t.restored);
    }

    function clearAll() {
      const n = Object.keys(state.answers).length + (state.notes.trim() ? 1 : 0) + state.orphans.length;
      confirmBox(t.clearTitle, fill(t.clearBody, { n }), t.confirmClear, () => {
        if (!frozen && !store.write(UNDO_KEY, state)) return toast(t.clearBlocked);
        const ui = state.ui;
        state = blankState(page);
        state.ui = ui;
        save();
        paintAll();
        toast(t.cleared, { label: t.undo, run: restoreUndo });
      });
    }

    const fileInput = el('input', { type: 'file', accept: 'application/json,.json', hidden: true });
    fileInput.addEventListener('change', async () => {
      const f = fileInput.files[0];
      fileInput.value = '';
      if (!f) return;
      let data;
      try {
        data = JSON.parse(await f.text());
      } catch (e) {
        data = null;
      }
      const incoming = isObj(data) && isObj(data.state) ? data.state : null;
      if (!incoming || data.kit !== 'html-interactive' || !importable(incoming)) return toast(t.importInvalid);
      if (incoming.page !== page.id) return toast(fill(t.importMismatch, { x: incoming.page }));
      const when = new Date(incoming.updatedAt || data.exportedAt || Date.now()).toLocaleString(page.lang);
      confirmBox(t.importTitle, fill(t.importBody, { time: when }), t.confirmImport, () => {
        if (!frozen && !store.write(UNDO_KEY, state)) return toast(t.clearBlocked);
        state = reconcile(page, incoming).state;
        save();
        paintAll();
        toast(t.imported, { label: t.undo, run: restoreUndo });
      });
    });

    const menuItem = (label, run, cls) => el('button', { type: 'button', class: 'hi-menu-item' + (cls ? ' ' + cls : ''), text: label, onclick: (e) => { e.target.closest('details').open = false; run(); } });
    const undoItem = menuItem(t.undoClear, restoreUndo);
    const menu = el('details', { class: 'hi-menu' },
      el('summary', { class: 'hi-btn', 'aria-label': t.more, text: '⋯' }),
      el('div', { class: 'hi-menu-list' },
        menuItem(t.downloadMd, () => download(exportMarkdown(page, state, {}), 'md', 'text/markdown')),
        menuItem(t.backup, () => download(JSON.stringify({ kit: 'html-interactive', kitVersion: KIT_VERSION, exportedAt: Date.now(), state }, null, 2), 'json', 'application/json')),
        menuItem(t.importBackup, () => fileInput.click()),
        undoItem,
        menuItem(t.clear, clearAll, 'is-danger')));
    doc.addEventListener('click', (e) => { if (menu.open && !menu.contains(e.target)) menu.open = false; });

    const pendingToggle = el('button', { type: 'button', class: 'hi-btn hi-toggle', 'aria-pressed': 'false', text: t.pendingOnly, onclick: () => {
      state.ui.pendingOnly = !state.ui.pendingOnly;
      save();
      paintAll();
    } });

    const root = doc.documentElement;
    const themeBtn = el('button', { type: 'button', class: 'hi-theme', 'aria-label': t.theme, 'aria-pressed': 'false' }, el('span'));
    function setTheme(mode) {
      root.dataset.theme = mode;
      themeBtn.setAttribute('aria-pressed', String(mode === 'dark'));
    }
    const preferred = (page.theme && page.theme.mode) || (win.matchMedia && win.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(state.ui.theme || preferred);
    themeBtn.addEventListener('click', () => {
      state.ui.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(state.ui.theme);
      save();
    });

    const wordmark = page.wordmark || page.title;
    const notesTa = el('textarea', { class: 'hi-text', rows: '5', 'aria-label': t.notesTitle, placeholder: t.notesHint });
    notesTa.addEventListener('input', () => { state.notes = notesTa.value; save(); });

    const sections = page.sections.map((s) => {
      const count = el('span', { class: 'hi-count hi-num' });
      sectionCounts[s.id] = count;
      const pc = el('small', { class: 'hi-num' });
      pillCounts[s.id] = pc;
      pills.append(el('a', { href: `#${s.id}` }, s.title, pc));
      const sl = s.layout === 'list' || s.layout === 'matrix' ? s.layout : page.layout === 'matrix' ? 'matrix' : 'list';
      return el('section', { id: s.id, class: `hi-section hi-l-${sl}` },
        el('div', { class: 'hi-sh' }, el('h2', { text: s.title }), s.hint ? el('span', { class: 'hi-hint', text: s.hint }) : null, count),
        el('div', { class: 'hi-items' }, s.items.map(renderItem)));
    });

    host.replaceChildren(
      el('header', { class: 'hi-shell' },
        el('div', { class: 'hi-bar hi-wrap' }, el('a', { class: 'hi-wm', href: '#hi-top', text: wordmark }), pills, savedEl, themeBtn)),
      el('main', { id: 'hi-top', class: 'hi-wrap' },
        el('section', { class: 'hi-hero' },
          el('h1', { text: page.title }),
          page.lede ? el('p', { class: 'hi-lede', text: page.lede }) : null,
          el('div', { class: 'hi-statline', 'aria-live': 'polite' }, statA, statP, statT)),
        banner,
        sections,
        page.notes === false ? null : el('section', { id: 'hi-notes', class: 'hi-section' },
          el('div', { class: 'hi-sh' }, el('h2', { text: t.notesTitle }), el('span', { class: 'hi-hint', text: t.notesHint })), notesTa)),
      el('footer', { class: 'hi-foot hi-wrap' }, el('span', { class: 'hi-wm', text: wordmark }), el('span', { class: 'hi-meta hi-num', text: `${page.id} · html-interactive ${KIT_VERSION}` })),
      el('div', { class: 'hi-dock' },
        el('div', { class: 'hi-dock-in hi-wrap' },
          el('div', { class: 'hi-progress' }, barText, el('span', { class: 'hi-track' }, barFill)),
          recBtn, pendingToggle,
          el('button', { type: 'button', class: 'hi-btn is-primary', text: t.copy, onclick: copyAnswers }),
          menu)),
      toastEl, confirmDlg, manual, lightbox, fileInput);

    win.addEventListener('storage', (e) => {
      if (e.key !== KEY || frozen) return;
      const next = reconcile(page, store.read(KEY));
      if (next.incompatible) return;
      state = next.state;
      if (doc.activeElement && doc.activeElement.blur) doc.activeElement.blur();
      paintAll();
    });
    win.addEventListener('beforeunload', (e) => {
      if (store.ok || !Object.keys(state.answers).length) return;
      e.preventDefault();
      e.returnValue = '';
    });

    if (page.layout === 'focus') {
      const es = page.lang === 'es';
      const order = page.sections.flatMap((s) => s.items.map((it) => it.id));
      let i = Math.min(Math.max(0, Number(state.ui.step) || 0), order.length - 1);
      const main = host.querySelector('main');
      const node = (k) => doc.getElementById(`hi-item-${order[k]}`);
      const dots = el('div', { class: 'hi-dots' }, order.map((id, k) => {
        const d = el('button', { type: 'button', class: 'hi-dot', 'aria-label': `${k + 1}` });
        d.addEventListener('click', () => { i = k; show(); });
        return d;
      }));
      const n = el('span', { class: 'hi-step-n hi-num' });
      const prev = el('button', { type: 'button', class: 'hi-btn', text: es ? '← Anterior' : '← Previous' });
      const next = el('button', { type: 'button', class: 'hi-btn is-primary', text: es ? 'Siguiente →' : 'Next →' });
      let timer = null;
      const fit = (item) => {
        const box = item.closest('.hi-items');
        item.classList.remove('is-tall', 'is-open');
        if (box && box.scrollHeight > box.clientHeight + 2) item.classList.add('is-tall');
        const q = item.querySelector('.hi-q');
        let more = q.querySelector('.hi-more');
        const clamped = [...q.querySelectorAll(':scope > p')].some((p) => p.scrollHeight > p.clientHeight + 2);
        if (item.classList.contains('is-tall') && clamped && !more) {
          more = el('button', { type: 'button', class: 'hi-more', text: es ? 'Ver más' : 'Show more' });
          more.addEventListener('click', () => { item.classList.toggle('is-open'); more.textContent = item.classList.contains('is-open') ? (es ? 'Ver menos' : 'Show less') : (es ? 'Ver más' : 'Show more'); });
          q.append(more);
        }
        if (more) more.hidden = !item.classList.contains('is-tall') || !clamped;
      };
      win.addEventListener('resize', () => fit(node(i)));
      const paintDots = () => order.forEach((id, k) => {
        dots.children[k].className = 'hi-dot' + (k === i ? ' is-on' : '') + (node(k).dataset.state === 'done' ? ' is-done' : '');
      });
      new MutationObserver(paintDots).observe(main, { subtree: true, attributes: true, attributeFilter: ['data-state'] });
      const show = () => {
        clearTimeout(timer);
        order.forEach((id, k) => node(k).classList.toggle('is-current', k === i));
        fit(node(i));
        paintDots();
        n.textContent = `${i + 1} / ${order.length}`;
        prev.disabled = i === 0;
        next.disabled = i === order.length - 1;
        state.ui.step = i;
        save();
      };
      const go = (d) => { const j = i + d; if (j >= 0 && j < order.length) { i = j; show(); } };
      prev.addEventListener('click', () => go(-1));
      next.addEventListener('click', () => go(1));
      main.addEventListener('change', (e) => {
        if (e.target.type !== 'radio' || !node(i).contains(e.target)) return;
        const from = i;
        clearTimeout(timer);
        timer = setTimeout(() => { if (i === from) go(1); }, 320);
      });
      doc.addEventListener('keydown', (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey || (e.target.closest && e.target.closest('textarea, input, button, a, select, summary, dialog'))) return;
        if (/^[1-9]$/.test(e.key)) { const opt = node(i).querySelectorAll('.hi-opt input')[Number(e.key) - 1]; if (opt) { e.preventDefault(); opt.click(); } }
        else if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); go(1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
      });
      pills.querySelectorAll('a').forEach((a) => a.addEventListener('click', (e) => {
        const s = page.sections.find((x) => `#${x.id}` === a.getAttribute('href'));
        if (!s) return;
        e.preventDefault();
        i = order.indexOf(s.items[0].id);
        show();
      }));
      main.classList.add('hi-focus');
      pendingToggle.hidden = true;
      main.querySelector('.hi-hero').after(dots);
      main.insertBefore(el('div', { class: 'hi-stepnav' }, prev, n, next), doc.getElementById('hi-notes'));
      show();
    }

    if (rec.newOrphans && store.ok) store.write(KEY, state);
    paintAll();
  }

  return { SCHEMA, KIT_VERSION, LAYOUTS, slug, strings, validatePage, normalizePage, storageKey, reconcile, progress, isAnswered, importable, acceptRecommended, exportMarkdown, boot };
});
