# Portfolio Site — Working Rules

Next.js 14 (App Router, TypeScript, Tailwind CSS v4, Framer Motion). An immersive
personal site, not just a resume — see the "Latest Updates" section for the
non-resume parts.

## Architecture rules (do not bypass these)

1. **All content lives in `src/data/*.json`.** Never hardcode copy, links, dates,
   or lists directly in a component. If it's content, it goes in JSON.
2. **Components never import JSON directly.** They call functions from
   `src/services/portfolioService.ts` (`getProfile`, `getExperience`,
   `getProjects`, `getSkills`, `getEducation`, `getCertifications`, `getUpdates`).
   This is the single swap point if content ever moves to a real API — only
   that file's function bodies change, not components.
3. **Service functions are always `async`/return `Promise`**, even though they
   currently just resolve local JSON. This keeps the signature identical to a
   future `fetch()`-based implementation, so no caller needs to change when
   that swap happens.
4. **Types live in `src/types/portfolio.ts`** and mirror the JSON shape exactly.
   Update both together when the schema changes.
5. **Personal photos** (e.g. the hero avatar) are referenced by URL from JSON
   (`avatarUrl`), rendered with `next/image`. Real `blob:` URLs are
   browser-session-local and can't be persisted in JSON — use a real hosted URL
   (Azure Blob Storage public URL, CDN, S3, etc.) when swapping out the
   dicebear placeholders. Any new external image host must be added to
   `images.remotePatterns` in `next.config.ts`.
6. **Design/UI assets** (icons, decorative graphics, logos) go in `/public` and
   are referenced directly in components — these are not content, so they
   don't go through JSON/the service layer.
7. **Every section is a top-level component in `src/components/`**, wired into
   `src/app/page.tsx` in the order it appears on the page. Each section is an
   `async` Server Component that fetches its own data via the service layer.
8. **Scroll-in animation** goes through the shared `<Reveal>` client component
   (`src/components/Reveal.tsx`) — don't add ad-hoc `motion.div` usage
   elsewhere; wrap new content in `<Reveal>` for consistency.
9. **Theme**: light, warm, forced (not OS-driven) via `color-scheme: light`
    in `globals.css`. Accents are the CSS vars `--accent` (amber) and
    `--accent-2` (coral) for fills, and `--accent-ink` / `--accent-2-ink`
    for text on the light background — reuse these, don't introduce new
    one-off colors.
