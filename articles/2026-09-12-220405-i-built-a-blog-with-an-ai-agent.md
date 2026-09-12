# I built a blog from scratch with an AI agent

This site has no framework, no build step, and no dependencies. It is one
HTML file that renders markdown out of a few folders, and an AI agent wrote
most of the code while I directed. What follows is the long version: what
we built, what broke, and every wrong turn I can still remember.

## It started with a description of a feeling

I didn't have a feature list. I had one thing I wanted: interfaces that move
the way a phone moves. Not "smooth" in the slideshow sense — where you press
a button and an animation plays prettily to its end — but *physical*. Push a
panel and it follows your finger exactly, one to one. Let go mid-swipe and it
keeps going at the speed you let go with. Grab it again while it's still
moving and it stops dead under your finger, then goes wherever you now push
it, no matter that it was halfway through something else.

That is a short description and a surprisingly deep set of requirements. It
took the whole project to satisfy it.

The starting material was a design skill — a written-down set of principles
distilled from Apple's talks on fluid interfaces. The agent read it, I read
it, and we translated it into code. Roughly:

- **Respond on touch-down, not on click.** The instant a pointer lands,
  something visible should happen. Waiting for a full click already feels
  dead.
- **Nothing is ever "busy".** An animation must be able to start from
  whatever value is currently on screen, not from where it "should" have
  been. Interruption is the default, not a special case.
- **A gesture hands over its velocity when it ends.** Releasing a drag is not
  the end of a motion — it's a handoff to the animation, and the speed has to
  cross that boundary or you feel a tiny seam.
- **A flick lands where it was going**, computed from its speed, not where the
  finger happened to lift.

Everything you can touch on the site is one of those four rules applied to a
particular widget.

## The physics, in practical terms

The engine is about sixty lines. It is a damped harmonic oscillator solved in
closed form — one equation that, given a start position, a target, and an
initial velocity, tells you the position at any moment in time. No
step-by-step integration, so no drift and no frame-rate sensitivity.

What matters more than the math is the *interface* to it. Most animation
libraries ask you for a `stiffness` and a `damping` and an optional `mass` —
constants from a physics textbook. Nobody can feel 170 newtons per meter. We
replaced them with two numbers a person can actually reason about: how long
the motion should take, and how much it should bounce. "A third of a second,
no bounce" is something you can picture. "Stiffness 170, damping 26" is not.

The mechanics that make interruption work are small but essential:

- Every spring stores the value that is *currently displayed*. When you
  retarget it, it starts from that value with whatever velocity it currently
  has. This is the entire secret to catchable motion.
- A shared animation frame loop drives every active spring, rather than each
  spring owning a loop.
- When a drag releases, the measured pointer velocity is passed directly into
  the spring as its initial velocity. The eye reads "drag" and "animation" as
  one continuous movement because, mathematically, they are.
- To decide where a flick should land, we use the same deceleration formula
  UIKit uses: given the release speed, project where the motion would
  naturally stop, then snap to the nearest sensible target. Flick the article
  reader downward and it doesn't creep back a few pixels — it flies out.

The whole simulation ended up around 1.6 KB compressed. It's smaller than the
image on this page.

## Then it had to become a real site

The physics demo was one thing. Making it a site people could actually use
was where most of the time went, and where most of the mistakes were.

**Content lives in folders.** Every piece of text is a markdown file:
`articles/` for posts, `notices/` for short announcements, `about/index.md`
for the About panel. A post named `2026-09-12-220405-title.md` gets its date
and its position in the list from its filename. There's no admin panel, no
database, no editor. Publishing is dropping a file in a folder.

**One file, no build step.** The entire site is one `index.html`. Open it in
a browser and it runs. There is no compiler, no bundler, no framework
upgrade, nothing to break on a Tuesday.

**Shareable articles without a server.** Clicking a post opens a reader panel
and puts `#/article/<filename>` in the URL, so a link to a specific post
works, survives a refresh, and responds to the back button. It's a hack, and
it has a real cost I'll get to.

**Self-hosted fonts, out of necessity.** The design calls for three specific
typefaces. Loading them from the usual font CDN was unreliable — for some
visitors they'd simply never arrive, and the page would fall back to whatever
the system had. So the fonts got downloaded into the repo and served
directly, with a preload hint. Three files, about a hundred kilobytes total,
and no third-party request on the critical path. This should be more common
than it is.

## Making surfaces read as glass

For a while the site looked flat, and I couldn't say why. The fix was the
most interesting visual work of the project.

