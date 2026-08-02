"use client";

import { useEffect, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

import { LINKS } from "./Nav";

/** One full run of the line, end to end, when nobody is interacting. */
const PATROL_MS = 20000;

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}

/**
 * The hero's metro line: a route whose stops are the page's sections.
 *
 * A train patrols the line on its own. Point at (or tab to) a stop and the
 * train changes destination and pulls in there, lighting the track up behind
 * it and swelling the stop it arrives at. Activating a stop travels to that
 * section. The stop's own label is the only text — no tooltip or destination
 * board on top of it.
 *
 * Plain HTML anchors rather than SVG, so it stays responsive at any width,
 * keeps 44px tap targets, and is keyboard- and screen-reader-navigable for
 * free. The stop list is Nav's LINKS, so the line and the nav can't disagree.
 *
 * Layout note: each stop is `flex-1`, so with n stops the dot centres sit at
 * (i + 0.5) / n of the width — that's the coordinate space everything here
 * (track, lit fill, train, board) is positioned in.
 */
export default function HeroMetroLine() {
  const stopCount = LINKS.length;
  const stopAt = (index: number) => ((index + 0.5) / stopCount) * 100;
  const firstStop = stopAt(0);
  const lastStop = stopAt(stopCount - 1);

  const reduced = useReducedMotion();
  const [destination, setDestination] = useState<number | null>(null);
  // Which stop the train is currently standing at, or -1 between stops.
  const [atStop, setAtStop] = useState(0);

  // `target` is where the train wants to be; the spring is what actually
  // moves, which is what makes a change of destination read as a train
  // slowing, turning and pulling in rather than teleporting.
  const target = useMotionValue(firstStop);
  const spring = useSpring(target, {
    stiffness: 90,
    damping: 22,
    mass: 0.9,
  });
  const position = reduced ? target : spring;

  const left = useTransform(position, (value) => `${value}%`);
  const litWidth = useTransform(
    position,
    (value) => `${Math.max(0, value - firstStop)}%`,
  );

  // Idle patrol: a triangle wave between the first and last stop. Paused
  // while a destination is chosen, and skipped entirely when motion is
  // reduced (the train just waits at the first stop until asked to move).
  useAnimationFrame((time) => {
    if (destination !== null || reduced) return;
    const phase = (time % PATROL_MS) / PATROL_MS;
    const sweep = phase < 0.5 ? phase * 2 : 2 - phase * 2;
    target.set(firstStop + (lastStop - firstStop) * easeInOut(sweep));
  });

  useEffect(() => {
    if (destination === null) return;
    target.set(stopAt(destination));
    // stopAt is derived from LINKS, which is module-level and constant.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, target]);

  // Light up whichever stop the train is standing at. The threshold is a
  // fraction of the gap between stops, so "standing at" scales with width.
  useMotionValueEvent(position, "change", (value) => {
    const gap = 100 / stopCount;
    let nearest = 0;
    for (let i = 1; i < stopCount; i += 1) {
      if (Math.abs(stopAt(i) - value) < Math.abs(stopAt(nearest) - value)) {
        nearest = i;
      }
    }
    const arrived = Math.abs(stopAt(nearest) - value) < gap * 0.3;
    setAtStop(arrived ? nearest : -1);
  });

  return (
    <nav aria-label="Jump to a section" className="hero-line pointer-events-auto">
      <ol className="relative flex items-start">
        <span
          aria-hidden
          className="hero-line-track"
          style={{ left: `${firstStop}%`, right: `${firstStop}%` }}
        />
        <motion.span
          aria-hidden
          className="hero-line-lit"
          style={{ left: `${firstStop}%`, width: litWidth }}
        />
        <motion.span aria-hidden className="hero-line-train" style={{ left }} />

        {LINKS.map((link, index) => (
          <li key={link.href} className="flex-1">
            <a
              href={link.href}
              data-at={atStop === index ? "true" : undefined}
              onMouseEnter={() => setDestination(index)}
              onMouseLeave={() => setDestination(null)}
              onFocus={() => setDestination(index)}
              onBlur={() => setDestination(null)}
              className="hero-line-stop flex min-h-[44px] flex-col items-center gap-2 pt-1 outline-none"
            >
              <span aria-hidden className="hero-line-dot" />
              <span className="hero-line-label">
                <span className="hero-line-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                {link.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
