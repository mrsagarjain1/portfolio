"use client";

import { ScrollAnimation } from "./ScrollAnimation";
import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";
import { ClipReveal } from "./ClipReveal";
import { AnimatedUnderline } from "./AnimatedUnderline";
import { EncryptReveal } from "./EncryptReveal";

const milestones = [
  {
    number: "01",
    title: "The Problem, Live",
    body: "Started as an Iron 2 player with no structured path to improve. Existing content was generic and rarely actionable.",
  },
  {
    number: "02",
    title: "Proving the Pattern",
    body: "Reached Immortal within a year. Improvement follows clear, repeatable patterns - but no product delivered this in a personalized way.",
  },
  {
    number: "03",
    title: "30-Day MVP Launch",
    body: "While learning LangChain, saw the opportunity to build an AI coaching layer for competitive gaming. Launched the MVP fast. Validated strong early demand.",
  },
  {
    number: "04",
    title: "Expert Refinement",
    body: "Worked with 100+ professional coaches to refine the system and introduced a reward-driven engagement loop to improve retention.",
  },
  {
    number: "05",
    title: "The Platform Vision",
    body: "Valocoach.ai is building the default AI coaching infrastructure for competitive gamers.",
  },
];

import { Variants } from "framer-motion";

const milestoneVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function Story() {
  return (
    <ScrollAnimation>
      <motion.section 
        id="story" 
        className="py-6 px-6 border-t border-[#1f1f1f]"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-150px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
      <div className="max-w-5xl mx-auto">

        <ScrollReveal>
          <div className="mb-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs font-medium text-[#6ee7b7] tracking-widest uppercase">
                <EncryptReveal text="Origin" />
              </span>
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-[#e8e8e8] tracking-tight mt-3">
              <ClipReveal><EncryptReveal text="How it started." /></ClipReveal>
            </h2>
            <AnimatedUnderline className="mt-2 max-w-xs" />
            <p className="text-white mt-3 max-w-lg text-sm leading-relaxed">
              The best products are built by people who lived the problem.
            </p>
          </div>
        </ScrollReveal>

        <div className="relative">
          {/* Vertical line */}
          <motion.div
            className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[#6ee7b7] via-[#6ee7b7]/50 to-transparent hidden sm:block"
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.2 }}
          />

          <div className="space-y-0">
            {milestones.map((m, i) => (
              <motion.div
                key={m.number}
                custom={i}
                variants={milestoneVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                className="relative sm:pl-20 group"
              >
                {/* Dot */}
                <motion.div
                  className="absolute left-4 top-6 w-4 h-4 rounded-full border-2 border-[#6ee7b7] bg-gradient-to-br from-[#111]/80 to-[#050505]/80 backdrop-blur-md hidden sm:flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  whileHover={{ scale: 1.3 }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-[#6ee7b7]"
                    animate={{ scale: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                  />
                </motion.div>

                <motion.div
                  className={`py-8 px-4 sm:px-6 rounded-lg ${i < milestones.length - 1 ? "border-b border-[#222]/50" : ""} group hover:bg-gradient-to-br hover:from-[#111]/50 hover:to-[#050505]/50 hover:backdrop-blur-md hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] hover:border-[#6ee7b7]/20 transition-all`}
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-start gap-6">
                    <span className="text-xs font-mono text-[#6ee7b7] pt-1 hidden sm:block min-w-[2ch] font-semibold group-hover:text-[#34d399] transition-colors">
                      {m.number}
                    </span>
                    <div className="flex-1">
                      <motion.h3
                        className="text-base font-medium text-[#e8e8e8] mb-2 group-hover:text-[#6ee7b7] transition-colors"
                        animate={{ color: ["#e8e8e8", "#e8e8e8", "#e8e8e8"] }}
                      >
                        {m.title}
                      </motion.h3>
                      <motion.p
                        className="text-sm text-white leading-relaxed max-w-xl group-hover:text-[#6ee7b7] transition-colors"
                        animate={{ opacity: [1, 1, 1] }}
                      >
                        {m.body}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      </motion.section>
    </ScrollAnimation>
  );
}
