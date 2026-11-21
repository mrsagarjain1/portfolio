"use client";

import { motion, useMotionValueEvent } from "framer-motion";
import { useRef, useState } from "react";

import { useScrollProgress } from "../hooks/useScrollProgress";
import { RANKS, rankAt, type RankReading } from "../lib/rank";

const FIRST = RANKS[0];
const LAST = RANKS[RANKS.length - 1];

/** A small shield with one to three chevrons: more chevrons for higher ranks. */
function RankGlyph({ color, index }: { color: string; index: number }) {
  const chevrons = 1 + Math.floor(index / 3);
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0 transition-colors duration-300"
    >
      <path
        d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7L12 2.5Z"
        fill={color}
        fillOpacity="0.14"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {Array.from({ length: chevrons }).map((_, i) => (
        <path
          key={i}
          d={`M8.2 ${14.2 - i * 3}L12 ${10.6 - i * 3}L15.8 ${14.2 - i * 3}`}
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

/**
 * Rank-up meter. A small badge in the header that climbs from Iron 2 to Immortal 1
 * as the visitor scrolls, with a thin bar for progress to the next rank.
 *
 * Purely decorative (`aria-hidden`, not focusable). It follows the shared
 * scroll-progress motion value and re-renders only when the rank or the rating
 * changes, never on every scroll frame.
 *
 * Each time the visitor climbs to a higher rank, a ring pulses once around the
 * badge and a short "Rank up" tag drops below it. Both are framer-motion
 * animations that play once, so the page's Motion switch controls them: with
 * motion off they fade without moving.
 */
export function RankMeter({ className = "" }: { className?: string }) {
  const progress = useScrollProgress();
  const [reading, setReading] = useState<RankReading>(() => rankAt(0));
  /** How many times the visitor has climbed a rank. Each one restarts the animation; zero shows nothing. */
  const [rankUps, setRankUps] = useState(0);
  /** The rank last shown, to tell a climb from a drop. */
  const shownIndex = useRef(0);

  useMotionValueEvent(progress, "change", (value) => {
    const next = rankAt(value * 100);
    if (next.index > shownIndex.current) setRankUps((count) => count + 1);
    shownIndex.current = next.index;
    setReading((current) =>
      current.index === next.index && current.rr === next.rr ? current : next,
    );
  });

  return (
    <div
      aria-hidden="true"
      title={`Scroll to rank up: ${FIRST.name} to ${LAST.name}`}
      data-testid="rank-meter"
      data-rank-ups={rankUps}
      className={`relative inline-flex select-none items-center gap-2 ${className}`}
    >
      {rankUps > 0 && (
        <>
          <motion.span
            key={`ring-${rankUps}`}
            data-testid="rank-up-ring"
            className="pointer-events-none absolute inset-0 rounded-md border-2"
            style={{ borderColor: reading.color }}
            initial={{ opacity: 0.95, scale: 1 }}
            animate={{ opacity: 0, scale: 1.16 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
          />
          <motion.span
            key={`tag-${rankUps}`}
            data-testid="rank-up-tag"
            className="pointer-events-none absolute left-0 top-full z-10 mt-2 inline-flex items-center gap-1.5 rounded-sm bg-ink-2 px-2 py-1 font-mono text-[10px] font-semibold uppercase leading-none tracking-[0.14em]"
            style={{ color: reading.color }}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: [0, 1, 1, 0], y: [-6, 0, 0, 0] }}
            transition={{ duration: 1.7, times: [0, 0.14, 0.78, 1], ease: "easeOut" }}
          >
            <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
              <path d="M4 0.5 7.5 7H0.5L4 0.5Z" fill="currentColor" />
            </svg>
            Rank up
          </motion.span>
        </>
      )}
      <RankGlyph color={reading.color} index={reading.index} />
      <div className="w-[5.6rem] leading-none">
        <div
          className="text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 md:text-[11px]"
          style={{ color: reading.color }}
        >
          {reading.name}
        </div>
        <div className="mt-1.5 h-[3px] w-full overflow-hidden rounded-full bg-[#3a3b38]">
          <div
            className="h-full origin-left rounded-full"
            style={{
              transform: `scaleX(${reading.fraction})`,
              backgroundColor: reading.color,
            }}
          />
        </div>
      </div>
      <span className="hidden font-mono text-[10px] tabular-nums text-[#aaa] sm:inline md:hidden lg:inline">
        {reading.isPeak ? "PEAK" : `${reading.rr} RR`}
      </span>
    </div>
  );
}
