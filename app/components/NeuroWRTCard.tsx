"use client";

import { motion } from "framer-motion";

import { neurowrt } from "../lib/content";
import { BrowserFrame } from "./BrowserFrame";
import { MotionPolicy } from "./MotionPolicy";
import { ScrambleText } from "./ScrambleText";

/**
 * A second project next to valocoach.ai: an AI assistant you talk to in plain
 * English to run an OpenWrt router. It is also the bridge between the router
 * firmware career and the AI work, and the Journey section links here.
 */
export function NeuroWRTCard() {
  return (
    <MotionPolicy>
      <motion.article
        id={neurowrt.id}
        className="grid scroll-mt-28 items-center gap-6 rounded-2xl border border-[#222] bg-gradient-to-br from-[#111]/80 to-[#050505]/80 p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] backdrop-blur-md transition-colors hover:border-[#6ee7b7]/30 sm:p-7 lg:grid-cols-2 lg:gap-10"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-[#6ee7b7]">
            <ScrambleText text={neurowrt.eyebrow} />
          </p>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-2xl font-semibold tracking-tight text-[#e8e8e8]">
              {neurowrt.title}
            </h3>
            <span className="font-mono text-xs text-[#888]">{neurowrt.year}</span>
          </div>
          <p className="mt-1 text-sm font-medium text-[#6ee7b7]">{neurowrt.tagline}</p>
          <p className="mt-3 text-sm leading-relaxed text-[#d4d4d4]">
            {neurowrt.description}
          </p>

          <p className="mt-5 text-xs font-medium uppercase tracking-widest text-white">
            {neurowrt.askLabel}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {neurowrt.ask.map((prompt) => (
              <li
                key={prompt}
                className="rounded-md border border-[#222] bg-[#0c0c0c] px-3 py-1 font-mono text-xs text-[#d4d4d4]"
              >
                {prompt}
              </li>
            ))}
          </ul>

          <ul className="mt-5 flex flex-wrap gap-2">
            {neurowrt.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md border border-[#222] bg-gradient-to-br from-[#111]/80 to-[#050505]/80 px-3 py-1 text-xs font-medium text-white"
              >
                {tag}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={neurowrt.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#2a2a2a] px-3.5 py-2 text-sm font-medium text-[#e8e8e8] transition-colors hover:border-[#6ee7b7]/40 hover:text-[#6ee7b7]"
            >
              {neurowrt.link.label}
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path
                  d="M2 10L10 2M10 2H4M10 2V8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <span className="text-xs italic text-[#aaa]">{neurowrt.bridge}</span>
          </div>
        </div>

        <BrowserFrame
          src={neurowrt.image.src}
          alt={neurowrt.image.alt}
          width={neurowrt.image.width}
          height={neurowrt.image.height}
          urlBar={neurowrt.image.urlBar}
          sizes="(min-width: 1024px) 480px, 100vw"
        />
      </motion.article>
    </MotionPolicy>
  );
}
