"use client";

import { motion } from "framer-motion";
import { ScrollAnimation } from "./ScrollAnimation";
import { BlurReveal } from "./BlurReveal";
import { AnimatedCounter } from "./AnimatedCounter";
import { FeatureCard } from "./FeatureCard";
import { ScrollReveal } from "./ScrollReveal";
import { ClipReveal } from "./ClipReveal";
import { AnimatedUnderline } from "./AnimatedUnderline";
import { EncryptReveal } from "./EncryptReveal";
import { ScrambleText } from "./ScrambleText";
import { ProductShowcase } from "./ProductShowcase";
import { Platforms } from "./Platforms";
import { CoachDemo } from "./CoachDemo";
import { NeuroWRTCard } from "./NeuroWRTCard";
import { work } from "../lib/content";

export default function Work() {
  return (
    <ScrollAnimation>
      <motion.section 
        id={work.id}
        className="py-6 px-6 border-t border-[#1f1f1f] relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-150px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
      {/* Background glow */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6ee7b7]/5 rounded-full blur-3xl pointer-events-none"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>
      <div className="max-w-5xl mx-auto relative z-10">

        <ScrollReveal>
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-medium text-[#6ee7b7] tracking-widest uppercase">
                <ScrambleText text={work.eyebrow} />
              </span>
            </motion.div>
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mt-3">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl font-semibold text-[#e8e8e8] tracking-tight"
              >
                <ClipReveal><EncryptReveal text={work.title} /></ClipReveal>
              </motion.h2>
              <AnimatedUnderline className="mt-2 max-w-xs" />
              <a
                href={work.liveDemo.href}
                target="_blank"
                rel="noopener noreferrer"
                data-preview="valocoach"
                className="inline-flex items-center gap-1.5 text-sm text-[#6ee7b7] hover:text-[#34d399] transition-colors"
              >
                {work.liveDemo.label}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
            <p className="text-white mt-3 text-sm leading-relaxed max-w-xl">
              <BlurReveal text={work.description} delay={0.3} />
            </p>
          </div>
        </ScrollReveal>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {work.stats.map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
              className="p-4 rounded-xl border border-[#222] bg-gradient-to-br from-[#111]/80 to-[#050505]/80 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] transition-colors hover:border-[#6ee7b7]/30"
              style={{ transitionDuration: "300ms", transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
            >
              <div className="text-2xl font-semibold text-[#e8e8e8]">
                <AnimatedCounter value={s.value} duration={1.5} />
              </div>
              <div className="text-xs text-white mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* The product on screen: web app and phones */}
        <ProductShowcase />

        {/* Where it runs: web, mobile, Windows */}
        <Platforms />

        {/* What it does, next to a dated snapshot of the public stats page */}
        <div className="mb-6 grid gap-4 lg:grid-cols-2 lg:items-stretch">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {work.features.map((f, idx) => (
              <FeatureCard key={f.title} title={f.title} description={f.description} index={idx} />
            ))}
          </div>
          <CoachDemo />
        </div>

        {/* Built with */}
        <motion.div
          className="p-5 rounded-xl border border-[#222] bg-gradient-to-br from-[#111]/80 to-[#050505]/80 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] mb-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-xs text-white uppercase tracking-widest mb-3 font-medium">{work.builtWithLabel}</p>
          <div className="flex flex-wrap gap-2">
            {work.techStack.map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="px-3 py-1 text-xs rounded-md border border-[#222] bg-gradient-to-br from-[#111]/80 to-[#050505]/80 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] text-white font-medium"
              >
                {t}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* A second project: where router firmware meets LLMs */}
        <NeuroWRTCard />

      </div>
    </motion.section>
    </ScrollAnimation>
  );
}
