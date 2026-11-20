"use client";

import { motion } from "framer-motion";

import { journey, type JourneyEntry } from "../lib/content";
import { AnimatedUnderline } from "./AnimatedUnderline";
import { ClipReveal } from "./ClipReveal";
import { MotionPolicy } from "./MotionPolicy";
import { ScrambleText } from "./ScrambleText";
import { ScrollReveal } from "./ScrollReveal";

function EntryCard({ entry }: { entry: JourneyEntry }) {
  return (
    <article className="rounded-xl border border-[#222] bg-gradient-to-br from-[#111]/80 to-[#050505]/80 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md transition-colors hover:border-[#6ee7b7]/30">
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-xs">
          <span className="text-[#6ee7b7]">{entry.years}</span>
          <span aria-hidden="true" className="text-[#555]">
            {" · "}
          </span>
          <span className="text-[#888]">{entry.place}</span>
        </p>
        <div className="flex items-center gap-2">
          {entry.project && (
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#888]">
              {entry.project}
            </span>
          )}
          {entry.current && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#6ee7b7]/30 bg-[#6ee7b7]/5 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[#6ee7b7]">
              <span aria-hidden="true" className="h-1 w-1 animate-pulse rounded-full bg-[#6ee7b7]" />
              {journey.nowLabel}
            </span>
          )}
        </div>
      </header>

      <h3 className="mt-2 text-base font-semibold tracking-tight text-[#e8e8e8]">
        {entry.role}
        <span className="text-[#6ee7b7]">, </span>
        {entry.org}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#d4d4d4]">{entry.summary}</p>

      {entry.highlight && (
        <p className="mt-3 flex gap-2 text-sm font-medium leading-relaxed text-[#6ee7b7]">
          <span aria-hidden="true">▸</span>
          <span>{entry.highlight}</span>
        </p>
      )}

      {entry.tags.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-md border border-[#222] bg-[#0c0c0c] px-2.5 py-0.5 text-xs font-medium text-white"
            >
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function Entry({ entry, last }: { entry: JourneyEntry; last: boolean }) {
  return (
    <motion.li
      className="relative pb-8 pl-12 last:pb-0 sm:pl-16"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Rail: a line that draws down to the next role, with a node on it. */}
      {!last && (
        <motion.span
          aria-hidden="true"
          className="absolute -bottom-4 left-[15px] top-4 w-[2px] origin-top bg-gradient-to-b from-[#6ee7b7]/70 via-[#6ee7b7]/30 to-[#6ee7b7]/10 sm:left-[23px]"
          initial={{ scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.9, delay: 0.25, ease: "easeOut" }}
        />
      )}
      <span
        aria-hidden="true"
        className="absolute left-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#6ee7b7] bg-[#0a0a0a] sm:left-4"
      >
        <span
          className={`h-1.5 w-1.5 rounded-full bg-[#6ee7b7] ${entry.current ? "animate-pulse" : ""}`}
        />
      </span>

      <EntryCard entry={entry} />
    </motion.li>
  );
}

/**
 * Career timeline: router firmware first, then the AI work. Each role draws its
 * piece of the rail as it scrolls into view. Facts come from the owner's
 * LinkedIn profile (see `journey` in the content file).
 */
export default function Journey() {
  const { entries } = journey;

  return (
    <MotionPolicy>
      <motion.section
        id={journey.id}
        className="relative border-t border-[#1f1f1f] px-6 py-6"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-150px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <div className="mb-8">
              <span className="text-xs font-medium uppercase tracking-widest text-[#6ee7b7]">
                <ScrambleText text={journey.eyebrow} />
              </span>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-tight text-[#e8e8e8] sm:text-4xl">
                <ClipReveal>{journey.title}</ClipReveal>
              </h2>
              <AnimatedUnderline className="mt-2 max-w-xs" />
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white">
                {journey.lead}
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
            <ol className="relative">
              {entries.map((entry, i) => (
                <Entry key={entry.id} entry={entry} last={i === entries.length - 1} />
              ))}
            </ol>

            <motion.aside
              className="lg:sticky lg:top-32 lg:self-start"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <a
                href={journey.bridge.href}
                className="group block rounded-xl border border-[#6ee7b7]/30 bg-gradient-to-br from-[#6ee7b7]/10 via-[#0a0a0a]/50 to-[#0a0a0a]/30 p-5 backdrop-blur-md transition-colors hover:border-[#6ee7b7]/50"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6ee7b7]">
                  {journey.bridge.eyebrow}
                </p>
                <p className="mt-3 text-xl font-semibold tracking-tight text-[#e8e8e8]">
                  {journey.bridge.title}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#d4d4d4]">
                  {journey.bridge.text}
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#6ee7b7] transition-colors group-hover:text-[#34d399]">
                  {journey.bridge.label}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-0.5"
                  >
                    <path
                      d="M2.5 7H11.5M7.5 3L11.5 7L7.5 11"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </a>
            </motion.aside>
          </div>
        </div>
      </motion.section>
    </MotionPolicy>
  );
}
