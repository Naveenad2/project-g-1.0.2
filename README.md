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
`allowedDevOrigins`. Without it, live reload and the on-demand chunk for the 3D story fail on the device.
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
  signature gradient is kept for accents (the week story's thread, progress lines, the pricing switch). Every value is a token in `tokens.css`. Dark mode
  is a navy theme, not black.
- **Surfaces:** the page is off-white with a very fine film grain, kept faint. Heroes are full-width light gradients with rounded lower
  corners. Mint bands (`.section--mint`) fade in and out at their edges. Navy bands (`.section--deep`), the closing
  call to action and the footer are inset rounded panels with an animated field. Dark panels use the `is-dark` token
  set, and light islands inside them (forms, product windows) use `is-light`.
- **Gradients:** `GradientBg` layers five soft radial lights (tangerine, teal, white, peach, aqua) that drift on long,
  offset loops, and adds a light static grain (kept low, with the colour a touch richer). Only `transform` animates, on the compositor, so it never repaints or
  flickers. Variants: `hero`, `soft`, `deep`, `cta` and `vivid`. It is static under reduced motion.
- **Inner heroes (`PageHero`):** the copy on the full-width gradient, with a product visual beside it where a page
  has one. No hero on the site uses an earth or any other 3D art.
- **Home hero:** a full-width gradient panel with rounded lower corners, like the inner heroes, with the original
  type sizes. Following the design team's note to keep it light on text, it holds only the headline, one sentence
  and the two actions, beside the widget board, with the regulators band along its foot. The next section follows in
  normal flow, so nothing slides over anything. With a mouse, the copy and the board lift as the hero scrolls away;
  touch screens keep native scrolling with nothing moving against it. On phones and tablets the board sits between
  the actions and the sentence.
- **Widget board (`ImpactMap`):** the hero's visual: the idea of the impact map in Gieom's design, built as a board
  of glass widgets with product content from the rest of the site.
  - **The story:** a new circular (CBUAE Circular 1/2026) drops into the regulations feed above two already mapped.
    A light reads down the impact map, light lines run into the three policies it hits ("Update"), and the owners
    are notified. Michael Torres approves, the acknowledgement ring fills as the readers count up to 1,240 of 1,300,
    and linkage coverage (AML-POL-0115) fills beside.
  - **The glass:** kept calm: a mostly solid light fill over a slight backdrop blur, a soft rim, a faint inner glow
    and a gentle light that follows the pointer. Behind it sit a fine drafting grid and two soft lights. Touch
    screens get the same look without backdrop blur or pointer effects, which keeps scrolling there free of
    flicker.
  - **Sharp text:** every widget is real text on flat layers, never 3D, scaled or rotated. Depth comes from the
    glass, shadows, a slow float and three layers that drift apart with the pointer (2D translation only).
    Annotations are plain text, never chips.
  - **The entrance:** about five seconds, played once in CSS from the page's own load (so nothing flashes and it
    needs no script). Panes unfold from the top, and the feed makes room for the new circular. The light lines
    (measured from the layout, with a casing and travelling pulses) and the count are run by script on the same
    clock. Reduced motion shows the finished board.
  - **Sizes:** the board is placed in percentages and sized in container units, so it scales as one piece. Below
    440px wide it becomes a flowing column: the feed, the three policies hit (the lines running down the left), the
    ring and the approval side by side, then the notes.
- **Tour:** the heading, the tour's title and chapters, and a link sit beside a contained, glass-framed poster rather
  than a full-width image.
- **Closing call to action (`CtaBand`):** open to the page, not a card. Centred copy sits on saturated tangerine
  and teal light that fades into the page on every side.
- **Every compliance week (`WeekStory`):** right after the hero, the story from Gieom's design: five moments from
  "A new circular lands on Friday evening" to "Thursday arrives and the auditor asks for proof". Each pairs the copy
  with a live product demo (`CoverageDemo`, `DraftDemo`, `GovernDemo`, `SopDemo` and `ProofDemo`, where the auditor's
  questions are answered one click each).
  - **The heading:** the section opens with one main heading block: the title, the sentence under it and the
    section's two calls to action (Book a demo, Start free trial), which appear here only, not in each chapter.
    It is centred over the thread on desktop and aligned to the thread's rail on phones and tablets, where the
    buttons stack at full width on narrow screens.
  - **The thread:** an SVG thread runs through the week (a faint dotted route, the drawn line in the tangerine-to-teal
    gradient, a soft glow and a bright head), starting from a point of light under the heading's buttons. Each
    chapter's node catches light, with a small burst, when the thread reaches it.
  - **Desktop:** copy and demo alternate either side, and the thread weaves between them. It draws itself under the
    reading line as you scroll, with its head following the eye. The chapter being read is fully lit, with the
    light of its day behind its demo, and the others rest a little back. Demos drift with a light parallax.
  - **Phones and tablets:** one column with the thread down the left, and the demos at full width. The thread
    travels on to each chapter as you reach it, as a timed move rather than one tied to the scroll.
  - **Arrival:** each title rises in word by word, the answer and body follow, the list rules draw, and
    the demo slides in from its side. Every arrival plays once. Chapters already on screen are never hidden, and
    with reduced motion or without scripts everything is simply there.
  - **Steady height:** a playing demo never changes the page's height, so nothing below it (the pinned 3D story
    included) moves. The Draft demo keeps space for its inserted clause and shows "Drafting…" where the draft will
    appear, and each visual also keeps the tallest height it has shown at its width.
