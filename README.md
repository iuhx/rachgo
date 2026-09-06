# rachgo

[rachg.com](https://rachg.com) — a personal home on the web. Single-page, single-file,
built as a study in Apple-style fluid interface design: interruptible springs, gesture
velocity hand-off, momentum projection and glass materials.

## Structure

```
index.html      the whole site (name, tagline and email are set here)
articles/       markdown articles + index.json
notices/        one-line-ish notices, newest first (shown in row i)
about/index.md  the About panel body (row iii)
fonts/          self-hosted Sora / Inter / Cinzel (variable woff2)
publish.mjs     one-command publishing (articles + notices)
rss.xml         feed, regenerated on publish
robots.txt      crawler rules + sitemap pointer
sitemap.xml     regenerated on publish
_headers        security & caching headers
site/           deployment output, built by publish.mjs (what Cloudflare serves)
wrangler.jsonc  Cloudflare Workers static-assets config
```

## Notices & about

Notices are markdown files in `notices/`, named `YYYY-MM-DD-slug.md` —
the date prefix becomes the date shown beside the notice, the body renders
as markdown. About is the body of `about/index.md`. Both refresh when you
publish.

## Publish an article

1. Drop `YYYY-MM-DD-my-post.md` into `articles/`.
2. Run:

```sh
node publish.mjs            # regenerates index.json + rss.xml, commits, pushes
node publish.mjs --deploy   # … also runs `npx wrangler deploy`
```

The date prefix shows beside the title; every article gets a shareable
`#/article/<file>` link that survives refresh and the back button.

## Deploy (Cloudflare Workers)

```sh
node publish.mjs --ci --deploy   # sync content → build site/ → wrangler deploy
```

`publish.mjs` assembles the deployment into `site/` — only what visitors need
(index.html, articles, notices, about, fonts, feeds). `.git`, README and
repo-only files are never uploaded.

On Cloudflare (Workers Builds), set the **build command** to
`node publish.mjs --ci` and the deploy command to `npx wrangler deploy` —
then every push rebuilds `site/` and deploys.
