import { about, links, skills } from "../lib/content";
import { GitHubActivity } from "./GitHubActivity";
import { ScrollReveal } from "./ScrollReveal";
import { SocialIcon } from "./SocialIcon";

/** The GitHub username, taken from the profile link in the content file. */
const GITHUB_USER = links.github.split("/").filter(Boolean).pop() ?? "";

/** A square, outlined label: used for skills and the "currently building" list. */
const chip =
  "border border-text/70 px-2.5 py-1 font-mono text-[0.7rem] uppercase tracking-[0.06em] text-text";

export default function About() {
  const titleWords = about.title.split(" ");

  return (
    <section
      id={about.id}
      className="bg-paper px-[var(--page-gutter)] py-20 text-text sm:py-28"
    >
      <div className="mx-auto max-w-[90rem]">
        <p className="font-mono text-xs uppercase tracking-[0.16em] sm:text-sm">{about.eyebrow}</p>

        <div className="mt-6 grid gap-x-[clamp(2rem,7vw,7rem)] gap-y-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div>
            <ScrollReveal>
              <h2 className="display text-[clamp(4rem,7.5vw,7.75rem)] leading-none tracking-[-0.045em] text-[#282723]">
                {titleWords.map((word, index) => (
                  <span key={`${word}-${index}`}>
                    {index > 0 && " "}
                    <span className={`block ${index > 0 ? "pl-[0.48em]" : ""}`}>{word}</span>
                  </span>
                ))}
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.05}>
              <div className="mt-[clamp(2.5rem,5.5vh,4.5rem)] space-y-6 text-[clamp(0.95rem,1.12vw,1.05rem)] leading-[1.75] text-muted sm:ml-[24%]">
                {about.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-10 sm:ml-[24%]">
                <p className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-red">
                  {about.buildingLabel}
                </p>
                <ul className="flex flex-wrap gap-2">
                  {about.building.map((item) => (
                    <li key={item} className={chip}>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={0.08} className="lg:pt-6">
            <div className="border-t-2 border-text pt-5">
              <h3 className="mb-6 font-mono text-xs font-normal uppercase tracking-[0.16em]">
                {skills.title}
              </h3>
              <div className="space-y-6">
                {skills.groups.map((group) => (
                  <div
                    key={group.name}
                    className="grid gap-3 border-b border-rule pb-6 last:border-b-0 sm:grid-cols-[10rem_1fr]"
                  >
                    <p className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
                      {group.name}
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <li key={item} className={chip}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        <ScrollReveal className="mt-16">
          <div className="border-t-2 border-text pt-5">
            <div className="mb-5 flex items-center gap-3">
              <SocialIcon name="GitHub" />
              <h3 className="font-mono text-xs font-normal uppercase tracking-[0.16em]">
                {about.githubLabel}
              </h3>
            </div>
            <GitHubActivity username={GITHUB_USER} />
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
