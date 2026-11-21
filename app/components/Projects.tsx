import { projects } from "../lib/content";
import { AnimatedCounter } from "./AnimatedCounter";
import { ProductShowcase } from "./ProductShowcase";
import { ProjectCard } from "./ProjectCard";
import { ScrollReveal } from "./ScrollReveal";
import { SectionHeading } from "./SectionHeading";
import { FocusTag, FocusTarget } from "./SkillFocus";
import { TabButton } from "./TabButton";

/** valocoach.ai: the product with real users, shown first and largest. */
function FeaturedProject() {
  const { featured } = projects;

  return (
    <FocusTarget as="article" id="valocoach" tags={featured.tags} className="pt-8">
      <div className="grid items-center gap-12 lg:grid-cols-5 lg:gap-14">
        <div className="lg:col-span-2">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-red">
            {projects.featuredLabel}
          </p>
          <h3 className="display mt-3 text-[clamp(2rem,3.4vw,3.5rem)] leading-[1.05] tracking-[-0.05em] text-text">
            {featured.title}
          </h3>
          <p className="mt-2 text-lg leading-snug text-text">{featured.tagline}</p>
          <p className="mt-4 text-base leading-relaxed text-body">{featured.description}</p>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5">
            {featured.stats.map((stat, i) => (
              <div
                key={stat.label}
                // With an odd number of stats the last one takes a full row instead of leaving a gap.
                className={`border-t border-text pt-3 ${
                  i === featured.stats.length - 1 && featured.stats.length % 2 === 1 ? "col-span-2" : ""
                }`}
              >
                <dd className="display text-3xl tracking-[-0.05em] text-text tabular-nums">
                  <AnimatedCounter value={stat.value} duration={1.2} />
                </dd>
                <dt className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-muted">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>

          <ul className="mt-6 flex flex-wrap gap-x-4 gap-y-1">
            {featured.tags.map((tag) => (
              <li key={tag}>
                <FocusTag
                  tag={tag}
                  className="font-mono text-xs uppercase tracking-[0.08em] text-muted"
                />
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3">
            {featured.links.map((link) => (
              <TabButton key={link.href} href={link.href} label={link.label} external />
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="crop-frame">
            <ProductShowcase />
          </div>
        </div>
      </div>
    </FocusTarget>
  );
}

export default function Projects() {
  const { items } = projects;
  // The featured product plus every smaller project.
  const total = items.length + 1;
  // With an odd number of entries the last one takes a full row instead of leaving a gap.
  const isOdd = items.length % 2 === 1;

  return (
    <section
      id={projects.id}
      className="paper-grid-soft px-[var(--page-gutter)] pb-24 pt-20 text-text sm:pt-28"
    >
      <div className="mx-auto max-w-[110rem]">
        <ScrollReveal>
          <div className="border-b border-rule pb-12">
            <SectionHeading
              eyebrow={projects.eyebrow}
              title={projects.title}
              lead={projects.lead}
              count={total}
              align="center"
            />
          </div>
        </ScrollReveal>

        <ScrollReveal>
          <FeaturedProject />
        </ScrollReveal>

        <div className="relative mt-20 grid gap-x-[clamp(1.5rem,4vw,4rem)] gap-y-16 md:grid-cols-2 lg:mt-24">
          {/* The thin centre rule between the two columns. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-5 left-1/2 top-0 hidden w-px bg-rule-soft md:block"
          />
          {items.map((project, i) => (
            <ScrollReveal
              key={project.id}
              delay={(i % 2) * 0.05}
              className={isOdd && i === items.length - 1 ? "md:col-span-2" : ""}
            >
              <ProjectCard
                project={project}
                index={i + 2}
                wide={isOdd && i === items.length - 1}
              />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
