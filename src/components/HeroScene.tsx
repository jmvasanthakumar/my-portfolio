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

interface Block {
  gi: number;
  gj: number;
  k: number;
  tx: number; // target screen x, relative to scene center
  ty: number; // target screen y, relative to scene center
  sx: number; // start offset x (where it flies in from)
  sy: number; // start offset y
  progressStart: number; // 0-1, fraction of scroll progress where this block starts assembling
  progressEnd: number; // 0-1, fraction of scroll progress where it's fully settled
  mix: number; // 0-1 color mix between accent/accent2
}

const LEVELS = 4; // pyramid of levels: 4x4, 3x3, 2x2, 1x1
const TILE_W = 46;
const TILE_H = 23;
const LEVEL_H = 32;
// The structure finishes assembling by this fraction of the scroll track,
// leaving the remainder as a "hold" before content fades into the next
// section (see contentOpacity below).
const BUILD_FRACTION = 0.65;

// Mirrors the --accent / --accent-2 fill tokens in globals.css. These are the
// vivid fills, not the ink variants — the blocks are graphics, not text.
const ACCENT: [number, number, number] = [245, 158, 11]; // amber
const ACCENT_2: [number, number, number] = [251, 113, 133]; // coral/rose

function easeOutBack(t: number) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function mixColor(mix: number, factor: number): [number, number, number] {
  return [0, 1, 2].map((idx) =>
    Math.min(255, (ACCENT[idx] + (ACCENT_2[idx] - ACCENT[idx]) * mix) * factor)
  ) as [number, number, number];
}

function buildBlocks(): Block[] {
  const blocks: Block[] = [];
  const totalUnits = Array.from({ length: LEVELS }, (_, k) =>
    Math.pow(LEVELS - k, 2)
  ).reduce((a, b) => a + b, 0);
  let unitCursor = 0;

  for (let k = 0; k < LEVELS; k++) {
    const size = LEVELS - k;
    const order: number[] = Array.from({ length: size * size }, (_, i) => i);
    for (let n = order.length - 1; n > 0; n--) {
      const r = Math.floor(Math.random() * (n + 1));
      [order[n], order[r]] = [order[r], order[n]];
    }

    let idx = 0;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const gi = i - (size - 1) / 2;
        const gj = j - (size - 1) / 2;
        const tx = (gi - gj) * (TILE_W / 2);
        const ty = (gi + gj) * (TILE_H / 2) - k * LEVEL_H;

        const angle = Math.random() * Math.PI * 2;
        const dist = 500 + Math.random() * 400;

        const unitIndex = unitCursor + order[idx];
        const windowSize = 3; // how many "slots" wide each block's own build window is
        const start = (unitIndex / totalUnits) * BUILD_FRACTION;
        const end = Math.min(
          BUILD_FRACTION,
          ((unitIndex + windowSize) / totalUnits) * BUILD_FRACTION
        );

        blocks.push({
          gi,
          gj,
          k,
          tx,
          ty,
          sx: Math.cos(angle) * dist,
          sy: Math.sin(angle) * dist,
          progressStart: start,
          progressEnd: Math.max(end, start + 0.001),
          mix: Math.max(0, Math.min(1, (gi - gj) / (LEVELS - 1) / 2 + 0.5)),
        });
        idx++;
      }
    }
    unitCursor += size * size;
  }

  return blocks;
}

