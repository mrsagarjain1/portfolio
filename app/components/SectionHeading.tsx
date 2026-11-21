interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  lead?: string;
  /** A small decorative number at the top-right of the title, like "Works 15". */
  count?: number;
  /** Light text on a dark section. */
  tone?: "light" | "dark";
  align?: "left" | "center";
}

/**
 * The mono label, giant tightly tracked title and optional one-line lead that
 * open each section. The title is a single heading; the count, when given, is
 * a decorative superscript hidden from assistive technology so it never
 * changes the heading's name.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  count,
  tone = "light",
  align = "left",
}: SectionHeadingProps) {
  const dark = tone === "dark";
  const center = align === "center";

  return (
    <div className={`mb-10 ${center ? "text-center" : ""}`}>
      <p
        className={`font-mono text-xs font-normal uppercase tracking-[0.16em] sm:text-sm ${
          dark ? "text-[#93978b]" : "text-text"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`display relative mt-4 text-balance text-[clamp(2.75rem,8vw,8.5rem)] leading-[0.92] tracking-[-0.06em] ${
          center ? "mx-auto w-fit" : ""
        } ${dark ? "text-[#eee9e5]" : "text-text"}`}
      >
        {title}
        {count !== undefined && (
          <sup
            aria-hidden="true"
            className="display absolute -top-[0.02em] left-[calc(100%+0.18em)] text-[0.28em] leading-none tracking-[-0.06em]"
          >
            {count}
          </sup>
        )}
      </h2>
      {lead && (
        <p
          className={`mt-5 max-w-xl text-base leading-relaxed sm:text-lg ${
            center ? "mx-auto" : ""
          } ${dark ? "text-[#b5b7ad]" : "text-body"}`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
