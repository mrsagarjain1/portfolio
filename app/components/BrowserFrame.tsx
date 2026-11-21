import Image from "next/image";
import type { ReactNode } from "react";

interface BrowserFrameProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Text shown in the fake address bar. */
  urlBar: string;
  /** Responsive `sizes` hint so the browser downloads the right image width. */
  sizes: string;
  /** Something laid over the picture, filling it (for example the draw-in covers). */
  overlay?: ReactNode;
  className?: string;
}

/** A screenshot inside a minimal browser window. Decorative chrome is aria-hidden. */
export function BrowserFrame({
  src,
  alt,
  width,
  height,
  urlBar,
  sizes,
  overlay,
  className = "",
}: BrowserFrameProps) {
  return (
    <div className={`overflow-hidden border border-text bg-[#171717] ${className}`}>
      <div
        className="flex items-center gap-1.5 border-b border-[#2a2b29] bg-[#171717] px-3 py-2"
        aria-hidden="true"
      >
        <span className="h-2 w-2 rounded-full bg-[#626262]" />
        <span className="h-2 w-2 rounded-full bg-[#626262]" />
        <span className="h-2 w-2 rounded-full bg-[#626262]" />
        <span className="ml-3 min-w-0 flex-1 truncate bg-[#262725] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#a8aaa2]">
          {urlBar}
        </span>
      </div>
      <div className="relative">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className="h-auto w-full"
        />
        {overlay}
      </div>
    </div>
  );
}
