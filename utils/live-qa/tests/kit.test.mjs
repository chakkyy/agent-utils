import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = new URL('../', import.meta.url);
const source = await readFile(new URL('skills/live-qa/kit-template.mjs', root), 'utf8');
const ENV_KEYS = ['QA_TARGET', 'QA_TOKEN', 'QA_TOKEN_KEY', 'QA_ENTRY_PATH', 'QA_API_MARKER'];
const BASE_ENV = { QA_TARGET: 'https://example.invalid', QA_TOKEN: 'fixture-only', QA_TOKEN_KEY: 'session' };

// Loads the shipped template with a fake Playwright boundary: no browser starts
// and no app is exercised, so this checks the harness wiring only.
async function fixture(fn, env = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'live-qa-'));
  const saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
  const calls = [], handlers = {};
  const page = {
    on: (event, handler) => { handlers[event] = handler; },
    goto: async (...args) => calls.push(['goto', ...args]),
    evaluate: async (_fn, arg) => calls.push(['seed', arg]),
    reload: async (opts) => calls.push(['reload', opts]),
    waitForTimeout: async (n) => calls.push(['wait', n]),
    screenshot: async (opts) => calls.push(['screenshot', opts]),
    $$eval: async (_sel, map) => map([{ textContent: '  hello  ' }, { textContent: null }, { textContent: 'x'.repeat(100) }]),
  };
  const ctx = { addInitScript: async (_fn, arg) => calls.push(['init', arg]), newPage: async () => page };
  const browser = { version: () => '130.0.6723.31', newContext: async (opts) => { calls.push(['context', opts]); return ctx; } };
  globalThis.__liveQaChromium = { launch: async (opts) => { calls.push(['launch', opts]); return browser; } };
  for (const k of ENV_KEYS) delete process.env[k];
  for (const [k, v] of Object.entries({ ...BASE_ENV, ...env })) if (v !== undefined) process.env[k] = v;
  try {
    const path = join(dir, 'kit.mjs');
    await writeFile(path, source.replace("import { chromium } from 'playwright';", 'const chromium = globalThis.__liveQaChromium;'));
    const kit = await import(pathToFileURL(path));
    await fn({ kit, calls, handlers, page, browser, ctx });
  } finally {
    for (const [k, v] of Object.entries(saved)) v === undefined ? delete process.env[k] : (process.env[k] = v);
    delete globalThis.__liveQaChromium;
    await rm(dir, { recursive: true, force: true });
  }
}

const find = (calls, name) => calls.find((c) => c[0] === name);

test('the template still imports chromium from playwright', () => {
  assert.ok(source.includes("import { chromium } from 'playwright';"));
});

test('desktop context blocks service workers and sends desktop client hints', () => fixture(async ({ kit, calls }) => {
  await kit.boot();
  const opts = find(calls, 'context')[1];
  assert.deepEqual(opts.viewport, { width: 1440, height: 900 });
  assert.equal(opts.serviceWorkers, 'block');
  assert.equal(opts.isMobile, false);
  assert.equal(opts.extraHTTPHeaders['sec-ch-ua-mobile'], '?0');
  assert.match(opts.userAgent, /Chrome\/130\.0\.0\.0 Safari/);
}));

test('mobile context is a touch device that reports itself as mobile', () => fixture(async ({ kit, calls }) => {
  await kit.boot({ mobile: true });
  const opts = find(calls, 'context')[1];
  assert.deepEqual(opts.viewport, { width: 390, height: 844 });
  assert.equal(opts.isMobile, true);
  assert.equal(opts.hasTouch, true);
  assert.equal(opts.extraHTTPHeaders['sec-ch-ua-mobile'], '?1');
  assert.match(opts.userAgent, /Android.*Mobile Safari/);
  assert.equal(find(calls, 'init')[1].uad.mobile, true);
}));

test('session is seeded after the entry page loads and before the reload', () => fixture(async ({ kit, calls, page, browser, ctx }) => {
  const result = await kit.boot();
  assert.equal(result.page, page);
  assert.equal(result.browser, browser);
  assert.equal(result.ctx, ctx);
  assert.equal(find(calls, 'goto')[1], 'https://example.invalid/');
  assert.deepEqual(find(calls, 'seed')[1], ['session', 'fixture-only']);
  const order = ['goto', 'seed', 'reload'].map((name) => calls.findIndex((c) => c[0] === name));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
}));

test('QA_ENTRY_PATH is appended to the target', () => fixture(async ({ kit, calls }) => {
  await kit.boot();
  assert.equal(find(calls, 'goto')[1], 'https://example.invalid/#/');
}, { QA_ENTRY_PATH: '/#/' }));

test('API listener keeps only responses that match the marker', () => fixture(async ({ kit, handlers }) => {
  const { api } = await kit.boot();
  for (const url of ['https://example.invalid/api/items', 'https://example.invalid/logo.png']) {
    handlers.response({ url: () => url, status: () => 200, request: () => ({ method: () => 'GET' }) });
  }
  assert.deepEqual(api, ['200 GET https://example.invalid/api/items']);
}));

test('snap takes a viewport screenshot named after the case', () => fixture(async ({ kit, calls, page }) => {
  await kit.snap(page, 'case-1');
  const opts = find(calls, 'screenshot')[1];
  assert.equal(opts.fullPage, false);
  assert.ok(opts.path.endsWith('case-1.png'));
}));

test('texts trims, handles null and caps at 70 characters', () => fixture(async ({ kit, page }) => {
  assert.deepEqual(await kit.texts(page, 'p'), ['hello', '', 'x'.repeat(70)]);
}));

for (const [name, env] of [
  ['missing target', { QA_TARGET: undefined }],
  ['missing token', { QA_TOKEN: undefined }],
  ['missing token key', { QA_TOKEN_KEY: undefined }],
]) {
  test(`stops on a ${name} before launching a browser`, () => fixture(async ({ kit, calls }) => {
    await assert.rejects(kit.boot(), /no session to test with/);
    assert.equal(calls.length, 0);
  }, env));
}
