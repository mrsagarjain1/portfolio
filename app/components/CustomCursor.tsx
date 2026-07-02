"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import { useImmersiveContext } from "./immersive/ImmersiveProvider";
import { useFrameClock } from "../hooks/useFrameClock";
import { usePointerBroadcast } from "../hooks/usePointerBroadcast";
import { usePointerCapability } from "../hooks/usePointerCapability";
import { useReducedMotion } from "../hooks/useReducedMotion";

/**
 * CustomCursor — the highest-priority continuous pointer follower.
 *
 * An immersive, velocity-reactive cursor built from four decorative layers that
 * all track the shared pointer broadcaster and update once per shared frame:
 *
 *  - a soft **aura** glow that trails behind with the most lag (mix-blend
 *    `screen`, brightening on hover);
 *  - a **comet ring** that lags the pointer, orients toward the movement
 *    direction and stretches with speed, and swells into a brighter ring over
 *    interactive elements;
 *  - a crisp glowing **dot** pinned to the exact pointer position; and
 *  - an expanding **pulse** burst emitted on each click.
 *
 * It subscribes to the shared pointer broadcaster (not its own `mousemove`) and
 * the shared frame clock (not its own rAF), and registers with the pointer
 * effect registry so it participates in the concurrent-follower cap. The custom
 * cursor is only active — and the native cursor is only hidden — on a fine
 * pointer, with motion enabled, while the registry keeps it active. In every
 * other case it renders `null` and the native system cursor is restored, so a
 * visible pointer indication is always preserved (Req 4.8).
 *
 * _Requirements: 4.1, 4.2, 4.7, 4.8, 7.2, 7.3_
 */

const EFFECT_ID = "CustomCursor";
const EFFECT_PRIORITY = 50; // highest-priority pointer follower

interface TrailFrame {
  /** Trailing ring position. */
  rx: number;
  ry: number;
  /** Aura position (trails furthest behind). */
  ax: number;
  ay: number;
  /** Movement direction of the ring, in degrees. */
  angle: number;
  /** Ring speed in px/frame, used to stretch the comet. */
  speed: number;
}

interface ClickBurst {
  x: number;
  y: number;
  key: number;
}

const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

