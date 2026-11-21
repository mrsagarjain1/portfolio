"use client";

import { useMotionValueEvent } from "framer-motion";
import { useState } from "react";

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
 */
export function RankMeter({ className = "" }: { className?: string }) {
  const progress = useScrollProgress();
  const [reading, setReading] = useState<RankReading>(() => rankAt(0));

  useMotionValueEvent(progress, "change", (value) => {
    const next = rankAt(value * 100);
    setReading((current) =>
      current.index === next.index && current.rr === next.rr ? current : next,
    );
  });

  return (
    <div
      aria-hidden="true"
      title={`Scroll to rank up: ${FIRST.name} to ${LAST.name}`}
      data-testid="rank-meter"
      className={`inline-flex select-none items-center gap-2 ${className}`}
    >
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
