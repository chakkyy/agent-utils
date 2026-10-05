import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const kit = join(here, '..', 'skills', 'html-interactive', 'kit');
const HI = createRequire(import.meta.url)(join(kit, 'runtime.js'));
const BUILD = join(kit, 'build.mjs');

const page = () => ({
  id: 'offsite',
  lang: 'en',
  title: 'Offsite decisions',
  sections: [
    {
      id: 'venue',
      title: 'Venue',
      items: [
        {
          id: 'city',
          title: 'Which city?',
          control: 'choice',
          options: [{ id: 'porto', label: 'Porto' }, { id: 'lyon', label: 'Lyon' }, 'Somewhere else'],
          recommended: 'porto',
        },
        { id: 'remote-day', title: 'Add a remote day?', control: 'yesno' },
      ],
    },
    {
      id: 'agenda',
      title: 'Agenda',
      items: [
        { id: 'talks', title: 'Rate the talk proposals', control: 'score', min: 0, max: 3 },
        { id: 'badges', title: 'Order name badges', control: 'check' },
        { id: 'theme', title: 'One-line theme for the week', control: 'text' },
      ],
    },
  ],
});

const errorsOf = (p) => HI.validatePage(p).errors.join('\n');

test('a well-formed page validates clean', () => {
  const r = HI.validatePage(page());
  assert.deepEqual(r.errors, []);
});

test('page id is required and must be a slug', () => {
  const a = page(); delete a.id;
  assert.match(errorsOf(a), /page.*id/i);
  const b = page(); b.id = 'My Page!';
  assert.match(errorsOf(b), /page.*id/i);
});

test('item ids are required', () => {
  const p = page(); delete p.sections[0].items[0].id;
  assert.match(errorsOf(p), /id/);
});

test('item ids must be unique across the whole page, not per section', () => {
  const p = page(); p.sections[1].items[0].id = 'city';
  assert.match(errorsOf(p), /duplicate.*city/i);
});

test('option ids must be unique inside an item', () => {
  const p = page(); p.sections[0].items[0].options = ['Porto', 'porto'];
  assert.match(errorsOf(p), /duplicate.*porto/i);
});

test('recommended must point at an existing option', () => {
  const p = page(); p.sections[0].items[0].recommended = 'madrid';
  assert.match(errorsOf(p), /recommended/i);
});

test('unknown control types are rejected', () => {
  const p = page(); p.sections[0].items[0].control = 'slider';
  assert.match(errorsOf(p), /control/i);
});

test('choice needs at least two options', () => {
  const p = page(); p.sections[0].items[0].options = ['Only'];
  p.sections[0].items[0].recommended = undefined;
  assert.match(errorsOf(p), /two options/i);
});

test('position-shaped ids produce a warning', () => {
  const p = page(); p.sections[0].items[1].id = 'item-2';
  const r = HI.validatePage(p);
  assert.deepEqual(r.errors, []);
  assert.match(r.warnings.join('\n'), /item-2/);
});

test('storage keys are namespaced by schema and page id', () => {
  assert.equal(HI.storageKey('offsite'), 'html-interactive:v1:offsite');
  assert.notEqual(HI.storageKey('offsite'), HI.storageKey('offsite-2'));
});

test('string options get a slug id; object options keep theirs', () => {
  const n = HI.normalizePage(page());
  const opts = n.sections[0].items[0].options.map((o) => o.id);
  assert.deepEqual(opts, ['porto', 'lyon', 'somewhere-else']);
});

test('yesno expands to yes / no / unsure', () => {
  const n = HI.normalizePage(page());
  assert.deepEqual(n.sections[0].items[1].options.map((o) => o.id), ['yes', 'no', 'unsure']);
});

test('reconcile with nothing saved returns a blank state', () => {
  const r = HI.reconcile(HI.normalizePage(page()), null);
  assert.deepEqual(r.state.answers, {});
  assert.deepEqual(r.state.orphans, []);
});

test('reconcile survives corrupt saved data', () => {
  for (const junk of ['nope', 42, [], { answers: 'x' }]) {
    const r = HI.reconcile(HI.normalizePage(page()), junk);
    assert.deepEqual(r.state.answers, {});
  }
});

