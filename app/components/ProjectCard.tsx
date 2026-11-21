import type { Project } from "../lib/content";
import { BrowserFrame } from "./BrowserFrame";
import { DrawIn } from "./DrawIn";
import { FocusTag, FocusTarget } from "./SkillFocus";
import { TabButton } from "./TabButton";

/** Soft paper tones behind each project's picture, taken in turn. */
const TONES = ["#e8c9b8", "#cbd4aa", "#b9cfd5", "#d4cec6", "#e8b29c"];

/**
 * `sizes` hint for the picture, measured from the grid in Projects.tsx: two columns
 * from 768px, each about 45vw, until the 110rem container stops growing at 1872px
 * (848px a column). A hint smaller than the real slot makes the browser fetch an
 * image smaller than the slot and blur it, so re-measure if the grid changes.
 */
const CARD_SIZES = "(min-width: 1872px) 848px, (min-width: 768px) 45vw, 100vw";

interface ProjectCardProps {
  /** Full-width entry: picture on one side, text (under a second picture, if any) on the other. Used for an odd one out. */
  wide?: boolean;
  project: Project;
  /** Position in the gallery, shown as a large numeral when there is no screenshot. */
  index?: number;
}

/**
 * One smaller project, as a gallery entry: a picture in a crop-marked frame,
 * then the title, year, one-line hook, description, tags and links. A project
 * with no screenshot gets a plain tone block with its number instead, so every
 * entry keeps the same shape.
 */
export function ProjectCard({ project, index = 1, wide = false }: ProjectCardProps) {
  const { image, detailImage } = project;
  const tone = TONES[(index - 1) % TONES.length];

  return (
    <FocusTarget
      as="article"
      id={project.id}
      tags={project.tags}
      className={`scroll-mt-24 pt-6 ${
        wide
          ? // With a second picture the two pictures share a top line; with one, the text is centred beside it.
            `md:grid md:grid-cols-2 md:gap-x-[clamp(1.5rem,4vw,4rem)] ${
              detailImage ? "md:items-start" : "md:items-center"
            }`
          : ""
      }`}
    >
      <div className="crop-frame">
        {image ? (
          <BrowserFrame
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            urlBar={image.urlBar}
            sizes={CARD_SIZES}
            overlay={image.reveal && <DrawIn rects={image.reveal} />}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex aspect-[1680/920] w-full items-end p-5 sm:p-7"
            style={{ backgroundColor: tone }}
          >
            <span className="display text-[clamp(4rem,10vw,9rem)] leading-[0.8] tracking-[-0.07em] text-text/85">
              {String(index).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      <div className={wide ? "mt-8 md:mt-0" : "mt-8"}>
        {detailImage && (
          <div className="crop-frame mb-8">
            <BrowserFrame
              src={detailImage.src}
              alt={detailImage.alt}
              width={detailImage.width}
              height={detailImage.height}
              urlBar={detailImage.urlBar}
              sizes={CARD_SIZES}
              overlay={detailImage.reveal && <DrawIn rects={detailImage.reveal} />}
            />
          </div>
        )}
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h3 className="display text-[clamp(1.5rem,2.35vw,2.5rem)] leading-[1.12] tracking-[-0.045em] text-text">
            {project.title}
          </h3>
          <span className="font-mono text-xs uppercase tracking-[0.1em] text-muted">
            {project.year}
          </span>
        </div>
        <p className="mt-2 text-lg leading-snug text-text">{project.tagline}</p>
        <p className="mt-4 max-w-[38rem] text-base leading-relaxed text-body">
          {project.description}
        </p>

        <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1">
          {project.tags.map((tag) => (
            <li key={tag}>
              <FocusTag
                tag={tag}
                className="font-mono text-xs uppercase tracking-[0.08em] text-muted"
              />
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-3">
          {project.links.map((link) => (
            <TabButton key={link.href} href={link.href} label={link.label} external />
          ))}
        </div>
      </div>
    </FocusTarget>
  );
}
