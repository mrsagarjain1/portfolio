"use client";

/**
 * PageIntro — the cinematic page-load intro overlay, rebuilt around the intro
 * state machine from design.md ("Page-Load Intro Lifecycle").
 *
 *   checking ─┬─▶ skipped     (session flag already set)      ─▶ revealed
 *             ├─▶ reducedFast (prefers-reduced-motion)         ─▶ revealed (<=500ms, no animation)
 *             └─▶ playing     (first visit + motion on)        ─▶ revealed (normal <=3000ms / failsafe 3500ms)
 *
 * While the overlay is visible it covers the full viewport above all content
 * (z-index 9998), locks body scroll, and traps keyboard focus so it cannot
 * enter the underlying primary content (Req 6.1, 6.4). On reveal the overlay
 * fully unmounts — leaving no element that intercepts pointer/focus — and body
 * scroll is restored (Req 6.3). An independent failsafe timeout guarantees the
 * content is never permanently hidden even if the animation stalls (Req 6.6).
 * The session guard shows the intro at most once per browser session (Req 6.7).
 *
 * _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_
 */

import { motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  INTRO_FAILSAFE_MS,
  INTRO_MAX_MS,
  INTRO_REDUCED_MS,
} from "../lib/immersive/constants";
import { shouldShowIntro } from "../lib/immersive/intro";

/** Duration of the dismiss fade before the overlay is fully unmounted (ms). */
const DISMISS_MS = 600;

/** Phases of the intro lifecycle. */
type IntroPhase = "checking" | "playing" | "reducedFast" | "revealed";

/** Read the OS reduced-motion preference directly (SSR-safe). */
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// --- Decorative playing-phase visuals -------------------------------------

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

const particles = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  x: 20 + ((i * 2.1) % 60),
  y: 30 + ((i * 3.7) % 40),
  delay: (i * 0.12) % 1.8,
}));

const nameLetters = "Sagar Jain".split("");

