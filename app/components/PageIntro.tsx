"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";

// Particle component for the background
function Particle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-[#6ee7b7]"
      style={{ left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: [0, 0.8, 0],
        scale: [0, 1.5, 0],
        y: [0, -30 - Math.random() * 40],
      }}
      transition={{
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: Math.random() * 2,
        ease: "easeOut",
      }}
    />
  );
}

// Generate deterministic particle positions
const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: 20 + (i * 2.1) % 60,
  y: 30 + (i * 3.7) % 40,
  delay: (i * 0.12) % 1.8,
}));

const nameLetters = "Sagar Jain".split("");

export function PageIntro() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    // Progress bar
    const progressInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return p + 2;
      });
    }, 40);

    // Dismiss
    const timer = setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 2800);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#050505] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.05,
            filter: "blur(10px)",
            transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
          }}
        >
          {/* Radial glow behind center */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(110,231,183,0.08) 0%, rgba(110,231,183,0.02) 40%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Orbiting ring 1 */}
          <motion.div
            className="absolute w-64 h-64 rounded-full border border-[#6ee7b7]/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#6ee7b7] shadow-[0_0_12px_rgba(110,231,183,0.8)]"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Orbiting ring 2 */}
          <motion.div
            className="absolute w-96 h-96 rounded-full border border-[#6ee7b7]/5"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#34d399] shadow-[0_0_10px_rgba(52,211,153,0.8)]"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>

          {/* Orbiting ring 3 - smallest */}
          <motion.div
            className="absolute w-40 h-40 rounded-full border border-[#6ee7b7]/15"
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              className="absolute top-1/2 -right-1 -translate-y-1/2 w-1 h-1 rounded-full bg-[#6ee7b7] shadow-[0_0_8px_rgba(110,231,183,0.6)]"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>

          {/* Floating particles */}
          {particles.map((p) => (
            <Particle key={p.id} delay={p.delay} x={p.x} y={p.y} />
          ))}

          {/* Top scan line */}
          <motion.div
            className="absolute top-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-[#6ee7b7] to-transparent"
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          />

          {/* Bottom scan line */}
          <motion.div
            className="absolute bottom-0 right-0 h-[1px] bg-gradient-to-l from-transparent via-[#6ee7b7] to-transparent"
            initial={{ width: "0%", opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          />

          {/* Center content */}
          <div className="flex flex-col items-center gap-4 relative z-10">
            {/* Name - letter-by-letter reveal */}
            <div className="flex overflow-hidden">
              {nameLetters.map((letter, i) => (
                <motion.span
                  key={i}
                  className={`text-4xl sm:text-5xl font-bold tracking-tight ${
                    letter === " " ? "w-3" : ""
                  }`}
                  style={{
                    background: "linear-gradient(135deg, #e8e8e8 0%, #6ee7b7 50%, #e8e8e8 100%)",
                    backgroundSize: "200% 200%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                  initial={{ y: 60, opacity: 0, rotateX: -90 }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    rotateX: 0,
                    backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                  }}
                  transition={{
                    y: { duration: 0.5, delay: 0.15 + i * 0.05, ease: [0.25, 0.46, 0.45, 0.94] },
                    opacity: { duration: 0.4, delay: 0.15 + i * 0.05 },
                    rotateX: { duration: 0.6, delay: 0.15 + i * 0.05 },
                    backgroundPosition: { duration: 4, repeat: Infinity, ease: "linear" },
                  }}
                >
                  {letter === " " ? "\u00A0" : letter}
                </motion.span>
              ))}
            </div>

            {/* Subtitle - elegant expansion reveal */}
            <motion.div
              className="text-sm sm:text-base font-mono text-[#6ee7b7] h-6 uppercase"
              initial={{ opacity: 0, letterSpacing: "0em", filter: "blur(8px)" }}
              animate={{ opacity: 1, letterSpacing: "0.3em", filter: "blur(0px)" }}
              transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
            >
              Applied AI Engineer
            </motion.div>

            {/* Decorative divider */}
            <motion.div
              className="flex items-center gap-3 mt-1"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#6ee7b7]/50" />
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[#6ee7b7]"
                animate={{
                  boxShadow: [
                    "0 0 4px rgba(110,231,183,0.5)",
                    "0 0 16px rgba(110,231,183,0.8)",
                    "0 0 4px rgba(110,231,183,0.5)",
                  ],
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#6ee7b7]/50" />
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="mt-3 w-48 h-[2px] bg-[#1a1a1a] relative overflow-hidden rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.3 }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #6ee7b7, #34d399, #6ee7b7)",
                  backgroundSize: "200% 100%",
                  boxShadow: "0 0 10px rgba(110,231,183,0.5)",
                }}
                animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>

            {/* Progress text */}
            <motion.span
              className="text-[10px] font-mono text-[#6ee7b7]/50 tracking-widest mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.3 }}
            >
              INITIALIZING
            </motion.span>
          </div>

          {/* Corner accents */}
          <motion.div
            className="absolute top-6 left-6 w-8 h-8 border-t border-l border-[#6ee7b7]/30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          />
          <motion.div
            className="absolute top-6 right-6 w-8 h-8 border-t border-r border-[#6ee7b7]/30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          />
          <motion.div
            className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-[#6ee7b7]/30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          />
          <motion.div
            className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-[#6ee7b7]/30"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
