# Nine days of a one-file website

Last week I noticed the deployment was serving the project's version
history. I asked the live site for a file inside its `.git` directory and
got real content back — a commit hash — instead of the 404 I'd promised
strangers. A personal homepage with no framework, no build step, and a
single HTML file had somehow published its entire source history to anyone
who typed the URL.

The fix took twenty minutes. The site had been running for five days. This
is the story of those days: what the constraint bought, what it cost, the
bugs that only a one-file architecture could hide, and the one I invented
myself.

## Where the shape came from

It started with a description of a feeling, written to an AI agent: I want
a page that moves the way a phone moves. Push a panel and it follows your
finger one to one. Let go mid-swipe and it keeps the speed you let go with.
Grab it while it's still gliding and it stops under your hand — then goes
wherever you now push it, even if that's the opposite direction.

The agent came back with questions instead of code, which is how I knew the
constraint had landed. Not "which framework" — "should a released drag hand
its velocity to the animation?" Yes. That single yes produced the whole
physics layer: springs solved in closed form (one equation that gives the
position at any moment, no per-frame integration to drift), tuned with two
numbers a person can reason about — how long the motion takes, and how much
it bounces — instead of the stiffness-and-damping constants nobody can
feel.

The engine is sixty lines. Compressed, 1.6 KB. I have written more
configuration for carousels.

## Glass, ninety percent

For the first two days the site looked flat and I couldn't say why. The
surfaces were translucent, the colors were right, and nothing read as
glass.

The fix was four layers. A frost: more blur than seemed tasteful, plus
saturation and a slight brightness lift, because a surface has to read as
glass before edges mean anything. A rim: a one-pixel gradient, brightest at
the top-left, gone before it reaches the bottom-right — light has to land
somewhere. A lens: a two-pixel band just inside the rim with its own
backdrop filter, brightening and re-saturating the background behind it.
And a sheen that follows the pointer, so the surface feels wet.

The lens is the layer that reads as refraction, and it is worth being
precise about what it is: an impression of refraction, built from filters
that only know how to smear. CSS can blur what's behind an element but it
cannot displace it — the displacement function that bends real pixels
belongs to the operating system's compositor. So the glass tops out at
about ninety percent of the material. I'd rather have a solid ninety than a
hundred that stutters.

## Four attempts at sorting a list

The article list defeated me four times, which is embarrassing to type
about a sorted array.

Attempt one sorted by the date in the filename, alphabetically within a
day. Two posts published the same day sorted by slug, and the older one
landed on top.

Attempt two broke ties by modification time. I learned on the deploy
machine that a CI checkout writes every file new, within the same second —
the tiebreaker was comparing identical values and falling through to
whatever order the filesystem listed.

Attempt three broke ties by the file's last commit time. This worked
locally and produced a different order in the build, because the build
environment turned out to have a different locale — and the tie under the
tie was decided by a locale-aware string comparison, which is allowed to
order the same two strings differently depending on where it runs.

Attempt four: the timestamp went into the filename itself —
2026-09-06-123153-slug.md — and the tie became a byte comparison. No clock,
no locale, no git. The same sources now produce byte-identical output on
every machine, which I verified by building twice with the system clock
forced to different timezones and diffing.

There was also a bug hiding under attempt three that I want to record
because of how it failed: silently. The timestamp parser built a date
string like 2026-09-06T21:18:47:00+08:00 — appending a seconds component to
a time that already had one. Invalid. Date.parse returned NaN, the code
caught it and fell back to the file's modification time, and the list came
out plausible. It was wrong for two days and nobody noticed, because a
plausible order attracts no suspicion.

## The unit I got wrong

Before that, I announced a velocity bug with a comparison table. The
spring's reported velocity was 1, in whatever unit the engine printed; the
true velocity at the same moment was 622 pixels per second. I concluded the
hand-off was off by three orders of magnitude. A fix was written and
applied.

Then a second look at the claim: the engine reports velocity per
millisecond. 1 per millisecond is 1,000 per second — the same speed as the
622 I was comparing against, within the noise of the measurement. The bug
was in my comparison, not the code. The fix was deleted.

The person holding the debugger is the person most likely to fool you,
because their wrong claims come with numbers attached. I was the one
holding the debugger.

## The afternoon I verified yesterday

Once, for several hours, every observation contradicted every other
observation. The deploy log said the newest version was live; the content I
fetched looked days older. Two checks ten minutes apart disagreed about
whether a change had shipped.

An old dev server from earlier that week was still running in the
background, holding the port, serving a snapshot of the site from before
several rounds of changes. My checks against "production" were checks
against Tuesday.

Since then, every observation starts with a version marker fetched from
the same server that's being tested. It costs one request. It has caught
the stale-server bug twice since.

## What the agent changed

Working with an agent on this changed the shape of the work more than the
amount of it.

The agent is tireless at the review pass. It read the finished article list
against the code and found that a button inside a marked-inert bar had been
quietly disabled — an accessibility fix that had caused a usability
regression, exactly the kind of cross-concern bug that survives a solo
review. It found a missing timezone parameter in a date parser I'd
rewritten. It flagged that a documented command-line flag didn't actually
exist in the script.

It also once wrote a fix for a bug that didn't exist, on my diagnosis, and
the review caught that too. The direction matters: the agent implements
decisions and audits results. The deciding and the doubting stay with me.

The other change is tempo. The whole loop — write markdown, regenerate the
list and the feed, build the deploy folder, push — is one command. When
publishing is that cheap, you publish things you'd otherwise leave in a
draft folder, and the site becomes a log of thinking instead of a
portfolio of finished pieces.

## The limits, stated by the person who chose them

The one-file shape has real costs, and I want them in my own words.

Search engines see one page. The site routes readers through hash links,
and a crawler treats everything after the hash as the same document. Each
article exists as its own markdown file, fetchable and readable — but a
search engine will index the homepage and mostly stop there. If this site
ever needs to be found, it graduates to one page per post. I keep three
conditions written down that would end the experiment: a post that
genuinely benefits from search, a feature that needs a server, traffic high
enough that the savings stop mattering. None are true yet.

No dynamic anything. Comments, search, a contact form that actually sends —
each wants a server and a database, and each converts this from a file into
a system. The mailbox is Cloudflare forwarding to a real inbox; that's the
whole infrastructure story.

And the mailbox has received exactly one letter. I sent it, testing the
routing. This is disclosed in the article about the mailbox, which is
itself linked from the article about the seams, which is the state of a
blog on day nine.

## The graduation test

Three conditions, written down on day one, that would end the experiment:

1. A post that genuinely benefits from search.
2. A feature that needs a server — accounts, comments, state.
3. Traffic high enough that the maintenance savings stop mattering.

None are true. Until one is, the site stays a file.

If you're building something similar, the source is at the bottom of the
page — read it against its own comments, and show your units.
