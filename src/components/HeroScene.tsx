"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

import HeroMetro from "./HeroMetro";

interface HeroSceneProps {
  name: string;
  title: string;
  tagline: string;
  yearsOfExperience: number;
  avatarUrl: string;
  avatarHdUrl: string;
}

/**
 * Whether it's worth pulling the full-resolution portrait. The compressed
 * copy is what ships by default; the original is over a megabyte, so it's
 * only fetched when the connection looks fast and the user hasn't asked to
 * save data. Browsers without the Network Information API (Safari, Firefox)
 * report nothing — those get the upgrade, since the fetch happens after load
 * and never blocks anything.
 */
function connectionLooksFast() {
  const connection = (
    navigator as Navigator & {
      connection?: {
        saveData?: boolean;
        effectiveType?: string;
        downlink?: number;
      };
    }
  ).connection;

  if (!connection) return true;
  if (connection.saveData) return false;
  if (connection.effectiveType && connection.effectiveType !== "4g") {
    return false;
  }
  if (typeof connection.downlink === "number" && connection.downlink < 1.5) {
    return false;
  }
  return true;
}

/**
 * The hero. Motion here is deliberately restrained and CSS-driven: a metro-map
 * backdrop with trains gliding along its routes (see HeroMetro) over a soft
 * aurora wash, and a rotating gradient ring plus a gentle float on the
 * portrait frame. The photo itself is never filtered, masked or abstracted —
 * it reads as a clean, sharp portrait at every size.
 *
 * Earlier iterations put a canvas/WebGL effect here (particles, smoke, a
 * shader mesh gradient, a halftone portrait). They were dropped: they either
 * competed with the copy or made the face unrecognisable. Don't reintroduce
 * one without a strong reason.
 *
 * Scroll is used only for a short pinned fade-out; the track is deliberately
 * short so the page gets going quickly.
 */
export default function HeroScene({
  name,
  title,
  tagline,
  yearsOfExperience,
  avatarUrl,
  avatarHdUrl,
}: HeroSceneProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const [wantHd, setWantHd] = useState(false);
  const [hdVisible, setHdVisible] = useState(false);

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

  // Progressive upgrade: once the page has finished loading, and only if the
  // connection looks fast and the frame is big enough to show the detail,
  // request the full-resolution original. It layers over the default copy and
  // fades in when it has decoded, so a slow or stalled fetch is never visible.
  useEffect(() => {
    if (!avatarHdUrl) return;

    let cancelled = false;

    const upgrade = () => {
      if (cancelled) return;
      const width = portraitRef.current?.getBoundingClientRect().width ?? 0;
      // Phone-sized portraits are already covered by the default copy; only
      // spend the extra bytes when the frame is big enough to show them.
      const needed = width * (window.devicePixelRatio || 1);
      if (needed < 480 || !connectionLooksFast()) return;
      setWantHd(true);
    };

    if (document.readyState === "complete") {
      upgrade();
    } else {
      window.addEventListener("load", upgrade, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", upgrade);
    };
  }, [avatarHdUrl]);

  return (
    // svh, not vh: on phones `100vh` is the viewport with the browser chrome
    // hidden, so a vh-sized hero gets its bottom cropped by the toolbar.
    <div ref={trackRef} className="relative h-[150svh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div aria-hidden className="hero-aurora pointer-events-none absolute inset-0 -z-10" />
        <HeroMetro />

        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="section-container relative z-10 grid items-center gap-10 pt-20 sm:gap-12 sm:pt-24 md:grid-cols-[1.25fr_0.75fr]"
        >
          <div>
            <p className="mb-3 font-mono text-sm text-accent-ink sm:mb-4">
              Hi, I&apos;m
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {name}
            </h1>
            <h2 className="mt-2 text-lg font-medium text-muted sm:mt-3 sm:text-2xl">
              {title} · {yearsOfExperience}+ years
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted sm:mt-6 sm:text-lg">
              {tagline}
            </p>

            <div className="mt-6 flex flex-wrap gap-3 sm:mt-8 sm:gap-4">
              <a
                href="#contact"
                className="rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-contrast transition-transform hover:scale-105 sm:px-6"
              >
                Get in touch
              </a>
              <a
                href="#projects"
                className="rounded-full border border-border px-5 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent-ink sm:px-6"
              >
                View projects
              </a>
            </div>
          </div>

          {/* Natural source order puts the portrait after the intro, which is
              exactly the mobile stacking we want; on md+ it becomes the
              right-hand column. */}
          <div className="hero-float justify-self-center">
            <div
              ref={portraitRef}
              className="relative h-44 w-44 sm:h-56 sm:w-56 lg:h-72 lg:w-72"
            >
              <div
                aria-hidden
                className="absolute -inset-6 rounded-full bg-gradient-to-br from-accent to-accent-2 opacity-30 blur-2xl"
              />
              {/* Rotating conic ring: the animation lives in the frame, so the
                  photo inside stays completely untouched. */}
              <div
                aria-hidden
                className="hero-ring absolute -inset-[3px] rounded-full"
              />
              <div className="glass-card relative h-full w-full overflow-hidden rounded-full">
                {/* object-[50%_35%] biases the crop upward: the source is a
                    full portrait, so a plain centre crop sits the face high
                    in the circle. */}
                <Image
                  src={avatarUrl}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 176px, (max-width: 1024px) 224px, 288px"
                  className="object-cover object-[50%_35%]"
                  priority
                />
                {wantHd && (
                  // Layered on top of the default copy, not swapped for it, so
                  // there's no gap while it loads. `sizes` is deliberately
                  // larger than the frame: it makes the optimizer hand back a
                  // ~1080px resample of the original instead of the browser
                  // squeezing 2500px down on its own (which speckles it).
                  <Image
                    src={avatarHdUrl}
                    alt=""
                    aria-hidden
                    fill
                    sizes="900px"
                    onLoad={() => setHdVisible(true)}
                    className={`object-cover object-[50%_35%] transition-opacity duration-700 ${
                      hdVisible ? "opacity-100" : "opacity-0"
                    }`}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ opacity: contentOpacity }}
          className="absolute bottom-5 left-1/2 z-10 -translate-x-1/2 text-xs text-muted sm:bottom-10"
        >
          scroll ↓
        </motion.div>
      </div>
    </div>
  );
}
