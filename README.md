# landing-moment

A Claude Code plugin for building landing pages that **don't read as templates**.

Most AI-built landings fail the same way: they stack effects pulled from a component library onto
copy those effects have nothing to do with. This plugin encodes the opposite method — find the one
sentence that carries the page's promise, and build the single moment that makes that sentence
*visible* — and then **measures the result in a real browser** so "it looks fine" isn't the bar.

> The skill body is in Spanish (that's the author's working language). The method, the code and the
> tools are language-agnostic — Claude will apply them to a page in any language.

> **New in 0.3.0** — run `/plugin update landing-moment`. Adds the **movement score** (how to keep
> the whole page alive instead of only the hero), a **catalogue of seven mechanism families** for
> when nothing comes to mind, and a third production-tested component: the graph that wires itself.
> 0.2.0 fixed a documented command that never ran and added `audit.mjs`, the craft floor measured in
> a real browser. Full list in [CHANGELOG.md](CHANGELOG.md).

## Install

Inside Claude Code:

```
/plugin marketplace add MartinOlivero/landing-moment
/plugin install landing-moment@landing-moment
```

Or from your terminal:

```bash
claude plugin marketplace add MartinOlivero/landing-moment
claude plugin install landing-moment@landing-moment
```

Restart the session afterwards so the skill loads. Check it's there with `claude plugin list`.

## Use

Just ask, in whatever words you'd normally use:

- *"armá la landing de este producto"* / *"build the landing page for this"*
- *"esta página está plana, hacele algo"* / *"this hero looks generic"*
- *"que no parezca hecho con IA"* / *"my page looks AI-generated"*

