"use client";

import { motion } from "framer-motion";
import { useId, useMemo } from "react";

type Particle = {
  id: number;
  angle: number; // degrees
  distance: number; // px travelled outward
  size: number;
  delay: number;
  duration: number;
  rotate: number;
  shape: "circle" | "square" | "triangle";
  color: "accent" | "foreground" | "muted";
};

const COLORS: Record<Particle["color"], string> = {
  accent: "var(--accent)",
  foreground: "var(--foreground)",
  muted: "var(--muted-soft)",
};

function makeParticles(count: number, seedOffset: number): Particle[] {
  const shapes: Particle["shape"][] = ["circle", "square", "triangle"];
  const colors: Particle["color"][] = ["accent", "accent", "foreground", "muted"];
  return Array.from({ length: count }, (_, i) => {
    // Deterministic-ish pseudo-random spread so bursts feel organic without
    // needing a random seed dependency — good enough for a decorative effect.
    const seed = (i + 1) * 137.5 + seedOffset;
    const angle = (seed * 47) % 360;
    return {
      id: i,
      angle,
      distance: 60 + ((seed * 13) % 70),
      size: 5 + ((seed * 7) % 7),
      delay: ((seed * 3) % 10) / 100,
      duration: 0.7 + ((seed * 11) % 40) / 100,
      rotate: (seed * 29) % 360,
      shape: shapes[i % shapes.length],
      color: colors[i % colors.length],
    };
  });
}

function ParticleShape({ shape, size, color }: Pick<Particle, "shape" | "size" | "color">) {
  const fill = COLORS[color];
  if (shape === "circle") {
    return <div style={{ width: size, height: size, borderRadius: "999px", background: fill }} />;
  }
  if (shape === "square") {
    return <div style={{ width: size, height: size, borderRadius: "2px", background: fill }} />;
  }
  return (
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderBottom: `${size}px solid ${fill}`,
      }}
    />
  );
}

/**
 * A short-lived radial burst of particles, meant to fire once from a fixed
 * point (e.g. behind a score number or streak badge) and never repeat until
 * re-mounted. Purely decorative — respects prefers-reduced-motion via the
 * global CSS rule that collapses animation durations.
 */
export function CelebrationBurst({
  intensity = "medium",
}: {
  intensity?: "low" | "medium" | "high";
}) {
  const count = intensity === "low" ? 10 : intensity === "high" ? 28 : 18;
  // useId gives a stable, unique-per-mount string to seed the pseudo-random
  // spread — deterministic across renders (Date.now() would not be), which
  // keeps this pure while still looking different each time it mounts fresh.
  const id = useId();
  const seed = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 1000;
    return hash;
  }, [id]);
  const particles = useMemo(() => makeParticles(count, seed), [count, seed]);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
      {particles.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.distance;
        const y = Math.sin(rad) * p.distance;
        return (
          <motion.div
            key={p.id}
            className="absolute"
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
            animate={{ x, y, opacity: 0, scale: 1, rotate: p.rotate }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <ParticleShape shape={p.shape} size={p.size} color={p.color} />
          </motion.div>
        );
      })}
    </div>
  );
}
