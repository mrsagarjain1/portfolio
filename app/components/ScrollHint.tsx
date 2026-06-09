"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ScrollHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Appear after the page intro finishes (~2.4s)
    const appearTimer = setTimeout(() => {
      setShow(true);
    }, 2400);

    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShow(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      clearTimeout(appearTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] pointer-events-none flex flex-col items-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Subtle text */}
          <motion.p 
            className="text-lg font-bold text-[#6ee7b7]/80 uppercase tracking-widest drop-shadow-md"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            Scroll to explore
          </motion.p>

          {/* Minimalist animated line */}
          <div className="relative w-[1px] h-16 bg-gradient-to-b from-[#6ee7b7]/20 to-transparent overflow-hidden rounded-full">
            <motion.div
              className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-transparent via-[#6ee7b7] to-transparent"
              animate={{ y: ["-100%", "200%"] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "linear",
                repeatDelay: 0.5
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
