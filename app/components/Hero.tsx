import Image from "next/image";

import { about, contact, hero, metrics, now, site } from "../lib/content";
import { AvailabilityBadge } from "./AvailabilityBadge";
import { Drift } from "./Drift";
import { SocialIcon, type SocialName } from "./SocialIcon";
import { TabButton } from "./TabButton";

/** Entrance delay for the staggered entrance, as a CSS variable read by the CSS animations. */
function delay(seconds: number, tilt?: string): React.CSSProperties {
  return { "--d": `${seconds}s`, ...(tilt ? { "--tilt": tilt } : {}) } as React.CSSProperties;
}

const iconLinks: { name: SocialName; href: string }[] = [
  ...contact.socials.map((s) => ({ name: s.label as SocialName, href: s.href })),
  { name: "Email", href: `mailto:${site.email}` },
];

/**
 * Paper stickers that float round the headline on wide screens: real numbers from the content file.
 * `rise` is how far each one lifts above the page while the visitor scrolls away (see Drift).
 */
const stickers = [
  {
    value: metrics.users,
    label: "Users",
    className: "lg:left-[var(--page-edge)] lg:top-[19%]",
    tilt: "-7deg",
    d: 0.6,
    rise: 80,
  },
  {
    value: metrics.impressions,
    label: "Monthly impressions",
    className: "lg:right-[var(--page-edge)] lg:top-[22%]",
    tilt: "6deg",
    d: 0.72,
    rise: 50,
  },
];

/**
 * The first screen: graph paper, a giant two-line headline that rises out of
 * its own mask, a photo that sits on the page like a sticker, and a cue to
 * scroll. Plain server-rendered markup: every entrance is a CSS animation that
 * runs once on first paint, with no script and no moving layers behind the text.
 */
export default function Hero() {
  return (
    <section
      id="hero"
      className="paper-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-[var(--page-gutter)] pb-20 pt-24 text-text sm:pb-24 sm:pt-28"
    >
      {/* A faint light wash across the paper. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.35), transparent 42%)" }}
      />

      {/* Photo sticker: a corner of the page on wide screens, above the headline on small ones. */}
      <Drift
        rise={120}
        className="order-first mx-auto mb-5 w-28 sm:mb-6 sm:w-44 lg:absolute lg:bottom-[9%] lg:left-[var(--page-edge)] lg:order-none lg:mb-0 lg:w-[clamp(11rem,17vw,17rem)]"
      >
        <div className="sticker" style={delay(0.35, "-5deg")}>
          <div className="relative aspect-[4/5] w-full overflow-hidden border-[0.5rem] border-b-[1.6rem] border-[#f6f2ea] bg-[#f6f2ea]">
            <Image
              src={hero.photo.src}
              alt={hero.photo.alt}
              fill
              sizes="(max-width: 640px) 144px, (max-width: 1024px) 176px, 272px"
              className="object-cover object-top"
              priority
            />
          </div>
        </div>
      </Drift>

      {stickers.map((sticker) => (
        <Drift
          key={sticker.label}
          rise={sticker.rise}
          className={`absolute hidden lg:block ${sticker.className}`}
        >
          <div
            aria-hidden="true"
            className="sticker bg-[#f6f2ea] px-5 py-4 text-center"
            style={delay(sticker.d, sticker.tilt)}
          >
            <p className="display text-3xl tracking-[-0.05em] text-text xl:text-4xl">{sticker.value}</p>
            <p className="mt-1 font-mono text-[0.65rem] uppercase tracking-[0.12em] text-body">
              {sticker.label}
            </p>
          </div>
        </Drift>
      ))}

      <div className="relative z-10 mx-auto flex w-full max-w-[110rem] flex-col items-center text-center">
        <p
          className="reveal-up mb-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.16em] text-text sm:text-sm"
          style={delay(0.05)}
        >
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-red" />
          {hero.badge}
        </p>

        <h1 className="display text-[clamp(2.4rem,8.65vw,11.05rem)] leading-[0.96] tracking-[-0.035em] text-[#111110]">
          <span className="mask-line">
            <span className="mask-inner" style={delay(0.1)}>
              {hero.headline.line1}
            </span>
          </span>
          <span className="mask-line">
            <span className="mask-inner" style={delay(0.22)}>
              {hero.headline.line2}
            </span>
          </span>
        </h1>

        <p
          className="reveal-up mx-auto mt-5 max-w-xl text-base leading-relaxed text-body sm:mt-8 sm:text-lg"
          style={delay(0.5)}
        >
          <span className="font-semibold text-text">{hero.intro}</span>{" "}
          <span>{hero.detail}</span>
        </p>

        <div
          className="reveal-up mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 sm:mt-8 sm:gap-y-4"
          style={delay(0.6)}
        >
          <TabButton href={`#${hero.primaryCta.sectionId}`} label={hero.primaryCta.label} />
          <TabButton href={`#${hero.secondaryCta.sectionId}`} label={hero.secondaryCta.label} />
          <ul className="flex items-center gap-3">
            {iconLinks.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  aria-label={item.name}
                  target={item.name === "Email" ? undefined : "_blank"}
                  rel={item.name === "Email" ? undefined : "noopener noreferrer"}
                  className="social-key !h-11 !w-11"
                >
                  <SocialIcon name={item.name} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="reveal-up mt-6 flex flex-col items-center gap-3 sm:mt-8" style={delay(0.7)}>
          <p className="flex flex-col items-center justify-center gap-y-1 font-mono text-xs uppercase tracking-[0.1em] text-body sm:flex-row sm:flex-wrap sm:gap-x-2">
            <span className="text-red">{now.label}</span>
            {now.roles.map((role) => (
              <span key={role.org} className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="hidden text-rule sm:inline">
                  /
                </span>
                <span>
                  <span className="text-text">{role.title}</span>
                  {", "}
                  {role.org}
                  {role.detail ? ` (${role.detail})` : ""}
                </span>
              </span>
            ))}
          </p>
          <AvailabilityBadge />
        </div>
      </div>

      <a
        href="#about"
        className="reveal-up absolute bottom-3 left-1/2 z-10 flex min-h-11 -translate-x-1/2 items-center gap-3 px-2 font-mono text-xs font-bold uppercase tracking-[0.12em] text-text sm:text-sm"
        style={delay(1.1)}
      >
        {about.title}
        <span aria-hidden="true" className="cue-arrow text-lg">
          ↓
        </span>
      </a>
    </section>
  );
}
