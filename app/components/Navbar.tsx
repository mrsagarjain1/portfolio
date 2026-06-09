"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { label: "Work", href: "#work" },
  { label: "Story", href: "#story" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handler = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  // Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-gradient-to-br from-[#111]/80 to-[#050505]/80 backdrop-blur-md border-b border-[#222] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] ${
        scrolled || menuOpen ? "from-[#111]/95 to-[#050505]/95" : ""
      }`}
    >
      <nav className="max-w-5xl mx-auto px-6 py-4 md:py-8 flex items-center justify-between">
        <motion.a
          href="#"
          whileHover={{ scale: 1.08 }}
          className="text-lg md:text-2xl font-semibold text-[#e8e8e8] tracking-tight hover:text-[#6ee7b7] transition-colors"
        >
          Sagar Jain
        </motion.a>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-12">
          {links.map((l, i) => (
            <motion.li
              key={l.label}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <motion.a
                href={l.href}
                whileHover={{ y: -2 }}
                className="text-lg text-white hover:text-[#6ee7b7] transition-colors relative group font-medium"
              >
                <span className="relative z-10">{l.label}</span>
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6ee7b7] to-transparent group-hover:w-full transition-all"
                  layoutId={`underline-${l.label}`}
                />
              </motion.a>
            </motion.li>
          ))}
        </ul>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden relative w-8 h-8 flex items-center justify-center"
          aria-label="Toggle menu"
        >
          <motion.span
            className="absolute w-5 h-[1.5px] bg-[#e8e8e8] rounded-full"
            animate={{
              rotate: menuOpen ? 45 : 0,
              y: menuOpen ? 0 : -4,
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.span
            className="absolute w-5 h-[1.5px] bg-[#e8e8e8] rounded-full"
            animate={{
              opacity: menuOpen ? 0 : 1,
              scaleX: menuOpen ? 0 : 1,
            }}
            transition={{ duration: 0.2 }}
          />
          <motion.span
            className="absolute w-5 h-[1.5px] bg-[#e8e8e8] rounded-full"
            animate={{
              rotate: menuOpen ? -45 : 0,
              y: menuOpen ? 0 : 4,
            }}
            transition={{ duration: 0.3 }}
          />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 h-[100dvh] bg-gradient-to-b from-[#0a0a0a]/98 to-[#050505]/98 backdrop-blur-md z-40 border-t border-[#222]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col items-center justify-center h-full gap-8">
              {links.map((l, i) => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: "easeOut" }}
                  className="text-2xl font-semibold text-white hover:text-[#6ee7b7] transition-colors tracking-tight"
                >
                  <span className="relative z-10">{l.label}</span>
                </motion.a>
              ))}

              {/* Decorative divider */}
              <motion.div
                className="flex items-center gap-3 mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#6ee7b7]/40" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#6ee7b7] shadow-[0_0_8px_rgba(110,231,183,0.6)]" />
                <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#6ee7b7]/40" />
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
