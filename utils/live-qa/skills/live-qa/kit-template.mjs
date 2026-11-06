import { chromium } from 'playwright';

// EDIT PER APP: target URL comes from env; token from env or a gitignored creds file.
export const TARGET = process.env.QA_TARGET; // e.g. https://your-preview.example.com
const TOKEN = process.env.QA_TOKEN;
// EDIT PER APP: localStorage key your app reads the session token from.
const TOKEN_KEY = process.env.QA_TOKEN_KEY;
// EDIT PER APP: path that loads your app before the session exists (hash routers: '/#/').
const ENTRY_PATH = process.env.QA_ENTRY_PATH ?? '/';
// EDIT PER APP: substring that identifies your backend's API responses.
const API_MARKER = process.env.QA_API_MARKER ?? '/api/';
export const OUT = new URL('.', import.meta.url).pathname;

// EDIT PER APP: how a session reaches the browser. The default writes a token to
// localStorage; for cookies or a login form, replace this body and QA_TOKEN* below.
async function seedSession(page) {
  await page.evaluate(([key, token]) => { localStorage.setItem(key, token); }, [TOKEN_KEY, TOKEN]);
}
const REQUIRED = { QA_TARGET: TARGET, QA_TOKEN: TOKEN, QA_TOKEN_KEY: TOKEN_KEY };

const DESKTOP_OS = {
  darwin: { ua: 'Macintosh; Intel Mac OS X 10_15_7', platform: 'macOS' },
  win32: { ua: 'Windows NT 10.0; Win64; x64', platform: 'Windows' },
  linux: { ua: 'X11; Linux x86_64', platform: 'Linux' },
};
const MOBILE_OS = { ua: 'Linux; Android 10; K', platform: 'Android', navigatorPlatform: 'Linux armv81' };

// Every masked surface is derived from the running browser and the requested mode,
// so a pinned version can't go stale and mobile can't claim to be a desktop.
function clientIdentity(browserVersion, mobile) {
  const major = browserVersion.split('.')[0];
  const os = mobile ? MOBILE_OS : DESKTOP_OS[process.platform] ?? DESKTOP_OS.linux;
  const brands = [{ brand: 'Not=A?Brand', version: '8' }, { brand: 'Chromium', version: major }, { brand: 'Google Chrome', version: major }];
  return {
    userAgent: `Mozilla/5.0 (${os.ua}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${major}.0.0.0 ${mobile ? 'Mobile ' : ''}Safari/537.36`,
    uad: { brands, mobile, platform: os.platform },
    navigatorPlatform: os.navigatorPlatform,
    // Masking navigator alone leaves HeadlessChrome in the client-hint request headers.
    headers: {
      'sec-ch-ua': brands.map((b) => `"${b.brand}";v="${b.version}"`).join(', '),
      'sec-ch-ua-mobile': mobile ? '?1' : '?0',
      'sec-ch-ua-platform': `"${os.platform}"`,
    },
  };
}

export async function boot({ mobile = false } = {}) {
  const missing = Object.keys(REQUIRED).filter((name) => !REQUIRED[name]);
  if (missing.length) throw new Error(`Missing ${missing.join(', ')}: no session to test with. Set them, or edit seedSession for your app.`);
  const browser = await chromium.launch({ args: ['--disable-blink-features=AutomationControlled'] });
  const identity = clientIdentity(browser.version(), mobile);
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    isMobile: mobile,
    hasTouch: mobile,
    serviceWorkers: 'block',
    userAgent: identity.userAgent,
    extraHTTPHeaders: identity.headers,
  });
  await ctx.addInitScript(({ uad, navigatorPlatform }) => {
    Object.defineProperty(Object.getPrototypeOf(navigator), 'webdriver', { get: () => undefined });
    const fullVersionList = uad.brands.map((b) => ({ brand: b.brand, version: `${b.version}.0.0.0` }));
    const getHighEntropyValues = (hints = []) => Promise.resolve({ ...uad, ...(hints.includes('fullVersionList') && { fullVersionList }) });
    const data = { ...uad, getHighEntropyValues, toJSON: () => ({ ...uad }) };
    Object.defineProperty(Navigator.prototype, 'userAgentData', { get: () => data });
    if (navigatorPlatform) Object.defineProperty(Navigator.prototype, 'platform', { get: () => navigatorPlatform });
  }, identity);
  const page = await ctx.newPage();
  const api = [];           // backend calls
  page.on('response', (r) => {
    if (r.url().includes(API_MARKER)) api.push(r.status() + ' ' + r.request().method() + ' ' + r.url());
  });
  await page.goto(TARGET + ENTRY_PATH, { waitUntil: 'domcontentloaded' });
  await seedSession(page);
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
