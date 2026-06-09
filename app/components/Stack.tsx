"use client";

import { useRef } from "react";
import { ScrollAnimation } from "./ScrollAnimation";
import { motion, useScroll, useTransform } from "framer-motion";
import { StackItem } from "./StackItem";
import { ScrollReveal } from "./ScrollReveal";
import { FloatingOrb } from "./FloatingOrb";
import { ClipReveal } from "./ClipReveal";

const stackItems = [
  { name: "Python", category: "Language" },
  { name: "FastAPI", category: "Backend" },
  { name: "LangChain", category: "AI" },
  { name: "LangGraph", category: "AI" },
  { name: "MongoDB", category: "Database" },
  { name: "Redis", category: "Cache" },
  { name: "Vector DB", category: "AI" },
  { name: "RAG", category: "AI" },
];

const learning = ["Agentic AI", "Deep Learning", "LangGraph", "LangChain"];

export default function Stack() {
  const stackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stackRef,
    offset: ["start end", "end start"],
  });
  const stackX = useTransform(scrollYProgress, [0, 1], [80, -80]);
  return (
    <ScrollAnimation>
      <motion.section 
        id="stack" 
        className="py-6 px-6 border-t border-[#1f1f1f] relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-150px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
      <div className="max-w-5xl mx-auto">
        {/* Floating ambient elements */}
        <FloatingOrb size={200} color="rgba(110, 231, 183, 0.04)" duration={10} className="absolute top-1/4 -right-20" />
        <FloatingOrb size={150} color="rgba(52, 211, 153, 0.03)" duration={8} delay={1} className="absolute bottom-1/4 -left-20" />

        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* About */}
          <ScrollReveal>
            <div>
            <span className="text-xs font-medium text-[#6ee7b7] tracking-widest uppercase">
              About
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#e8e8e8] tracking-tight mt-3 mb-6">
              <ClipReveal>The person</ClipReveal>
              <br />
              <ClipReveal delay={0.1}>behind the product.</ClipReveal>
            </h2>
            <div className="space-y-4 text-sm text-[#888] leading-relaxed">
              <p>
                I'm an AI Engineer and founder who builds at the intersection of
                artificial intelligence and competitive gaming. My edge: I'm not
                just a developer analyzing data - I was the player who needed the
                product.
              </p>
              <p>
                I went from Iron 2 to Immortal by finding the patterns that
                everyone else missed. Then I built the system that delivers those
                patterns to every player, personalized.
              </p>
              <p>
                I ship faster when it's related to games. That's not a fun fact -
                it's a product strategy.
              </p>
            </div>

            <motion.div
              className="mt-3 p-5 rounded-xl border border-[#6ee7b7]/30 bg-gradient-to-br from-[#6ee7b7]/10 via-[#0a0a0a]/50 to-[#0a0a0a]/30 backdrop-blur-md hover:border-[#6ee7b7]/50 hover:from-[#6ee7b7]/15 transition-all group overflow-hidden"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={{
                  background: [
                    "radial-gradient(circle at 0% 0%, rgba(110, 231, 183, 0.1) 0%, transparent 60%)",
                    "radial-gradient(circle at 100% 100%, rgba(110, 231, 183, 0.1) 0%, transparent 60%)",
                    "radial-gradient(circle at 0% 0%, rgba(110, 231, 183, 0.1) 0%, transparent 60%)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <p className="text-xs text-[#6ee7b7] uppercase tracking-widest mb-3 font-semibold">Currently building with</p>
              <div className="flex flex-wrap gap-2 relative z-10">
                {learning.map((l, i) => (
                  <motion.span
                    key={l}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.15, borderColor: "#34d399" }}
                    className="px-3 py-1 text-xs rounded-md border border-[#6ee7b7]/40 bg-gradient-to-r from-[#6ee7b7]/10 to-[#34d399]/5 text-[#6ee7b7] hover:text-[#34d399] transition-colors cursor-pointer font-medium"
                  >
                    {l}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            <blockquote className="mt-3 pl-4 border-l-2 border-[#1f1f1f]">
              <p className="text-sm text-[#888] italic leading-relaxed">
                "Build fast. Learn faster. Play to win."
              </p>
            </blockquote>
            </div>
          </ScrollReveal>

          {/* Stack */}
          <ScrollReveal>
            <span className="text-xs font-medium text-[#6ee7b7] tracking-widest uppercase">
              Tech Stack
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#e8e8e8] tracking-tight mt-3 mb-4">
              How I build.
            </h2>
            <p className="text-sm text-[#888] leading-relaxed mb-6">
              Focused on AI backends that power real products at scale. Every tool
              is chosen because it ships faster and holds up under load.
            </p>
            <motion.div
              ref={stackRef}
              className="grid grid-cols-2 gap-3"
              style={{ x: stackX }}
            >
              {stackItems.map((s, idx) => (
                <StackItem key={s.name} name={s.name} category={s.category} index={idx} />
              ))}
            </motion.div>
          </ScrollReveal>

        </div>
      </div>
      </motion.section>
    </ScrollAnimation>
  );
}
