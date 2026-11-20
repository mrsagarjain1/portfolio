/**
 * Single source of truth for the site's copy, numbers and links.
 *
 * Every number (users, impressions, downloads, coaches), role, link and block of
 * text that visitors read lives here, so changing a fact means editing one
 * file. Components import from this module and never type a statistic
 * themselves. Keep it plain data: no JSX, no browser APIs, so server code
 * (metadata, the share card) and client components can both import it.
 *
 * Facts come from the owner's LinkedIn profile, the public valocoach.ai
 * pages, the app store listings and the public GitHub repositories. Do not add
 * a number here that is not published somewhere the owner controls.
 */

// ---------------------------------------------------------------------------
// Identity, numbers and links
// ---------------------------------------------------------------------------

export const site = {
  name: "Sagar Jain",
  url: "https://mrsagarjain.com",
  email: "mrsagarjain1@gmail.com",
  year: "2026",
} as const;

/** Headline numbers for valocoach.ai. Edit here and every page, tooltip, meta tag and share card follows. */
export const metrics = {
  users: "25K+",
  impressions: "1M+",
  downloads: "3K+",
  coaches: "100+",
} as const;

export const links = {
  valocoach: "https://valocoach.ai/",
  web: "https://www.valocoach.ai/",
  liveDemo: "https://www.valocoach.ai/statistics?region=ap&name=venator%23fear",
  android: "https://play.google.com/store/apps/details?id=com.valocoachai",
  ios: "https://apps.apple.com/us/app/valocoach-ai/id6781956574",
  windows: "https://github.com/mrsagarjain1/valocoach-desktop/releases/latest",
  neurowrt: "https://github.com/mrsagarjain1/neurowrt",
  linkedin: "https://www.linkedin.com/in/mrsagarjain1/",
  github: "https://github.com/mrsagarjain1",
  x: "https://x.com/mrsagarjain1",
} as const;

/** The sample account used by the live demo links. */
export const sampleAccount = {
  tag: "venator#fear",
  region: "ap",
} as const;

// ---------------------------------------------------------------------------
// Navigation and page titles
// ---------------------------------------------------------------------------

export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: "Work", href: "#work" },
  { label: "Story", href: "#story" },
  { label: "Journey", href: "#journey" },
  { label: "Stack", href: "#stack" },
  { label: "Contact", href: "#contact" },
];

/** Section ids in page order, with the label shown by the side dots. */
export const sections = [
  { id: "hero", label: "Home" },
  { id: "work", label: "Work" },
  { id: "story", label: "Story" },
  { id: "journey", label: "Journey" },
  { id: "stack", label: "Stack" },
  { id: "contact", label: "Contact" },
] as const;

/** Browser tab title while each section is on screen. */
export const sectionTitles: Record<string, string> = {
  hero: "Sagar Jain | Applied AI Engineer",
  work: "Sagar Jain | valocoach.ai",
  story: "Sagar Jain | Origin Story",
  journey: "Sagar Jain | From routers to rank-ups",
  stack: "Sagar Jain | Tech Stack",
  contact: "Sagar Jain | Let's Build",
};

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

export interface Metric {
  value: string;
  label: string;
}

export interface NowRole {
  title: string;
  org: string;
  detail?: string;
}

export const now = {
  label: "Now",
  roles: [
    { title: "Founder", org: "Neural Stats", detail: "valocoach.ai" },
    { title: "Principal Engineer", org: "Aadvik TekLabs" },
  ] as NowRole[],
  /** Shown next to the live clock in the hero and in the contact section. */
  status: "Open to collaborations",
};

export const hero = {
  badge: "Founder and Applied AI Engineer",
  headline: { line1: "I build AI", line2: "products at scale." },
  intro:
    "I turn ideas into things people actually use. Some got bigger than expected.",
  mission:
    "Right now that means building the default AI coaching infrastructure for competitive gaming, and taking valocoach.ai to new titles.",
  metrics: [
    { value: metrics.users, label: "Users" },
    { value: metrics.impressions, label: "Impressions/mo" },
    { value: metrics.downloads, label: "Downloads" },
  ] as Metric[],
  primaryCta: { label: "See it live", href: links.valocoach },
  secondaryCta: { label: "View Work", sectionId: "work" },
  photo: { src: "/headshot.jpg", alt: "Sagar Jain" },
};

