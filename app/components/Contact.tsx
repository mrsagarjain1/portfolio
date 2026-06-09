"use client";

import { ScrollAnimation } from "./ScrollAnimation";
import { motion } from "framer-motion";
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

export default function Contact() {
  return (
    <ScrollAnimation>
      <motion.section 
        id="contact" 
        className="py-16 px-6 border-t border-[#1f1f1f]"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
      <div className="max-w-5xl mx-auto">
        <div className="max-w-xl">
          <span className="text-xs font-medium text-[#6ee7b7] tracking-widest uppercase">
            Contact
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#e8e8e8] tracking-tight mt-3 mb-4">
            <ClipReveal>Let's build something.</ClipReveal>
          </h2>
          <p className="text-sm text-[#777] leading-relaxed mb-10">
            Open to collaborating on AI products, gaming tech, and esports platforms.
          </p>

          {/* Email CTA */}
          <motion.a
            href="mailto:mrsagarjain1@gmail.com"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            className="group flex items-center justify-between w-full p-5 rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] hover:border-[#6ee7b7]/30 transition-colors mb-4"
          >
            <div>
              <p className="text-xs text-[#555] mb-1 font-medium uppercase tracking-wide">Email</p>
              <p className="text-sm font-medium text-[#e8e8e8] group-hover:text-[#6ee7b7] transition-colors">mrsagarjain1@gmail.com</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-[#6ee7b7]">
              <path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.a>

          {/* Social links */}
          <div className="flex gap-3">
            {socials.map((s, i) => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[#1f1f1f] bg-[#0c0c0c] text-[#888] hover:text-[#e8e8e8] hover:border-[#6ee7b7]/30 transition-colors text-sm"
              >
                <span className="group-hover:text-[#6ee7b7] transition-colors">{s.icon}</span>
                <span className="hidden sm:block">{s.label}</span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-[#1f1f1f] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-[#555]">Sagar Jain · 2026</p>
          <p className="text-xs text-[#555] italic">Build fast. Learn faster. Play to win.</p>
        </div>
      </div>
      </motion.section>
    </ScrollAnimation>
  );
}
