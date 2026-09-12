# I built a blog from scratch with an AI agent

This site has no framework, no build step, and no dependencies. It is one
HTML file that renders markdown out of a few folders. I directed; an AI
agent wrote most of the code. Here is the whole story, honestly told —
including the parts where the agent was wrong, and the parts where I was.

## Starting from a single constraint

I didn't start with a feature list. I started with one feeling I wanted:
the kind of motion you get on a phone — where things respond the instant
you touch them, follow your finger exactly, and can be caught and reversed
mid-flight. Most websites don't move like that. They move like slideshows:
you trigger an animation, it plays to the end, and you wait.

So the brief was: build a page that moves physically. Everything else
followed from that.

## The rules that turned out to matter

The agent and I settled on a small set of principles, borrowed from the
design talks Apple gives about fluid interfaces:

- **Respond on touch-down, not on click.** The moment your finger lands,
  something should happen.
- **Motion is never "busy".** A spring always starts from wherever the
  element is *right now*, so it can be interrupted and sent the other way
  without a jump.
- **A released gesture hands over its speed.** When you let go mid-swipe,
  the animation continues at the velocity your finger had. No seam.
- **A flick should land where it was headed**, not where you released it.
  Your speed projects forward; the element settles at the projected spot.

Once those were in place, every interaction on the site was just a matter
of applying them: the bottom sheet, the article reader, the buttons.

The practical consequence: the whole thing is a few hundred lines of a
hand-rolled spring simulation, not an animation library. `stiffness` and
`damping` got replaced by two numbers a person can actually reason about —
how long the motion takes, and how much it bounces.

## One file, and folders for everything else

The site is a single `index.html`. That was deliberate. There is no build
step, nothing to compile, nothing to break. Open it in a browser and it
works.

Content is separate, and everything is a file:

- drop `2026-09-12-220405-my-post.md` into `articles/` for a post
- drop a small markdown file into `notices/` for a one-line announcement
- edit `about/index.md` for the About panel

A small script scans those folders, regenerates the article list, the RSS
feed, and the sitemap, then builds the deployment folder and pushes. The
date in the filename sets the order, so the two most recent posts never
argue about which came first.

## Then we made the glass

For a while the site looked flat. The interesting part came later: making
surfaces read as glass. Not "translucent box" glass — the material with
thickness.

Four layers did most of the work: a stronger frost on the base, a bright
gradient along the top edge, a thin band just inside the edge that
brightens whatever is behind it (this is what makes the rim look like it
bends light), and a soft highlight that follows your pointer so the surface
feels wet.

The honest limitation: the web's blur filters can blur and saturate what is
behind an element, but they cannot *displace* it. That last step — true
refraction — belongs to the operating system's compositor, not to CSS. So
the site gets about ninety percent of the way and stops at the edge of what
the browser allows. Ninety percent is a lot.

## The agent was confidently wrong, twice

Two moments stand out, and they're the reason I'd say this was a
collaboration and not a vending machine.

The first: my own. I once declared a "unit bug" in the spring math — a
thousand-fold mismatch in velocity hand-off. I ran the numbers, presented
the finding, and the agent built a fix. Then a review of the actual code
showed that the units were consistent all along, and *my* conversion was
the error. We reverted everything. The lesson: even the person holding the
debugger should show their units.

The second: the deployment was quietly serving the project's entire version
history to anyone who asked for it. A commit hash at a public URL was the
tell. The fix was unglamorous and total — the deploy now assembles a clean
folder with only what a visitor needs, and the history is simply not there
anymore.

Both bugs were found by someone reading the code against its own claims.
That is the whole trick, and it applies whether the author is human or not.

## How it ships

The site is static, so hosting is nearly free and nearly unbreakable. It
deploys to an edge network: the repository is connected, and every push
rebuilds the content indexes and ships the site. A failed build never takes
the running site down. A custom domain and a forwarding mailbox took a few
minutes.

No servers to patch, no database to back up, no certificate to renew.

## What I'd tell anyone doing this

- **Pick one strong constraint and let it dictate the rest.** "It should
  move like a phone" decided more of this design than any feature list.
- **Keep the deploy boring.** The exciting parts should be the ones you
  choose, not the ones that page you at night.
- **Review the agent's work against its own claims.** Most of the real bugs
  we found were places where the code and the comment disagreed.
- **Let it be unfinished.** This site is nine days old. It's fine.

Everything above is running at [rachg.com](https://rachg.com) right now, and
the source is open at
[github.com/iuhx/rachgo](https://github.com/iuhx/rachgo). If you're building
something similar, write — I read everything.