// ---------------------------------------------------------------------------
// Work: valocoach.ai
// ---------------------------------------------------------------------------

export interface Feature {
  title: string;
  description: string;
}

export interface Platform {
  id: "web" | "mobile" | "windows";
  title: string;
  blurb: string;
  links: { label: string; href: string }[];
}

export interface ShowcaseImage {
  src: string;
  alt: string;
  label?: string;
}

export interface SnapshotRow {
  label: string;
  value: string;
}

export interface SnapshotMatch {
  map: string;
  score: string;
}

/** Date the public stats page was read for the web screenshot and the demo. */
export const snapshotDate = "20 Nov 2026";

export const work = {
  id: "work",
  eyebrow: "Featured Work",
  title: "valocoach.ai",
  description:
    "AI-powered coaching platform that gives every competitive Valorant player access to personalized, data-driven improvement - the kind previously reserved for pro teams.",
  liveDemo: { label: "Live demo", href: links.liveDemo },
  stats: [
    { value: metrics.users, label: "Users" },
    { value: metrics.impressions, label: "Monthly Impressions" },
    { value: metrics.downloads, label: "App Downloads" },
    { value: metrics.coaches, label: "Pro Coaches Consulted" },
  ] as Metric[],
  features: [
    {
      title: "Match Analysis",
      description:
        "AI parses every match and surfaces the exact patterns holding your rank back - not generic tips.",
    },
    {
      title: "Personalized Coaching",
      description: `Coaching that adapts to your playstyle. Built with insights from ${metrics.coaches} professional coaches.`,
    },
    {
      title: "Progression Systems",
      description:
        "Reward-driven loops keep players engaged and making consistent, measurable progress.",
    },
    {
      title: "Agent & Role Intelligence",
      description:
        "Deep role-specific insights. Know exactly what to do on your agent at your rank.",
    },
  ] as Feature[],
  builtWithLabel: "Built with",
  techStack: [
    "Python",
    "FastAPI",
    "LangChain",
    "MongoDB",
    "Redis",
    "Vector DB",
    "Next.js",
    "React",
    "Flutter",
  ],
};

/** Product visuals. Add an image by dropping the file in public/work and listing it here. */
export const showcase = {
  web: {
    src: "/work/valocoach-web.webp",
    width: 1280,
    height: 800,
    alt: "valocoach.ai player statistics page for the sample account venator#fear: KDR, headshot rate, ACS, win rate, current and peak rank, and top agent.",
    urlBar: "valocoach.ai/statistics",
    caption: `Web app. Free player stats, no account. A real account, snapshot from ${snapshotDate}.`,
  },
  phones: [
    {
      src: "/work/valocoach-app-match.webp",
      alt: "ValoCoach mobile app, match overview with the score, kills, deaths, assists, ACS and headshot rate.",
      label: "Match overview",
    },
    {
      src: "/work/valocoach-app-coach.webp",
      alt: "ValoCoach mobile app, AI coach screen with a performance rating, a recommended agent and agent context.",
      label: "AI coach",
    },
    {
      src: "/work/valocoach-app-quests.webp",
      alt: "ValoCoach mobile app, Battle Pass screen with seasonal quests and XP rewards.",
      label: "Quests",
    },
  ] as ShowcaseImage[],
  phonesCaption: "Android and iOS. Match analysis, AI coach and quests.",
};

export const platforms: Platform[] = [
  {
    id: "web",
    title: "Web",
    blurb:
      "Free player stats with no account. Sign in for AI match analysis and the AI Battlepass.",
    links: [{ label: "Open web app", href: links.web }],
  },
  {
    id: "mobile",
    title: "Android and iOS",
    blurb:
      "Match analysis, an AI coach, quests and live match tools on your phone.",
    links: [
      { label: "Android", href: links.android },
      { label: "iOS", href: links.ios },
    ],
  },
  {
    id: "windows",
    title: "Windows",
    blurb:
      "Live match tracking with auto-instalock, AI match analysis, a chat with your AI coach, the daily store, player lookup and rewards.",
    links: [{ label: "Download", href: links.windows }],
  },
];

