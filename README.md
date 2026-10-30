# Tokkey landing page

Static landing page for **Tokkey** (amis / cpilot.net): a USB-C key that runs local AI on a Mac.
This package contains the Home page **through screen 4**. No build step, no dependencies.

## ⚠️ Read this first: the Tokkey branding design file

All design work follows **[`docs/tokkey-brand-web/SKILL.md`](docs/tokkey-brand-web/SKILL.md)**
(the Tokkey branding design guideline: colors, type scale, 8px grid and padding hierarchy, logo SVG,
photography, icons, do's and don'ts). Read it before changing any UI, color, type, spacing, logo or image.
Do not substitute other fonts, colors or styles. If something is not covered, ask the designer.

If you use Claude (or another AI coding tool), load that file as the skill / project context first
(Claude: add it as a skill named `tokkey-brand-web`). `AGENTS.md` points tools to it automatically.

## Fonts (required, no substitutes)

| Role | Font | Download |
|---|---|---|
| Default (headings, body, nav, buttons) | **Inter** (400 / 600 / 700) | Google Fonts: https://fonts.google.com/specimen/Inter · Official site: https://rsms.me/inter/ |
| Machine output, labels, data (about 10% of text) | **Commit Mono** | https://commitmono.com · GitHub: https://github.com/eigilnikolajsen/commit-mono |

- **Commit Mono is bundled** in `fonts/` (OFL license, `fonts/LICENSE-CommitMono-OFL.txt`) and loaded with `@font-face` in `index.html`: Regular and Bold, upright and italic.
- **Inter** is loaded from Google Fonts in `<head>`. To self-host, download it from either link above and add `@font-face` rules.
- Do not use Commit Mono for nav, buttons, captions, paragraphs or footer (see the skill).

## Run locally
    python3 -m http.server 8000
    # open http://localhost:8000   (open via http, not file://, so fonts and frames load)

## Structure
- `index.html` – the page: CSS in `<style>`, JS in one `<script>`, logo as inline SVG
- `fonts/` – Commit Mono files + license
- `vf/` – hero frame sequence (`f00-f34.webp`, `hi.webp`), drawn on a canvas by scroll position
- `lap2.webp` (laptop cutout), `lap.webp`, `lid.png` (closed lid), `plug.webp`, `flow.webp`,
  `tokkey.png`, `k4_plate.webp`, `k4_close.webp` (screen 4 light guidance)
- `docs/tokkey-brand-web/SKILL.md` – branding design guideline

## How the page works
Scroll-driven, one `requestAnimationFrame` loop (`frame()`), smoothed scroll `Y`.
Each screen is a tall `section.pin` with a `position:sticky` stage; progress is the scroll position
within the section, mapped with helpers `clamp, seg, ease, lerp`.
- `#sx` (900vh): screens 1-2, hero, agent chips fly into the key, ASCII ripple (`#bas`)
- `#s3` (560vh): screen 3, zoom into the laptop screen, glass UI reveal, ASCII background (`#bas3`)
- `#s4` (460vh): screen 4, four tabs. Tab 1 has a draggable model-size slider (`#msl`, snaps 4B / 9B / 35B).
  Scroll picks the tab; clicking a title overrides for 2.5 s.
- Changing section heights changes scroll pacing. `size()` recomputes layout on resize.

## Known gaps / placeholders
- Nav links (Software, Models, Pricing, Dev Doc, FAQ) point to `#`; those pages are not in this package.
- Screens 5+ are not included. `index.html` still has some unused CSS from them; safe to delete.
- Slider values: only **35B ≈ 5 GB with Tokkey vs ≈ 23 GB without** is a real claim. 4B / 9B numbers are
  extrapolated placeholders. Get real figures before launch.
- Product imagery: no stock or AI-generated product photos (see the skill).
- Screens 3-4 use translucent glass UI and a lime `#C6F24E` for slider / running states, in addition to
  brand green `#4ABE18`. Check these against the skill with the designer before extending them.
- Mobile / touch and real-device scroll feel are untested.

## Deploy
GitHub Pages: Settings → Pages → deploy from branch `main`, folder `/ (root)`.
