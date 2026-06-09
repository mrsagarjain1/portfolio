"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function GlitchTransition() {
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    let ticking = false;
    let lastY = window.scrollY;

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastY);
      lastY = currentY;

      // Trigger on large scroll jumps (section snaps)
      if (delta > 200 && !ticking) {
        ticking = true;
        setGlitch(true);
        setTimeout(() => {
          setGlitch(false);
          ticking = false;
        }, 150);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {glitch && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-[9990]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.05 }}
        >
          {/* Chromatic aberration layers */}
          <motion.div
            className="absolute inset-0 bg-[#6ee7b7]/5 mix-blend-screen"
            animate={{ x: [-4, 4, -2, 0], opacity: [0, 1, 0.5, 0] }}
            transition={{ duration: 0.12, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 bg-[#f472b6]/4 mix-blend-screen"
            animate={{ x: [4, -4, 2, 0], opacity: [0, 0.8, 0.3, 0] }}
            transition={{ duration: 0.12, ease: "linear", delay: 0.02 }}
          />
          {/* Scanline flash */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
            }}
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.1 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
