"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { showcase } from "../lib/content";
import { BrowserFrame } from "./BrowserFrame";
import { MotionPolicy } from "./MotionPolicy";

/** Per-phone placement in the fan: width, tilt and how far it sits below the centre phone. */
const FAN = [
  { width: "30%", rotate: -6, lift: 14, overlap: "0" },
  { width: "38%", rotate: 0, lift: 0, overlap: "-7%" },
  { width: "30%", rotate: 6, lift: 14, overlap: "-7%" },
] as const;

function PhoneFan() {
  return (
    <div className="mx-auto flex w-full max-w-[420px] items-end justify-center">
      {showcase.phones.slice(0, FAN.length).map((phone, i) => {
        const place = FAN[i];
        return (
          <motion.div
            key={phone.src}
            className={`relative hover:z-20 ${i === 1 ? "z-10" : "z-[1]"}`}
            style={{
              width: place.width,
              marginLeft: place.overlap,
              rotate: place.rotate,
              y: place.lift,
              transformOrigin: "50% 100%",
            }}
            initial={{ opacity: 0, y: place.lift + 24 }}
            whileInView={{ opacity: 1, y: place.lift }}
            whileHover={{ y: place.lift - 8, scale: 1.04 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: "easeOut" }}
          >
            <div className="rounded-[18px] border border-[#2a2a2a] bg-black p-[3px] shadow-xl shadow-black/50">
              <Image
                src={phone.src}
                alt={phone.alt}
                width={540}
                height={1170}
                sizes="(min-width: 1024px) 160px, 30vw"
                className="h-auto w-full rounded-[15px]"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/** The product on screen: the web app in a browser window next to three phone screens. */
export function ProductShowcase() {
  const { web, phonesCaption } = showcase;

  return (
    <MotionPolicy>
      <div className="mb-6 grid items-center gap-6 lg:grid-cols-5 lg:gap-8">
        <motion.figure
          className="lg:col-span-3"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <BrowserFrame
            src={web.src}
            alt={web.alt}
            width={web.width}
            height={web.height}
            urlBar={web.urlBar}
            sizes="(min-width: 1024px) 600px, 100vw"
          />
          <figcaption className="mt-2 text-xs leading-relaxed text-[#aaa]">
            {web.caption}
          </figcaption>
        </motion.figure>

        <figure className="lg:col-span-2" data-testid="phone-fan">
          <PhoneFan />
          <figcaption className="mt-4 text-center text-xs leading-relaxed text-[#aaa]">
            {phonesCaption}
          </figcaption>
        </figure>
      </div>
    </MotionPolicy>
  );
}
