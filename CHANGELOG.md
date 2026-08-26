# Changelog

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
