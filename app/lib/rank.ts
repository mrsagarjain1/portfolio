/**
 * Rank-up meter math.
 *
 * As the visitor scrolls, a small badge in the header climbs a Valorant-style
 * rank ladder: Iron 2 at the top of the page (where the origin story starts),
 * Immortal 1 (the owner's peak rank) near the bottom. Framework-free so it can
 * be covered by property tests, like the rest of `app/lib`.
 *
 * Input is scroll progress as a percentage in [0, 100], the same unit that
 * `computeScrollProgress` returns.
 */

export interface RankStep {
  name: string;
  /** Accent colour for the badge, readable on the dark page. */
  color: string;
}

/** The ladder, lowest first. The last entry is the peak. */
export const RANKS: readonly RankStep[] = [
  { name: "Iron 2", color: "#9ca3af" },
  { name: "Bronze 2", color: "#c08a5a" },
  { name: "Silver 2", color: "#cbd5e1" },
  { name: "Gold 2", color: "#e6c35c" },
  { name: "Platinum 2", color: "#4fb8c4" },
  { name: "Diamond 2", color: "#b794f6" },
  { name: "Ascendant 2", color: "#34d399" },
  { name: "Immortal 1", color: "#f0587a" },
];

/**
 * Scroll progress (percent) at which the peak rank is reached. Below 100 so the
 * peak shows before the very last pixel of the page, and a visitor who stops in
 * the contact section still sees it.
 */
export const RANK_PEAK_AT = 90;

export interface RankReading {
  /** Index into {@link RANKS}. */
  index: number;
  name: string;
  color: string;
  /** Rank rating inside the current rank, 0 to 99. Always 0 at the peak. */
  rr: number;
  /** Progress towards the next rank, 0 to 1. Always 1 at the peak. */
  fraction: number;
  isPeak: boolean;
}

function clamp01(value: number): number {
  return Math.min(Math.max(value, 0), 1);
}

/**
 * The rank shown for a scroll progress percentage.
 *
 * Total over every number: NaN is treated as 0 and infinities clamp to the two
 * ends of the ladder. Monotone: a larger progress never gives a lower rank, and
 * inside one rank never a lower rating.
 */
export function rankAt(progress: number): RankReading {
  const last = RANKS.length - 1;
  const t = Number.isNaN(progress) ? 0 : clamp01(progress / RANK_PEAK_AT);
  const scaled = t * last;
  const index = Math.min(Math.floor(scaled), last);
  const isPeak = index === last;
  const fraction = isPeak ? 1 : scaled - index;
  const rr = isPeak ? 0 : Math.min(99, Math.floor(fraction * 100));
  const step = RANKS[index];

  return { index, name: step.name, color: step.color, rr, fraction, isPeak };
}
