"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [ring, setRing] = useState({ x: -100, y: -100 });
  const [clicked, setClicked] = useState(false);
  const [hovering, setHovering] = useState(false);
  const ringRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      ringRef.current = { x: e.clientX, y: e.clientY };
    };

    const onDown = () => setClicked(true);
    const onUp = () => setClicked(false);

    const onHoverIn = () => setHovering(true);
    const onHoverOut = () => setHovering(false);

    // Lerp ring toward cursor
    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;
    let rx = -100, ry = -100;
    const tick = () => {
      rx = lerp(rx, ringRef.current.x, 0.12);
      ry = lerp(ry, ringRef.current.y, 0.12);
      setRing({ x: rx, y: ry });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const interactables = "a, button, [role=button], input, [data-hover]";
    const els = document.querySelectorAll<HTMLElement>(interactables);
    els.forEach((el) => {
      el.addEventListener("mouseenter", onHoverIn);
      el.addEventListener("mouseleave", onHoverOut);
    });

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    // Re-query on DOM changes
    const obs = new MutationObserver(() => {
      document.querySelectorAll<HTMLElement>(interactables).forEach((el) => {
        el.addEventListener("mouseenter", onHoverIn);
        el.addEventListener("mouseleave", onHoverOut);
      });
    });
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      cancelAnimationFrame(rafRef.current);
      obs.disconnect();
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        className="fixed pointer-events-none z-[99999]"
        style={{
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <motion.div
          className="rounded-full bg-[#6ee7b7]"
          animate={{
            width: clicked ? 6 : hovering ? 10 : 8,
            height: clicked ? 6 : hovering ? 10 : 8,
            opacity: hovering ? 1 : 0.9,
          }}
          transition={{ duration: 0.15 }}
        />
      </div>

      {/* Ring */}
      <div
        className="fixed pointer-events-none z-[99998]"
        style={{
          left: ring.x,
          top: ring.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <motion.div
          className="rounded-full border border-[#6ee7b7]"
          animate={{
            width: clicked ? 28 : hovering ? 44 : 36,
            height: clicked ? 28 : hovering ? 44 : 36,
            opacity: hovering ? 0.8 : 0.35,
            borderColor: hovering ? "#34d399" : "#6ee7b7",
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </>
  );
}
