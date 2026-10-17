# Ahmed Abbas Ashour — Portfolio v2

Bilingual (Arabic / English) portfolio for a full-stack developer and technical lead in Baghdad.
Same emerald & gold palette as v1; new identity, layout, content and interactions.
Built with React 19, TypeScript, Vite and GSAP.

```bash
npm install
npm run dev        # http://localhost:5173  (Arabic: /ar/)
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
npm run lint
```

Deploy (Cloudflare Pages): build command `npm run build`, output directory `dist`
(or `npx wrangler pages deploy dist`).

## What is on the page

| Section | What it does |
|---|---|
| Hero | Headline, live Baghdad time + availability, the core stack as one quiet line under the lead, the **developer badge** (a pendulum you can drag to swing, brush to nudge, and click/tap to flip to its `credential.json`; holographic guilloche foil that turns with its tilt; on touch screens it tips with the scroll) and, behind it, the **astrolabe**: a 3D armillary sphere in guilloche line-work that engraves itself in, turns slowly about a pole raised to Baghdad's latitude, and follows the pointer and the scroll (on phones and tablets it starts beside the headline and travels down with the scroll to frame the badge). Facts count up. |
| Work | Four featured case studies as **stacking cards** that rise in perspective and settle back like pages in a folio, each with an animated **architecture sketch** (data packets, "in scope" marks, hover to trace a node's connections). A soft light follows the pointer (on phones, the scroll) and reveals guilloche engraving in the card. Three more systems in an expandable index. |
| Services | Six services on the one cream "paper" panel (same palette, inverted); under the light, the sheet shows emerald engraving. |
| Process | Five steps on a rail that fills as you scroll; each step lights up with a ring and a wash of gold. |
| Stack | Isometric layer plates (interface → server → data → automation) that open out as the section scrolls in; the layer being read lifts its plate. On phones the plates stay pinned above the list. |
| About | Story, principles, an at-a-glance ledger, and the Baghdad / al-Khwārizmī card (leans toward the pointer). |
| Contact | Form with project-type and timeline chips, plus a **live HTTP request preview** that builds the JSON as you type and shows the real response status. |
| Footer | The astrolabe again, rising like a sun behind the closing call to action. |
| Everywhere | Section titles turn up word by word; gold accent words catch one sweep of light; a gold reading-progress hairline under the header; the stack marquee quickens with the scroll. **Quick actions** palette (`Ctrl K` / `⌘K` or `/`), toasts, and a print stylesheet: **Print → Save as PDF gives a clean résumé**. |

## Editing content

Personal content lives in `src/content/`; interface copy lives in `src/i18n/`.

| File | What to edit |
|---|---|
| `src/content/site.ts` | Email, WhatsApp, socials (add LinkedIn/GitHub in the same shape), CV file per language (`cv.en` / `cv.ar`), Formspree endpoint, availability, time zone, `site.url`, Open Graph images, analytics/verification codes, the stack marquee, the core-stack line under the hero (`heroStack`) |
| `src/content/projects.ts` | The seven projects: headline, summary, scope (`roles`), delivered work (`owned`), stack, `featured`, optional real screenshot (`media`), and the architecture sketch (`blueprint`). Copy describes the work, not the person — no "I". |
| `src/content/stack.ts` | Stack layers and ways of working |
| `src/i18n/en.ts`, `src/i18n/ar.ts` | All interface copy. `ar.ts` is typed against `en.ts`, so a missing translation fails the build. In titles, `*word*` marks the accent word (serif italic in English, Ruqʿah calligraphy in Arabic). |
| `src/i18n/meta.ts` | Page titles and descriptions (also used for Open Graph and JSON-LD) |

### Architecture sketches (`blueprint`)

Each node has a `kind` (`actor`, `app`, `api`, `db`, `ext`, `out`, `ai`), a grid cell for the
wide layout (`wide: [column, row]`, up to 4 columns) and for phones (`tall: [column, row]`, up to 2 columns),
a bilingual `label`/`sub`, and `mine: true` for the parts in Ahmed's scope (shown as "In scope"; keep that honest).
Edges (`from` → `to`) route themselves; `twoWay` adds return traffic, and `wideSides` / `tallSides`
force ports when the automatic route would cross something. Everything mirrors automatically in Arabic.

### Adding a real screenshot

Put the image in `public/projects/` and set `media` on the project:

```ts
media: { src: '/projects/opsiq.webp', width: 1600, height: 1000, alt: { en: 'OpsIQ dashboard', ar: 'لوحة تحكم OpsIQ' } }
```

## Contact form

- `profile.formEndpoint` set (Formspree) → the form POSTs JSON (`name`, `email`, `company`, `type`, `timeline`, `message`, `language`) and reports the real result.
- Empty → it opens the visitor's email app with the request ready, and says so.

## Search & sharing

Generated at build time from `src/content/site.ts` and `src/i18n/meta.ts`: localized `<title>`/description,
Open Graph, canonical + hreflang, `sitemap.xml`, `robots.txt`, and schema.org `Person` JSON-LD.
`public/` holds the favicon (the أحمد · Ahmed mark from the brand kit), PNG/maskable icons, `site.webmanifest` and the two 1200×630
Open Graph images. `tools/og.html` + `tools/og.mjs` regenerate the OG images and icons (optional; needs
`npm i -D playwright-core` and a local Chrome).

`public/_headers` sets the Cloudflare Pages security headers (Content-Security-Policy and friends) and long
caching for `/assets/*`; when a third-party service is added, add its origin to the CSP there.
`public/404.html` (+ `404.css`) is the bilingual page Cloudflare serves with a 404 status for unknown paths.
`tools/cvlogo.py` put the brand icon on the CV PDFs (pypdf + reportlab; originals in `tools/source/`).

## Design notes

- **Palette (unchanged):** emerald `#0C4A3E`, deep `#07332B`, panel `#0A3F35`, gold `#D9C18D` / `#EAD6A4`, cream `#EFE6CC`, muted `#A9BFB1`, mint `#5FE0C8` / `#84D0BC`. Every other colour is a mix of these (`src/styles/tokens.css`).
- **Type:** Instrument Serif (display, italic accent) · Geist (text) · Geist Mono (labels, code; Alexandria takes any Arabic inside mono text, which the system fallback would set as spaced-out monospaced letters) · Alexandria (Arabic headings and interface, one variable file) · IBM Plex Sans Arabic 400 (Arabic running text) · Aref Ruqaa (Arabic accent — Ruqʿah, the everyday handwriting of Iraq). All self-hosted and split by unicode-range, so Arabic files only download when Arabic renders.
- **Identity:** the أحمد · Ahmed wordmark — one shared first letter read leftward in Arabic and rightward in English (brand kit: `E:\Ahmed-Brand`); guilloche line-work from security printing (a nod to the data-security degree); engineering-grid and blueprint details.
- **Motion & 3D:** GSAP + ScrollTrigger for reveals, stacking cards, the opening stack plates and the process rail; SMIL for sketch packets (paused off-screen); a small spring for the badge; one hand-written canvas renderer for the astrolabe (`src/components/astrolabe/`, no 3D library: about 4 KB gzipped for everything new). `src/motion/useDepth.ts` drives the light/engraving surfaces (`data-spot`) and the 3D lean (`data-tilt`) by delegation, with scroll-driven equivalents on touch screens so phones get every effect. The canvas pauses off-screen and in background tabs, runs at 30 fps on phones and drops detail on slow devices.
- **Phones:** laid out for the phone, not shrunk from the desktop. The hero has a one-line status, one call to action and two quiet links under it; sections sit closer together; each service puts its icon beside its title; the architecture sketch runs edge to edge inside its case card (larger labels) and the stack becomes quiet tokens; the pinned stack plates are opaque, so the list never shows through them; the ledger reads as a spec sheet; the footer links sit in two columns. Checked at 360, 375, 390 and 430 px in both languages, and on tablets.
- **Reduced motion (`prefers-reduced-motion: reduce`):** nothing moves — no swing, rotation, tilt, parallax or marquee; the astrolabe is a still engraving. The page still arrives with plain fades, numbers still count, and the light (accent sweep, surface light) stays, because a change of light is not motion. Note that Windows "Animation effects: off" turns this mode on in every browser.
- **Accessibility:** checked with axe-core (WCAG 2.2 AA + best practices) in both languages on desktop and phone: no violations. Keyboard support throughout (palette combobox, accordion, badge flip button, dialog menu), visible focus, skip link.
