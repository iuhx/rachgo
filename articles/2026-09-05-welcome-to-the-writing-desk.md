# Welcome to the writing desk

This is the first article on rachg.com — and a live cheat-sheet for how
writing works here.

## Articles

1. Drop a `.md` file into the **articles** folder, next to this page.
2. List the filename in `articles/index.json` — newest first, or let
   `node publish.mjs` do it for you (it also refreshes the feed).
3. Push. Cloudflare rebuilds, the article goes live.

Name a file with a `YYYY-MM-DD-` prefix and the date appears beside the
title, like the one above.

## Notices & about

Short announcements live in the **notices** folder — same idea, smaller
form. A `YYYY-MM-DD-slug.md` file there becomes a dated line on the front
page, and its body renders as markdown too.

The About panel reads `about/index.md` — blank line between paragraphs.

## What renders

**Bold**, *italic*, `inline code`, and [links](https://example.com) all work.

> Blockquotes look like this — quiet, indented, unhurried.

- Lists are supported
- So are ordered ones

```js
// fenced code blocks too
const hello = 'rachg';
```

---

Write plainly. The design stays out of the way.
