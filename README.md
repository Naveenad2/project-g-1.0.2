# Gieom.cloud — marketing site

Next.js 16 (App Router) + TypeScript rebuild of the Gieom.cloud website. All 33 pages and their copy carry over from the
original prototype; the design, typography, layout and code are new.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # static export to ./out
npm start            # serve ./out locally
npm run lint && npm run typecheck && npm run format:check
```

Requires Node 20.9 or newer.

## Deploying

`next build` writes a fully static site to `out/` (`output: 'export'` in `next.config.ts`). Upload that folder to
Cloudflare Pages, Netlify, S3/CloudFront or any static host. `public/_redirects` maps the old prototype URLs
(`/About.html`, `/ProductPolicy.html`, …) to the new routes with 301s on Cloudflare Pages and Netlify.

On Cloudflare Pages: build command `npm run build`, output directory `out`.

## Typography

- **Headings:** Helvetica Now Display, falling back to Helvetica Neue → Helvetica → Inter.
- **Body and UI:** Inter (self-hosted at build time through `next/font`).

Helvetica Now Display is a licensed Monotype font, so it is not bundled. `src/styles/fonts.css` uses a copy installed on
the visitor's machine when one is present. To self-host your licensed files, place the `.woff2` files in `public/fonts/`
and add a `url()` after each `local()` in that file (an example is in the file header).

## Theme

The site always opens in the light theme, whatever the operating-system setting. Visitors can switch to dark mode with
the toggle in the header (and footer); the choice is stored in `localStorage` (`gieom-theme`) and applied before first
paint, so there is no flash. All colours are tokens in `src/styles/tokens.css`, with a light and a dark set.

## Design system

- **Surfaces:** every hero is a full-width brand gradient with rounded lower corners and a luminous horizon line. Dark
  showcase sections (`.section--deep`), the closing call-to-action card and the footer are inset rounded panels. Light
  areas sit on a continuous page wash (`--page-bg`) of teal, mint and warm light, so nothing is flat white. Dark panels use the `is-dark` token set,
  and light islands inside them (forms, product windows) use `is-light`.
- **Gradients:** `GradientBg` (`src/components/ui/GradientBg.tsx`) layers slowly drifting radial light in navy, teal,
  mint and orange, with variants `hero`, `deep`, `soft` and `cta`. It is text-free and static under reduced motion.
- **Header:** a floating glass bar. It is dark glass over the gradient hero and turns frosted white once the page scrolls.
- **Sharp text by rule:** nothing that contains text is rotated, scaled or put in perspective, so text is never
  rasterised soft. Depth comes from glass, light, shadow and 2D motion. Only the text-free `DocStack` and the platform
  layer stack use CSS 3D.
- **Layouts:** dense bento grids. Feature cards (`FeatureStep`) align their rows with `subgrid`, and a lone last card
  runs full width. The platform bento and features bento follow the same pattern. `Showcase` frames product visuals on a
  gradient or glass plate.
- **Home showpieces:** the hero app window with the live linking demo and the regulators band along the hero's base;
  `CapabilityMap`, ten line illustrations joined by one dotted path, with the description of the selected one underneath (the Impact
  analyser wave runs along the path); and `FeatureTabs`, an auto-advancing list beside one live demo.
- **Interaction:** `SpotlightController` lights `[data-spotlight]` cards under the cursor with one delegated listener.
- **States:** `Status` and `Severity` glyphs replace coloured pills, and entity chips carry type glyphs.
- **Motion:** word-by-word headline reveals, scroll-driven reveals, gradient drift and a reading-progress hairline. All
  of it respects `prefers-reduced-motion`, and the timed tours pause on hover, on focus and off-screen.

## Project structure

```
src/
  app/
    layout.tsx               Root: fonts, theme bootstrap, metadata
    globals.css              Reset, base typography, context tokens, buttons, chips, bento rules, utilities
    (site)/                  Pages that share the header and footer
      page.tsx               Home
      products/*             Six product pages
      solutions/*            Seven solution pages (role + industry)
      about, customers, partners, careers, blog, guides, webinars, help, glossary,
      pricing, trust, contact, demo, trial, status, privacy, terms, dpa
    login/                   Sign-in (own split layout)
    not-found.tsx
  components/
    layout/                  Header (floating bar, mega menu, drawer), Footer, ThemeToggle, SpotlightController
    blocks/                  PageHero, ProblemGrid, FeatureStep, Tiles, CtaBand, DocStack, Timeline, Faq,
                             IndustryPage template, LegalLayout
    home/                    CapabilityMap and CapabilityArt, FeatureTabs, PlatformStack bento, animated product demos
    mocks/                   Product UI mock-ups used across pages (registers, RCSA, workflow…)
    forms/                   Field primitives, Contact/Demo/Trial forms, StaticForm
    pricing/, resources/     Pricing tiers toggle, case-study and blog filters
    ui/                      GradientBg, Showcase, Status, Rise, Icon, Logo, ButtonLink, Section, Screenshot, VideoPlayer
  lib/
    routes.ts                Every internal URL in one place
    navigation.ts            Header and footer menus
    hooks.ts                 useInView, useSequence (demo timelines), reduced-motion
    geometry.ts              Layout offsets for demo cursor targets, unaffected by entrance transforms
    theme.ts                 Theme bootstrap and toggle logic
  styles/                    Design tokens, fonts, shared page modules
```

## Content notes

- Copy matches the live original site as of 12 November 2026, including the home page's proof list, the closing
  "Show an auditor…" band and the tour title.

- Bracketed items such as `[Starter price]` or `[support email]` are placeholders carried over from the original
  site. They are highlighted on purpose so they are easy to find and replace.
- The Contact, Demo and Trial forms show their confirmation state on submit. No form is connected to a backend yet,
  as in the original prototype. The Trust, Partners, newsletter, Help search and Login forms validate and confirm
  on the button.
- Cards for articles, guides, roles, recordings and templates link to `#` until those pages exist.
