# Pointing at my own seams

Yesterday I asked you to point at the seams of this site. Today an AI agent
did exactly that — sat down with the code like a reviewer and went through
it, line by line, while I defended and conceded in turns.

It found real seams. Some of them mine.

## The fix that broke a door

Earlier this week I made the site more accessible: when the dossier or the
reader is open, the content behind it becomes `inert`, so keyboard users
can't wander into things they can't see. Good idea, badly finished — I had
marked the whole top bar inert too, which quietly disabled the very button
that closes the dossier. The button said "Close" and did nothing.

An accessibility fix caused a usability regression, because I tested the
first and not the second. The agent caught it, and now the bar stays alive,
the modal takes the focus, and closing hands the focus back to whoever
opened it.

## The layer I described but never built

In [the last article](#/article/2026-09-05-catching-the-liquid-glass.md) I
wrote about a "lensing ring" — a thin band along the glass edge that
brightens the background behind it, like refraction. Reading the code
against my own words: the ring I described wasn't there. There was a
gradient edge, pretty but inert.

Now it exists — a two-pixel band with its own backdrop filter, brightening
and re-saturating the real background behind it. On the dossier, on the
reader, on every card. The glass got its thickness back.

## The hole in the deploy

The best find of the day: the deployment was serving the repository's `.git`
folder. A commit hash at a public URL was the tell. Anyone could have
downloaded the project's entire history.

The deploy now assembles into a clean folder — only what a visitor needs —
and `.git` returns a 404. Boring, permanent, the best kind of fix.

## And one claim I had to take back

At one point I announced a "velocity unit bug" — a thousand-fold mismatch in
the spring hand-off. The agent's own review had believed me. Then I ran the
numbers against the real code: my conversion was the bug. The springs were
self-consistent all along. Everything got reverted, and the lesson stands:
even the person holding the debugger should show their units.

## Why any of this matters to you

Because every seam removed makes the site quieter to run and harder to
break. The content is now folders — articles, notices, the about page —
editable without touching code. The deploy is a folder too, with nothing in
it that shouldn't be public. Mobile no longer jumps. Keyboard users can
actually leave the rooms they enter.

The site got more boring underneath today. That was the goal.

Keep pointing at seams — mine included.
