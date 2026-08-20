import { chromium } from 'playwright';

// EDIT PER APP: target URL comes from env; token from env or a gitignored creds file.
export const TARGET = process.env.QA_TARGET; // e.g. https://your-preview.example.com
const TOKEN = process.env.QA_TOKEN;
// EDIT PER APP: substring that identifies your backend's API responses.
const API_MARKER = process.env.QA_API_MARKER ?? '/api/';
export const OUT = new URL('.', import.meta.url).pathname;

export async function boot({ mobile = false } = {}) {
  const browser = await chromium.launch({ args: ['--disable-blink-features=AutomationControlled'] });
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    serviceWorkers: 'block',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
  });
  await ctx.addInitScript(() => {
    Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', { get: () => undefined });
    const uad = { brands: [{ brand: 'Not=A?Brand', version: '8' }, { brand: 'Chromium', version: '139' }, { brand: 'Google Chrome', version: '139' }], mobile: false, platform: 'macOS', getHighEntropyValues: () => Promise.resolve({}), toJSON: () => ({}) };
    Object.defineProperty(Navigator.prototype, 'userAgentData', { get: () => uad });
  });
  const page = await ctx.newPage();
  const api = [];           // backend calls
  page.on('response', (r) => {
    if (r.url().includes(API_MARKER)) api.push(r.status() + ' ' + r.request().method() + ' ' + r.url());
  });
  await page.goto(TARGET + '/#/', { waitUntil: 'domcontentloaded' });
  // EDIT PER APP: token key and any extra flags your app reads at boot.
  await page.evaluate((t) => { localStorage.setItem('accessToken', t); }, TOKEN);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  return { browser, ctx, page, api };
}

export async function snap(page, name) {
  await page.screenshot({ path: OUT + name + '.png', fullPage: false });
  console.log('snap:', name);
}

export async function texts(page, sel) {
  return page.$$eval(sel, (els) => els.map((e) => (e.textContent || '').trim().slice(0, 70)));
}
