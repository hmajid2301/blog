import fs from 'node:fs';
import lighthouse from '/tmp/blog-audit-session16/tools/node_modules/lighthouse/core/index.js';
import * as chromeLauncher from '/tmp/blog-audit-session16/tools/node_modules/chrome-launcher/dist/index.js';

const CHROME = '/nix/store/d9xv3v0b3a5sjn4qc27wb47p3pkhq9yn-playwright-browsers/chromium-1228/chrome-linux64/chrome';
const ROOT = '/tmp/blog17-verify/lh';
fs.mkdirSync(`${ROOT}/raw`, { recursive: true });

const routes = {
  posts: '/posts/',
  til: '/til/',
  projects: '/projects/',
  subscribe: '/subscribe/',
  series: '/series/',
  sitehistory: '/site-history/',
};
const blockedUrlPatterns = [
  '*://gc.zgo.at/*', '*://*.goatcounter.com/*', '*://plausible.haseebmajid.dev/*', '*://plausible.io/*',
];

const out = [];
for (let run = 1; run <= 2; run++) {
  for (const [name, path] of Object.entries(routes)) {
    let chrome;
    const id = `${name}-run${run}`;
    try {
      chrome = await chromeLauncher.launch({
        chromePath: CHROME,
        chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-background-networking'],
      });
      const result = await lighthouse(`http://127.0.0.1:1422${path}`, {
        port: chrome.port,
        logLevel: 'error',
        output: ['json'],
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        blockedUrlPatterns,
      });
      const lhr = result.lhr;
      const a = lhr.audits;
      const row = {
        id,
        path,
        categories: Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, v.score])),
        metrics: Object.fromEntries(
          ['first-contentful-paint', 'largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'speed-index'].map((k) => [k, a[k].numericValue]),
        ),
        cls_elements: (a['layout-shifts']?.details?.items ?? []).map((i) => ({ score: i.score, node: i.node?.selector, snippet: i.node?.snippet?.slice(0, 100) })),
        unsized: (a['unsized-images']?.details?.items ?? []).map((i) => i.url?.slice(0, 120)),
        tap_targets: (a['target-size']?.details?.items ?? []).slice(0, 8).map((i) => ({ node: i.node?.selector, snippet: i.node?.snippet?.slice(0, 120) })),
        contrast: (a['color-contrast']?.details?.items ?? []).slice(0, 6).map((i) => ({ node: i.node?.selector, snippet: i.node?.snippet?.slice(0, 140) })),
        failed: Object.entries(a).filter(([, v]) => v.score !== null && v.score < 1).map(([k, v]) => `${k}=${v.score}`),
      };
      fs.writeFileSync(`${ROOT}/raw/${id}.json`, JSON.stringify(lhr, null, 2));
      out.push(row);
      console.log(id, JSON.stringify(row.categories), 'cls=', row.metrics['cumulative-layout-shift'].toFixed(4));
    } finally {
      if (chrome) await chrome.kill();
    }
  }
}
fs.writeFileSync(`${ROOT}/summary.json`, JSON.stringify(out, null, 2));
