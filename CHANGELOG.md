# Changelog

## 0.3.1 — 2026-09-27

### Fixed

- **The detector was blind to anything inside a script.** It only read `.html/.css/.jsx/.tsx/…`,
  so a vanilla engine that injects its own CSS from a JS string (the usual shape of a drop-in
  effect) came back "no template signals" while shipping an uppercase eyebrow above every
  title. It now reads `.js`, `.mjs` and `.ts` too.
- **The kicker rule only caught `class="eyebrow"` in markup.** It now also catches the CSS
  selector, including BEM (`.hero__eyebrow`) — `\b` doesn't fire after `__` because the
  underscore counts as a word character. Three new autotest cases (17 total).
- The detector skips the plugin's own `scripts/` folder: both tools name every pattern they look
  for, so scanning them was pure noise.

## 0.3.0 — 2026-08-26

The method had one blind spot: it told you to build **one** moment, and people read that as
"everything below the hero can be dead". A page with a spectacular hero and four screens of flat
text fails the same way a page with six random animations does — you just run out of fuel in
section two.

### Added

- **The movement score.** How to spread the gesture across the whole page in three roles and no
  more than three: **the moment** (one, the hero, 60-70% of the effort), **the echoes** (one per
  section — the same gesture, one dimension smaller, doing local work) and **the thread** (the
  continuous, mute one: separators, timestamps, the instrument surface). Includes how to *derive*
  an echo instead of inventing it, the scroll rhythm rule (two long text blocks in a row with
  nothing happening is where a page gets abandoned), what does **not** count as movement (the
  identical fade-up on every block is the most common template signature there is), and why this
  works at all: it demonstrates instead of asserting, it lowers the cost of understanding, and it
  gives the scroll a reason to continue.

- **A catalogue of seven mechanism families**, so the moment doesn't depend on inspiration. Entered
  by what the page has to *prove*: translate · replay · connect · complete · compare ·
  disassemble · filter. Five of them point at working code; two describe the mechanism only, and
  say so.

- **`references/graph-react.md` — the graph that wires itself.** Loose pieces travel to their place
  and cables draw themselves into a system with an input and an output. The third production-tested
  mechanism, alongside the sweep and the tape. Covers the three-phase state machine whose *base
  state is the finished system* (so it survives no-JS and reduced-motion), coordinates as data
  instead of drawing, measuring each path with `getTotalLength()` instead of estimating it, the
  transition-placement trap that makes the cables animate backwards, and the "play it again" button
  — half your visitors arrive at the section looking somewhere else.

- The example page now shows an **echo**, not just the moment: the grid fragments in each step light
  up with the same staggering as the hero when the section arrives.

## 0.2.0 — 2026-08-26

If you installed 0.1.0, **update**: `/plugin update landing-moment`. One of these is a fix to a
command that didn't run at all.

### Fixed

- **The detector command didn't work for anyone who installed the plugin.** The skill documented
  `node ${CLAUDE_PLUGIN_ROOT}/scripts/detect.mjs`, but that variable is only substituted in hooks
  and MCP configs — in a shell it's empty, so the command failed with
  `Cannot find module '/scripts/detect.mjs'`. The skill now locates the script itself.

### Added

- **`scripts/audit.mjs` — the craft floor, measured on the rendered page.** Opens the page in the
  Chrome / Chromium / Edge / Brave you already have, over CDP through Node's built-in WebSocket:
  **zero dependencies, installs nothing**. Scrolls the whole page first so sections that reveal on
  scroll are in their real state, then measures contrast (compositing translucent layers the way
  the browser does), line measure by real glyph width, 390px overflow, `prefers-reduced-motion`,
  no-JS degradation, fonts that failed to load, and console errors. `--autotest` covers 6 cases.

  Calibrated against a production landing: it started at 55 findings, 44 of them false positives
  (gradient backgrounds, `rgba()` read as a solid colour, measuring without scrolling). All three
  causes fixed; the 11 that remained were real — including a 9px mobile overflow that was live.

- **A copy gate as step 0 of the method.** Three filters the headline must pass (a concrete noun, a
  number or proper name, a tension) and the words to stop with when it doesn't. This was a footnote
  before; it's the single biggest reason AI landings come out generic.

- **A typeface table** in the craft floor, by visual world. Telling someone not to use Inter without
  offering alternatives ends in Inter.

- **`references/example-page.html`** — a complete, self-contained landing with its own moment,
  commented step by step, that passes both tools. The reference components were mechanisms; this is
  a whole page.

## 0.1.0

Initial release: the authored-moment method, the craft floor, two reference components, the
library/licence table, and `detect.mjs`.
