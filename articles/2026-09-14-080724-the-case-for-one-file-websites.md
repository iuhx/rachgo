# The case for one-file websites

Most websites are systems: a framework, a build pipeline, a bundle, a
server, a database, a dashboard of logs. The site you're reading is none of
that. It is one HTML file, a handful of markdown files, and a small script
that assembles them into a folder a host can serve. Nine days of running it
this way say it was the right call — and say precisely when it wouldn't be.

## What a one-file site is

One file holds the entire interface: markup, styles, and the small amount of
logic the page needs. Content lives beside it as plain markdown. A tiny
script scans the folders, regenerates the list and the feed, assembles the
deployment, and hands it to a host.

No framework, no compiler, no dependency tree to audit. There is nothing to
upgrade and nothing to break because a transitive package changed its mind.

## What it buys

**It fits in your head.** The whole site can be read, start to finish, in
one sitting. When something is wrong, it is wrong somewhere you can point
at — not somewhere inside a transitive dependency two levels deep.

**It will still run in five years.** Static HTML and CSS have an
extraordinary half-life. Sites built this way in the late nineties still
open correctly. The risk profile of this site is essentially the risk
profile of a text file.

**Deploys are boring.** The publish script assembles a folder of files and
hands it to a host that serves it from the edge. Failed builds never take
the running site down; the previous version keeps serving until a new one
is ready.

**Nothing phones home.** The fonts are self-hosted, the analytics are
cookieless, and there are no third-party requests on the critical path. The
page loads like a local file, because it essentially is one.

**Content is just files.** A post is a markdown file named with its
timestamp. Publishing is dropping the file in a folder. No editor, no admin
panel, no login to forget the password of.

## What it costs

Honesty requires the other column.

**No per-article pages.** The site routes readers through hash links, which
search engines treat as one page. Articles are fetchable — each lives as its
own markdown file — but a search engine will mostly index the homepage. For
a personal site with no ambitions of traffic, fine. For a publication that
lives on search, this is the deal-breaker.

**Everything is hand-rolled.** The spring physics, the markdown renderer,
the reader panel — all mine, all small, all missing features a framework
would provide for free. The flip side: nothing in the codebase is there
because someone else decided it should be.

**Dynamic anything means graduating.** Comments, search, a contact form
with real mail — each of these eventually wants a server. The one-file
pattern doesn't forbid it, but it stops pretending to be simple the moment
you add one.

## The graduation test

I keep three conditions that would make me rebuild this as a multi-page
site:

1. A post that genuinely benefits from being found by search.
2. A feature that requires a server (comments, accounts, anything with
   state).
3. Traffic high enough that the maintenance savings stop mattering.

Nine days in, none of these are true. The site stays a file.

## The surprising part

Building this way changed what I wrote. When publishing is a folder and a
push, you write shorter, more often, with less ceremony. When the site
itself is one readable file, you keep it readable — you refactor instead of
piling on. The constraint shapes the content.

Most of the web is systems because most of the web needs to be. Some of it
— a personal site, a small tool, a place to think out loud — works better
as a file.

Write plainly. Ship the file. Say what you mean.
