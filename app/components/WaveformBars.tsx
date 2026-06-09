"use client";

export function WaveformBars({ count = 24 }: { count?: number }) {
  return (
    <div className="flex items-end gap-[2px] h-5" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="wave-bar"
          style={{
            "--dur": `${0.6 + Math.random() * 0.8}s`,
            "--delay": `${Math.random() * 1}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
