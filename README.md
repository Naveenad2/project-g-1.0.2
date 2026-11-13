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

### Testing on a phone or tablet

`npm run dev` prints a **Network** address (for example `http://192.168.1.10:3000`); open that on a device on the
same Wi-Fi. Next.js blocks its dev resources for any host other than `localhost` unless the host is listed in
`allowedDevOrigins`. Without it, live reload and the on-demand chunks (the globe, the 3D story) fail on the device.
`next.config.ts` adds this machine's own network addresses automatically, so restart `npm run dev` after it changes
or when you join a different network. Development mode is unoptimised, so judge smoothness on a production build:
`npm run build && npm start`, then open the printed network address.

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

- **Palette:** Gieom.cloud Tangerine & Teal. Tangerine `#FF8A24` for primary calls to action, with navy text; teal
  `#00B3AA` for the secondary action and shapes; deep teal `#00807A` for links; navy `#0F2D3D` for headings, body copy
  and dark bands; mint `#EDF9F6` for section backgrounds; and off-white `#FDFDFD` for the page. The tangerine-to-teal
  signature gradient is kept for accents (globe arcs, progress lines). Every value is a token in `tokens.css`. Dark mode
  is a navy theme, not black.
- **Surfaces:** the page is off-white with a fine film grain. Heroes are full-width light gradients with rounded lower
  corners. Mint bands (`.section--mint`) fade in and out at their edges. Navy bands (`.section--deep`), the closing
  call to action and the footer are inset rounded panels with an animated field. Dark panels use the `is-dark` token
  set, and light islands inside them (forms, product windows) use `is-light`.
- **Gradients:** `GradientBg` layers five soft radial lights (tangerine, teal, white, peach, aqua) that drift on long,
  offset loops, and adds a static grain. Only `transform` animates, on the compositor, so it never repaints or
  flickers. Variants: `hero`, `soft`, `deep`, `cta` and `vivid`. It is static under reduced motion.
- **The earth:** `Globe` (`src/components/globe`) is a three.js scene drawn as a porcelain sphere with a faint
  graticule. Land is drawn as fine coastline outlines only, kept light so the copy beside it stays the focus. The
  outlines come from Natural Earth's 1:110m land data (public domain), packed into `coastlines.ts`. Each one is a
  continuous ribbon about 1 CSS pixel wide on any screen. Country borders are left out on purpose, because several
  near the hubs are disputed. Arcs in the signature gradient link the regulators the site names: RBI, SEBI, IRDAI,
  CBUAE, ADGM, DFSA, SAMA, CBB, QFCRA and FATF. The scene also has pulsing hubs, travelling light, two dotted orbits
  and an atmosphere halo. It loads only when it nears the viewport, renders only while it is visible and the tab is
  active, and fades in on its first frame. Framings: `hero` (home), `art` (inner heroes without a product visual)
  and `horizon` (a low, wide view, not used at present). A parent can set `--globe-fade: <start> <end>` (fractions
  of the canvas height) to fade the drawing out towards its foot. The fade is done inside the canvas, not with a CSS
  mask, which flickers over a live canvas on phones.
- **Home hero:** a full-width gradient panel with rounded lower corners, like the inner heroes. It holds the copy,
  the giant earth and the regulators band. The next section (the live linking demo, with a short introduction beside
  it) follows in normal flow. Its field rises out of the page under the hero, so nothing slides over anything. As the
  hero scrolls away, the earth turns and moves closer inside its canvas. With a mouse, the copy also lifts and fades;
  on touch screens only the earth responds, so nothing jitters against native scrolling. On phones and tablets the
  earth sits between the buttons and the paragraph, and fades out before the paragraph starts.
- **Tour:** the heading, the tour's title and chapters, and a link sit beside a contained, glass-framed poster rather
  than a full-width image.
- **Closing call to action (`CtaBand`):** open to the page, not a card. Centred copy sits on saturated tangerine
  and teal light that fades into the page on every side.
