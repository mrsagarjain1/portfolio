"use client";

/**
 * WaveformBars — a small decorative "signal alive" accent (aria-hidden).
 *
 * The per-bar animation duration and delay are derived deterministically from
 * the bar index rather than `Math.random()`. Random values would differ between
 * the server render and the client hydration pass, producing a React hydration
 * mismatch; a stable index-based hash yields identical markup on both sides
 * while still giving each bar its own varied, organic-looking timing.
 */

/** Deterministic pseudo-random in [0, 1) from an integer seed (server == client). */
function hash01(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function WaveformBars({ count = 24 }: { count?: number }) {
  return (
    <div className="flex items-end gap-[2px] h-5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="wave-bar"
          style={{
            "--dur": `${(0.6 + hash01(i + 1) * 0.8).toFixed(4)}s`,
            "--delay": `${hash01((i + 1) * 7.13).toFixed(4)}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