- **How it works (`CapabilityStory` + `src/components/story/scene.ts`):** "Gieom.cloud brings all of it together"
  as a pinned 3D story with an index.
  - **Pinned:** the section holds still while you scroll through it. Scrolling moves the story along: the copy for
    each capability changes in place, and the camera moves through one scene, coming in to the document for Magpie
    AI and rising for the Impact Analyser's shockwave. The opening shot is the section's heading beside the policy
    document on its tray, on a faint drafting grid, with dashed footprints and guide paths.
  - **One capability at a time:** only the capability being told is built, as you reach it, and it folds away as you
    leave. The document, the other capabilities and the light links between them appear only for the opening shot
    and the Impact Analyser's overview.
  - **The index:** all ten capabilities stay in view, each with a hairline that fills as the story passes through
    it. Tapping one moves the page to that point in the section, and the camera flies straight there instead of
    sweeping through every capability between.
  - **Desktop:** copy on the left, the scene in its own column on the right, the index of names along the foot.
  - **Phones and tablets:** the scene on top, the index under it as one tappable segment per capability with a
    count, then the copy, all within one screen. Nothing scrolls sideways.
  - **Moves with the scroll on touch:** on phones and tablets (and any narrow window) the copy is moved by the
    scroll itself rather than by timed fades. Each capability's copy rises in, line by line, as its chapter begins
    and lifts away as it ends, eased at the camera's own rate, so the copy and the scene move together and play
    backwards when you scroll back up. Only a tap on the index makes the camera fly; a fast swipe always moves
    through the story with the finger. Desktop keeps the copy changing in place with a short rise.
  - **Steady copy:** every chapter's copy starts at the same line, so the title never jumps as the chapter
    changes. Copy that would not fit its space on a short screen is set slightly smaller, chapter by chapter
    (`--fit`), and the line above the title keeps its size.
  - **Steady background:** the section's light is part of the pinned screen, so nothing slides behind the copy
    while it holds still. The screen is full-bleed (its light reaches both edges on wide screens) while the content
    keeps to the page width.
  - **No flicker:** nothing is laid over or masked on the live canvas. Its edges fade inside WebGL (a full-screen
    pass that multiplies the drawing towards the edges), and no text scrolls across it.
  - **Fallbacks:** before the script runs, or without it, the story is plain text in flow. Without WebGL the copy
    and index still work.
  - **Models:** each capability is drawn as the product shows it, not as abstract shapes. Thin matte cards carry
    printed interface detail: tabbed register cards, Magpie's suggestions lifting off the clauses they touch, a
    policy joined to its regulation, control, risk and owner, an SOP flow in two swimlanes, a workflow canvas with
    its form and escalation matrix, the lifecycle rail with the board tier, a roster of readers, the 5 × 5 heat map
    and a dashboard. There are no spheres, cubes, glass or gloss.
  - **How it is built:** every model is a few merged meshes built from flat outlines (`Geo`), coloured by role from
    one palette uniform, so a theme switch is a single uniform update. Connectors are constant-width screen-space
    lines (`Lines`) that draw in, carry a travelling highlight and the Impact Analyser's wave. Quality adapts: if
    frames run long, the scene renders fewer pixels, and it redraws at once after any resize so the canvas
    never shows a blank frame. The original illustration labels are plain HTML annotations
    projected beside the objects, never in boxes.
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
- **Glass, kept calm:** cards, the secondary button, the header, the demo window and the replay control share the
  `--glass-*` tokens: a mostly solid light fill, a soft top highlight, a quiet rim, a faint teal inner glow and a
  navy shadow, with a light blur and little added saturation. Real backdrop blur is kept to the few surfaces with
  detail behind them, so scrolling stays light on phones.
- **Pricing switch (`PricingTiers`):** a pill slides under the chosen billing period and turns from teal (monthly)
  to tangerine (annual) along the brand gradient, so the colour sweeps across it as it moves. The three cards follow
  it: a band of the new colour crosses each card in turn (the way the pill moved), each card settles, and its light,
  rim, price rules and ticks turn teal or tangerine; the prices roll over to the new period. Without script the
  chosen option is simply filled, and with reduced motion the colours change at once.
- **Navigation:** the Solutions menu lists the three roles. The four industry pages are still built, but nothing in
  the menu or footer links to them.
- **Phones and tablets (touch screens):** built to avoid the usual causes of mobile flicker.
  - Gradients stay still.
  - Only the header bar keeps a backdrop blur.
  - Nothing masks a live WebGL canvas or the regulators marquee. The 3D story fades its edges inside its own
    canvas, the regulators marquee simply runs off the screen edges, and soft overlays do the other fades.
  - Scrolling is native: Lenis is off, and there are no scroll-linked reveals or parallax. The one scroll-linked
    motion is the copy of the pinned 3D story, which moves inside a screen that is itself holding still.
  - The week story's thread moves chapter to chapter, never with the scroll position.
  - The page transition is a plain fade.
  - The 3D story's canvas keeps its drawing buffer within a pixel budget phones and tablets will allocate.
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
      solutions/*            Seven solution pages (three roles linked; four industry pages built but unlinked)
      about, customers, partners, careers, blog, guides, webinars, help, glossary,
      pricing, trust, contact, demo, trial, status, privacy, terms, dpa
    login/                   Sign-in (own split layout)
    not-found.tsx
  components/
    layout/                  Header (floating bar, mega menu, drawer), Footer, ThemeToggle, SpotlightController
    motion/                  MotionProvider (Lenis + GSAP reveals, scroll position when pages change)
    blocks/                  PageHero, ProblemGrid, FeatureStep, Tiles, CtaBand, Timeline, Faq,
                             IndustryPage template, LegalLayout
    home/                    HomeHero, ImpactMap (widget board), WeekStory, CapabilityStory,
                             PlatformStack index, product demos
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
