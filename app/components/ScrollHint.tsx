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
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Pulsing glow behind pill */}
          <motion.div
            className="absolute inset-0 rounded-full opacity-50"
            animate={{
              boxShadow: [
                "0 0 20px 4px rgba(110,231,183,0.08), 0 0 40px 8px rgba(110,231,183,0.04)",
                "0 0 30px 8px rgba(110,231,183,0.15), 0 0 60px 16px rgba(110,231,183,0.06)",
                "0 0 20px 4px rgba(110,231,183,0.08), 0 0 40px 8px rgba(110,231,183,0.04)",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative flex flex-col items-center gap-3 bg-[#0a0a0a]/80 backdrop-blur-md px-6 py-3.5 rounded-full border border-[#6ee7b7]/25">
            {/* Mouse icon + text row */}
            <div className="flex items-center gap-2.5">
              {/* Mini mouse icon */}
              <motion.svg
                width="18"
                height="22"
                viewBox="0 0 14 20"
                fill="none"
                className="text-[#6ee7b7]"
              >
                <rect
                  x="1"
                  y="1"
                  width="12"
                  height="18"
                  rx="6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <motion.line
                  x1="7"
                  y1="4"
                  x2="7"
                  y2="7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  animate={{ y: [0, 3, 0], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                />
              </motion.svg>

              <p className="text-sm text-[#6ee7b7] uppercase tracking-[0.25em] font-medium">
                Scroll to explore
              </p>
            </div>

            {/* Animated chevron */}
            <motion.svg
              width="28"
              height="28"
              viewBox="0 0 20 20"
              fill="none"
              animate={{ y: [0, 14, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-[#6ee7b7]"
            >
              <motion.path
                d="M10 2V12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <path
                d="M6.5 8.5L10 12L13.5 8.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
