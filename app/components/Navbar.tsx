"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ScrambleText } from "./ScrambleText";

const links = [
  { label: "Work", href: "#work" },
  { label: "Story", href: "#story" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0a0a0a]/90 backdrop-blur-md border-b border-[#1f1f1f]" : ""
      }`}
    >
      <nav className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <motion.a
          href="#"
          whileHover={{ scale: 1.08 }}
          className="text-2xl font-semibold text-[#e8e8e8] tracking-tight hover:text-[#6ee7b7] transition-colors"
        >
          Sagar Jain
        </motion.a>
        <ul className="flex items-center gap-12">
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
                className="text-lg text-[#888] hover:text-[#6ee7b7] transition-colors relative group font-medium"
              >
                <ScrambleText text={l.label} />
                <motion.span
                  className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-[#6ee7b7] to-transparent group-hover:w-full transition-all"
                  layoutId={`underline-${l.label}`}
                />
              </motion.a>
            </motion.li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
