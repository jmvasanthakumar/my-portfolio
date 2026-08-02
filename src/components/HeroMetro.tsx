/**
 * Hero backdrop: a stylised metro/transit map.
 *
 * Purely decorative and purely declarative — an inline SVG whose routes only
 * ever run horizontal, vertical or at 45°, the way real transit diagrams are
 * drawn. The "trains" are not separate elements: each route is drawn twice,
 * once as a faint base line and once as a bright dashed overlay whose
 * `stroke-dashoffset` animates, so a short lit segment glides along the route.
 *
 * Every path carries `pathLength="1"`, which normalises its length — that lets
 * one set of dash values describe the same two-carriage train on every route
 * regardless of how long it actually is, and makes the loop seamless (the dash
 * pattern sums to exactly 1).
 *
 * No canvas, no JS, no layout cost: it animates a single SVG presentation
 * attribute and stops entirely under `prefers-reduced-motion`.
 */

interface Route {
  d: string;
  /** Line colour — one of the theme accents. */
  stroke: string;
  /** Seconds for a train to run the whole route. */
  duration: number;
  /** Negative delay so the trains are already spread out on first paint. */
  delay: number;
}

const ROUTES: Route[] = [
  {
    d: "M -60 660 H 200 L 320 540 H 560 L 680 420 H 900 L 1020 300 H 1260",
    stroke: "var(--accent)",
    duration: 17,
    delay: -3,
  },
  {
    d: "M -60 200 H 240 L 360 320 H 620 L 740 200 H 1000 L 1100 300 H 1260",
    stroke: "var(--accent-2)",
    duration: 21,
    delay: -11,
  },
  {
    d: "M 160 -60 V 120 L 300 260 V 460 L 440 600 V 860",
    stroke: "#38bdf8",
    duration: 15,
    delay: -7,
  },
  {
    d: "M 1260 620 H 1000 L 880 500 H 720 L 620 600 H 460",
    stroke: "var(--muted)",
    duration: 24,
    delay: -17,
  },
];

/** Ordinary stops: a hollow dot sitting on the line. */
const STOPS: { x: number; y: number; stroke: string }[] = [
  { x: 200, y: 660, stroke: "var(--accent)" },
  { x: 560, y: 540, stroke: "var(--accent)" },
  { x: 800, y: 420, stroke: "var(--accent)" },
  { x: 1160, y: 300, stroke: "var(--accent)" },
  { x: 240, y: 200, stroke: "var(--accent-2)" },
  { x: 500, y: 320, stroke: "var(--accent-2)" },
  { x: 880, y: 200, stroke: "var(--accent-2)" },
  { x: 160, y: 120, stroke: "#38bdf8" },
  { x: 300, y: 460, stroke: "#38bdf8" },
  { x: 440, y: 740, stroke: "#38bdf8" },
  { x: 1000, y: 620, stroke: "var(--muted)" },
  { x: 720, y: 500, stroke: "var(--muted)" },
];

/**
 * Interchanges — the three points where two routes genuinely cross. Drawn
 * larger, with a slow ping, the way a map marks a transfer station.
 */
const INTERCHANGES: { x: number; y: number; delay: number }[] = [
  { x: 300, y: 260, delay: 0 },
  { x: 380, y: 540, delay: -1.4 },
  { x: 1100, y: 300, delay: -2.6 },
];

export default function HeroMetro() {
  return (
    <svg
      aria-hidden
      className="hero-metro pointer-events-none absolute inset-0 -z-10 h-full w-full"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
    >
      {ROUTES.map((route) => (
        <g key={route.d}>
          <path className="hero-metro-line" d={route.d} stroke={route.stroke} />
          <path
            className="hero-metro-train"
            d={route.d}
            stroke={route.stroke}
            pathLength={1}
            style={{
              animationDuration: `${route.duration}s`,
              animationDelay: `${route.delay}s`,
            }}
          />
        </g>
      ))}

      {STOPS.map((stop) => (
        <circle
          key={`${stop.x}-${stop.y}`}
          className="hero-metro-stop"
          cx={stop.x}
          cy={stop.y}
          r={7}
          stroke={stop.stroke}
        />
      ))}

      {INTERCHANGES.map((stop) => (
        <g key={`${stop.x}-${stop.y}`}>
          <circle
            className="hero-metro-ping"
            cx={stop.x}
            cy={stop.y}
            r={12}
            style={{ animationDelay: `${stop.delay}s` }}
          />
          <circle
            className="hero-metro-stop hero-metro-stop--interchange"
            cx={stop.x}
            cy={stop.y}
            r={12}
          />
        </g>
      ))}
    </svg>
  );
}
