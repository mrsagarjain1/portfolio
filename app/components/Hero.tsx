"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { OrbitingRing, ProgressRing } from "./OrbitingRing";
import { MouseParallax } from "./MouseParallax";
import { ScrambleText } from "./ScrambleText";
import { AnimatedCounter } from "./AnimatedCounter";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { hero, now } from "../lib/content";

function AnimatedMetric({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className="text-center"
    >
      <div className="text-2xl font-semibold text-[#e8e8e8] tabular-nums">
        <AnimatedCounter value={value} duration={1.5} />
      </div>
      <div className="text-xs text-white mt-0.5">{label}</div>
    </motion.div>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const contentY = useTransform(scrollY, [0, 500], [0, -60]);
  const headlineOpacity = useTransform(scrollY, [0, 250], [1, 0]);
  const headlineScale = useTransform(scrollY, [0, 250], [1, 0.92]);
  const headshotScale = useTransform(scrollY, [0, 400], [1, 0.7]);
  const headshotOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(h > 0 ? (window.scrollY / h) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center justify-center pt-28 pb-16 px-6 relative overflow-hidden" id="hero">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-[#6ee7b7]/4 rounded-full blur-[120px]"
          animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 -right-20 w-[400px] h-[400px] bg-[#34d399]/3 rounded-full blur-[100px]"
          animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 0.95, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <motion.div className="max-w-5xl mx-auto w-full relative z-10" style={{ y: contentY }}>
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          <div className="flex-1 text-center lg:text-left order-2 lg:order-1 relative z-50">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#6ee7b7]/20 bg-[#6ee7b7]/5 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#6ee7b7] animate-pulse" />
              <ScrambleText text={hero.badge} className="text-xs font-medium text-[#6ee7b7] tracking-wide" />
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#e8e8e8] tracking-tight leading-[1.08] mb-5"
              style={{ opacity: headlineOpacity, scale: headlineScale }}
            >
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
              >
                {hero.headline.line1}
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7, ease: "easeOut" }}
                className="text-gradient-flow"
              >
                {hero.headline.line2}
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="text-base text-white leading-relaxed max-w-md mx-auto lg:mx-0 mb-8"
            >
              <span className="font-medium text-[#e8e8e8]">{hero.intro}</span>{" "}
              <span className="text-[#c8c8c8]">{hero.mission}</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-8 mb-8"
            >
              <div className="w-px h-10 bg-[#1f1f1f]" />
              {hero.metrics.map((m, i) => (
                <AnimatedMetric key={m.label} value={m.value} label={m.label} delay={1.1 + i * 0.1} />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="flex items-center justify-center lg:justify-start gap-3 relative z-50 pointer-events-auto"
            >
              <motion.a
                href={hero.primaryCta.href}
                target="_blank"
                rel="noopener noreferrer"
                data-preview="valocoach"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="glass-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#e8e8e8] text-[#0a0a0a] text-sm font-semibold hover:bg-white transition-colors"
              >
                {hero.primaryCta.label}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7H11.5M7.5 3L11.5 7L7.5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </motion.a>
              <motion.a
                href={`#${hero.secondaryCta.sectionId}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(hero.secondaryCta.sectionId)?.scrollIntoView({ behavior: 'smooth' });
                }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-5 py-2.5 rounded-lg border border-[#2a2a2a] text-[#aaa] text-sm font-medium hover:border-[#6ee7b7]/40 hover:text-[#e8e8e8] transition-all"
              >
                {hero.secondaryCta.label}
              </motion.a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
              className="mt-8 flex flex-col items-center lg:items-start gap-3"
            >
              <p className="flex flex-wrap items-center justify-center lg:justify-start gap-x-2 gap-y-1 text-xs text-[#aaa]">
                <span className="font-mono uppercase tracking-widest text-[#6ee7b7]">{now.label}</span>
                {now.roles.map((role) => (
                  <span key={role.org} className="inline-flex items-center gap-2">
                    <span aria-hidden="true" className="text-[#444]">·</span>
                    <span>
                      <span className="text-[#e8e8e8]">{role.title}</span>
                      {", "}
                      {role.org}
                      {role.detail ? ` (${role.detail})` : ""}
                    </span>
                  </span>
                ))}
              </p>
              <AvailabilityBadge />
            </motion.div>
          </div>

          <motion.div
            className="order-1 lg:order-2 flex-shrink-0"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
            style={{ scale: headshotScale, opacity: headshotOpacity }}
          >
            <div className="relative">
              <div className="absolute -inset-6">
                <OrbitingRing />
              </div>
              <div className="absolute -inset-4">
                <ProgressRing progress={progress} />
              </div>
              <MouseParallax strength={15}>
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-72 lg:h-72 rounded-2xl overflow-hidden border border-[#1f1f1f] shadow-2xl shadow-[#6ee7b7]/5">
                  <Image
                    src={hero.photo.src}
                    alt={hero.photo.alt}
                    fill
                    sizes="(max-width: 1024px) 224px, 288px"
                    className="object-cover object-top"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/30 to-transparent pointer-events-none" />
                </div>
              </MouseParallax>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
