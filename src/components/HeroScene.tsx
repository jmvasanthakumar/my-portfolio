"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

interface HeroSceneProps {
  name: string;
  title: string;
  tagline: string;
  yearsOfExperience: number;
  avatarUrl: string;
}

interface Puff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  growth: number;
  age: number;
  life: number;
  rot: number;
  rotV: number;
  peak: number; // max opacity this puff reaches mid-life
  sprite: number;
}

const MAX_PUFFS = 190;
// How far the pointer disturbs the smoke, in CSS pixels.
const POINTER_RADIUS = 170;

// Mirrors the --accent / --accent-2 fill tokens in globals.css, plus the cool
// sky note already used in the hero's background wash. These are graphics,
// not text, so the vivid fills are the right variants here.
const PALETTE: [number, number, number][] = [
  [245, 158, 11], // amber — --accent
  [251, 113, 133], // coral — --accent-2
  [56, 189, 248], // sky
];
const SPRITE_SIZE = 256;
const VARIANTS_PER_COLOR = 3;

/**
 * One soft, irregular smoke blob, pre-rendered once to an offscreen canvas.
 * Built from a handful of overlapping radial gradients rather than a single
 * one — a lone gradient reads as fog, the clustered version has the lumpy
 * edge that makes it read as smoke. Pre-rendering keeps the per-frame cost
 * to a plain drawImage.
 */
