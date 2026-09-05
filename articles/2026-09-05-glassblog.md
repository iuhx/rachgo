# glassblog: this site, as a template

Somewhere between writing a spring library and rebuilding a footer, it became
obvious that this site's stack was quietly turning into a product: one HTML
file that renders markdown from a folder, a publish script that regenerates
the feed and pushes, a static deploy to Cloudflare's edge.

So the stack got its own repository:
[glassblog](https://github.com/iuhx/glassblog).

Fork it, press the deploy button, and you have a blog. Single file, markdown
folder, RSS, liquid glass and all. Your name, tagline and email live in one
`config.js` — four values, and the wordmark, the tab and the footer follow.
There is nothing to build and nothing to break.

This site runs the exact same template. It just has more articles.
