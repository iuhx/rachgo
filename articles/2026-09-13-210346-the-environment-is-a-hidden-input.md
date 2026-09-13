# The environment is a hidden input

Last week the article list on this site came out in a different order,
depending on which machine built it. Same source files, same commit, two
different results. It took three attempts to fix, and the fix revealed that
all three attempts had been fighting the same bug wearing different clothes.

The bug: the build environment was a hidden input.

## Disguise one: modification times

The first ordering scheme sorted posts by the date in the filename, and —
for posts published on the same day — by the file's modification time as a
tiebreaker. Sensible, I thought. Then I learned what a CI checkout does to
modification times: it writes every file new, often within the same second.
Every post I had published "same day" now shared a timestamp, and the
tiebreaker was comparing identical values. The order fell through to
whatever the filesystem felt like listing.

Modification times in a checkout don't measure when you wrote something.
They measure when a machine copied it. On your laptop that's roughly the
truth; on a build server it's noise.

## Disguise two: the locale

Attempt two replaced the noisy tiebreaker with a locale-aware string
comparison. This worked on my machine and broke in the build, because
locale-aware comparison is allowed to order the same two strings differently
depending on the language settings of the environment doing the comparing.
Two files published in the same second should sort identically everywhere.
"Identically everywhere" and "locale-aware" are opposites.

## Disguise three: the clock without a timezone

Attempt three sorted deterministically at last — and then the *dates
themselves* started drifting. A post written at 21:18 my time showed up in
the feed as a different day, because the build environment parsed the
filename's timestamp against its own clock, and its clock was on UTC. The
order was finally stable; the truth it was ordering had silently shifted by
eight hours.

## The fix: move the truth into the artifact

All three disguises had one root: something the *environment* knew was
shaping the *output*. The fix was to stop asking the environment and put the
information where it can't be misread:

- the publish timestamp lives in the **filename**, with the timezone written
  into it explicitly;
- the tiebreaker between two files is a plain **byte-order comparison** —
  no locale, no clock, no culture settings;
- the display date is generated from the **filename's own components**, not
  from a date object reinterpreted by whichever machine is rendering.

The verification is the satisfying part: build the feed with the machine
pinned to UTC, build it again pinned to UTC+8, and compare the outputs byte
for byte. Identical. The environment can now disagree with itself all it
wants; the artifact doesn't care.

## The general form

The pattern generalizes past blogs. Every build has hidden inputs: the
system clock, the locale, the timezone, the filesystem's mood, whatever
happens to be in the checkout. Each one is a way for two machines given the
same source to produce different results.

The audit is one question, asked repeatedly: **what does this output depend
on that isn't in the source?** Then, for each answer: either eliminate it,
pin it, or move it into the source. Modification time? Move it into the
filename. Locale comparison? Replace with byte order. Clock without a
timezone? Write the offset down.

And the test is one command, run twice with the environment forced to two
different answers. If the outputs differ, you found a hidden input. If they
match, you found nothing — which, for once, is the good outcome.
