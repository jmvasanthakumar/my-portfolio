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

const VERTEX_SHADER = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

/**
 * Animated mesh gradient, the technique behind Stripe-style hero backgrounds:
 * fractal brownian motion (stacked octaves of value noise) fed through two
 * rounds of domain warping — fbm(p + fbm(p + fbm(p))) — so the field folds
 * against itself into slow, marbled, never-repeating colour flow.
 *
 * Value noise is used rather than the usual simplex implementation: at this
 * blur level the two are indistinguishable, and it's a fraction of the ALU
 * cost per pixel.
 */
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
uniform float uProgress;

// Palette mirrors the CSS vars in globals.css: --background, --accent (amber),
// --accent-2 (coral), plus the sky note used in the hero's background wash.
const vec3 BASE = vec3(0.992, 0.988, 0.976);
const vec3 AMBER = vec3(0.961, 0.620, 0.043);
const vec3 CORAL = vec3(0.984, 0.443, 0.522);
const vec3 SKY = vec3(0.220, 0.741, 0.973);

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  // Rotating between octaves hides the axis-aligned grid of the value noise.
  mat2 rot = mat2(0.80, 0.60, -0.60, 0.80);
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p = rot * p * 2.02;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float aspect = uResolution.x / uResolution.y;
  vec2 p = vec2(uv.x * aspect, uv.y) * 1.6;

  float t = uTime * 0.045;

  // Two levels of domain warping. Each level offsets the sample point by the
  // previous level's output, which is what turns smooth noise into swirling,
  // liquid-looking bands instead of clouds.
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3 - t * 0.8)));
  vec2 r = vec2(
    fbm(p + 2.4 * q + vec2(1.7 + t * 0.7, 9.2)),
    fbm(p + 2.4 * q + vec2(8.3, 2.8 - t * 0.5))
  );
  float f = fbm(p + 2.6 * r);

  vec3 color = BASE;
  color = mix(color, AMBER, smoothstep(0.28, 0.95, f) * 0.80);
  color = mix(color, CORAL, clamp(length(q) - 0.25, 0.0, 1.0) * 0.85);
  color = mix(color, SKY, clamp(r.x - 0.35, 0.0, 1.0) * 0.70);

  // A warm light that trails the cursor, so the surface reacts to the pointer
  // without anything visibly "following" it.
  vec2 pointerDelta = (uv - uPointer) * vec2(aspect, 1.0);
  float glow = exp(-dot(pointerDelta, pointerDelta) * 9.0);
  color += AMBER * glow * 0.16;

  // On landscape, keep the left column close to the page background so the
  // hero copy sits on near-flat paper and the gradient builds toward the
  // right. Portrait phones have no side column to spare, so the gradient
  // covers the full screen there and the copy carries its own backdrop.
  float reveal = mix(smoothstep(0.02, 0.62, uv.x), 0.78, step(aspect, 1.0));
  // Settle back toward the background as the scroll track runs out.
  reveal *= 1.0 - uProgress * 0.55;
  color = mix(BASE, color, reveal);

  // Dither: light, wide gradients band badly on 8-bit displays without it.
  color += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.012;

  gl_FragColor = vec4(color, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * Procedural, code-driven hero background: an animated mesh gradient rendered
 * by a WebGL fragment shader — no video, no image assets, no 3D library.
 *
 * Everything expensive happens on the GPU, one full-screen pass per frame, so
 * the animation is smooth regardless of what the main thread is doing. If
 * WebGL is unavailable the canvas simply stays empty and the CSS radial
 * gradient behind it carries the design.
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
  const pointerRef = useRef({ x: 0.72, y: 0.5 });
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
  const sceneScale = useTransform(smoothProgress, [0, 1], [1, 1.08]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = (canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "low-power",
    }) ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
    if (!gl) return; // no WebGL: the CSS gradient behind the canvas stands in

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();
    if (!vs || !fs || !program) return;

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]), // one oversized triangle
      gl.STATIC_DRAW
    );
    const aPosition = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, "uResolution");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uPointer = gl.getUniformLocation(program, "uPointer");
    const uProgress = gl.getUniformLocation(program, "uProgress");

    // The gradient has no hard edges, so rendering below device resolution is
    // invisible and keeps the fragment cost down on high-DPI screens.
    const RENDER_SCALE = 0.75;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2) * RENDER_SCALE;
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };

    // Pointer position is eased toward the cursor rather than snapped, so the
    // highlight drifts instead of jumping.
    const target = { ...pointerRef.current };
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = 1 - (e.clientY - rect.top) / rect.height;
    };

    resize();
    window.addEventListener("resize", resize);
    if (!reducedMotion) window.addEventListener("pointermove", onPointerMove);

    let frameId = 0;
    const start = performance.now();

    const render = (time: number) => {
      const pointer = pointerRef.current;
      pointer.x += (target.x - pointer.x) * 0.045;
      pointer.y += (target.y - pointer.y) * 0.045;

      gl.uniform1f(uTime, time);
      gl.uniform2f(uPointer, pointer.x, pointer.y);
      gl.uniform1f(uProgress, smoothProgress.get());
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reducedMotion) {
      render(12); // one static, fully-formed frame
    } else {
      const tick = (now: number) => {
        render((now - start) / 1000);
        frameId = requestAnimationFrame(tick);
      };
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      if (frameId) cancelAnimationFrame(frameId);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  return (
    // svh, not vh: on phones `100vh` is the viewport with the browser chrome
    // hidden, so a vh-sized hero gets its bottom cropped by the toolbar.
    <div ref={trackRef} className="relative h-[150svh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
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
          style={{ scale: sceneScale }}
        />

        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="section-container relative z-10 grid items-center gap-8 pt-20 sm:gap-12 sm:pt-24 md:grid-cols-[1.3fr_0.7fr]"
        >
          <div className="relative order-2 rounded-2xl bg-background/70 p-4 backdrop-blur-sm sm:p-0 md:order-1 md:bg-transparent md:backdrop-blur-none">
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

          <div className="order-1 justify-self-center md:order-2">
            <div className="relative h-32 w-32 sm:h-48 sm:w-48 lg:h-64 lg:w-64">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent to-accent-2 opacity-45 blur-2xl" />
              <div className="glass-card relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={avatarUrl}
                  alt={name}
                  fill
                  sizes="(max-width: 640px) 128px, (max-width: 1024px) 192px, 256px"
                  className="object-cover"
                  priority
                />
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