/** Full animated intro content shown during the `playing` phase. */
function PlayingContent() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 2));
    }, 40);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Radial glow behind center */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(110,231,183,0.08) 0%, rgba(110,231,183,0.02) 40%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
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
        <div className="flex overflow-hidden">
          {nameLetters.map((letter, i) => (
            <motion.span
              key={i}
              className={`text-4xl sm:text-5xl font-bold tracking-tight ${
                letter === " " ? "w-3" : ""
              }`}
              style={{
                background:
                  "linear-gradient(135deg, #e8e8e8 0%, #6ee7b7 50%, #e8e8e8 100%)",
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
                y: {
                  duration: 0.5,
                  delay: 0.15 + i * 0.05,
                  ease: [0.25, 0.46, 0.45, 0.94],
                },
                opacity: { duration: 0.4, delay: 0.15 + i * 0.05 },
                rotateX: { duration: 0.6, delay: 0.15 + i * 0.05 },
                backgroundPosition: { duration: 4, repeat: Infinity, ease: "linear" },
              }}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </div>

        <motion.div
          className="text-sm sm:text-base font-mono text-[#6ee7b7] h-6 uppercase"
          initial={{ opacity: 0, letterSpacing: "0em", filter: "blur(8px)" }}
          animate={{ opacity: 1, letterSpacing: "0.3em", filter: "blur(0px)" }}
          transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
        >
          Applied AI Engineer
        </motion.div>

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
    </>
  );
}

/**
 * Static intro content shown during the reduced-motion fast path (and the
 * transient checking phase). No animated sequence — the name and role are
 * rendered in their final visible state (Req 6.5).
 */
function StaticContent() {
  return (
    <div className="flex flex-col items-center gap-4 relative z-10">
      <div className="flex">
        {nameLetters.map((letter, i) => (
          <span
            key={i}
            className={`text-4xl sm:text-5xl font-bold tracking-tight ${
              letter === " " ? "w-3" : ""
            }`}
            style={{
              background:
                "linear-gradient(135deg, #e8e8e8 0%, #6ee7b7 50%, #e8e8e8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {letter === " " ? "\u00A0" : letter}
          </span>
        ))}
      </div>
      <div className="text-sm sm:text-base font-mono text-[#6ee7b7] uppercase tracking-[0.3em]">
        Applied AI Engineer
      </div>
    </div>
  );
}

export function PageIntro() {
  const [phase, setPhase] = useState<IntroPhase>("checking");
  const [dismissing, setDismissing] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const revealedRef = useRef(false);
  const bodyOverflowRef = useRef<string>("");
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Reveal the primary content: idempotent. Restores body scroll immediately so
   * content becomes interactive, starts the dismiss fade, then fully unmounts
   * the overlay so nothing intercepts focus/pointer (Req 6.3).
   */
  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    if (typeof document !== "undefined") {
      document.body.style.overflow = bodyOverflowRef.current;
    }
    setDismissing(true);
    dismissTimerRef.current = setTimeout(() => setPhase("revealed"), DISMISS_MS);
  }, []);

  // -------------------------------------------------------------------------
  // Lifecycle decision: session guard -> reduced fast path / playing.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const store = window.sessionStorage ?? null;
    bodyOverflowRef.current = document.body.style.overflow;

    let show = true;
    try {
      show = shouldShowIntro(store);
    } catch {
      show = true;
    }

    // Already shown this session: reveal immediately, no overlay (Req 6.7).
    if (!show) {
      revealedRef.current = true;
      setPhase("revealed");
      return;
    }

    // Lock body scroll while the overlay is visible.
    document.body.style.overflow = "hidden";

    const timers: ReturnType<typeof setTimeout>[] = [];

    if (prefersReducedMotion()) {
      // Reduced-motion fast path: reveal within 500 ms, no animation (Req 6.5).
      setPhase("reducedFast");
      timers.push(setTimeout(reveal, INTRO_REDUCED_MS));
    } else {
      setPhase("playing");
      // Normal completion reveals within 3000 ms (Req 6.2)...
      timers.push(setTimeout(reveal, INTRO_MAX_MS));
      // ...and an independent failsafe always reveals by 3500 ms (Req 6.6).
      timers.push(setTimeout(reveal, INTRO_FAILSAFE_MS));
    }

    return () => {
      timers.forEach(clearTimeout);
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      // Restore scroll if we unmount before reveal completes.
      document.body.style.overflow = bodyOverflowRef.current;
    };
  }, [reveal]);

  // -------------------------------------------------------------------------
  // Focus containment: while visible, keep focus inside the overlay so it
  // cannot enter the underlying primary content (Req 6.4). Released on reveal.
  // -------------------------------------------------------------------------
  useEffect(() => {
    const visible =
      (phase === "checking" || phase === "playing" || phase === "reducedFast") &&
      !dismissing;
    if (!visible) return;

    const overlay = overlayRef.current;
    if (!overlay || typeof document === "undefined") return;

    overlay.focus();

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Node | null;
      if (target && !overlay.contains(target)) {
        overlay.focus();
      }
    };

    document.addEventListener("focusin", onFocusIn, true);
    return () => document.removeEventListener("focusin", onFocusIn, true);
  }, [phase, dismissing]);

  if (phase === "revealed") return null;

  return (
    <div
      ref={overlayRef}
      tabIndex={-1}
      aria-hidden="true"
      data-testid="page-intro-overlay"
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-[#050505] overflow-hidden outline-none"
      style={{
        opacity: dismissing ? 0 : 1,
        filter: dismissing ? "blur(10px)" : "none",
        transform: dismissing ? "scale(1.05)" : "none",
        transition: dismissing
          ? "opacity 0.6s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.6s, transform 0.6s"
          : undefined,
        pointerEvents: dismissing ? "none" : "auto",
      }}
    >
      {phase === "playing" ? <PlayingContent /> : <StaticContent />}
    </div>
  );
}
