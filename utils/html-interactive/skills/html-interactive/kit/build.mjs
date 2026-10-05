#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const HELP = `html-interactive build

  node build.mjs <page.json> [-o <out.html>] [--no-embed] [--force]

Validates the page data and writes ONE self-contained HTML file (runtime, styles
and data inline). Local evidence images are embedded as data URIs unless
--no-embed is passed. An existing output is only overwritten when it is a
previous build of the same page id; --force overrides that check.`;

const here = dirname(fileURLToPath(import.meta.url));
const HI = createRequire(import.meta.url)(join(here, 'runtime.js'));
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.avif': 'image/avif' };
const EMBED_WARN_BYTES = 8 * 1024 * 1024;

const die = (msg) => {
  process.stderr.write(msg + '\n');
  process.exit(1);
};
const escHtml = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const safeJson = (v) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/[\u2028\u2029]/g, (c) => '\\u' + c.charCodeAt(0).toString(16));
const isColor = (s) => typeof s === 'string' && /^#[0-9a-fA-F]{3,8}$/.test(s);

const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) {
  process.stdout.write(HELP + '\n');
  process.exit(args.length ? 0 : 1);
}
let input = null;
let out = null;
let embed = true;
let force = false;
for (let i = 0; i < args.length; i += 1) {
  const a = args[i];
  if (a === '-o' || a === '--out') out = args[++i];
  else if (a === '--no-embed') embed = false;
  else if (a === '--force') force = true;
  else if (a.startsWith('-')) die(`unknown flag ${a}\n\n${HELP}`);
  else input = a;
}
if (!input) die(HELP);
input = resolve(input);
if (!existsSync(input)) die(`not found: ${input}`);

let page;
try {
  page = JSON.parse(readFileSync(input, 'utf8'));
} catch (e) {
  die(`${input} is not valid JSON: ${e.message}`);
}

const { errors, warnings } = HI.validatePage(page);
warnings.forEach((w) => process.stderr.write(`warning: ${w}\n`));
if (errors.length) die(`${basename(input)} is not a valid page:\n` + errors.map((e) => `  - ${e}`).join('\n'));

let embeddedBytes = 0;
if (embed) {
  for (const s of page.sections) for (const it of s.items) {
    if (!Array.isArray(it.evidence)) continue;
    it.evidence = it.evidence.map((e) => {
      const ev = typeof e === 'string' ? { src: e } : { ...e };
      if (/^(https?:|data:)/i.test(ev.src)) return ev;
      const file = resolve(dirname(input), ev.src);
      if (!existsSync(file)) die(`evidence image not found: ${ev.src} (item "${it.id}", resolved to ${file})`);
      const mime = MIME[extname(file).toLowerCase()];
      if (!mime) die(`evidence image type not supported: ${ev.src} (item "${it.id}")`);
      const buf = readFileSync(file);
      embeddedBytes += buf.length;
      ev.src = `data:${mime};base64,${buf.toString('base64')}`;
      return ev;
    });
  }
  if (embeddedBytes > EMBED_WARN_BYTES) process.stderr.write(`warning: ${(embeddedBytes / 1048576).toFixed(1)} MB of images embedded; shrink them or pass --no-embed\n`);
}

out = resolve(out || input.replace(/\.json$/i, '') + '.html');
const marker = `<meta name="html-interactive:page" content="${escHtml(page.id)}">`;
if (existsSync(out) && !force && !readFileSync(out, 'utf8').includes(marker)) {
  die(`refusing to overwrite ${out}: it is not a previous build of page "${page.id}". Pick another -o path, or pass --force if replacing it is intended.`);
}

const theme = page.theme && typeof page.theme === 'object' ? page.theme : {};
const vars = [];
if (isColor(theme.accent)) vars.push(`--hi-acc-base:${theme.accent}`);
if (isColor(theme.accentInk)) vars.push(`--hi-acc-ink:${theme.accentInk}`);
if (isColor(theme.accentDark)) vars.push(`--hi-acc-dark:${theme.accentDark}`);
if (isColor(theme.accentInkDark)) vars.push(`--hi-acc-ink-dark:${theme.accentInkDark}`);
const css = readFileSync(join(here, 'kit.css'), 'utf8')
  + (vars.length ? `\n:root{${vars.join(';')}}` : '')
  + (typeof page.css === 'string' ? `\n${page.css.replace(/<\/style/gi, '<\\/style')}` : '');
const runtime = readFileSync(join(here, 'runtime.js'), 'utf8');
if (/<\/script/i.test(runtime)) die('runtime.js contains a closing script tag; refusing to inline it');
const icon = typeof page.icon === 'string' && page.icon ? page.icon : '☑️';
const lang = HI.normalizePage(page).lang;

const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${marker}
<meta name="html-interactive:kit" content="${HI.KIT_VERSION}">
<title>${escHtml(page.title)}</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>${escHtml(icon)}</text></svg>">
<style>
${css}
</style>
</head>
<body>
<div id="hi-root"></div>
<noscript><p>${lang === 'es' ? 'Esta página necesita JavaScript para guardar y exportar las respuestas.' : 'This page needs JavaScript to save and export the answers.'}</p></noscript>
<script type="application/json" id="hi-data">${safeJson(page)}</script>
<script>
${runtime}
</script>
</body>
</html>
`;

writeFileSync(out, html);
const n = page.sections.reduce((a, s) => a + s.items.length, 0);
process.stdout.write(`${out}\n${n} items in ${page.sections.length} sections · ${(html.length / 1024).toFixed(0)} KB · page id "${page.id}" · kit ${HI.KIT_VERSION}\n`);
