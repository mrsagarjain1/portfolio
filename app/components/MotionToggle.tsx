"use client";

import { useImmersiveContext } from "./immersive/ImmersiveProvider";

/**
 * A small, always-available control that lets visitors turn the immersive
 * motion layer on or off in-page, independent of their OS `prefers-reduced-
 * motion` setting (Accessibility). Clicking sets an explicit override in the
 * ImmersiveProvider; the whole animated layer (galaxy, cursor trails, reveals,
 * parallax) reacts live because every effect reads the shared `motionEnabled`
 * flag the override feeds into.
 */
export function MotionToggle() {
  const { motionEnabled, setMotionOverride } = useImmersiveContext();

  return (
    <button
      type="button"
      onClick={() => setMotionOverride(motionEnabled ? "off" : "on")}
      aria-pressed={!motionEnabled}
      aria-label={
        motionEnabled ? "Turn off background motion" : "Turn on background motion"
      }
      title={motionEnabled ? "Turn off motion" : "Turn on motion"}
      className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 rounded-full border border-[#6ee7b7]/30 bg-[#0a0a0a]/70 px-3 py-2 text-xs font-medium text-[#e8e8e8] backdrop-blur-md transition-colors hover:border-[#6ee7b7]/60 hover:text-[#6ee7b7]"
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${
          motionEnabled ? "bg-[#6ee7b7]" : "bg-[#555]"
        }`}
        style={
          motionEnabled
            ? { boxShadow: "0 0 8px 1px rgba(110,231,183,0.7)" }
            : undefined
        }
      />
      <span className="hidden sm:inline">
        {motionEnabled ? "Motion on" : "Motion off"}
      </span>
    </button>
  );
}