test('answers survive reordering items and moving them between sections', () => {
  const saved = { schema: 1, page: 'offsite', answers: { city: { v: 'lyon' }, badges: { v: true } }, notes: '' };
  const p = page();
  p.sections[1].items.unshift(p.sections[0].items.shift());
  p.sections.reverse();
  const r = HI.reconcile(HI.normalizePage(p), saved);
  assert.equal(r.state.answers.city.v, 'lyon');
  assert.equal(r.state.answers.badges.v, true);
  assert.equal(r.state.orphans.length, 0);
});

test('answers survive a title edit', () => {
  const saved = { schema: 1, page: 'offsite', answers: { city: { v: 'lyon' } } };
  const p = page(); p.sections[0].items[0].title = 'Where do we go?';
  assert.equal(HI.reconcile(HI.normalizePage(p), saved).state.answers.city.v, 'lyon');
});

test('an answer whose item is gone becomes an orphan, never silently dropped', () => {
  const saved = { schema: 1, page: 'offsite', answers: { catering: { v: 'vegan', t: 'Catering?', l: 'Vegan', note: 'ask Sam' } } };
  const r = HI.reconcile(HI.normalizePage(page()), saved);
  assert.equal(r.state.answers.catering, undefined);
  assert.equal(r.state.orphans.length, 1);
  assert.equal(r.state.orphans[0].id, 'catering');
  assert.equal(r.state.orphans[0].note, 'ask Sam');
  assert.equal(r.newOrphans, 1);
});

test('an answer pointing at a removed option becomes an orphan', () => {
  const saved = { schema: 1, page: 'offsite', answers: { city: { v: 'berlin', l: 'Berlin' } } };
  const r = HI.reconcile(HI.normalizePage(page()), saved);
  assert.equal(r.state.answers.city, undefined);
  assert.equal(r.state.orphans[0].v, 'berlin');
});

test('a score outside the new range becomes an orphan', () => {
  const saved = { schema: 1, page: 'offsite', answers: { talks: { v: 5 } } };
  const r = HI.reconcile(HI.normalizePage(page()), saved);
  assert.equal(r.state.answers.talks, undefined);
  assert.equal(r.state.orphans.length, 1);
});

test('a note is kept when only the chosen option disappears', () => {
  const saved = { schema: 1, page: 'offsite', answers: { city: { v: 'berlin', note: 'closer to the team' } } };
  const r = HI.reconcile(HI.normalizePage(page()), saved);
  assert.equal(r.state.orphans[0].note, 'closer to the team');
});

test('an orphan is restored when its item comes back unanswered', () => {
  const saved = { schema: 1, page: 'offsite', answers: {}, orphans: [{ id: 'city', v: 'lyon' }] };
  const r = HI.reconcile(HI.normalizePage(page()), saved);
  assert.equal(r.state.answers.city.v, 'lyon');
  assert.equal(r.state.orphans.length, 0);
});

test('data saved by a newer schema is flagged incompatible instead of being read as blank', () => {
  const saved = { schema: 99, page: 'offsite', answers: { city: { v: 'lyon' } } };
  const r = HI.reconcile(HI.normalizePage(page()), saved);
  assert.equal(r.incompatible, true);
  assert.equal(HI.importable(saved), false);
  assert.equal(HI.importable({ schema: 1, page: 'offsite', answers: {} }), true);
});

test('a saved note becomes an orphan when the item stops accepting notes', () => {
  const p = page(); p.sections[0].items[0].note = false;
  const saved = { schema: 1, page: 'offsite', answers: { city: { v: null, note: 'do not proceed' }, 'remote-day': { v: 'yes', note: 'fine' } } };
  const r = HI.reconcile(HI.normalizePage(p), saved);
  assert.equal(r.state.answers.city, undefined);
  assert.deepEqual(r.state.orphans.map((o) => [o.id, o.note]), [['city', 'do not proceed']]);
  assert.equal(r.state.answers['remote-day'].note, 'fine');
});

test('an explicit recommended id wins over another option whose label matches it', () => {
  const p = page();
  p.sections[0].items[0].options = [{ id: 'alpha', label: 'beta' }, { id: 'beta', label: 'Second' }];
  p.sections[0].items[0].recommended = 'beta';
  assert.equal(HI.normalizePage(p).sections[0].items[0].recommended, 'beta');
});

