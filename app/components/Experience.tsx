import { credentials, experience, type ExperienceEntry } from "../lib/content";
import { ScrollReveal } from "./ScrollReveal";
import { SectionHeading } from "./SectionHeading";

/**
 * One role. The role and company are set as a big name that dims when idle and
 * lights up on hover or focus, like a menu of services; the facts sit under it.
 */
function EntryCard({ entry }: { entry: ExperienceEntry }) {
  return (
    <article>
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-xs uppercase tracking-[0.12em]">
          <span className="text-[#e8b29c]">{entry.years}</span>
          <span aria-hidden="true" className="text-[#a3a79b]">
            {" · "}
          </span>
          <span className="text-[#a3a79b]">{entry.place}</span>
        </p>
        <div className="flex items-center gap-3">
          {entry.project && (
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#a3a79b]">
              {entry.project}
            </span>
          )}
          {entry.current && (
            <span className="inline-flex items-center gap-1.5 border border-[#eee9e5]/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[#eee9e5]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#e05a3f]" />
              {experience.nowLabel}
            </span>
          )}
        </div>
      </header>

      <h3 className="display mt-3 text-[clamp(1.75rem,4.2vw,4.25rem)] leading-[1.08] tracking-[-0.055em]">
        {entry.role}
        {", "}
        {entry.org}
      </h3>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-[#b5b7ad]">{entry.summary}</p>

      {entry.highlight && (
        <p className="mt-4 flex max-w-3xl gap-2 text-base font-bold leading-relaxed text-[#e8b29c]">
          <span aria-hidden="true">▸</span>
          <span>{entry.highlight}</span>
        </p>
      )}

      {entry.tags.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
          {entry.tags.map((tag) => (
            <li key={tag} className="font-mono text-xs uppercase tracking-[0.08em] text-[#a3a79b]">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

/** Certifications and education, beside the timeline. */
function Credentials() {
  const { certifications, education } = credentials;
  const badge =
    "mt-0.5 min-w-[3.75rem] border border-[#eee9e5]/50 px-2 py-0.5 text-center font-mono text-[11px] uppercase tracking-[0.08em] text-[#eee9e5]";

  return (
    <div className="border-t-2 border-[#eee9e5] pt-5">
      <h3 className="mb-5 font-mono text-xs font-normal uppercase tracking-[0.16em] text-[#eee9e5]">
        {credentials.title}
      </h3>
      <ul className="space-y-4">
        {certifications.map((item) => (
          <li key={item.badge} className="flex items-start gap-3">
            <span className={badge}>{item.badge}</span>
            <span className="text-sm leading-snug text-[#b5b7ad]">{item.name}</span>
          </li>
        ))}
        <li className="flex items-start gap-3 border-t border-[#eee9e5]/15 pt-4">
          <span className={badge}>{education.badge}</span>
          <span className="text-sm leading-snug text-[#b5b7ad]">
            {education.name}
            <span className="block font-mono text-xs uppercase tracking-[0.06em] text-[#a3a79b]">
              {education.school}, {education.years}
            </span>
          </span>
        </li>
      </ul>
    </div>
  );
}

/** Career timeline, oldest first, with certifications and education beside it. */
export default function Experience() {
  const { entries } = experience;

  return (
    <section
      id={experience.id}
      className="on-dark bg-services px-[var(--page-gutter)] py-20 text-[#eee9e5] sm:py-28"
    >
      <div className="mx-auto max-w-[110rem]">
        <ScrollReveal>
          <SectionHeading
            eyebrow={experience.eyebrow}
            title={experience.title}
            lead={experience.lead}
            tone="dark"
          />
        </ScrollReveal>

        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          <ol>
            {entries.map((entry, i) => (
              <li
                key={entry.id}
                className="name-row relative grid gap-x-6 border-t border-[#eee9e5]/15 py-9 sm:grid-cols-[4rem_minmax(0,1fr)]"
              >
                {/* Index number: decorative, so it stays out of the accessibility tree. */}
                <span
                  aria-hidden="true"
                  className="mb-3 font-mono text-[0.7rem] leading-6 text-[#a3a79b] sm:mb-0"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <ScrollReveal>
                  <EntryCard entry={entry} />
                </ScrollReveal>
              </li>
            ))}
          </ol>

          <ScrollReveal className="lg:sticky lg:top-28 lg:self-start" delay={0.05}>
            <Credentials />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