The skill triggers on its own. **It reads the copy first**, and if the headline has nothing concrete
in it, it says so and asks for a better one before writing a line of CSS — that refusal is the
feature, not a bug (see *What this doesn't promise*).

## What's inside

| | |
|---|---|
| **The authored-moment method** | How to derive one interactive moment from the page's own argument, with four production case studies |
| **A copy gate** | Three filters the headline must pass before any design happens — a concrete noun, a number or proper name, and a tension. This is the single biggest reason AI landings come out generic |
| **A catalogue of seven mechanism families** | Entered by what the page has to *prove*: translate · replay · connect · complete · compare · disassemble · filter. For when the method is clear but nothing comes to mind |
| **A movement score** | How to spread the gesture across the page in three roles — the moment, the echoes, the thread — so it doesn't die after the hero, without turning into a circus. Plus what doesn't count as movement, and why any of it works |
| **Six build rules** | One moment not six effects · repeat its language to unify the page · deterministic (seeded PRNG, never `Math.random`) · the shape must carry information · degrade properly (reduced-motion, no-JS, mobile) · play once, never loop |
| **A mechanical craft floor** | Contrast, line measure, type scale, spacing, depth, states, motion — plus a typeface table with real alternatives to the fonts that give an AI page away |
| **A full example page** | `references/example-page.html` — one self-contained page with its own moment, commented step by step, that passes both tools |
| **Three reference components** | A light sweep that reveals/transforms (vanilla), a self-playing timeline (React + canvas), and a graph that wires loose pieces into a system (SVG + CSS). Zero dependencies |
| **A library/licence table** | Which component libraries are worth it, and the two licence traps (react-bits' Commons Clause, origin-ui's AGPL) |
| **A cliché detector** | `detect.mjs` — 12 rules over the source: gradient text, generic fonts, kickers, flat glows, emoji-as-icons, `Math.random` on load, missing `prefers-reduced-motion`, Google Fonts under a CSP |
| **A rendered-page auditor** | `audit.mjs` — opens the page in a real Chrome and measures what the source can't tell you |

## The two tools

`detect.mjs` reads the **source**. `audit.mjs` measures the **rendered page**. They catch different
things and you want both.

```bash
DET=$(find ~/.claude/plugins -maxdepth 8 -name detect.mjs  -path '*landing-moment*' | head -1)
AUD=$(find ~/.claude/plugins -maxdepth 8 -name audit.mjs   -path '*landing-moment*' | head -1)

node "$DET" ./src            # source: the tells of an AI-built page
node "$AUD" page.html        # rendered: the craft floor, measured
node "$AUD" http://localhost:5173
```

> Don't write `node ${CLAUDE_PLUGIN_ROOT}/scripts/detect.mjs`. That variable is only substituted in
> hooks and MCP configs — in a shell it's empty and the command fails. The `find` above is the
> portable form.

The auditor loads the page in the Chrome, Chromium, Edge or Brave you already have (via CDP, over
Node's built-in WebSocket — **it installs nothing**), scrolls the whole page so sections that reveal
on scroll are in their real state, and then measures:

- **Contrast**, composing translucent layers the way the browser does — a panel over
  `rgba(147,51,234,.08)` is not a solid purple, and treating it as one is how contrast tools produce
  fiction. Text over a gradient or an image is reported as *not measurable*, never as a failure.
- **Line measure** in real characters per line, using the actual glyph width of the font in use.
- **Mobile 390px**: horizontal overflow, and contrast that only breaks at that width.
- **`prefers-reduced-motion`**: whether the page still shows the *final state* or just hides things.
- **No JavaScript**: whether the hero survives with scripts disabled.
- **Fonts**: whether the family you declared actually loaded, or a CSP blocked it silently and
  you've been looking at the fallback.
- **Console errors**.

Failures are numbers against a minimum — fix them. Warnings are decisions — make them.

```bash
node "$AUD" --autotest     # 6 self-checks against a deliberately broken page
node "$DET" --autotest     # 14 self-checks
```

## What you need besides the plugin

| | Why |
|---|---|
| **Node 18+** | Both tools. No npm install, no dependencies |
| **Chrome, Chromium, Edge or Brave** | Only for `audit.mjs`. Elsewhere: `CHROME_PATH=/path/to/browser` |
| **Copy with something concrete in it** | The method derives the moment from the headline. Vague copy has nothing to derive from — the skill will tell you so and ask |
| **Material from the real product** | Screenshots of the actual UI, module covers, packaging, video thumbnails. The reference landings lean on 16 real product screenshots; a page with no real material falls back to decoration |

Optional but it changes the ceiling:

- **[Claude in Chrome](https://www.anthropic.com/claude-code)** — lets Claude watch the moment *in
  motion* and iterate on it. `audit.mjs` covers the measurable floor without it; nothing covers
  "does this actually read as the argument" except looking.

## Does it need other skills?

**No. It's self-contained** — the method, the floor and both tools are here. But two combinations
are worth knowing:

- **A design catalogue** (e.g. `ui-ux-pro-max`, with its palettes, styles and font pairings) helps
  in exactly one situation: the product has **no visual world of its own** and you have to invent
  one. Order matters — this skill decides the *direction* (the world comes from the product, the
  moment from the argument); the catalogue only fills in details inside that decision. If you let
  the catalogue lead, you get its default styles — glassmorphism, bento grids, neumorphism — which
  are precisely what this method calls a template.
- **A design-system linter** (e.g. `impeccable`) overlaps with the craft floor here and checks a
  different thing: consistency against a design system, not landing clichés. Full disclosure: of
  the four reference landings, that kind of linter ran on **one**, and both of its findings were
  deliberate and kept.

## What this plugin does *not* promise

It won't make a page beautiful on its own. It gives you a method, a floor and two measurements —
the result still depends on the copy and the material you feed it. The skill says so explicitly:
**if no moment emerges from the headline, the problem is the copy, not the design**, and no
animation covers that.

The detector reports signals, not errors. The included example page trips one of them on purpose (a
Google Fonts link, flagged because a project CSP could block it) — the comment right above it
explains the decision. That's the intended way to use it: decide, don't obey.

## Case studies

The four moments the method produced, all shipped:

| The sentence | The moment |
|---|---|
| *"Your networks already told you what to do. **Nobody translated it.**"* | Raw API field names float around the headline (`reach`, `impressions`, `avg_view_duration`). A line of light sweeps down **once** and leaves them translated. |
| *"Your closer ended an $8,000 call and **nobody knows what happened inside**"* | That call drawn as an audio editor sees it. It starts gray — nobody listened — and a playhead plays it back, stopping at the five moments the sale fell apart. |
| *"The lead you don't answer in five minutes **is already talking to someone else**"* | The same 11:47pm enquiry in two lanes. Above, a clock runs to 32 hours; below, the system stops it at 0:03. Log scale, labelled — on a linear axis three seconds next to thirty-two hours is invisible. |
| *"I don't teach you to use AI. **I teach you to think in systems** with AI."* | Nine loose, unlit tools inside a CRT monitor. An amber edge sweeps down once and leaves them **wired** into one system. |

And a fifth, built from scratch as the worked example in `references/example-page.html`:

| *"You worked 47 hours this week. **You invoiced 31.**"* | The week drawn as the clock sees it: seven days, fourteen hours each. It starts showing only what was invoiced. One sweep crosses left to right — the day advancing — and the 16 unbilled hours appear at the edges of each day and the weekend, while the counter climbs. |

## Licence

MIT. Built by [Martín Olivero / IamAutom](https://iamautom.com) — [@tincho.olivero](https://youtube.com/@tincho.olivero).