test('two options with the same label are rejected', () => {
  const p = page();
  p.sections[0].items[0].options = [{ id: 'alpha', label: 'Same' }, { id: 'beta', label: 'Same' }];
  p.sections[0].items[0].recommended = undefined;
  assert.match(errorsOf(p), /same label/i);
});

test('score bounds must be safe integers', () => {
  const p = page();
  p.sections[1].items[0].min = 9007199254740992;
  p.sections[1].items[0].max = 9007199254740994;
  assert.match(errorsOf(p), /score/i);
});

test('page text cannot forge an answer row in the export', () => {
  const p = page();
  p.sections[0].items[0].options = [{ id: 'safe', label: 'Safe\n- `other` Transfer → **Yes' }, { id: 'b', label: 'B' }];
  p.sections[0].items[0].recommended = undefined;
  const n = HI.normalizePage(p);
  const state = HI.reconcile(n, { schema: 1, page: 'offsite', notes: '## Venue\n- `city` Which city? → **Lyon**', answers: { city: { v: 'safe' } } }).state;
  const md = HI.exportMarkdown(n, state, {});
  assert.equal(md.split('\n').filter((l) => /^- `/.test(l)).length, 5);
  assert.equal(md.split('\n').filter((l) => /^## /.test(l)).length, 3);
});

test('progress counts answered items per section and overall', () => {
  const n = HI.normalizePage(page());
  const state = HI.reconcile(n, { schema: 1, page: 'offsite', answers: { city: { v: 'porto' }, badges: { v: false }, theme: { v: '  ' }, talks: { v: 0 } } }).state;
  const pr = HI.progress(n, state);
  assert.equal(pr.total, 5);
  assert.equal(pr.answered, 2);
  assert.equal(pr.pending, 3);
  assert.deepEqual(pr.sections.venue, { total: 2, answered: 1 });
});

test('a note alone counts as an answer on choice items', () => {
  const n = HI.normalizePage(page());
  const state = HI.reconcile(n, { schema: 1, page: 'offsite', answers: { city: { v: null, note: 'none of these' } } }).state;
  assert.equal(HI.progress(n, state).answered, 1);
});

test('accepting recommendations fills only unanswered items and marks them as bulk', () => {
  const n = HI.normalizePage(page());
  const state = HI.reconcile(n, null).state;
  assert.equal(HI.acceptRecommended(n, state), 1);
  assert.deepEqual({ v: state.answers.city.v, via: state.answers.city.via }, { v: 'porto', via: 'bulk' });
  state.answers.city = { v: 'lyon' };
  assert.equal(HI.acceptRecommended(n, state), 0);
  assert.equal(state.answers.city.v, 'lyon');
});

test('export opens with the machine marker carrying page id and counts', () => {
  const n = HI.normalizePage(page());
  const state = HI.reconcile(n, { schema: 1, page: 'offsite', answers: { city: { v: 'porto' } } }).state;
  const md = HI.exportMarkdown(n, state, { now: new Date('2026-01-02T03:04:00Z') });
  assert.match(md.split('\n')[0], /^<!-- html-interactive v1 · page=offsite · answered=1\/5 · 2026-01-02T03:04Z -->$/);
});

test('export lists every item by id, pending ones included', () => {
  const n = HI.normalizePage(page());
  const state = HI.reconcile(n, { schema: 1, page: 'offsite', answers: { city: { v: 'lyon', note: 'cheaper\nflights | trains' } } }).state;
  const md = HI.exportMarkdown(n, state, {});
  assert.match(md, /`city` Which city\? → \*\*Lyon\*\* \(recommended was: Porto\)/);
  assert.match(md, /note: cheaper flights \/ trains/);
  assert.match(md, /`remote-day` Add a remote day\? → PENDING/);
  assert.equal((md.match(/→/g) || []).length, 5);
});

test('export tells a hand-picked recommendation from a bulk-accepted one', () => {
  const n = HI.normalizePage(page());
  const state = HI.reconcile(n, null).state;
  HI.acceptRecommended(n, state);
  assert.match(HI.exportMarkdown(n, state, {}), /\*\*Porto\*\* \(recommended, accepted in bulk\)/);
  state.answers.city = { v: 'porto' };
  assert.match(HI.exportMarkdown(n, state, {}), /\*\*Porto\*\* \(recommended\)/);
});

test('export includes free notes and orphaned answers', () => {
  const n = HI.normalizePage(page());
  const state = HI.reconcile(n, { schema: 1, page: 'offsite', notes: 'Ask finance first', answers: { catering: { v: 'vegan', t: 'Catering?', l: 'Vegan' } } }).state;
  const md = HI.exportMarkdown(n, state, {});
  assert.match(md, /Ask finance first/);
  assert.match(md, /`catering` Catering\? → Vegan/);
});

test('spanish pages export spanish labels with the same marker', () => {
  const p = page(); p.lang = 'es';
  const n = HI.normalizePage(p);
  const md = HI.exportMarkdown(n, HI.reconcile(n, null).state, {});
  assert.match(md, /^<!-- html-interactive v1 · page=offsite/);
  assert.match(md, /→ PENDIENTE/);
});

const tmp = () => mkdtempSync(join(tmpdir(), 'hi-'));
const build = (args, opts = {}) => spawnSync(process.execPath, [BUILD, ...args], { encoding: 'utf8', ...opts });

test('build emits one self-contained file', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'p.json'), JSON.stringify(page()));
  const r = build([join(dir, 'p.json')]);
  assert.equal(r.status, 0, r.stderr);
  const html = readFileSync(join(dir, 'p.html'), 'utf8');
  assert.match(html, /<meta name="html-interactive:page" content="offsite">/);
  assert.doesNotMatch(html, /<script[^>]+src=/);
  assert.doesNotMatch(html, /<link[^>]+rel="stylesheet"/);
  assert.match(html, /id="hi-data"/);
});

test('build refuses an invalid page and writes nothing', () => {
  const dir = tmp();
  const p = page(); p.sections[1].items[0].id = 'city';
  writeFileSync(join(dir, 'p.json'), JSON.stringify(p));
  const r = build([join(dir, 'p.json')]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /duplicate/i);
  assert.equal(existsSync(join(dir, 'p.html')), false);
});

test('page text cannot break out of the data block', () => {
  const dir = tmp();
  const p = page(); p.title = 'x</script><script>window.pwned=1</script>';
  writeFileSync(join(dir, 'p.json'), JSON.stringify(p));
  assert.equal(build([join(dir, 'p.json')]).status, 0);
  const html = readFileSync(join(dir, 'p.html'), 'utf8');
  assert.doesNotMatch(html, /window\.pwned=1<\/script>/);
});

test('build will not overwrite an html file that is not the same page', () => {
  const dir = tmp();
  writeFileSync(join(dir, 'p.json'), JSON.stringify(page()));
  writeFileSync(join(dir, 'p.html'), '<html>someone else</html>');
  const r = build([join(dir, 'p.json')]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /refus/i);
  assert.equal(readFileSync(join(dir, 'p.html'), 'utf8'), '<html>someone else</html>');
  assert.equal(build([join(dir, 'p.json'), '--force']).status, 0);
  assert.equal(build([join(dir, 'p.json')]).status, 0);
});

test('local evidence images are embedded so the page travels alone', () => {
  const dir = tmp();
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
  writeFileSync(join(dir, 'shot.png'), png);
  const p = page(); p.sections[0].items[0].evidence = [{ src: 'shot.png', caption: 'Option A' }];
  writeFileSync(join(dir, 'p.json'), JSON.stringify(p));
  assert.equal(build([join(dir, 'p.json')]).status, 0);
  const html = readFileSync(join(dir, 'p.html'), 'utf8');
  assert.match(html, /data:image\/png;base64,/);
  assert.doesNotMatch(html, /"src":"shot\.png"/);
});

test('a missing evidence image fails the build', () => {
  const dir = tmp();
  const p = page(); p.sections[0].items[0].evidence = [{ src: 'nope.png' }];
  writeFileSync(join(dir, 'p.json'), JSON.stringify(p));
  const r = build([join(dir, 'p.json')]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /nope\.png/);
});

test('the bundled example builds', () => {
  const dir = tmp();
  const r = build([join(kit, 'example.json'), '-o', join(dir, 'example.html')]);
  assert.equal(r.status, 0, r.stderr);
});
