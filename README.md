# landing-moment

A Claude Code plugin for building landing pages that **don't read as templates**.

Most AI-built landings fail the same way: they stack effects pulled from a component library onto
copy those effects have nothing to do with. This plugin encodes the opposite method — find the one
sentence that carries the page's promise, and build the single moment that makes that sentence
*visible*.

> The skill body is in Spanish (that's the author's working language). The method, the code and the
> detector are language-agnostic — Claude will apply them to a page in any language.

## Install

```
/plugin marketplace add MartinOlivero/landing-moment
/plugin install landing-moment
```

## Use

Just ask, in whatever words you'd normally use:

- *"armá la landing de este producto"* / *"build the landing page for this"*
- *"esta página está plana, hacele algo"* / *"this hero looks generic"*
- *"que no parezca hecho con IA"* / *"my page looks AI-generated"*

The skill triggers on its own. It reads the copy first, proposes the moment, and asks before
building if there's more than one valid direction.

Run the cliché detector on the result at any time:

```bash
node scripts/detect.mjs <file-or-folder>
node scripts/detect.mjs --autotest      # 14 self-checks, no deps
```

## What's inside

| | |
|---|---|
| **The authored-moment method** | How to derive one interactive moment from the page's own argument, with four production case studies |
| **Six build rules** | One moment not six effects · repeat its language to unify the page · deterministic (seeded PRNG, never `Math.random`) · the shape must carry information · degrade properly (reduced-motion, no-JS, mobile) · play once, never loop |
| **A mechanical craft floor** | Contrast ratios, line measure, type scale, spacing, depth, states, motion — with a console snippet to measure real contrast. Verified on the rendered result, not the intent |
| **Two reference components** | A light sweep that reveals/transforms (vanilla HTML/CSS/JS) and a self-playing timeline that pauses at key moments (React + canvas). Both production-tested, zero dependencies |
| **A library/licence table** | Which component libraries are worth it, and the two licence traps (react-bits' Commons Clause, origin-ui's AGPL) |
| **A cliché detector** | 12 rules for the tells of an AI-built page: gradient text, generic fonts, kickers, flat glows, emoji-as-icons, `Math.random` on load, missing `prefers-reduced-motion`, Google Fonts under a CSP |

## What this plugin does *not* promise

It won't make a page beautiful on its own. It gives you a method and a floor — the result still
depends on the copy you feed it. The skill says so explicitly: **if no moment emerges from the
headline, the problem is the copy, not the design**, and no animation covers that.

The detector reports signals, not errors. Run against the author's own reference landing it flags
six things — and two of them are deliberate (a cyan halo that *is* the page's HUD language, a
background grid that *is* the product's instrument surface). Decide; don't obey.

## Case studies

The four moments the method produced, all shipped:

| The sentence | The moment |
|---|---|
| *"Your networks already told you what to do. **Nobody translated it.**"* | Raw API field names float around the headline (`reach`, `impressions`, `avg_view_duration`). A line of light sweeps down **once** and leaves them translated. |
| *"Your closer ended an $8,000 call and **nobody knows what happened inside**"* | That call drawn as an audio editor sees it. It starts gray — nobody listened — and a playhead plays it back, stopping at the five moments the sale fell apart. |
| *"The lead you don't answer in five minutes **is already talking to someone else**"* | The same 11:47pm enquiry in two lanes. Above, a clock runs to 32 hours; below, the system stops it at 0:03. Log scale, labelled — on a linear axis three seconds next to thirty-two hours is invisible. |
| *"I don't teach you to use AI. **I teach you to think in systems** with AI."* | Nine loose, unlit tools inside a CRT monitor. An amber edge sweeps down once and leaves them **wired** into one system. |

None of them is an animated background. Each one is the argument, executing.

## Licence

MIT. Built by [Martín Olivero / IamAutom](https://iamautom.com) — [@tincho.olivero](https://youtube.com/@tincho.olivero).
