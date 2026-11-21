interface TabButtonProps {
  href: string;
  label: string;
  /** Opens in a new tab with `noopener noreferrer`. */
  external?: boolean;
  /** Light keys, for use on the dark sections. */
  tone?: "dark" | "light";
  className?: string;
}

/** A label split into two keys: its first word, then the rest. */
function splitLabel(label: string): string[] {
  const [first, ...rest] = label.split(" ");
  return rest.length > 0 ? [first, rest.join(" ")] : [first];
}

/**
 * The split "tab" button. Each key holds its text twice in a clipped window; on
 * hover or keyboard focus the text rolls up and the copy underneath rolls in.
 * CSS only. The link carries the full label as its name, so the duplicate text
 * and the split are invisible to assistive technology.
 */
export function TabButton({
  href,
  label,
  external = false,
  tone = "dark",
  className = "",
}: TabButtonProps) {
  return (
    <a
      href={href}
      aria-label={label}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`tab-btn ${tone === "light" ? "tab-btn-light" : ""} ${className}`}
    >
      {splitLabel(label).map((part, index) => (
        <span key={index} aria-hidden="true" className="tab-part">
          <span className="word-window">
            <span className="word-roll">
              <span>{part}</span>
              <span>{part}</span>
            </span>
          </span>
        </span>
      ))}
    </a>
  );
}
