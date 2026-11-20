import Image from "next/image";

interface BrowserFrameProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Text shown in the fake address bar. */
  urlBar: string;
  /** Responsive `sizes` hint so the browser downloads the right image width. */
  sizes: string;
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
  className = "",
}: BrowserFrameProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border border-[#222] bg-[#0a0a0a] shadow-2xl shadow-black/40 ${className}`}
    >
      <div
        className="flex items-center gap-1.5 border-b border-[#1f1f1f] bg-[#0c0c0c] px-3 py-2"
        aria-hidden="true"
      >
        <span className="h-2 w-2 rounded-full bg-[#3a3a3a]" />
        <span className="h-2 w-2 rounded-full bg-[#3a3a3a]" />
        <span className="h-2 w-2 rounded-full bg-[#3a3a3a]" />
        <span className="ml-3 min-w-0 flex-1 truncate rounded-md bg-[#111] px-3 py-1 font-mono text-[10px] text-[#777]">
          {urlBar}
        </span>
      </div>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className="h-auto w-full"
      />
    </div>
  );
}
