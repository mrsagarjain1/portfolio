"use client";

import { ScrollAnimation } from "./ScrollAnimation";
import { motion } from "framer-motion";
import { MagneticButton } from "./MagneticButton";
import { ScrollReveal } from "./ScrollReveal";
import { FloatingOrb } from "./FloatingOrb";
import { ClipReveal } from "./ClipReveal";

const socials = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/mrsagarjain1/",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
        <circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/mrsagarjain1",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/>
      </svg>
    ),
  },
  {
    label: "X",
    href: "https://x.com/mrsagarjain1",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
];

const contactItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

export default function Contact() {
  return (
    <ScrollAnimation>
      <motion.section 
        id="contact" 
        className="py-6 px-6 border-t border-[#1f1f1f] relative"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-150px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
      <div className="max-w-5xl mx-auto">
        {/* Floating ambient elements */}
        <FloatingOrb size={170} color="rgba(110, 231, 183, 0.04)" duration={9} className="absolute top-1/3 right-10" />
        <FloatingOrb size={140} color="rgba(52, 211, 153, 0.03)" duration={7} delay={2} className="absolute bottom-1/3 -left-5" />

        <ScrollReveal>
          <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-medium text-[#6ee7b7] tracking-widest uppercase">
              Contact
            </span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#e8e8e8] tracking-tight mt-3 mb-4">
            <ClipReveal>Let's build something.</ClipReveal>
          </h2>
          <p className="text-sm text-[#888] leading-relaxed mb-10">
            Open to collaborating on AI products, gaming tech, and esports
            platforms. If you're working on something interesting, reach out.
          </p>
          </div>
        </ScrollReveal>

        {/* Email */}
        <div className="max-w-xl">
          <MagneticButton
            href="mailto:mrsagarjain1@gmail.com"
            className="group flex items-center justify-between w-full p-5 rounded-xl border border-[#6ee7b7]/20 bg-gradient-to-r from-[#111]/70 to-[#0a0a0a]/50 backdrop-blur-sm hover:border-[#6ee7b7]/50 hover:from-[#111]/90 hover:to-[#0a0a0a]/70 transition-all mb-4 relative overflow-hidden"
            strength={0.2}
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
            <div>
              <p className="text-xs text-[#6ee7b7] mb-1 font-semibold uppercase tracking-wide">Email</p>
              <p className="text-sm font-medium text-[#e8e8e8] group-hover:text-[#6ee7b7] transition-colors">mrsagarjain1@gmail.com</p>
            </div>
            <motion.svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="text-[#6ee7b7] transition-colors"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <path
                d="M3 8H13M9 4L13 8L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </MagneticButton>

          {/* Social links */}
          <motion.div
            className="flex gap-3"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.3,
                },
              },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
          >
            {socials.map((s, i) => (
              <MagneticButton
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#6ee7b7]/20 bg-gradient-to-br from-[#111]/60 to-[#0a0a0a]/40 backdrop-blur-sm text-[#888] hover:text-[#e8e8e8] hover:border-[#6ee7b7]/50 hover:from-[#111]/80 hover:to-[#0a0a0a]/60 transition-all text-sm group relative overflow-hidden"
                strength={0.25}
              >
                {/* Hover glow */}
                <motion.div
                  className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{
                    background: [
                      "radial-gradient(circle at 0% 0%, rgba(110, 231, 183, 0.1) 0%, transparent 50%)",
                      "radial-gradient(circle at 100% 100%, rgba(110, 231, 183, 0.1) 0%, transparent 50%)",
                      "radial-gradient(circle at 0% 0%, rgba(110, 231, 183, 0.1) 0%, transparent 50%)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.1 }}
                />
                <motion.span className="group-hover:text-[#6ee7b7] transition-colors">
                  {s.icon}
                </motion.span>
                <span className="hidden sm:block group-hover:text-[#6ee7b7] transition-colors">{s.label}</span>
              </MagneticButton>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-[#1f1f1f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-[#666]">Sagar Jain · 2026</p>
          <p className="text-xs text-[#666] italic">
            Build fast. Learn faster. Play to win.
          </p>
        </div>

      </div>
      </motion.section>
    </ScrollAnimation>
  );
}
