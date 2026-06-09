"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { AnimatedText } from "./AnimatedText";
import { BlurReveal } from "./BlurReveal";
import { FloatingElement } from "./FloatingElement";
import { MagneticButton } from "./MagneticButton";
import { ParallaxSection } from "./ParallaxSection";
import { ScrollReveal } from "./ScrollReveal";
import { GlowingText } from "./GlowingText";
import { MouseParallax } from "./MouseParallax";
import { FloatingOrb } from "./FloatingOrb";
import { useRef, useState, useEffect } from "react";
import { useCard3D } from "../hooks/useMouseEffects";

const metrics = [
  { value: "20K+", label: "Users" },
  { value: "1M+", label: "Monthly Impressions/mo" },
  { value: "3K+", label: "App Downloads" },
];

export default function Hero() {
  const buttonRef1 = useRef(null);
  const buttonRef2 = useRef(null);
  const headshotRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const headshot3D = useCard3D(headshotRef as React.RefObject<HTMLElement>);

  // Depth parallax: hero content scrolls up slower than the page
  const { scrollY } = useScroll();
  const textY = useTransform(scrollY, [0, 600], [0, -80]);
  const imageY = useTransform(scrollY, [0, 600], [0, -40]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section ref={sectionRef} className="min-h-screen flex items-center pt-20 pb-12 px-6 relative overflow-hidden" id="hero">
      {/* Animated gradient orbs with enhanced effects */}
      <motion.div
        className="absolute inset-0 -z-10 opacity-40"
        animate={{
          y: [0, 20, 0],
        }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6ee7b7]/8 rounded-full blur-3xl pointer-events-none"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.4, 0.6, 0.4],
          }}
          transition={{ duration: 5, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#6ee7b7]/5 rounded-full blur-3xl pointer-events-none"
          animate={{
            y: [0, -20, 0],
            scale: [1, 0.9, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
      </motion.div>

      {/* Additional floating orbs */}
      <FloatingOrb size={150} color="rgba(110, 231, 183, 0.05)" duration={7} className="top-1/3 right-10" />
      <FloatingOrb size={200} color="rgba(52, 211, 153, 0.03)" duration={9} delay={1} className="bottom-1/3 left-5" />
      <FloatingOrb size={120} color="rgba(110, 231, 183, 0.04)" duration={8} delay={2} className="top-1/2 right-1/4" />

      <div className="max-w-5xl mx-auto w-full relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-16">

          {/* Text — depth parallax: moves faster on scroll */}
          <motion.div
            className="flex-1 order-2 lg:order-1"
            style={{ y: textY }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-[#e8e8e8] tracking-tight leading-[1.1] mb-4">
              <AnimatedText text="I build AI" />
              <br />
              <GlowingText text="products at scale." className="text-[#999]" delay={0.5} />
            </h1>

            <p className="text-lg text-[#888] leading-relaxed max-w-lg mb-6">
              <BlurReveal
                text="AI Engineer and founder building the default coaching infrastructure for competitive gaming. Currently expanding valocoach.ai to mobile and new titles."
                delay={0.8}
              />
            </p>

            {/* Metrics */}
            <MouseParallax strength={25} className="flex flex-wrap gap-4 mb-6">
              {metrics.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + i * 0.1, duration: 0.6 }}
                  whileHover={{ scale: 1.08, y: -5 }}
                  className="px-5 py-3 rounded-lg border border-[#6ee7b7]/20 bg-gradient-to-br from-[#111]/70 to-[#0a0a0a]/50 backdrop-blur-sm hover:border-[#6ee7b7]/40 hover:from-[#111]/90 hover:to-[#0a0a0a]/70 transition-all cursor-pointer group relative overflow-hidden"
                >
                  {/* Animated background */}
                  <motion.div
                    className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{
                      background: [
                        "radial-gradient(circle at 0% 50%, rgba(110, 231, 183, 0.1) 0%, transparent 60%)",
                        "radial-gradient(circle at 100% 50%, rgba(110, 231, 183, 0.1) 0%, transparent 60%)",
                        "radial-gradient(circle at 0% 50%, rgba(110, 231, 183, 0.1) 0%, transparent 60%)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    className="text-2xl font-semibold text-[#e8e8e8] group-hover:text-[#6ee7b7] transition-colors"
                    animate={{ color: ["#e8e8e8", "#6ee7b7", "#e8e8e8"] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.3,
                    }}
                  >
                    {m.value}
                  </motion.div>
                  <div className="text-sm text-[#888] mt-1 group-hover:text-[#6ee7b7] transition-colors">{m.label}</div>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                whileHover={{ scale: 1.08, y: -5 }}
                className="px-5 py-3 rounded-lg border border-[#6ee7b7]/30 bg-gradient-to-br from-[#6ee7b7]/15 to-[#34d399]/5 backdrop-blur-sm hover:border-[#6ee7b7]/50 hover:from-[#6ee7b7]/20 hover:to-[#34d399]/10 transition-all cursor-pointer group relative overflow-hidden"
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{
                    background: [
                      "radial-gradient(circle at 50% 0%, rgba(52, 211, 153, 0.1) 0%, transparent 60%)",
                      "radial-gradient(circle at 50% 100%, rgba(52, 211, 153, 0.1) 0%, transparent 60%)",
                      "radial-gradient(circle at 50% 0%, rgba(52, 211, 153, 0.1) 0%, transparent 60%)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                />
                <div className="text-2xl font-semibold text-[#6ee7b7] group-hover:text-[#34d399] transition-colors">Revenue</div>
                <div className="text-sm text-[#888] mt-1 group-hover:text-[#6ee7b7] transition-colors">Generating</div>
              </motion.div>
            </MouseParallax>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <MagneticButton
                href="https://www.valocoach.ai/statistics?region=ap&name=venator%23fear"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#6ee7b7] text-[#0a0a0a] text-base font-medium hover:bg-[#34d399] transition-all shadow-lg hover:shadow-[#6ee7b7]/30"
                strength={0.4}
              >
                See it live
                <motion.svg
                  width="18"
                  height="18"
                  viewBox="0 0 14 14"
                  fill="none"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path
                    d="M2.5 7H11.5M7.5 3L11.5 7L7.5 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </MagneticButton>
              <MagneticButton
                href="#contact"
                className="inline-flex items-center px-6 py-3 rounded-lg border border-[#1f1f1f] text-[#e8e8e8] text-base font-medium hover:border-[#6ee7b7]/50 hover:bg-[#6ee7b7]/5 transition-all"
                strength={0.3}
              >
                Work With Me
              </MagneticButton>
            </div>
          </motion.div>

          {/* Headshot — depth parallax: moves slower on scroll + 3D tilt */}
          <FloatingElement intensity={15}>
            <motion.div
              className="order-1 lg:order-2 flex-shrink-0"
              style={{ y: imageY }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            >
              <motion.div
                ref={headshotRef}
                className="relative w-56 h-56 lg:w-80 lg:h-80"
                style={{
                  perspective: "1000px",
                  rotateX: headshot3D.x,
                  rotateY: headshot3D.y,
                  transformStyle: "preserve-3d",
                }}
                whileHover={{ scale: 1.04 }}
                transition={{ type: "spring", stiffness: 250, damping: 25 }}
              >
                {/* Tilt glow */}
                <motion.div
                  className="absolute inset-0 rounded-2xl pointer-events-none z-10"
                  style={{
                    background: `radial-gradient(circle at ${50 + headshot3D.y * 3}% ${50 - headshot3D.x * 3}%, rgba(110,231,183,0.12) 0%, transparent 70%)`,
                  }}
                />
                <Image
                  src="/headshot.png"
                  alt="Sagar Jain"
                  fill
                  sizes="(max-width: 1024px) 192px, 256px"
                  className="rounded-2xl object-cover object-top border border-[#1f1f1f]"
                  priority
                  quality={100}
                  unoptimized={true}
                />
              </motion.div>
            </motion.div>
          </FloatingElement>

        </div>
      </div>
    </section>
  );
}
