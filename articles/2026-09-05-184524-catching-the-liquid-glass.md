# Catching the liquid glass

Apple shipped a new material this year — Liquid Glass. It refracts whatever
sits behind it, catches light along its edges, and generally behaves like
something poured rather than drawn. The web can't do that. Not really: CSS
backdrop-filter can blur and saturate what's behind an element, but it cannot
displace it. Refraction is a compositor trick, and the compositor belongs to
the platform.

So I stopped chasing the physics and went after the perception instead. Four
layers got the feel to about ninety percent:

- **A stronger frost.** More blur, more saturation, a whisper of brightness —
  the base has to read as glass before anything else works.
- **A specular edge.** A one-pixel gradient ring, bright at the top-left,
  fading out before it reaches the bottom. Light has to land somewhere.
- **A lensing ring.** A second, nested backdrop-filter that brightens and
  re-saturates a thin band just inside the edge. The eye reads it as
  refraction. It isn't, but the eye isn't a compiler.
- **A sheen that follows you.** A soft radial highlight tracked to the
  pointer. This is the layer that makes it liquid — light should move.

That last ten percent — the true bending of pixels — stays out of reach until
the platform hands it over. Fine. Ninety percent of the feel is yours today.