export function CustomCursor() {
  const { registerPointerEffect, isPointerEffectActive } =
    useImmersiveContext();
  const pointerType = usePointerCapability();
  const reducedMotion = useReducedMotion();

  // The dot is pinned to the exact pointer (updated by the broadcaster, one
  // notification per frame). The trailing ring/aura lag behind and are advanced
  // on the shared frame clock.
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trail, setTrail] = useState<TrailFrame>({
    rx: -100,
    ry: -100,
    ax: -100,
    ay: -100,
    angle: 0,
    speed: 0,
  });
  const [clicked, setClicked] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [burst, setBurst] = useState<ClickBurst | null>(null);

  const pointerRef = useRef({ x: -100, y: -100 });
  const ringRef = useRef({ x: -100, y: -100 });
  const auraRef = useRef({ x: -100, y: -100 });
  const angleRef = useRef(0);

  // Register as a continuous pointer follower so the registry can cap it.
  useEffect(
    () => registerPointerEffect(EFFECT_ID, EFFECT_PRIORITY, "cursor"),
    [registerPointerEffect],
  );

  // The custom cursor renders (and hides the native cursor) only on a fine
  // pointer, with motion enabled, and while the registry keeps it active.
  const active =
    pointerType === "fine" &&
    !reducedMotion &&
    isPointerEffectActive(EFFECT_ID);

  // Track the raw pointer via the shared broadcaster (throttled to one/frame)
  // and pin the dot to it directly for zero-lag precision.
  usePointerBroadcast(
    ({ x, y }) => {
      pointerRef.current = { x, y };
      if (active) {
        setPos({ x, y });
      }
    },
    { priority: EFFECT_PRIORITY },
  );

  // Advance the trailing layers + velocity on the shared frame clock. Gated on
  // `active`, so nothing animates under reduced motion or on a coarse pointer.
  useFrameClock(() => {
    if (!active) return;

    const p = pointerRef.current;
    const prev = ringRef.current;
    const rx = lerp(prev.x, p.x, 0.2);
    const ry = lerp(prev.y, p.y, 0.2);
    const vx = rx - prev.x;
    const vy = ry - prev.y;
    ringRef.current = { x: rx, y: ry };

    const ax = lerp(auraRef.current.x, p.x, 0.1);
    const ay = lerp(auraRef.current.y, p.y, 0.1);
    auraRef.current = { x: ax, y: ay };

    const speed = Math.hypot(vx, vy);
    // Only re-orient while there's meaningful motion, so a resting cursor keeps
    // its last angle instead of jittering.
    if (speed > 0.4) {
      angleRef.current = (Math.atan2(vy, vx) * 180) / Math.PI;
    }

    setTrail({ rx, ry, ax, ay, angle: angleRef.current, speed });
  });

  // Hide the native cursor and track click/hover state — only while active, so
  // whenever the custom cursor is disabled the native cursor is restored.
  useEffect(() => {
    if (!active) return;

    document.body.style.cursor = "none";

    const onDown = () => {
      setClicked(true);
      setBurst({
        x: pointerRef.current.x,
        y: pointerRef.current.y,
        key: Date.now(),
      });
    };
    const onUp = () => setClicked(false);
    const onHoverIn = () => setHovering(true);
    const onHoverOut = () => setHovering(false);

    const interactables = "a, button, [role=button], input, [data-hover]";
    const attach = () => {
      document
        .querySelectorAll<HTMLElement>(interactables)
        .forEach((el) => {
          el.addEventListener("mouseenter", onHoverIn);
          el.addEventListener("mouseleave", onHoverOut);
        });
    };
    attach();

    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    // Re-query on DOM changes.
    const obs = new MutationObserver(attach);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.body.style.cursor = "";
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      obs.disconnect();
      setClicked(false);
      setHovering(false);
    };
  }, [active]);

  // Coarse pointer, reduced motion, or capped out: render nothing and leave the
  // native cursor in place (a visible pointer indication is always preserved).
  if (!active) return null;

  // Comet stretch: elongate the ring along the movement direction with speed,
  // but relax to a clean circle while hovering an interactive element.
  const stretch = hovering ? 1 : 1 + Math.min(trail.speed * 0.05, 0.9);
  const ringSize = clicked ? 26 : hovering ? 48 : 34;

  return (
    <>
      {/* Aura — soft glow trailing furthest behind */}
      <div
        aria-hidden="true"
        className="hidden md:block fixed pointer-events-none z-[99997]"
        style={{
          left: trail.ax,
          top: trail.ay,
          transform: "translate(-50%, -50%)",
          mixBlendMode: "screen",
        }}
      >
        <motion.div
          className="rounded-full"
          animate={{
            width: hovering ? 260 : 200,
            height: hovering ? 260 : 200,
            opacity: clicked ? 0.28 : hovering ? 0.22 : 0.12,
          }}
          transition={{ duration: 0.3 }}
          style={{
            background:
              "radial-gradient(circle, rgba(110,231,183,0.9) 0%, rgba(110,231,183,0.15) 40%, transparent 70%)",
            filter: "blur(8px)",
          }}
        />
      </div>

      {/* Click pulse — expands and fades on each press */}
      {burst && (
        <div
          key={burst.key}
          aria-hidden="true"
          className="hidden md:block fixed pointer-events-none z-[99998]"
          style={{
            left: burst.x,
            top: burst.y,
            transform: "translate(-50%, -50%)",
            mixBlendMode: "screen",
          }}
        >
          <motion.div
            className="rounded-full border border-[#6ee7b7]"
            initial={{ width: 20, height: 20, opacity: 0.6 }}
            animate={{ width: 90, height: 90, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() => setBurst(null)}
          />
        </div>
      )}

      {/* Comet ring — orients toward movement and stretches with speed */}
      <div
        aria-hidden="true"
        className="hidden md:block fixed pointer-events-none z-[99998]"
        style={{
          left: trail.rx,
          top: trail.ry,
          transform: `translate(-50%, -50%) rotate(${trail.angle}deg)`,
          mixBlendMode: "screen",
        }}
      >
        <motion.div
          className="rounded-full border"
          animate={{
            width: ringSize,
            height: ringSize,
            scaleX: stretch,
            opacity: hovering ? 0.85 : 0.4,
            borderColor: hovering ? "#34d399" : "#6ee7b7",
          }}
          transition={{ duration: 0.18 }}
          style={{ borderWidth: 1.5 }}
        />
      </div>

      {/* Dot — crisp, glowing, pinned to the exact pointer */}
      <div
        aria-hidden="true"
        data-testid="cursor-dot"
        className="hidden md:block fixed pointer-events-none z-[99999]"
        style={{
          left: pos.x,
          top: pos.y,
          transform: "translate(-50%, -50%)",
        }}
      >
        <motion.div
          className="rounded-full bg-[#6ee7b7]"
          animate={{
            width: clicked ? 5 : hovering ? 10 : 8,
            height: clicked ? 5 : hovering ? 10 : 8,
            opacity: hovering ? 1 : 0.9,
          }}
          transition={{ duration: 0.15 }}
          style={{ boxShadow: "0 0 10px 2px rgba(110,231,183,0.6)" }}
        />
      </div>
    </>
  );
}
