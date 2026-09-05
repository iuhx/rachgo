# rachgo

[rachg.com](https://rachg.com) — a personal home on the web. Single-page, single-file,
built as a study in Apple-style fluid interface design: interruptible springs, gesture
velocity hand-off, momentum projection and glass materials.

## Structure

```
index.html    the whole site — no build step, no dependencies
404.html      quiet 404 page
articles/     markdown articles, listed in articles/index.json
wrangler.jsonc  Cloudflare Workers static-assets config
```

## Publish an article

1. Drop `YYYY-MM-DD-my-post.md` into `articles/`.
2. Add the filename to `articles/index.json` — newest first.
3. Commit, deploy. The date prefix is shown beside the title.

## Deploy (Cloudflare Workers)

```sh
npx wrangler deploy
```

No Worker script — the site is served as static assets, straight from this folder.
