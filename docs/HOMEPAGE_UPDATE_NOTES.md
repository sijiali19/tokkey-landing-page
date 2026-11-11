# Tokkey landing page — homepage update (Nov 2026)

Static site, no build step. Open `index.html` through any static server (ES modules + fetch need http, not file://).

## What changed in this drop
- `index.html` — "Release the True Power" scroll story rebuilt: scroll-scrubbed frame sequence (`u/*.webp`), With / Without Tokkey text, handoff to the draggable three.js model. "Meet Tokkey" heading removed. Green glow removed from the exploded view.
- `sr3d.js` — three.js model; default pose changed to match the last sequence frame.
- `blog.html` (new) — Blog / Research page, linked in the nav after Technology. All posts are placeholders.
- `u/00.webp … 53.webp` (new) — the sequence. Each file is a sprite sheet holding 3 frames stacked vertically (1440×810 each), 160 frames total. Order is file index × 3 + row.
- `hero.jpg` (new) — blue gradient background used by `blog.html`.

## Notes
- `model_glb.js` and `env_hdr.js` are the GLB model and HDR environment as base64 ES modules (~12 MB). Replace with real .glb/.hdr + normal loaders on a real host if preferred.
- `f/a–d` are the intro frame sequences; `f/e`, `f/g` are no longer used and not included.
- Pages linked from the nav but not in this folder (`software.html`, `technology.html`, `faq.html`, `pricing.html`, `devdoc.html`, `models.html`, `thanks.html`) already exist in the repo / are unchanged.
- `config.js` holds a placeholder Stripe link; set `STRIPE_URL`.
- Placeholder content to replace before launch: blog posts, dates, newsletter form, "Draft title" tags.
