"use client";

import { ScrollAnimation } from "./ScrollAnimation";
import { motion } from "framer-motion";
import { StackItem } from "./StackItem";
import { ScrollReveal } from "./ScrollReveal";
import { ClipReveal } from "./ClipReveal";
import { ScrambleText } from "./ScrambleText";
import { GitHubHeatmap } from "./GitHubHeatmap";

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

        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* About */}
          <ScrollReveal>
            <div>
            <span className="text-xs font-medium text-[#6ee7b7] tracking-widest uppercase">
              <ScrambleText text="About" />
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#e8e8e8] tracking-tight mt-3 mb-6">
              <ClipReveal>The person</ClipReveal>
              <br />
              <ClipReveal delay={0.1}>behind the product.</ClipReveal>
            </h2>
            <div className="space-y-4 text-sm text-white leading-relaxed">
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
              <p className="text-sm text-white italic leading-relaxed">
                "Build fast. Learn faster. Play to win."
              </p>
            </blockquote>

            <motion.div 
              className="mt-8 p-5 rounded-xl border border-[#222] bg-gradient-to-br from-[#111]/80 to-[#050505]/80 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]"
              whileHover={{ borderColor: "rgba(110,231,183,0.3)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#6ee7b7]">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-xs font-medium text-white tracking-wide">GitHub Contributions</span>
              </div>
              <GitHubHeatmap />
            </motion.div>
            </div>
          </ScrollReveal>

          {/* Stack */}
          <ScrollReveal>
            <span className="text-xs font-medium text-[#6ee7b7] tracking-widest uppercase">
              <ScrambleText text="Tech Stack" />
            </span>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#e8e8e8] tracking-tight mt-3 mb-4">
              How I build.
            </h2>
            <p className="text-sm text-white leading-relaxed mb-6">
              Focused on AI backends that power real products at scale. Every tool
              is chosen because it ships faster and holds up under load.
            </p>
            {/* Connected ecosystem grid */}
            <div className="relative grid grid-cols-2 gap-3">
              {/* Subtle connecting lines between categories */}
              <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
                  <motion.line x1="50" y1="0" x2="50" y2="50" stroke="#6ee7b7" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.15"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.3 }} />
                  <motion.line x1="150" y1="50" x2="150" y2="100" stroke="#34d399" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.15"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }} />
                  <motion.line x1="50" y1="100" x2="50" y2="150" stroke="#6ee7b7" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.15"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.7 }} />
                  <motion.line x1="150" y1="150" x2="150" y2="200" stroke="#34d399" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.15"
                    initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.9 }} />
                </svg>
              </div>
              {stackItems.map((s, idx) => (
                <StackItem key={s.name} name={s.name} category={s.category} index={idx} />
              ))}
            </div>
          </ScrollReveal>

        </div>
      </div>
      </motion.section>
    </ScrollAnimation>
  );
}
