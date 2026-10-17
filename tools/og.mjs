// Renders the Open Graph images (1200×630) and the PNG app icons from the project's own fonts and assets.
// Optional tool: npm i -D playwright-core, then  node tools/og.mjs .   (CHROME_PATH overrides the Chrome location)
// The favicon itself is the brand kit's  02-Icon/favicon.svg  (the أحمد · Ahmed mark), copied into public/.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';

const project = process.argv[2];
const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const fonts = pathToFileURL(path.join(project, 'node_modules')).href;
const portrait = pathToFileURL(path.join(project, 'src/assets/portrait.webp')).href;
const html = fs.readFileSync(path.join(here, 'og.html'), 'utf8').replaceAll('FONTS', fonts).replaceAll('PORTRAIT', portrait);
const page = path.join(here, 'og.render.html');
fs.writeFileSync(page, html);

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  const tab = await ctx.newPage();
  // The OG images now come from the brand kit (E:/Ahmed-Brand/03-Social); pass --og to re-render the old template.
  for (const lang of process.argv.includes('--og') ? ['en', 'ar'] : []) {
    await tab.goto(`${pathToFileURL(page).href}?lang=${lang}`, { waitUntil: 'load' });
    await tab.evaluate(() => document.fonts.ready);
    await tab.waitForTimeout(400);
    const out = path.join(project, 'public', `og-${lang}.jpg`);
    await tab.screenshot({ path: out, type: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: 1200, height: 630 } });
    console.log(out, fs.statSync(out).size);
  }
  const svg = fs.readFileSync(path.join(project, 'public/favicon.svg'), 'utf8');
  for (const [name, size, pad] of [['apple-touch-icon.png', 180, 0], ['icon-192.png', 192, 0], ['icon-512.png', 512, 0], ['icon-maskable-512.png', 512, 60]]) {
    const ctxIcon = await browser.newContext({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
    const t = await ctxIcon.newPage();
    const inner = size - pad * 2;
    await t.setContent(`<html><body style="margin:0;background:#0C4A3E;display:grid;place-items:center;width:${size}px;height:${size}px">
      <div style="width:${inner}px;height:${inner}px">${svg.replace('width="64" height="64"', `width="${inner}" height="${inner}"`)}</div></body></html>`);
    const out = path.join(project, 'public', name);
    await t.screenshot({ path: out, omitBackground: false });
    console.log(out, fs.statSync(out).size);
    await ctxIcon.close();
  }
} finally {
  await browser.close();
}