/**
 * Real numbers from the public stats page for the sample account, copied on the
 * date below. AI analysis on that page needs a sign-in, so the demo shows only
 * what the page shows without one and says so.
 */
export const coachSnapshot = {
  title: "Player insights",
  windowTitle: "valocoach.ai / statistics",
  takenOn: snapshotDate,
  prompt: `search ${sampleAccount.tag} (${sampleAccount.region.toUpperCase()})`,
  rows: [
    { label: "rank", value: "Ascendant 2, 40 RR" },
    { label: "peak", value: "Immortal 1" },
    { label: "KDR", value: "0.93" },
    { label: "HS%", value: "23.0%" },
    { label: "ACS", value: "206" },
    { label: "win rate", value: "57.9%" },
    { label: "best map", value: "Haven" },
    { label: "worst map", value: "Sunset" },
    { label: "top agent", value: "Cypher" },
  ] as SnapshotRow[],
  recentLabel: "last 5",
  recent: [
    { map: "Sunset", score: "13:11" },
    { map: "Corrode", score: "15:13" },
    { map: "Sunset", score: "7:13" },
    { map: "Abyss", score: "13:15" },
    { map: "Corrode", score: "13:11" },
  ] as SnapshotMatch[],
  footer: "AI match analysis unlocks after sign-in.",
  note: `Real numbers from the public stats page, read on ${snapshotDate}. They change as matches are played.`,
  cta: {
    label: `Search ${sampleAccount.tag} on the website`,
    href: links.liveDemo,
  },
};

export const neurowrt = {
  id: "neurowrt",
  eyebrow: "More builds",
  title: "NeuroWRT",
  tagline: "An AI network assistant for OpenWrt routers",
  year: "2025",
  description:
    "Ask your router a question in plain English. NeuroWRT turns it into a command, sends it to the router and shows both the command and the router's answer.",
  askLabel: "Try asking",
  ask: [
    "How many devices are connected right now?",
    "Show me bandwidth usage by IP",
    "Is my router running out of memory?",
  ],
  tags: ["Python", "LangChain", "OpenWrt", "Streamlit"],
  bridge: "Where router firmware meets LLMs.",
  link: { label: "View on GitHub", href: links.neurowrt },
  image: {
    src: "/work/neurowrt-chat.webp",
    width: 1000,
    height: 741,
    alt: "NeuroWRT in the browser. The question 'What is the current routing table?' produces the command route -n and the router's routing table.",
    urlBar: "localhost:8501",
  },
};

// ---------------------------------------------------------------------------
// Story (origin)
// ---------------------------------------------------------------------------

export interface Milestone {
  number: string;
  title: string;
  body: string;
}

export const story = {
  id: "story",
  eyebrow: "Origin",
  title: "How it started.",
  lead: "The best products are built by people who lived the problem.",
  milestones: [
    {
      number: "01",
      title: "The Problem, Live",
      body: "Started as an Iron 2 player with no structured path to improve. Existing content was generic and rarely actionable.",
    },
    {
      number: "02",
      title: "Proving the Pattern",
      body: "Reached Immortal within a year. Improvement follows clear, repeatable patterns - but no product delivered this in a personalized way.",
    },
    {
      number: "03",
      title: "30-Day MVP Launch",
      body: "While learning LangChain, saw the opportunity to build an AI coaching layer for competitive gaming. Launched the MVP fast. Validated strong early demand.",
    },
    {
      number: "04",
      title: "Expert Refinement",
      body: `Worked with ${metrics.coaches} professional coaches to refine the system and introduced a reward-driven engagement loop to improve retention.`,
    },
    {
      number: "05",
      title: "The Platform Vision",
      body: "Valocoach.ai is building the default AI coaching infrastructure for competitive gamers.",
    },
  ] as Milestone[],
};

// ---------------------------------------------------------------------------
// Journey (career)
// ---------------------------------------------------------------------------

