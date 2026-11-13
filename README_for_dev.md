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

## Software page: feature scroll story (Nov 13)
- `software.html` — the five feature scenes are now a scroll story at ≥761 px: the copy scrolls on the left and fades with distance from the viewport centre, the UI preview stays pinned on the right (`.fxv`, `position:sticky`) and cross-fades per chapter (opacity .65s, transform .85s, 25px rise, scale .985, `cubic-bezier(.22,1,.36,1)`). A chapter bar ("01 / 05" + five links) is pinned to the bottom while the story is on screen. At ≤760 px each UI sits under its copy, with no pinning and no chapter bar. Motion is off under `prefers-reduced-motion`.
- How it works: on wide screens the script moves each `.fx-stage` into `#fxvStage`; on narrow screens it moves them back into their section. The breakpoint lives in two places that must stay in sync: the media queries in the CSS and `matchMedia('(min-width:761px)')` in the script. Do not put `overflow:hidden/auto` on an ancestor of `.fxv` (it breaks sticky).
- Preview micro-interactions (demo only, nothing is sent): agent picker (`.hub-opt`), model menu (`.comp .sel`, `#fxMenu`), and a `<dialog id="fxDialog">` opened by "Open … ↗", the send buttons, "Review & continue →" and the chat follow-up field. Replace those handlers if these should lead to real product entry points.
- Motion and interactions are adapted from the "Tokkey Features" hand-off (`index.html` + `style.css` + `app.js`, Figma section 1066:1508). Fonts, colours and the grey glow are unchanged from the previous version of this page.

## Private agent scene + responsive pass (Nov 13)
- `index.html` — "A private agent on your Mac" (`#s3`): the screen video is replaced by an HTML scene (`#p0`): ribbon wallpaper (`s3_wall2.webp`), a dialog that loops through ask → think → answer, the Tokkey status panel, the slogan, and a steadily rotating gradient border. The Tokkey key stays visible under the screen. Styles and script live in `<style id="ag-motion">` and the script after it.
- The same section now scales with window height (short laptop windows, tablets) and has a phone layout (a copy of the scene inside `.k-m3`).
- Phones (≤767px): cards get 20px padding and 12px gaps (`<style id="mob-space">`); FAQ, the closing CTA and the footer are moved out of `#s9` (hidden on phones) so they show; the closing statement `#s12` is readable.
- Phone hero uses the same character-field ripple as the desktop hero (`<style id="mob-ripple">` + script) instead of `m_ripple_hero.jpg`.
- `s3_screen.mp4` / `s3_screen_poster.jpg` are no longer referenced by `index.html` (left in place).
- To check before launch: the dialog is titled "Siri" with the line "Apple Intelligence · on-device via Tokkey". These are Apple trademarks; confirm the wording is cleared or swap in a neutral name.