10. **Section order** (both in `page.tsx` and `Nav.tsx`'s `LINKS`):
    Hero → Experience → Projects → Skills → Updates → Education → Contact.
    Keep the numbered labels (`01. Journey`, `02. Work`, … `06. Contact`) in
    each component in sync with this order if sections are reordered.
11. **Section anchors** (`#experience`, `#projects`, `#skills`, `#updates`,
    `#education`, `#contact`) must stay in sync between each component's
    `id` and `Nav.tsx`'s `LINKS` array.
12. **Mobile responsiveness is non-negotiable.** Every section must work on a
    360×640 phone viewport — no change ships without checking it there.
    Concretely:
    - **Mobile-first classes.** Base utilities target the phone; `sm:`/`md:`/
      `lg:` add back the desktop treatment. Never write a desktop-only value
      with no base fallback.
    - **No horizontal scroll, ever.** `document.documentElement.scrollWidth`
      must equal the viewport width at 360px. Long strings get `break-all` /
      `break-words`; wide blocks (tables, code, diagrams) scroll inside their
      own `overflow-x-auto` container.
    - **Use `svh`, not `vh`, for full-height layout** (`h-[100svh]`,
      `h-[150svh]`). On phones `100vh` is the viewport with the browser
      toolbar hidden, so `vh` layouts get their bottom cropped.
    - **Full-height content must fit the small viewport.** The hero is the
      usual offender — shrink type, avatar, and spacing at base size so
      nothing is clipped at 640px tall.
    - **Tap targets ≥ 44px**, and anything that overlays the page (the mobile
      nav menu) needs its own opaque surface.
    - **Verify, don't assume**: resize the preview to 360×640, then re-check
      `scrollWidth` and that key sections aren't clipped.

## Hero: restrained motion (no video, no canvas)

`Hero.tsx` renders `HeroScene.tsx`. The hero's ambient motion is deliberately
quiet and lives entirely in CSS (`globals.css`):

- `.hero-aurora` — the backdrop: three soft radial colour fields that drift
  slowly against each other (`hero-aurora-drift`).
- `.hero-ring` — a conic-gradient ring rotating behind the portrait
  (`hero-ring-spin`).
- `.hero-float` — a slow vertical bob on the portrait frame
  (`hero-float-bob`).
- All three are disabled under `prefers-reduced-motion: reduce`.

Framer Motion drives two things, and only these two:

1. A short pinned fade-out: a `h-[150svh]` track with a `sticky top-0
   h-[100svh]` inner container, with content opacity/`y` driven by a damped
   `useSpring` over `useScroll`. Keep the track short — the page should get
   going quickly.
2. The pointer response. One pointer position (normalised to −1…1 from the
   hero's centre, smoothed by a `useSpring`) feeds three layers at different
   depths: `.hero-spot` — a warm pool of light — glides after the cursor, the
   aurora drifts the opposite way, and the portrait turns to face it
   (`rotateX`/`rotateY`, ±11° over a `perspective`). The portrait is also
   `drag` + `dragSnapToOrigin`, so it can be picked up and thrown and springs
   back. All transform-only, so it stays on the compositor.

   Guards, don't remove them: the spotlight and tilt only mount when
   `matchMedia("(pointer: fine)")` matches and motion isn't reduced (a touch
   would otherwise strand the light wherever the last tap landed), and drag is
   off under `prefers-reduced-motion`.

**Selection**: chrome isn't content. `nav`, `button`, `[role="button"]`,
`.hero-float` and `.hero-hint` are `user-select: none`, and every `img` is
non-selectable and non-draggable — otherwise dragging the portrait ghost-drags
the photo and highlights half the hero. Prose, headings and contact details
stay selectable; keep it that way.

**The portrait is never filtered, masked, or abstracted.** The photo renders
through `next/image` inside a round frame; the animation surrounds it. On
mobile it stacks *below* the intro copy (natural source order), and becomes
the right-hand column at `md`.

History, so these aren't re-litigated: a scroll-scrubbed `<video>` (choppy —
browsers can't seek frame-accurately without dense keyframing), an
isometric block build, a particle/flow field, a canvas smoke simulation, a
WebGL mesh-gradient shader, and a halftone dot-matrix portrait have all been
tried and rejected — they either competed with the copy or, in the halftone's
case, made the face unrecognisable. Don't reintroduce a canvas/WebGL hero
effect without a strong, specific reason. Two metro treatments were also tried
and dropped: a full SVG metro-map *backdrop* (routes and interchanges drifting
behind the copy — just noise), and an interactive metro *line* along the bottom
of the hero whose stops were the page's sections, with a train that patrolled
it and pulled in at whichever stop you pointed at. The line worked, but it only
had room from `md` up and it duplicated the nav; the pointer response is the
interaction that earns its place.

## SEO / indexing

The site is a single indexable page, and everything search-facing derives from
`profile.json`'s **`siteUrl`** — change the domain there and nowhere else.

- `layout.tsx` → `generateMetadata()`: `metadataBase`, title template,
  canonical, Open Graph, Twitter card, `robots` directives.
- `app/robots.ts` → `/robots.txt` (allows everything but `/_next/`, points at
  the sitemap).
- `app/sitemap.ts` → `/sitemap.xml`. One URL — the sections are anchors, not
  routes; listing them separately would report duplicates. `lastModified`
  tracks the newest entry in `updates.json`.
- `app/manifest.ts` → `/manifest.webmanifest`.
- `components/StructuredData.tsx` → schema.org JSON-LD (`ProfilePage` +
  `WebSite` + `Person`) built from the service layer, so it can't drift from
  the visible content. Extend it when a section adds meaningful facts.
- `app/icon.svg` / `app/apple-icon.png` — the VK monogram favicon.
- `app/opengraph-image.jpg` / `app/twitter-image.jpg` — the share card,
  regenerated with `node scripts/generate-og-image.cjs` (edit the copy in
  that script if the name/tagline changes).

All of these prerender as static files during `next build`, so they work on
Azure Static Web Apps without a server.

## When adding a new section

1. Add its content to a new (or existing) JSON file in `src/data/`.
2. Add a type to `src/types/portfolio.ts`.
3. Add a getter to `portfolioService.ts`.
4. Build the component in `src/components/`, wrapping content blocks in
   `<Reveal>`.
5. Register it in `src/app/page.tsx` and, if it should be reachable from the
   nav, add it to `LINKS` in `Nav.tsx`.

## Verifying changes

- `npx tsc --noEmit` and `npm run lint` should both pass clean before calling
  a change done.
- Preview via the dev server (`npm run dev`, or the Claude Browser
  `portfolio-dev` launch config in `.claude/launch.json`) and check rendered
  content, not just that it compiles.
- Check the preview at **360×640 as well as desktop** — rule 12 is part of
  "done", not a follow-up.
