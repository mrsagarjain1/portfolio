"use client";

import { useImmersiveContext } from "./immersive/ImmersiveProvider";

/**
 * A small, always-available control that lets visitors turn the page's motion
 * on or off, independent of their OS "reduce motion" setting. Clicking sets an
 * explicit override in the ImmersiveProvider. The drifting background, the
 * scroll reveals and the number counters all read the same `motionEnabled`
 * flag, so they react immediately.
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
      className="fixed bottom-4 right-4 z-[100] flex items-center gap-2 border border-[#222524] bg-key px-3 py-2 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-key-ink shadow-[0_3px_#222524] transition-colors hover:bg-key-ink hover:text-[#f0ede5]"
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${
          motionEnabled ? "bg-[#2f9e6e]" : "bg-[#8b8680]"
        }`}
        style={
          motionEnabled
            ? { boxShadow: "0 0 0 3px rgba(47,158,110,0.25)" }
            : undefined
        }
      />
      <span className="hidden sm:inline">
        {motionEnabled ? "Motion on" : "Motion off"}
      </span>
    </button>
  );
}
