"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollAnimation } from "./ScrollAnimation";
import { BlurReveal } from "./BlurReveal";
import { AnimatedCounter } from "./AnimatedCounter";
import { FeatureCard } from "./FeatureCard";
import { ScrollReveal } from "./ScrollReveal";
import { ClipReveal } from "./ClipReveal";
import { AnimatedUnderline } from "./AnimatedUnderline";

const features = [
  {
    title: "Match Analysis",
    description:
      "AI parses every match and surfaces the exact patterns holding your rank back - not generic tips.",
  },
  {
    title: "Personalized Coaching",
    description:
      "Coaching that adapts to your playstyle. Built with insights from 100+ professional coaches.",
  },
  {
    title: "Progression Systems",
    description:
      "Reward-driven loops keep players engaged and making consistent, measurable progress.",
  },
  {
    title: "Agent & Role Intelligence",
    description:
      "Deep role-specific insights. Know exactly what to do on your agent at your rank.",
  },
];

const stats = [
  { value: "20K+", label: "Users" },
  { value: "1M+", label: "Monthly Impressions" },
  { value: "3K+", label: "App Downloads" },
  { value: "100+", label: "Pro Coaches Consulted" },
];

const techStack = ["Python", "FastAPI", "LangChain", "MongoDB", "Redis", "Vector DB"];

export default function Work() {
  const [testUsername] = useState("venator#fear");

  return (
    <ScrollAnimation>
      <motion.section 
        id="work" 
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
                Featured Work
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
                <ClipReveal><BlurReveal text="valocoach.ai" /></ClipReveal>
              </motion.h2>
              <AnimatedUnderline className="mt-2 max-w-xs" />
              <a
                href="https://www.valocoach.ai/statistics?region=ap&name=venator%23fear"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-[#6ee7b7] hover:text-[#34d399] transition-colors"
              >
                Live demo
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
            </div>
            <p className="text-[#888] mt-3 text-sm leading-relaxed max-w-xl">
              <BlurReveal
                text="AI-powered coaching platform that gives every competitive Valorant player access to personalized, data-driven improvement - the kind previously reserved for pro teams."
                delay={0.3}
              />
            </p>
          </div>
        </ScrollReveal>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {stats.map((s, idx) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -4 }}
              className="p-4 rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] transition-colors hover:border-[#6ee7b7]/30"
              style={{ transitionDuration: "300ms", transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)" }}
            >
              <div className="text-2xl font-semibold text-[#e8e8e8]">
                <AnimatedCounter value={s.value} duration={1.5} />
              </div>
              <div className="text-xs text-[#666] mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {features.map((f, idx) => (
            <FeatureCard key={f.title} title={f.title} description={f.description} index={idx} />
          ))}
        </div>

        {/* Built with */}
        <motion.div
          className="p-5 rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p className="text-xs text-[#555] uppercase tracking-widest mb-3 font-medium">Built with</p>
          <div className="flex flex-wrap gap-2">
            {techStack.map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="px-3 py-1 text-xs rounded-md border border-[#1f1f1f] bg-[#0a0a0a] text-[#888] font-medium"
              >
                {t}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Links */}
        <div className="flex flex-wrap gap-3 mb-4">
          <motion.a
            href="https://www.valocoach.ai/statistics?region=ap&name=venator%23fear"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1f1f1f] bg-[#0c0c0c] text-sm text-[#e8e8e8] hover:border-[#6ee7b7]/30 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 7C1.5 3.96 3.96 1.5 7 1.5C10.04 1.5 12.5 3.96 12.5 7C12.5 10.04 10.04 12.5 7 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><path d="M5 7.5L7 9.5L9 7.5" stroke="#6ee7b7" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Web App
          </motion.a>
          <motion.a
            href="https://play.google.com/store/apps/details?id=com.valocoachai"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#1f1f1f] bg-[#0c0c0c] text-sm text-[#e8e8e8] hover:border-[#6ee7b7]/30 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-[#6ee7b7]"><path d="M3.18 23.76c.37.21.8.24 1.2.07l12.15-6.93-2.84-2.85L3.18 23.76zM20.6 10.35l-2.94-1.68-3.18 3.18 3.18 3.18 2.97-1.7c.85-.48.85-1.5-.03-1.98zM2 1.96C1.97 2.15 2 2.34 2 2.55v18.88c0 .21.03.4.08.57l.1.1 10.57-10.58v-.24L2.1 1.86l-.1.1zM4.38.17L16.53 7.1l-2.84 2.84L3.18.24C3.58.07 4.01.1 4.38.17z"/></svg>
            Android App
          </motion.a>
        </div>

        {/* Try it callout */}
        <motion.a
          href={`https://www.valocoach.ai/statistics?region=ap&name=${encodeURIComponent(testUsername)}`}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          className="group block p-6 rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] hover:border-[#6ee7b7]/30 transition-colors"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-[#e8e8e8] font-medium mb-1">Test it: search venator#fear on the website</p>
              <p className="text-sm text-[#777] leading-relaxed">
                See real coaching analysis with KDR, HS%, ACS, win rate, AI insights and personalized quests. No account needed.
              </p>
            </div>
            <svg
              width="16"
              height="16"
              viewBox="0 0 12 12"
              fill="none"
              className="text-[#6ee7b7] flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            >
              <path d="M2 10L10 2M10 2H4M10 2V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </motion.a>

      </div>
    </motion.section>
    </ScrollAnimation>
  );
}
