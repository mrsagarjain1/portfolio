import { contact, now, site } from "../lib/content";
import { ScrollReveal } from "./ScrollReveal";
import { SectionHeading } from "./SectionHeading";
import { SocialIcon, type SocialName } from "./SocialIcon";
import { TabButton } from "./TabButton";

/** First name over the rest, for the big wordmark in the footer. */
function wordmarkLines(name: string): string[] {
  const [first, ...rest] = name.toLowerCase().split(" ");
  return rest.length > 0 ? [first, rest.join(" ")] : [first];
}

const keys: { name: SocialName; href: string; external: boolean }[] = [
  ...contact.socials.map((s) => ({ name: s.label as SocialName, href: s.href, external: true })),
  { name: "Email", href: `mailto:${site.email}`, external: false },
];

export default function Contact() {
  return (
    <>
      <section
        id={contact.id}
        className="bg-paper-grey px-[var(--page-gutter)] py-20 text-text sm:py-28"
      >
        <div className="mx-auto grid max-w-[110rem] items-end gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:pr-12">
          <div>
            <ScrollReveal>
              <SectionHeading
                eyebrow={contact.eyebrow}
                title={contact.title}
                lead={contact.lead}
              />
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <p className="mb-8 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.12em] text-text sm:text-sm">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#2f9e6e]" />
                {now.status}
              </p>

              <p className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-body">
                {contact.emailLabel}
              </p>
              <a
                href={`mailto:${site.email}`}
                className="display inline-block break-all text-[clamp(1.4rem,3.4vw,3rem)] leading-tight tracking-[-0.045em] text-text underline decoration-2 underline-offset-[0.2em] transition-colors hover:text-red"
              >
                {site.email}
              </a>

              <div className="mt-8">
                <TabButton href={`mailto:${site.email}`} label="Send email" />
              </div>
            </ScrollReveal>
          </div>

          {/* Social links as physical keycaps. */}
          <ScrollReveal delay={0.1}>
            <ul className="flex flex-row gap-4 lg:flex-col lg:pb-3">
              {keys.map((key) => (
                <li key={key.name}>
                  <a
                    href={key.href}
                    aria-label={key.name}
                    target={key.external ? "_blank" : undefined}
                    rel={key.external ? "noopener noreferrer" : undefined}
                    className="social-key"
                  >
                    <SocialIcon name={key.name} />
                  </a>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      <footer className="ink-grid frame-inset relative flex min-h-[26rem] flex-col justify-between overflow-hidden px-[var(--page-gutter)] pb-20 pt-16 text-[#efede7] on-dark">
        <p
          aria-hidden="true"
          className="display relative z-10 mx-auto w-full max-w-[110rem] text-[clamp(4.5rem,17vw,20rem)] leading-[0.78] tracking-[-0.08em]"
        >
          {wordmarkLines(site.name).map((line, index) => (
            <span key={line} className={`block ${index > 0 ? "pl-[0.3em]" : ""}`}>
              {line}
            </span>
          ))}
        </p>
        <div className="relative z-10 mx-auto mt-14 flex w-full max-w-[110rem] flex-col items-start justify-between gap-3 font-mono text-xs uppercase tracking-[0.12em] text-[#b5b7ad] sm:flex-row sm:items-center">
          <p>{contact.footerLeft}</p>
          <p>{contact.footerRight}</p>
        </div>
      </footer>
    </>
  );
}
