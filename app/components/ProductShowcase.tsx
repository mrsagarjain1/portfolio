import Image from "next/image";

import { showcase } from "../lib/content";
import { BrowserFrame } from "./BrowserFrame";

/**
 * `sizes` hints, measured from the layout in Projects.tsx. The showcase column is
 * 3/5 of the content width (about 55vw) until the 110rem container stops growing
 * at 1872px, where it is 1032px wide. Each phone is a fifth of the column minus
 * its frame. A hint smaller than the real slot makes the browser fetch an image
 * smaller than the slot, which blurs a screenshot, so re-measure if the grid changes.
 */
const WEB_SIZES = "(min-width: 1872px) 1032px, (min-width: 1024px) 56vw, 100vw";
const PHONE_SIZES = "(min-width: 1872px) 199px, (min-width: 1024px) 11vw, (min-width: 640px) 18vw, 120px";

/**
 * The product on screen: the web app in a browser window, with two phone screens
 * overlapping its corner on wider screens and sitting below it on phones.
 * Static markup and CSS only.
 */
export function ProductShowcase() {
  const { web, phones, caption } = showcase;

  return (
    <figure>
      <div className="relative">
        <BrowserFrame
          src={web.src}
          alt={web.alt}
          width={web.width}
          height={web.height}
          urlBar={web.urlBar}
          sizes={WEB_SIZES}
        />

        <div className="mx-auto mt-5 flex w-[62%] max-w-[260px] items-end justify-center sm:absolute sm:-bottom-8 sm:right-3 sm:mx-0 sm:mt-0 sm:w-[40%] sm:max-w-none">
          {phones.map((phone, i) => (
            <div
              key={phone.src}
              className={`w-1/2 rounded-[16px] border border-[#626262] bg-[#171717] p-[3px] shadow-xl shadow-black/30 transition-transform duration-300 hover:-translate-y-1 ${
                i === 0 ? "z-[1] -mr-3 translate-y-3 -rotate-6" : "z-10"
              }`}
            >
              <Image
                src={phone.src}
                alt={phone.alt}
                width={664}
                height={1440}
                sizes={PHONE_SIZES}
                className="h-auto w-full rounded-[13px]"
              />
            </div>
          ))}
        </div>
      </div>

      <figcaption className="mt-3 font-mono text-xs uppercase leading-relaxed tracking-[0.04em] text-muted sm:mt-12">
        {caption}
      </figcaption>
    </figure>
  );
}
