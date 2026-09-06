# springlet: motion in two numbers

Animation libraries love to ask for a stiffness and a damping factor. Those
are constants from an engineering textbook, and tuning them is astro-math —
nobody feels 170 newtons per meter, you guess it.

Apple describes motion with two numbers a human can actually reason about:

- **response** — how long the motion takes to arrive, in seconds
- **damping** — how much it bounces on the way (1 means not at all)

Today I extracted the spring engine that runs this site into a tiny library:
[springlet](https://github.com/iuhx/springlet). A closed-form damped harmonic
oscillator — solved per frame, no integration drift — under 2 KB gzipped,
zero dependencies.

Three rules matter more than the math:

1. Every spring starts from the **displayed** value, so motion can be caught
   and reversed mid-flight. Nothing is ever "busy".
2. A released gesture **hands its velocity** to the spring. Flicks and
   animations become one continuous physical system.
3. One shared requestAnimationFrame loop drives every active spring.

It also ships `projectMomentum` — UIKit's deceleration formula, for deciding
where a flick was headed — and a test suite that proves the overshoot is real
while critical damping never overshoots.

Two numbers, 2 KB. Feel them at [rachg.com](https://rachg.com).