The target wasn't "translucent rectangle". It was the material with
*thickness* — something you feel the edge of. Four layers got it there:

1. **A real frost.** More blur than looked right at first, more saturation,
   and a slight brightness lift. A surface has to read as glass before any
   edge treatment means anything.
2. **A gradient rim.** A one-pixel ring of light, brightest at the top-left,
   fading before it reaches the bottom-right. Light has to come from
   somewhere.
3. **A lensing band.** A thin strip just inside the rim applies its own blur
   and brightness to whatever is behind it, so the edge appears to bend the
   background. This is the layer that sells the illusion — and it is an
   illusion. The pixels aren't actually refracting; they're just being
   filtered. The eye can't tell without a ruler.
4. **A sheen that follows the pointer.** A soft highlight tracked to the
   cursor position, so the surface feels wet and changes as you move across
   it. Static glass looks like plastic. Moving light doesn't.

Here is the honest ceiling: CSS can blur and saturate what's behind an
element, but it cannot *displace* it. True refraction — bending the actual
image of the background — is a compositor feature that belongs to the
operating system. On the web, you can approximate it with an SVG filter or a
shader, at a cost in complexity and performance I wasn't willing to pay. So
the site gets about ninety percent of the way there and stops exactly at the
edge of what the browser permits. I'd rather have a well-made ninety percent
than a fragile one hundred.

## The boring part that matters most: shipping

The site is static, so deployment is nearly free and nearly unbreakable. It
lives on an edge network; pushing to the repository rebuilds the content
indexes and ships the result. There is no server to patch, no database to
back up, no certificate to renew, and a failed build never takes the running
site down.

This took three attempts to get right, and the first one was embarrassing.

**The deploy was serving the project's entire version history.** The whole
repository was being uploaded as static files, which meant the `.git`
directory was sitting there at a public URL. The tell was absurdly small: I
asked for one file inside it and got real content back instead of a 404. The
same history that's public on the code host was being served from the site
itself. Nothing secret was exposed, but the shape of the mistake was exactly
the kind that becomes a real leak later.

The fix was to stop deploying the repository and start deploying *an output
folder*. A small script assembles a clean directory containing only what a
visitor needs — the page, the content, the fonts, the feed — and the hosting
config points there instead. Now the version history simply isn't in the
deployed artifact at all. Unglamorous, permanent, and the best kind of fix.
That request returns a 404 now, and it will keep returning one.

## An accessibility fix that quietly broke a button

This one still stings because the reasoning was correct and the execution
was not.

When a panel opens, the content behind it shouldn't be reachable by keyboard
— otherwise you can tab into things you can't see. The right tool for this is
the `inert` attribute, and adding it was correct. I applied it to the page
content and to the top bar. Then the panel opened, and the button in that top
bar — the one that says "Close" — could not be clicked, because I had just
told the browser it was inert.

The fix took one line and ten seconds to write, and the lesson is worth more
than the fix: an accessibility improvement *caused* a usability regression,
because I tested the first thing and not the second. The top bar now stays
alive while the content behind the panel goes inert, and the panel takes
focus when it opens.

Getting focus right took a second pass, too. The first version captured
"which element opened this panel" *after* flipping on `inert` — but turning
on inert immediately moves focus to the document body, so what got captured
was the body. Closing the panel then returned focus to nowhere. Now the
opener is recorded before anything changes, and closing hands focus back to
the button you pressed. Small detail, and the difference between a dialog
that feels like a dialog and one that feels broken.

## The bug I announced that wasn't there

I want to include this one because it's the most honest thing in the whole
project.

At one point I became convinced the velocity handoff was broken by a factor
of a thousand — that a released drag was handing over its speed in the wrong
unit, so every flick lost almost all its energy and limped to its target
instead of flying. I ran the numbers, produced a comparison table, and
reported it as a confirmed bug. A fix was written.

Then we checked the actual code against the claim. The units were internally
consistent the whole time. The "thousand-fold mismatch" was my own
conversion error: I had compared a value expressed in pixels-per-millisecond
against one expressed in pixels-per-second and concluded they disagreed. They
were the same speed written two ways.

Everything was reverted. The motion had been correct from the beginning.

The lesson isn't "be careful with units," although, yes. It's that a
confident-sounding diagnosis from the person holding the debugger is still
just a claim, and it should be checked with the same skepticism as anyone
else's. The person most likely to fool you is the one who just measured
something.

## The ordering saga, or: how many ways can a list be wrong

Sorting a list of blog posts sounds like a solved problem. It took four
attempts.

