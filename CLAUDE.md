# Portfolio Site — Working Rules

Next.js 14 (App Router, TypeScript, Tailwind CSS v4, Framer Motion). An immersive
"all about me" personal site, not just a resume — see `src/data/about.json` and
the "Latest Updates" section for the non-resume parts.

## Architecture rules (do not bypass these)

1. **All content lives in `src/data/*.json`.** Never hardcode copy, links, dates,
   or lists directly in a component. If it's content, it goes in JSON.
2. **Components never import JSON directly.** They call functions from
   `src/services/portfolioService.ts` (`getProfile`, `getAbout`, `getExperience`,
   `getProjects`, `getSkills`, `getEducation`, `getCertifications`, `getUpdates`).
   This is the single swap point if content ever moves to a real API — only
   that file's function bodies change, not components.
3. **Service functions are always `async`/return `Promise`**, even though they
   currently just resolve local JSON. This keeps the signature identical to a
   future `fetch()`-based implementation, so no caller needs to change when
   that swap happens.
4. **Types live in `src/types/portfolio.ts`** and mirror the JSON shape exactly.
   Update both together when the schema changes.
5. **Personal photos** (avatar, about photo) are referenced by URL from JSON
   (`avatarUrl`, `photoUrl`), rendered with `next/image`. Real `blob:` URLs are
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
9. **Theme**: dark, developer-focused, forced (not OS-driven) via
   `color-scheme: dark` in `globals.css`. Accent colors are the CSS vars
   `--accent` (emerald) and `--accent-2` (indigo) — reuse these, don't
   introduce new one-off colors.
10. **Section order** (both in `page.tsx` and `Nav.tsx`'s `LINKS`):
    Hero → Experience → Projects → Skills → Updates → Education → **About** →
    Contact. About is placed last on purpose — it's the personal/human
    section (hobbies, values, story), so the site leads with professional
    credibility and closes on "here's who I actually am" right before
    Contact. Keep the numbered labels (`01. Journey`, `02. Work`, etc.) in
    each component in sync with this order if sections are reordered.
11. **`about.json` content must stay non-technical.** It's the deliberate
    counterweight to the resume-driven sections above it — bio, values, and
    fun facts should read as personal (life, personality, interests outside
    work), not as a restatement of engineering philosophy or tech stack.
    Section anchors (`#about`, `#experience`, `#projects`, `#skills`,
    `#updates`, `#education`, `#contact`) must stay in sync between each
    component's `id` and `Nav.tsx`'s `LINKS` array.

## Hero: procedural canvas scene (no video/image assets)

`Hero.tsx` always renders `HeroScene.tsx` — a code-driven, canvas-based
particle/network field (abstract, dark, emerald/indigo), not a video. This
was a deliberate pivot away from an earlier scroll-scrubbed-video approach:
video seeking is inherently choppy under fast scroll (browsers can't seek
frame-accurately without dense keyframing), and generating clutter-free
footage was also difficult. A canvas animation avoids both problems and adds
no asset weight.

`HeroScene.tsx`:

- Wraps a 250vh scroll track (`h-[250vh]`) with a `sticky top-0 h-screen`
  inner container, so content stays pinned to the viewport for the length of
  the track (same pinning approach as before).
- Runs its own `requestAnimationFrame` loop, independent of scroll, drawing
  ~70 drifting particles with faint connecting lines when close together
  (a "constellation" look). This is what makes the idle motion smooth — it's
  never blocked on scroll events or video decode.
- Scroll only drives a cheap CSS `scale` transform on the canvas (via
  Framer Motion's `useScroll` + `useSpring`, damped so it eases rather than
  jumps) for a subtle zoom-in as the user scrolls — GPU-accelerated, so it
  stays smooth even though the particle animation itself doesn't listen to
  scroll at all.
- Respects `prefers-reduced-motion`: draws a single static frame instead of
  animating when the user has that OS setting on.
- Content (name/title/tagline/avatar) fades out near the end of the track via
  the same damped scroll value, so the scene is the sole focus right before
  the next section takes over.

If a similar effect is needed elsewhere, extract the canvas particle logic
into its own hook/component rather than duplicating `HeroScene`. Don't
reintroduce a `<video>`-based approach for scroll-driven hero content unless
the keyframe-density problem is solved first (re-encoding with `-g 1` or
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
