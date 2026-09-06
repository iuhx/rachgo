#!/usr/bin/env node
/**
 * One-command publishing for rachg.com.
 *
 *   node publish.mjs            scan articles/ → index.json + rss.xml → commit → push
 *   node publish.mjs --deploy   … also run `npx wrangler deploy` (or let Workers Builds do it)
 *   node publish.mjs --dry      regenerate index.json + rss.xml only, no git / deploy
 *
 * Workflow: drop `YYYY-MM-DD-my-post.md` into articles/, then run this.
 */
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const SITE_URL = 'https://rachg.com';   // ← change once the custom domain is live

const titleFrom = (f) => f
  .replace(/\.md$/i, '')
  .replace(/^\d{4}-\d{2}-\d{2}-/, '')
  .replace(/[-_]+/g, ' ')
  .trim();

const dateFrom = (f) => {
  const m = f.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : null;
};

/* 1. Scan articles/, newest first (date prefix wins, fallback: file mtime) */
const files = readdirSync('articles')
  .filter((f) => f.toLowerCase().endsWith('.md'))
  .map((f) => {
    const iso = dateFrom(f);
    const t = iso ? new Date(iso + 'T00:00:00') : statSync('articles/' + f).mtime;
    return { f, t };
  })
  .sort((a, b) => b.t - a.t)
  .map((x) => x.f);

writeFileSync('articles/index.json', JSON.stringify(files, null, 2) + '\n');
console.log(files.length ? 'index.json ← ' + files.join(', ') : 'index.json ← (no articles found)');

/* 1b. Scan notices/, newest first (date prefix wins, fallback: file mtime) */
const noticeFiles = readdirSync('notices')
  .filter((f) => f.toLowerCase().endsWith('.md'))
  .map((f) => {
    const iso = dateFrom(f);
    const t = iso ? new Date(iso + 'T00:00:00') : statSync('notices/' + f).mtime;
    return { f, t };
  })
  .sort((a, b) => b.t - a.t)
  .map((x) => x.f);

writeFileSync('notices/index.json', JSON.stringify(noticeFiles, null, 2) + '\n');
console.log(noticeFiles.length ? 'notices/index.json ← ' + noticeFiles.join(', ') : 'notices/index.json ← (no notices found)');
const unprefixed = noticeFiles.filter((f) => !dateFrom(f));
if (unprefixed.length) console.log('⚠ notices without a YYYY-MM-DD- prefix will show no date:', unprefixed.join(', '));

/* 2. Regenerate rss.xml */
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const items = files.map((f) => {
  const iso = dateFrom(f);
  const d = iso ? new Date(iso + 'T00:00:00') : statSync('articles/' + f).mtime;
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
       content change (newest article, newest notice, or about/index.md) */
const newest = [
  files.length ? (dateFrom(files[0]) ? dateFrom(files[0]) : statSync('articles/' + files[0]).mtime.toISOString().slice(0, 10)) : null,
  noticeFiles.length ? (dateFrom(noticeFiles[0]) ? dateFrom(noticeFiles[0]) : statSync('notices/' + noticeFiles[0]).mtime.toISOString().slice(0, 10)) : null,
  statSync('about/index.md').mtime.toISOString().slice(0, 10),
].filter(Boolean).sort().pop() || '2026-09-05';

writeFileSync('sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  '  <url>\n' +
  '    <loc>' + SITE_URL + '/</loc>\n' +
  '    <lastmod>' + newest + '</lastmod>\n' +
  '  </url>\n' +
  '</urlset>\n');
console.log('sitemap.xml written (lastmod ' + newest + ')');

/* 3. Commit + push (+ deploy) */
if (process.argv.includes('--dry')) {
  console.log('dry run — no git, no deploy');
  process.exit(0);
}

const sh = (cmd) => execSync(cmd, { stdio: 'inherit' });
sh('git add -A');
try {
  execSync('git diff --cached --quiet');
  console.log('nothing new to commit');
} catch (_) {
  sh('git commit -m "publish: update articles"');
  sh('git push');
}
if (process.argv.includes('--deploy')) sh('npx wrangler deploy');
console.log('done ✓');