export interface JourneyEntry {
  id: string;
  years: string;
  role: string;
  org: string;
  place: string;
  /** Project or product named in the role, shown as a small label. */
  project?: string;
  summary: string;
  /** One standout fact, shown with a marker. */
  highlight?: string;
  tags: string[];
  /** True for roles the owner holds today. */
  current?: boolean;
}

export const journey = {
  id: "journey",
  eyebrow: "Journey",
  title: "From routers to rank-ups.",
  lead: "Almost four years of router firmware, including secure networks for banks and ATMs, came before the AI work.",
  entries: [
    {
      id: "nesecure",
      years: "2019 - 2021",
      role: "Software Engineer",
      org: "Nesecure Telecom",
      place: "Mumbai",
      summary:
        "Firmware for industrial Wi-Fi routers on MediaTek chipsets. Coordinated with the manufacturer on the router hardware design.",
      tags: ["Firmware", "MediaTek", "Wi-Fi"],
    },
    {
      id: "piscis",
      years: "2021 - 2022",
      role: "Software Engineer",
      org: "Piscis Networks",
      place: "Mumbai",
      project: "PI-OS",
      summary:
        "Firmware for industrial CPE routers on MediaTek MT7621, MT7628 and MT7620. Multi-WAN load balancing, IPsec and OpenVPN, OSPF and BGP routing, 4G/5G, a zone-based firewall, URL filtering, ad-block and an SMS gateway.",
      highlight: "Built end-to-end secure networks for banks and ATMs.",
      tags: ["C", "Shell", "Embedded Linux", "OpenWrt"],
    },
    {
      id: "thingularity",
      years: "2022 - 2023",
      role: "Software Engineer",
      org: "Thingularity",
      place: "Bengaluru",
      project: "MinimOS",
      summary:
        "Worked on MinimOS, an OpenWrt-based OS. Updated packages such as Samba, pppd and GnuTLS and added IPv6 support.",
      highlight: "Fixed CVEs including CVE-2020-8597 and CVE-2021-20231.",
      tags: ["OpenWrt", "CVE fixes", "IPv6"],
    },
    {
      id: "neural-stats",
      years: "2023 - now",
      role: "Founder",
      org: "Neural Stats",
      place: "India",
      project: "ValoCoach.ai",
      summary:
        "Building ValoCoach.ai, an AI platform for competitive players that turns match data into coaching. Product strategy, model development and full-stack engineering across data pipelines, gameplay intelligence and the apps. Now scaling AI insights for Valorant players and building quest-based improvement loops.",
      tags: ["Python", "LangChain", "FastAPI"],
      current: true,
    },
    {
      id: "aadvik",
      years: "2026 - now",
      role: "Principal Engineer",
      org: "Aadvik TekLabs",
      place: "Agra",
      summary:
        "Leading end-to-end AI product development, from business requirements to building and launching products that generate revenue.",
      tags: [],
      current: true,
    },
  ] as JourneyEntry[],
  /** Side card that links the router work to the AI work. */
  bridge: {
    eyebrow: "Where the two meet",
    title: neurowrt.title,
    text: `${neurowrt.tagline}. ${neurowrt.bridge}`,
    label: "See the project",
    href: `#${neurowrt.id}`,
  },
  nowLabel: "Now",
};

// ---------------------------------------------------------------------------
// About, credentials and stack
// ---------------------------------------------------------------------------

export interface Credential {
  badge: string;
  name: string;
}

export const about = {
  eyebrow: "About",
  titleLines: ["The person", "behind the product."],
  paragraphs: [
    "I'm an AI Engineer and founder who builds at the intersection of artificial intelligence and competitive gaming. My edge: I'm not just a developer analyzing data - I was the player who needed the product.",
    "I went from Iron 2 to Immortal by finding the patterns that everyone else missed. Then I built the system that delivers those patterns to every player, personalized.",
    "I ship faster when it's related to games. That's not a fun fact - it's a product strategy.",
  ],
  buildingLabel: "Currently building with",
  building: ["Agentic AI", "Deep Learning", "LangGraph", "LangChain"],
  quote: "Build fast. Learn faster. Play to win.",
  githubLabel: "GitHub Contributions",
  githubUser: "mrsagarjain1",
};