**Attempt one: sort by date, alphabetically within a day.** Works, until you
publish two things on the same day and the older one is alphabetically first.
Then the list quietly contradicts the truth.

**Attempt two: sort by the file's modification time as a tiebreaker.** This
is where I learned that "modification time" is close to meaningless in an
automated build. When a machine checks out a repository, files are written
new, often with identical or arbitrary timestamps. The tiebreaker produced a
different order locally than it did in the build environment. The same
source files, two different lists.

**Attempt three: sort by the file's last commit time from version control.**
This worked locally and broke in the cloud, because build environments often
fetch only a shallow slice of history. Files without a commit record all
collapsed to the same fallback value. Again: same input, different output,
depending on where you stood.

**Attempt four: put the time in the filename.** `2026-09-12-220405-title.md`.
The ordering is now a property of the content itself, identical in every
environment, with no dependence on clocks, git, or the build system. The
feed gets a precise timestamp. It is a small, unpleasant, entirely reliable
solution, which is my favorite kind.

Even that had one more bug hiding in it. The timestamp parser produced a
malformed date string — I had appended seconds to a value that already
contained them — and every filename silently failed to parse, falling back to
the broken fallback. The list looked plausible, which is what made it
dangerous. A one-character fix.

There was also a subtle one that only appears across machines: the tiebreaker
used a locale-aware string comparison to decide between two files with
identical timestamps. Locale-aware comparison can order the same two strings
differently depending on the environment's language settings. Replacing it
with a plain byte-order comparison made the result identical everywhere. Two
files published in the same second should sort the same on your laptop and on
the build server, and now they do.

## A dead process that wasted an afternoon

A debugging story with no code in it, which is why it's worth telling.

For several rounds of testing, results were inconsistent in a way that made
no sense. Some checks showed the newest version of the page; others showed
something older. Values contradicted each other within minutes of each other.
I started suspecting the test harness, then the framework, then myself.

The cause was a leftover local web server from an earlier session, still
running in the background, still holding the port, still serving an old copy
of the site from a directory I had since moved on from. Whichever check
happened to hit it got the past. Several of my "verified" conclusions from
that afternoon were verified against a stale page.

The rule I took from it: before trusting any observation, confirm that what
you are observing is what you think you're observing. Check the version
marker before the result. A two-second sanity check would have saved an
afternoon.

## What it cost and what it produced

The numbers, since they're the whole argument for this approach:

- **The page**: one HTML file, roughly 35 KB, no dependencies.
- **The spring engine**: about 1.6 KB compressed.
- **Fonts**: three files, ~100 KB, self-hosted, no third parties.
- **Hosting**: effectively free, on an edge network, worldwide.
- **Publishing**: write a markdown file, push. Nothing else.
- **Infrastructure to maintain**: a domain and a mailbox.

And the advantages that aren't numbers:

- **Nothing to upgrade.** No framework version to bump, no dependency tree
  to audit, no build tool that breaks because a transitive package changed
  its mind.
- **It will still work in five years.** Static HTML and CSS have an
  extraordinary half-life. The risk profile of this site is essentially the
  risk profile of a text file.
- **It's readable by a human.** The whole thing fits in your head. If
  something is wrong, it is wrong somewhere you can point at.
- **Failed deploys are non-events.** The previous version keeps serving
  until a new one is ready.

## What I'd tell someone about to do the same

- **Choose one strong constraint and let it make your decisions.** "It has
  to move like a phone" settled more of this design than any feature list
  could have. Constraints are cheap; taste applied to everything is
  expensive.
- **Make the deploy boring on purpose.** The exciting parts of a project
  should be the parts you chose. A deploy that can surprise you is a deploy
  that will, eventually, at the worst time.
- **Check the code against its own comments.** A surprising number of the
  real bugs here were places where what the code did and what it said it did
  had drifted apart. This is especially true when code is generated by
  something that doesn't get tired and doesn't get bored.
- **Distrust a confident diagnosis, including your own.** Twice in this
  project, a report was believed — once by me, once by the agent — and
  turned out to be a misreading. Verify the claim, not the confidence.
- **Ninety percent, done well, beats a hundred percent that's fragile.**
  The glass isn't real refraction. It looks right, it runs fast, and it will
  never fall over trying to do something the browser can't.

This site is nine days old. It has a working mailbox that has received
exactly one letter, from me. It has an article ordering system that took
four tries. It has about ninety percent of the glass I wanted.

Everything above is running at [rachg.com](https://rachg.com) right now, and
the source is open at
[github.com/iuhx/rachgo](https://github.com/iuhx/rachgo). If you're building
something similar, write — I read everything.