function makeSprite([cr, cg, cb]: [number, number, number]) {
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE_SIZE;
  canvas.height = SPRITE_SIZE;
  const sctx = canvas.getContext("2d");
  if (!sctx) return canvas;

  for (let i = 0; i < 7; i++) {
    const x = SPRITE_SIZE / 2 + (Math.random() - 0.5) * SPRITE_SIZE * 0.36;
    const y = SPRITE_SIZE / 2 + (Math.random() - 0.5) * SPRITE_SIZE * 0.36;
    const radius = SPRITE_SIZE * (0.16 + Math.random() * 0.17);
    const grad = sctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, 0.42)`);
    grad.addColorStop(0.55, `rgba(${cr}, ${cg}, ${cb}, 0.16)`);
    grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
    sctx.fillStyle = grad;
    sctx.beginPath();
    sctx.arc(x, y, radius, 0, Math.PI * 2);
    sctx.fill();
  }

  return canvas;
}

/** Sideways drift, so a column of smoke sways instead of rising straight up. */
function wind(y: number, t: number) {
  return Math.sin(y * 0.0055 + t * 0.6) * 0.22 + Math.sin(y * 0.013 - t * 0.9) * 0.12;
}

/**
 * Procedural, code-driven hero background: slow plumes of coloured smoke
 * rising and curling across the viewport. Entirely canvas/JS, no video or
 * image assets.
 *
 * Animation runs on its own rAF loop, independent of scroll, so idle motion
 * stays smooth. Scroll only feeds cheap derived values (zoom, fade, a little
 * extra updraft).
 */
export default function HeroScene({
  name,
  title,
  tagline,
  yearsOfExperience,
  avatarUrl,
}: HeroSceneProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerRef = useRef({ x: 0, y: 0, active: false });
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false
  );

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 260,
    damping: 40,
    mass: 0.4,
  });

  const contentOpacity = useTransform(smoothProgress, [0, 0.55, 1], [1, 1, 0]);
  const contentY = useTransform(smoothProgress, [0, 1], [0, -60]);
  const sceneScale = useTransform(smoothProgress, [0, 1], [1, 1.18]);
  const sceneOpacity = useTransform(smoothProgress, [0, 0.7, 1], [1, 1, 0.15]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const ctx: CanvasRenderingContext2D = context;

    const sprites = PALETTE.flatMap((color) =>
      Array.from({ length: VARIANTS_PER_COLOR }, () => makeSprite(color))
    );

    let width = 0;
    let height = 0;
    const puffs: Puff[] = [];

    // Two vents: a main plume off toward the avatar column, and a fainter one
    // low on the left, so the field isn't symmetrical.
    const vents = () => [
      { x: width * 0.63, y: height + 60, spread: width * 0.1, weight: 0.72 },
      { x: width * 0.14, y: height + 90, spread: width * 0.08, weight: 0.28 },
    ];

    const emit = (seeded: boolean) => {
      const list = vents();
      const roll = Math.random();
      const vent = roll < list[0].weight ? list[0] : list[1];

      const puff: Puff = {
        x: vent.x + (Math.random() - 0.5) * vent.spread * 2,
        // Seeded puffs start scattered up the screen so the scene is already
        // full of smoke on the first frame instead of filling in from below.
        y: seeded ? Math.random() * height * 1.2 : vent.y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(0.24 + Math.random() * 0.5),
        r: 34 + Math.random() * 62,
        growth: 0.14 + Math.random() * 0.22,
        age: 0,
        life: 320 + Math.random() * 380,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.0025,
        peak: 0.1 + Math.random() * 0.13,
        sprite: Math.floor(Math.random() * sprites.length),
      };
      if (seeded) puff.age = Math.random() * puff.life * 0.8;
      puffs.push(puff);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      puffs.length = 0;
      for (let i = 0; i < MAX_PUFFS; i++) emit(true);
    };

    const step = (t: number, updraft: number) => {
      const pointer = pointerRef.current;

      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];

        p.vx += (wind(p.y, t) - p.vx) * 0.02;
        p.vy -= 0.0007 * updraft; // buoyancy: smoke accelerates as it rises

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < POINTER_RADIUS && dist > 0.001) {
            // Like waving a hand through it: shove the smoke outward and let
            // it billow a little where it's disturbed.
            const falloff = (1 - dist / POINTER_RADIUS) ** 2;
            p.vx += (dx / dist) * falloff * 0.55;
            p.vy += (dy / dist) * falloff * 0.55;
            p.r += falloff * 0.6;
          }
        }

        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.growth;
        p.rot += p.rotV;
        p.age++;

        if (p.age > p.life || p.y + p.r < -80) {
          puffs.splice(i, 1);
        }
      }

      while (puffs.length < MAX_PUFFS) emit(false);
    };

    const paint = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of puffs) {
        const ratio = p.age / p.life;
        // Ease in and out over the puff's life so nothing pops in or vanishes.
        const alpha = Math.sin(Math.PI * ratio) * p.peak;
        if (alpha <= 0.002) continue;

        ctx.globalAlpha = alpha;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.drawImage(sprites[p.sprite], -p.r, -p.r, p.r * 2, p.r * 2);
        ctx.restore();
      }

      ctx.globalAlpha = 1;
    };

    resize();
    window.addEventListener("resize", resize);

    let frameId = 0;
    let elapsed = 0;

    const tick = () => {
      elapsed += 0.006;
      step(elapsed, 1 + smoothProgress.get() * 1.5);
      paint();
      frameId = requestAnimationFrame(tick);
    };

    if (reducedMotion) {
      // No animation: let the plume develop for a fixed number of steps and
      // leave the resulting drift as one static composition.
      for (let i = 0; i < 260; i++) step(i * 0.006, 1);
      paint();
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (frameId) cancelAnimationFrame(frameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    pointerRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const onPointerLeave = () => {
    pointerRef.current = { ...pointerRef.current, active: false };
  };

  return (
    <div ref={trackRef} className="relative h-[150vh]">
      <div
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="sticky top-0 flex h-screen items-center overflow-hidden"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-20"
          style={{
            background:
              "radial-gradient(60rem 40rem at 50% -10%, rgba(245,158,11,0.18), transparent 60%), radial-gradient(50rem 30rem at 90% 20%, rgba(251,113,133,0.16), transparent 60%), radial-gradient(45rem 30rem at 8% 85%, rgba(56,189,248,0.12), transparent 60%)",
          }}
        />

        <motion.canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full"
          style={{
            scale: sceneScale,
            opacity: sceneOpacity,
            // Thin the smoke out behind the copy on the left so the text
            // always stays the most legible thing on screen.
            maskImage:
              "linear-gradient(to right, rgba(0,0,0,0.25), rgba(0,0,0,0.95) 55%)",
            WebkitMaskImage:
              "linear-gradient(to right, rgba(0,0,0,0.25), rgba(0,0,0,0.95) 55%)",
          }}
        />

        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="section-container relative z-10 grid items-center gap-12 pt-24 md:grid-cols-[1.3fr_0.7fr]"
        >
          <div className="relative rounded-2xl bg-background/70 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none">
            <p className="mb-4 font-mono text-sm text-accent-ink">Hi, I&apos;m</p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              {name}
            </h1>
            <h2 className="mt-3 text-xl font-medium text-muted sm:text-2xl">
              {title} · {yearsOfExperience}+ years
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {tagline}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="#contact"
                className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-contrast transition-transform hover:scale-105"
              >
                Get in touch
              </a>
              <a
                href="#projects"
                className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent-ink"
              >
                View projects
              </a>
            </div>
          </div>

          <div className="justify-self-center">
            <div className="relative h-48 w-48 sm:h-64 sm:w-64">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-accent-2 opacity-45 blur-2xl" />
              <div className="glass-card relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={avatarUrl}
                  alt={name}
                  fill
                  sizes="256px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: contentOpacity }}
          className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-xs text-muted"
        >
          scroll ↓
        </motion.div>
      </div>
    </div>
  );
}
