#!/usr/bin/env node
/**
 * One-command publishing for rachg.com.
 *
 *   node publish.mjs            articles/ + notices/ → indexes + rss.xml + sitemap + site/ → commit → push
 *   node publish.mjs --deploy   … also run `npx wrangler deploy` (or let Workers Builds do it)
 *   node publish.mjs --ci       regenerate everything, build site/, but skip git (for Workers Builds)
 *   node publish.mjs --dry      regenerate content + site/ only, no git / deploy
 *
 * Workflow: drop `YYYY-MM-DD-HHMMSS-my-post.md` into articles/, then run this.
 */
import { readdirSync, statSync, writeFileSync, rmSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const SITE_URL = 'https://rachg.com';   // ← change once the custom domain is live
const SITE_DIR = 'site';                // deployment output — wrangler.jsonc serves this folder

const titleFrom = (f) => f
  .replace(/\.md$/i, '')
  .replace(/^\d{4}-\d{2}-\d{2}(?:-\d{6})?-/, '')
  .replace(/[-_]+/g, ' ')
  .trim();

const dateFrom = (f) => {
  const m = f.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
};

/* 1. Scan articles/, newest first — ordering comes entirely from the
   filename: `YYYY-MM-DD-HHMMSS-slug.md` (time optional; date-only files
   sort at midnight). No git, no mtimes, pinned to UTC+8 — every
   environment agrees. */
const TZ = '+08:00';                            // the author's wall clock
function fileStamp(dir, f) {
  const m = f.match(/^(\d{4}-\d{2}-\d{2})(?:-(\d{6}))?/);
  if (m) {
    const time = m[2] ? m[2].replace(/(\d{2})(\d{2})(\d{2})/, '$1:$2:$3') : '00:00:00';
    const d = Date.parse(m[1] + 'T' + time + TZ);
    return isNaN(d) ? statSync(dir + '/' + f).mtime.getTime() : d;
  }
  return statSync(dir + '/' + f).mtime.getTime();   // no (valid) prefix → fall back to mtime
}

function orderNewestFirst(dir) {
  return readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.md'))
    .map((f) => ({ f, t: fileStamp(dir, f) }))
    .sort((a, b) => (b.t - a.t) || (a.f < b.f ? -1 : a.f > b.f ? 1 : 0))   // deterministic tiebreak (no localeCompare)
    .map((x) => x.f);
}

const files = orderNewestFirst('articles');
writeFileSync('articles/index.json', JSON.stringify(files, null, 2) + '\n');
console.log(files.length ? 'index.json ← ' + files.join(', ') : 'index.json ← (no articles found)');

/* 1b. Scan notices/, same ordering rules as articles */
const noticeFiles = orderNewestFirst('notices');

writeFileSync('notices/index.json', JSON.stringify(noticeFiles, null, 2) + '\n');
console.log(noticeFiles.length ? 'notices/index.json ← ' + noticeFiles.join(', ') : 'notices/index.json ← (no notices found)');
const unprefixed = noticeFiles.filter((f) => !dateFrom(f));
if (unprefixed.length) console.log('⚠ notices without a YYYY-MM-DD- prefix will show no date:', unprefixed.join(', '));

/* 2. Regenerate rss.xml */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const items = files.map((f) => {
  const d = new Date(fileStamp('articles', f));
  const link = SITE_URL + '/#/article/' + encodeURIComponent(f);
  return [
    '    <item>',
    '      <title>' + esc(titleFrom(f)) + '</title>',
    '      <link>' + link + '</link>',
    '      <guid>' + link + '</guid>',
    '      <pubDate>' + d.toUTCString() + '</pubDate>',
    '    </item>',
  ].join('\n');
}).join('\n');

writeFileSync('rss.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<rss version="2.0"><channel>\n' +
  '  <title>rachg.com</title>\n' +
  '  <link>' + SITE_URL + '</link>\n' +
  '  <description>Notes and projects from rachg.com</description>\n' +
  items + '\n' +
  '</channel></rss>\n');
/* 2b. sitemap.xml — canonical entry page; lastmod follows the freshest
       content stamp (newest article, newest notice, or about/index.md) */
const newestStamp = Math.max(
  files.length ? fileStamp('articles', files[0]) : 0,
  noticeFiles.length ? fileStamp('notices', noticeFiles[0]) : 0,
  existsSync('about/index.md') ? statSync('about/index.md').mtime.getTime() : 0
);
const localISODate = (ms) => {
  const d = new Date(ms);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
};
const lastmod = localISODate(newestStamp || Date.now());

writeFileSync('sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  '  <url>\n' +
  '    <loc>' + SITE_URL + '/</loc>\n' +
  '    <lastmod>' + lastmod + '</lastmod>\n' +
  '  </url>\n' +
  '</urlset>\n');
console.log('sitemap.xml written (lastmod ' + lastmod + ')');

/* 2c. Build the deployment folder — only what the visitor needs.
   .git, README, publish.mjs and other repo files never get uploaded. */
rmSync(SITE_DIR, { recursive: true, force: true });
mkdirSync(SITE_DIR, { recursive: true });
for (const f of ['index.html', '404.html', '_headers', 'robots.txt', 'sitemap.xml', 'rss.xml', 'og-image.png']) {
  if (existsSync(f)) cpSync(f, SITE_DIR + '/' + f);
}
for (const dir of ['articles', 'notices', 'about', 'fonts']) {
  if (existsSync(dir)) cpSync(dir, SITE_DIR + '/' + dir, { recursive: true });
}
console.log('site/ synced → ready for deploy');

/* 3. Commit + push (+ deploy) */
const IN_CI = !!process.env.CI;
const NO_GIT = process.argv.includes('--no-git') || process.argv.includes('--ci');
if (process.argv.includes('--dry')) {
  console.log('dry run — no git, no deploy');
  process.exit(0);
}

const sh = (cmd) => execSync(cmd, { stdio: 'inherit' });
if (IN_CI || NO_GIT) {
  console.log('CI/flag detected — skipping git (Workers Builds will deploy the freshly built site/)');
} else {
  sh('git add -A');
  try {
    execSync('git diff --cached --quiet');
    console.log('nothing new to commit');
  } catch (_) {
    sh('git commit -m "publish: update content"');
    sh('git push');
  }
}
if (process.argv.includes('--deploy')) sh('npx wrangler deploy');
console.log('done ✓');
