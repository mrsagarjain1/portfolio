"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { navLinks as links, site } from "../lib/content";
import { RankMeter } from "./RankMeter";

/** Words in the open menu take turns being solid and outlined, tilted a touch. */
const MENU_STYLES = [
  { color: "text-menu-1", outline: false, align: "justify-start", tilt: "-1.2deg" },
  { color: "text-menu-2", outline: true, align: "justify-end", tilt: "0.8deg" },
  { color: "text-menu-3", outline: false, align: "justify-start", tilt: "-0.6deg" },
  { color: "text-menu-4", outline: true, align: "justify-end", tilt: "1deg" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

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
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-text/15 bg-paper">
      {/* Sections put the gutter outside a 110rem column; this adds it back so the nav lines up with them. */}
      <nav className="mx-auto flex max-w-[calc(110rem+2*var(--page-gutter))] items-center justify-between px-[var(--page-gutter)] py-2.5 md:py-3">
        <div className="flex items-center gap-4 md:gap-6">
          <a
            href="#"
            aria-label={site.name}
            className="display flex min-h-11 items-center whitespace-nowrap text-[1.35rem] leading-none tracking-[-0.07em] text-text md:text-[1.6rem]"
          >
            <span aria-hidden="true">{site.name}</span>
          </a>
          <RankMeter className="rounded-md bg-ink-2 px-2.5 py-1.5" />
        </div>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex lg:gap-12">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="relative flex min-h-11 items-center font-mono text-xs uppercase tracking-[0.12em] text-text transition-colors after:absolute after:bottom-2 after:left-0 after:h-0.5 after:w-0 after:bg-red after:transition-all hover:after:w-full lg:text-sm"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile hamburger: three bars, the middle one short and ending in a red dot. */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="relative flex h-12 w-12 items-center justify-center md:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span
            className="absolute h-[3px] w-[23px] rounded-[3px] bg-[#1b1c19] transition-transform duration-300"
            style={{ transform: menuOpen ? "rotate(45deg)" : "translateY(-7px)" }}
          />
          <span
            className="absolute h-[3px] w-4 rounded-[3px] bg-[#1b1c19] transition-opacity duration-200"
            style={{ opacity: menuOpen ? 0 : 1, transform: "translateX(-3.5px)" }}
          >
            <span className="absolute left-[19px] top-0 h-[3px] w-1 rounded-sm bg-[#c45035]" />
          </span>
          <span
            className="absolute h-[3px] w-[14px] rounded-[3px] bg-[#1b1c19] transition-transform duration-300"
            style={{
              transform: menuOpen
                ? "rotate(-45deg) scaleX(1.64)"
                : "translate(4.5px, 7px)",
            }}
          />
        </button>
      </nav>

      {/* Mobile menu overlay: big display words on ink. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="absolute left-0 right-0 top-full z-40 h-[100dvh] overflow-y-auto bg-ink-2 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <nav className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-[680px] flex-col justify-center gap-4 px-6 pb-24 pt-8">
              {links.map((l, i) => {
                const style = MENU_STYLES[i % MENU_STYLES.length];
                return (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    style={{ transform: `rotate(${style.tilt})` }}
                    className={`display flex min-h-[5.5rem] items-center py-3 text-[clamp(2.75rem,14vw,5.25rem)] leading-[0.95] tracking-[-0.065em] ${style.color} ${style.align} ${
                      style.outline ? "text-outline" : ""
                    }`}
                  >
                    {l.label}
                  </a>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