function drawIsoBlock(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  scale: number,
  mix: number,
  alpha: number
) {
  const halfW = (TILE_W / 2) * scale;
  const halfH = (TILE_H / 2) * scale;
  const h = (LEVEL_H - 6) * scale;

  const top = mixColor(mix, 1);
  const left = mixColor(mix, 0.55);
  const right = mixColor(mix, 0.8);

  ctx.globalAlpha = alpha;

  // Left face
  ctx.beginPath();
  ctx.moveTo(cx - halfW, cy);
  ctx.lineTo(cx, cy + halfH);
  ctx.lineTo(cx, cy + halfH + h);
  ctx.lineTo(cx - halfW, cy + h);
  ctx.closePath();
  ctx.fillStyle = `rgb(${left[0]}, ${left[1]}, ${left[2]})`;
  ctx.fill();

  // Right face
  ctx.beginPath();
  ctx.moveTo(cx, cy + halfH);
  ctx.lineTo(cx + halfW, cy);
  ctx.lineTo(cx + halfW, cy + h);
  ctx.lineTo(cx, cy + halfH + h);
  ctx.closePath();
  ctx.fillStyle = `rgb(${right[0]}, ${right[1]}, ${right[2]})`;
  ctx.fill();

  // Top face
  ctx.beginPath();
  ctx.moveTo(cx, cy - halfH);
  ctx.lineTo(cx + halfW, cy);
  ctx.lineTo(cx, cy + halfH);
  ctx.lineTo(cx - halfW, cy);
  ctx.closePath();
  ctx.fillStyle = `rgb(${top[0]}, ${top[1]}, ${top[2]})`;
  // On the light background a glow washes out, so the block is grounded with
  // a warm drop shadow instead.
  ctx.shadowColor = "rgba(120, 53, 15, 0.22)";
  ctx.shadowBlur = 12 * scale;
  ctx.shadowOffsetY = 5 * scale;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.globalAlpha = 1;
}

/**
 * Procedural, code-driven hero background: an isometric block structure that
 * assembles piece by piece as the user scrolls through the pinned hero
 * track — scrolling further completes it, scrolling back up un-builds it.
 * Entirely canvas/JS, no video or image assets.
 *
 * Positioned toward the right side of the viewport (near the avatar column)
 * and drawn behind the text via explicit z-index, so it never competes with
 * or covers the copy on the left.
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
  const blocksRef = useRef<Block[]>(buildBlocks());
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

  const contentOpacity = useTransform(
    smoothProgress,
    [0, 0.08, 0.82, 1],
    [1, 1, 1, 0]
  );
  const contentY = useTransform(smoothProgress, [0, 1], [0, -40]);
  const sceneScale = useTransform(smoothProgress, [0, 1], [1, 1.15]);

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

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawFrame(smoothProgress.get());
    };

    const sorted = [...blocksRef.current].sort((a, b) => a.ty - b.ty);

    function drawFrame(progress: number) {
      ctx.clearRect(0, 0, width, height);

      // Sit closer to the right (toward the avatar column) so the built
      // structure never overlaps the text block on the left.
      const cx = width * 0.66;
      const cy = height / 2 + (LEVELS * LEVEL_H) / 2;

      for (const b of sorted) {
        const span = b.progressEnd - b.progressStart;
        const localT = Math.max(
          0,
          Math.min(1, (progress - b.progressStart) / span)
        );
        if (localT <= 0) continue;
        const eased = easeOutBack(localT);
        const px = cx + b.tx + b.sx * (1 - eased);
        const py = cy + b.ty + b.sy * (1 - eased);
        const scale = 0.4 + 0.6 * Math.min(1, localT * 1.4);
        drawIsoBlock(ctx, px, py, scale, b.mix, 1);
      }
    }

    resize();
    window.addEventListener("resize", resize);

    let frameId: number;
    const tick = () => {
      drawFrame(smoothProgress.get());
      frameId = requestAnimationFrame(tick);
    };

    if (reducedMotion) {
      drawFrame(1); // draw fully assembled, static
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener("resize", resize);
      if (frameId) cancelAnimationFrame(frameId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    <div ref={trackRef} className="relative h-[250vh]">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 -z-10 h-full w-full"
          style={{ scale: sceneScale }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60rem 40rem at 50% -10%, rgba(245,158,11,0.18), transparent 60%), radial-gradient(50rem 30rem at 90% 20%, rgba(251,113,133,0.16), transparent 60%), radial-gradient(45rem 30rem at 8% 85%, rgba(56,189,248,0.12), transparent 60%)",
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