export const stack = {
  eyebrow: "Tech Stack",
  title: "How I build.",
  lead: "Focused on AI backends that power real products at scale. Every tool is chosen because it ships faster and holds up under load.",
  items: [
    { name: "Python", category: "Language" },
    { name: "FastAPI", category: "Backend" },
    { name: "LangChain", category: "AI" },
    { name: "LangGraph", category: "AI" },
    { name: "MongoDB", category: "Database" },
    { name: "Redis", category: "Cache" },
    { name: "Vector DB", category: "AI" },
    { name: "RAG", category: "AI" },
  ],
};

export const credentials = {
  title: "Credentials",
  certifications: [
    { badge: "RHCSA", name: "Red Hat Certified System Administrator" },
    {
      badge: "CCNA",
      name: "Cisco Certified Network Associate, Routing and Switching",
    },
    { badge: "Python", name: "Introduction to Programming Using Python" },
  ] as Credential[],
  education: {
    badge: "BCA",
    name: "Bachelor's in Computer Applications, Computer Science",
    school: "Apex Professional University",
    years: "2018 - 2021",
  },
};

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------

export const contact = {
  id: "contact",
  eyebrow: "Contact",
  title: "Let's build something.",
  lead: "Open to collaborating on AI products, gaming tech, and esports platforms.",
  emailLabel: "Email",
  socials: [
    { label: "LinkedIn", href: links.linkedin },
    { label: "GitHub", href: links.github },
    { label: "X", href: links.x },
  ],
  footerLeft: `${site.name} · ${site.year}`,
  footerRight: about.quote,
};

// ---------------------------------------------------------------------------
// Hover preview (card that follows the pointer over valocoach links)
// ---------------------------------------------------------------------------

export interface PreviewData {
  title: string;
  description: string;
  stats: string[];
}

export const previews: Record<string, PreviewData> = {
  valocoach: {
    title: "valocoach.ai",
    description:
      "AI coaching dashboard with real-time match analysis, personalized quests, and agent-specific insights.",
    stats: [
      `${metrics.users} Users`,
      `${metrics.impressions} Impressions/mo`,
      `${metrics.downloads} App Downloads`,
      `${metrics.coaches} Coaches`,
    ],
  },
};

// ---------------------------------------------------------------------------
// Search, share cards and structured data
// ---------------------------------------------------------------------------

export const seo = {
  title: "Sagar Jain | Applied AI Engineer & Founder of valocoach.ai",
  description: `Applied AI Engineer. Founder of valocoach.ai (${metrics.users} users) and Principal Engineer at Aadvik TekLabs. From router firmware for banks and ATMs to LLM products.`,
  openGraphDescription: `Sagar Jain, Applied AI Engineer. Founder of valocoach.ai with ${metrics.users} users and ${metrics.impressions} monthly impressions. Principal Engineer at Aadvik TekLabs. Earlier: router firmware for banks and ATMs.`,
  twitterTitle: "Sagar Jain | Applied AI Engineer",
  twitterDescription:
    "Applied AI Engineer, founder of valocoach.ai and Principal Engineer at Aadvik TekLabs. Building the default AI coaching infrastructure for competitive gamers.",
  siteName: "Sagar Jain — Portfolio",
  twitterHandle: "@mrsagarjain1",
  keywords: [
    "Sagar Jain",
    "sagar jain portfolio",
    "mrsagarjain",
    "Applied AI Engineer",
    "Principal Engineer",
    "AI Developer",
    "valocoach.ai",
    "valocoach",
    "Aadvik TekLabs",
    "AI Engineer India",
    "Sagar Jain AI",
    "Sagar Jain developer",
    "Software Engineer",
    "Machine Learning",
    "LangChain developer",
    "OpenWrt",
    "competitive gaming AI",
    "Portfolio",
  ],
  knowsAbout: [
    "Artificial Intelligence",
    "Machine Learning",
    "LangChain",
    "Python",
    "FastAPI",
    "OpenWrt",
    "Embedded Linux",
    "Computer Networking",
    "Competitive Gaming",
  ],
  /** Role line shown on the generated share card. */
  shareCardRoles: [
    "Founder, valocoach.ai",
    "Principal Engineer, Aadvik TekLabs",
  ],
};
