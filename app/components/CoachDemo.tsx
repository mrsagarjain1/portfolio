"use client";

import { motion, type Variants } from "framer-motion";
import { useState } from "react";

import { coachSnapshot as snapshot } from "../lib/content";
import { MotionPolicy } from "./MotionPolicy";
import { useReducedMotion } from "../hooks/useReducedMotion";

const listVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
};

const lineVariants: Variants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

/**
 * A terminal-style card that prints what the public stats page shows for a real
 * account. The numbers are a dated snapshot (see `coachSnapshot` in the content
 * file) and the card says so. AI analysis on the live site needs a sign-in, so
 * this shows only what the page shows without one and points to the live page.
 *
 * Every line is real text in the page (nothing is hidden from screen readers or
 * search); the animation only fades the lines in one by one when the card
 * scrolls into view. "Replay" prints them again.
 */
export function CoachDemo() {
  const [run, setRun] = useState(0);
  const reducedMotion = useReducedMotion();

  return (
    <MotionPolicy>
      <figure
        className="flex h-full flex-col overflow-hidden rounded-xl border border-[#222] bg-[#070707]/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md"
        aria-label={`${snapshot.title}: snapshot of a real account`}
      >
        <div className="flex items-center gap-1.5 border-b border-[#1f1f1f] bg-[#0c0c0c] px-3 py-2">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#3a3a3a]" />
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#3a3a3a]" />
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#3a3a3a]" />
          <span className="ml-3 min-w-0 flex-1 truncate font-mono text-[10px] text-[#777]">
            {snapshot.windowTitle}
          </span>
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setRun((n) => n + 1)}
              aria-label="Replay the demo"
              className="rounded-md border border-[#2a2a2a] px-2 py-0.5 font-mono text-[10px] text-[#aaa] transition-colors hover:border-[#6ee7b7]/40 hover:text-[#6ee7b7]"
            >
              Replay
            </button>
          )}
        </div>

        <motion.div
          key={run}
          className="flex-1 p-5 font-mono text-xs leading-6 sm:text-[13px] sm:leading-7"
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.p variants={lineVariants} className="text-[#6ee7b7]">
            <span aria-hidden="true" className="select-none text-[#6ee7b7]/50">
              {"› "}
            </span>
            {snapshot.prompt}
          </motion.p>

          <dl className="mt-4 space-y-1">
            {snapshot.rows.map((row) => (
              <motion.div key={row.label} variants={lineVariants} className="flex gap-3">
                <dt className="w-[5.5rem] shrink-0 text-[#777]">{row.label}</dt>
                <dd className="text-[#e8e8e8]">{row.value}</dd>
              </motion.div>
            ))}
            <motion.div variants={lineVariants} className="flex gap-3">
              <dt className="w-[5.5rem] shrink-0 text-[#777]">{snapshot.recentLabel}</dt>
              <dd className="flex flex-wrap gap-x-3 text-[#e8e8e8]">
                {snapshot.recent.map((match, i) => (
                  <span key={i} className="whitespace-nowrap">
                    {match.map} <span className="text-[#6ee7b7]">{match.score}</span>
                  </span>
                ))}
              </dd>
            </motion.div>
          </dl>

          <motion.p variants={lineVariants} className="mt-4 text-[#6ee7b7]">
            <span aria-hidden="true" className="select-none text-[#6ee7b7]/50">
              {"▸ "}
            </span>
            {snapshot.footer}
            {!reducedMotion && (
              <span
                aria-hidden="true"
                className="ml-1 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-[#6ee7b7]"
              />
            )}
          </motion.p>
        </motion.div>

        <figcaption className="flex flex-col gap-2 border-t border-[#1f1f1f] px-4 py-3 text-xs leading-relaxed text-[#aaa] sm:flex-row sm:items-center sm:justify-between">
          <span>{snapshot.note}</span>
          <a
            href={snapshot.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1.5 text-[#6ee7b7] transition-colors hover:text-[#34d399]"
          >
            {snapshot.cta.label}
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M2 10L10 2M10 2H4M10 2V8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </figcaption>
      </figure>
    </MotionPolicy>
  );
}
