# rachgo

[rachg.com](https://rachg.com) — my personal home on the web. A single HTML
file that renders markdown from folders, built as a study in Apple-style
fluid interface design: interruptible springs, gesture velocity hand-off,
momentum projection, liquid glass materials. Designed and built with AI
agents.

## Write

Everything on the site is a markdown file in a folder.

- **Articles** — drop `YYYY-MM-DD-HHMMSS-my-post.md` into `articles/`, list it in
  `articles/index.json` (newest first). The timestamp becomes the date · time
  beside the title, keeps same-day posts in publish order, and every article
  gets a shareable `#/article/<file>` link.
- **Notices** — short announcements in `notices/`, same filename
  convention, shown as a dated timeline on the front page.
- **About** — the About panel is the body of `about/index.md`.

With the Cloudflare build command configured (see Deploy), a push is the
whole publishing process — the indexes, feed and sitemap are regenerated
from the folders on Cloudflare's side. Or run it yourself:

```sh
node publish.mjs            # regenerate indexes + feed + sitemap + site/, commit, push
```

## Deploy

**Workers Builds (recommended)** — connect the repo in the Cloudflare
dashboard:

```text
Build command:  node publish.mjs --ci
Deploy command: npx wrangler deploy
```

Every push rebuilds the deployment on Cloudflare's side and ships it
atomically — failed builds never take the running site down.

**From your machine:**

```sh
node publish.mjs --ci --deploy
```

## Structure

```
index.html      the whole site — layout, springs, markdown renderer
404.html        quiet not-found page
og-image.png    share-card image (1200×630)
articles/       posts, one markdown file each (+ index.json)
notices/        short announcements (+ index.json)
about/index.md  the About panel body
fonts/          self-hosted Sora / Inter / Cinzel (variable woff2)
publish.mjs     one-command publishing
rss.xml         feed, regenerated on publish
sitemap.xml     regenerated on publish
robots.txt      crawler rules + sitemap pointer
_headers        security & caching headers
wrangler.jsonc  Cloudflare Workers static-assets config
```

`site/` is the deployment folder `publish.mjs` assembles for
`npx wrangler deploy` — generated, git-ignored, never edited.

## Feedback

The site is three days old and already asking for it: open an issue, or
write to [hello@rachg.com](mailto:hello@rachg.com).

## License

[MIT](LICENSE)
