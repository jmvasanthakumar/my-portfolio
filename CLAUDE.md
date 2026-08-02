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

## Hero: procedural canvas scene (no video/image assets)

`Hero.tsx` always renders `HeroScene.tsx` — a code-driven, canvas-based
animation, never a video. This was a deliberate pivot away from an earlier
scroll-scrubbed-video approach: video seeking is inherently choppy under fast
scroll (browsers can't seek frame-accurately without dense keyframing), and
generating clutter-free footage was also difficult. A canvas animation avoids
both problems and adds no asset weight.

`HeroScene.tsx` draws **rising smoke**: ~190 soft puffs emitted from two
vents below the viewport, drifting up through a sine "wind", expanding and
fading, tinted amber / coral / sky. Specifics worth keeping:

- Puffs are pre-rendered sprites (`makeSprite`), each a cluster of seven
  offset radial gradients on a 256px offscreen canvas. The clustering is
  what makes it read as smoke — a single radial gradient reads as fog.
  Nine sprites (3 colors × 3 variants) are built once at mount, so the
  per-frame cost is just `drawImage`.
- Scroll track is a short `h-[150vh]` with a `sticky top-0 h-screen` inner
  container — the hero pins for only ~half a viewport of scrolling. It was
  deliberately shortened from 250vh; don't lengthen it again.
- Its own `requestAnimationFrame` loop drives the motion, independent of
  scroll, so idle animation is smooth and never blocked on scroll events.
- The canvas is cleared each frame and stays transparent, so the radial
  background wash behind it shows through the smoke.
- On resize the field is re-seeded with puffs already scattered up the
  screen (`emit(true)`), so the hero opens full of smoke rather than
  filling in from the bottom.
- The pointer disturbs it: within `POINTER_RADIUS` puffs are shoved outward
  and billow, like waving a hand through smoke. This is the interactive
  hook of the scene — keep it if the visuals change.
- Scroll only feeds cheap derived values (Framer Motion `useScroll` +
  damped `useSpring`): canvas `scale`/`opacity` and a stronger updraft.
  GPU-accelerated, and the animation itself never reads scroll.
- Respects `prefers-reduced-motion`: advances the simulation a fixed number
  of steps and paints one static composition instead of animating.
- A CSS `mask-image` gradient thins the smoke on the left so the copy stays
  the most legible thing on screen.
- Content (name/title/tagline/avatar) fades out over the track via the same
  damped scroll value, before the next section takes over.

If a similar effect is needed elsewhere, extract the canvas logic into its
own hook/component rather than duplicating `HeroScene`. Don't reintroduce a
`<video>`-based approach for scroll-driven hero content unless the
keyframe-density problem is solved first (re-encoding with `-g 1` or
switching to an image-sequence-on-canvas technique).

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
