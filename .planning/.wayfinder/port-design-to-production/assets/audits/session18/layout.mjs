import { chromium } from '/tmp/blog-audit-session16/tools/node_modules/playwright-core/index.mjs';
import fs from 'node:fs';

const CHROME = '/nix/store/d9xv3v0b3a5sjn4qc27wb47p3pkhq9yn-playwright-browsers/chromium-1228/chrome-linux64/chrome';
const BASE = 'http://127.0.0.1:1422';
const OUT = '/tmp/blog17-verify';
fs.mkdirSync(`${OUT}/shots`, { recursive: true });

const routes = {
  home: '/',
  posts: '/posts/',
  til: '/til/',
  projects: '/projects/',
  subscribe: '/subscribe/',
  series: '/series/',
  sitehistory: '/site-history/',
  article: '/posts/2024-09-06-how-to-setup-authentik-forward-auth-with-traefik-on-nixos/',
};
const palettes = [
  ['cat', 'light'],
  ['cat', 'dark'],
  ['fireside', 'light'],
  ['fireside', 'dark'],
];
const widths = [390, 1440];

const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const report = [];
const consoleErrors = [];

for (const width of widths) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(`${width} ${m.text().slice(0, 160)}`); });
  page.on('pageerror', (e) => consoleErrors.push(`${width} pageerror ${String(e).slice(0, 160)}`));

  for (const [theme, mode] of palettes) {
    await page.goto(`${BASE}/`, { waitUntil: 'load' });
    await page.evaluate(([t, m]) => {
      localStorage.setItem('pref-palette', t);
      localStorage.setItem('pref-mode', m);
    }, [theme, mode]);

    for (const [name, path] of Object.entries(routes)) {
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
      const state = await page.evaluate(() => {
        const html = document.documentElement;
        const nav = document.querySelector('#menu');
        const navRect = nav?.getBoundingClientRect();
        const items = [...document.querySelectorAll('#menu a')].map((a) => ({
          text: a.textContent.trim(),
          box: a.getBoundingClientRect().toJSON(),
        }));
        return {
          theme: html.dataset.theme,
          mode: html.dataset.mode,
          overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          navItems: items.map((i) => i.text),
          navRows: new Set(items.map((i) => Math.round(i.box.top))).size,
          navRight: navRect ? Math.round(navRect.right) : null,
          viewport: window.innerWidth,
        };
      });
      report.push({ width, theme, mode, name, path, ...state });
      if (width === 390 || (width === 1440 && (theme === 'cat' && mode === 'light' || theme === 'fireside' && mode === 'dark'))) {
        await page.screenshot({ path: `${OUT}/shots/${name}-${width}-${theme}-${mode}.png`, fullPage: name !== 'article' });
      }
    }
  }
  await ctx.close();
}

await browser.close();
fs.writeFileSync(`${OUT}/layout.json`, JSON.stringify(report, null, 2));
fs.writeFileSync(`${OUT}/console-errors.json`, JSON.stringify([...new Set(consoleErrors)], null, 2));

const bad = report.filter((r) => r.overflowX > 1 || r.navRows > 1 || r.theme === undefined);
console.log('checked', report.length, 'page loads');
console.log('overflow/nav problems:', bad.length);
for (const r of bad) console.log(' ', r.width, r.theme, r.mode, r.name, 'overflowX=', r.overflowX, 'navRows=', r.navRows);
console.log('console errors:', new Set(consoleErrors).size);
