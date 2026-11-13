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

## v64 additions (Nov 12)
- `index.html` — "Made for your daily tasks" autoplay carousel (`#c5`, 5 slides, images `c5_*.webp`); "Personal intelligence" + "Local power" merged into one spine layout (`#s9`, 1920px design stage scaled by `--nk`, assets `z_a/z_b.webp`, `n9b_*`, `n11_*`); FAQ heading left-aligned.
- Floating **Sign up for Kickstarter** button (`#kkw`, glass style) with sticker (`kk_sticker.png`, appears after 10 s for 30 s) and email form. Markup, CSS and JS are at the end of `index.html`.
- **TODO for dev:** (1) the email form is front-end only: wire `#kkf` submit to your endpoint (e.g. Kickstarter "notify me" / email service); (2) add the Kickstarter campaign URL; (3) sticker is cropped from a 172px sprite, replace with an official high-res asset (https://www.kickstarter.com/help/brand_assets).
- Design reference: Figma file VY7ZJBmhwLJcMCpQ6fQtrW (Scene 02, node 900:2932).

## Software page (Nov 12)
- `software.html` (new) — the page the nav's "Software" link and "Reserve your spot" (`software.html#early`) point to. Single static file, no build step.
- Structure: fixed header (same as `index.html`; inverts to dark-on-light over the light sections) → hero "Own your AI." → five feature scenes laid out one after another (Agent Hub, Private Chat, No AI Credits, Your existing workflow, Router) → Early access form (`#early` / `#access`) → footer.
- Feature scenes are HTML/CSS, not images. Every size inside `.fx-stage` is a Figma pixel multiplied by `--u` (= `min(100cqw,1920px)/1920`), so a scene scales with the viewport. At ≤1100 px the copy stacks above the UI.
- Fonts follow `index.html`: titles Inter (Google Fonts link), body Geist and labels Geist Mono (`fonts/Geist-Variable.woff2`, `fonts/GeistMono-Variable.woff2`).
- Background of the hero and the closing block is `hero.jpg`. The character-field pattern is drawn on three `<canvas>` elements by the last inline `<script>`; it is static under `prefers-reduced-motion`.
- **TODO for dev:** the Early access form is front-end only (`onsubmit` just swaps the button label): wire it to your endpoint. Footer links "Pricing", "Dev Doc", "FAQ" are `#` placeholders. The "$20 Router credit" copy needs sign-off before launch.
- Design reference: Figma file VY7ZJBmhwLJcMCpQ6fQtrW, page "11/12", frame "Features" (node 1094:790). The page uses a neutral grey glow behind the UI cards where Figma has pale blue.
