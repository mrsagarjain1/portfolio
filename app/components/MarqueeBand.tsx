"use client";

const items = [
  "AI Engineering",
  "Competitive Gaming",
  "LangChain",
  "Python",
  "valocoach.ai",
  "20K+ Users",
  "FastAPI",
  "MongoDB",
  "Vector DB",
  "Product at Scale",
  "Mobile",
  "Applied AI",
  "Valorant",
  "Redis",
  "1M+ Impressions",
];

export function MarqueeBand() {
  const doubled = [...items, ...items]; // duplicate for seamless loop

  return (
    <div className="relative overflow-hidden border-y border-[#1f1f1f] py-4 bg-[#0a0a0a]/80 backdrop-blur-sm">
      {/* Left fade */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10 pointer-events-none" />
      {/* Right fade */}
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10 pointer-events-none" />

      <div className="flex whitespace-nowrap marquee-track">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-4 px-6 text-sm font-medium tracking-widest uppercase"
          >
            <span className="text-[#444]">·</span>
            <span
              className={
                i % 5 === 0
                  ? "text-[#6ee7b7]"
                  : "text-[#555]"
              }
            >
              {item}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