- **How it works (`CapabilityStory` + `src/components/story/scene.ts`):** a frameless three.js scene that blends
  into the page, with the copy in the lead: large titles and body text, and the scene fading out well before the
  text column. The section's heading opens the story beside an establishing shot: the policy document on its tray,
  on a faint drafting grid, with dashed footprints and guide paths where the capabilities will be built.
  - **Models:** each capability is drawn as the product shows it, not as abstract shapes. Thin matte cards carry
    printed interface detail: tabbed register cards, Magpie's suggestions lifting off the clauses they touch, a
    policy joined to its regulation, control, risk and owner, an SOP flow in two swimlanes, a workflow canvas with
    its form and escalation matrix, the lifecycle rail with the board tier, a roster of readers, the 5 × 5 heat map
    and a dashboard. There are no spheres, cubes, glass or gloss.
  - **How it is built:** every model is a few merged meshes built from flat outlines (`Geo`), coloured by role from
    one palette uniform, so a theme switch is a single uniform update. Connectors are constant-width screen-space
    lines (`Lines`) that draw in, carry a travelling highlight and the Impact Analyser's wave. A whole chapter is
    under 80 draw calls and about 20k triangles. Quality also adapts: if frames run long, the scene renders fewer
    pixels.
  - **Scroll:** the steps scroll as real text. Scroll position, measured from the steps' own positions, drives a
    camera that orbits from one capability to the next, comes in to the document for Magpie AI, rises for the
    Impact Analyser's shockwave and pulls back to show everything connected. Objects out of focus fade into the page
    colour. The original illustration labels are plain HTML annotations projected beside the objects, never in
    boxes.
  - **Layout:** on desktop the stage is pinned full-bleed behind the text, and the camera steps back on narrower
    screens so each model stays clear of the copy. On phones and tablets it is a band, 40% of the screen, pinned
    under the header, and a chapter begins as its title reaches the top of the reading area below the band. Without
    WebGL the story still reads as text.
- **Motion:** `MotionProvider` runs Lenis smooth scrolling on GSAP's ticker. On every route it reveals `.reveal`
  blocks with staggered fades and section headings line by line (SplitText, reverted afterwards). Only content that
  starts below the fold is ever hidden, so nothing flashes and nothing stays hidden if scripts fail. Hero copy enters
  through CSS (`.load-in`, `Rise`), and client-side navigations fade the new page in (`template.tsx`). Everything
  respects `prefers-reduced-motion`.
- **Moving between pages:** a link opens the new page at its top at once, or at its `#anchor` when it has one. The
  jump is never animated through the new page, and a smooth-scroll glide still running from the previous page is
  cancelled (`startPage` in `src/lib/scroll.ts`, called from `MotionProvider`). Back and forward keep the position the
  browser restores. A link to the page you are already on, such as the logo on the home page, glides back to the top.
  `<html data-scroll-behavior="smooth">` lets Next.js switch CSS smooth scrolling off during route changes.
- **Sharp text by rule:** nothing that contains text is rotated, scaled or put in perspective. Motion on text is
  translate and opacity only, cleared when it ends.
- **Liquid glass:** cards, the secondary button, the header, the demo window and the replay control share the
  `--glass-*` tokens. These give a translucent fill with a specular sheen, a bright rim, a soft teal inner glow and a
  navy shadow. Real backdrop blur is kept to the few surfaces with detail behind them, so scrolling stays light on
  phones.
- **Phones and tablets (touch screens):** built to avoid the usual causes of mobile flicker.
  - Gradients stay still.
  - Only the header bar keeps a backdrop blur.
  - Nothing masks a live WebGL canvas or the regulators marquee. The home earth fades out inside its own canvas,
    the regulators marquee simply runs off the screen edges, and soft overlays do the other fades.
  - Scrolling is native: Lenis is off, and there are no scroll-linked reveals, parallax or text movement.
  - The feature tabs advance only when tapped.
  - The page transition is a plain fade.
  - The globe canvases keep their drawing buffer within a pixel budget phones and tablets will allocate.
- **No template tropes:** no icons in tinted squares, no status pills with dots, no numbered step badges, no glass
  kicker pills and no gradient text. Lists use a short teal rule.
- **Interaction:** `SpotlightController` lights `[data-spotlight]` cards under the cursor with one delegated listener.

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
    motion/                  MotionProvider (Lenis + GSAP reveals, scroll position when pages change)
    globe/                   Globe (React wrapper), scene (three.js), coastlines (encoded land outlines)
    blocks/                  PageHero, ProblemGrid, FeatureStep, Tiles, CtaBand, Timeline, Faq,
                             IndustryPage template, LegalLayout
    home/                    HomeHero, CapabilityStory, FeatureTabs, PlatformStack index, product demos
    story/                   scene (three.js) for the How it works story
    mocks/                   Product UI mock-ups used across pages (registers, RCSA, workflow…)
    forms/                   Field primitives, Contact/Demo/Trial forms, StaticForm
    pricing/, resources/     Pricing tiers toggle, case-study and blog filters
    ui/                      GradientBg, Showcase, Status, Rise, Icon, Logo, ButtonLink, Section, Screenshot, VideoPlayer
  lib/
    routes.ts                Every internal URL in one place
    navigation.ts            Header and footer menus
    hooks.ts                 useInView, useSequence (demo timelines), reduced-motion
    scroll.ts                Smooth-scroll instance, scroll lock, page-start and scroll-to helpers
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
