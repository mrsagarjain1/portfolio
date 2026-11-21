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

/** Headline numbers for valocoach.ai. Edit here and every page, meta tag and share card follows. */
export const metrics = {
  users: "25K+",
  impressions: "1M+",
  downloads: "3K+",
  coaches: "100+",
} as const;

export const links = {
  valocoach: "https://valocoach.ai/",
  web: "https://www.valocoach.ai/",
  android: "https://play.google.com/store/apps/details?id=com.valocoachai",
  ios: "https://apps.apple.com/us/app/valocoach-ai/id6781956574",
  windows: "https://github.com/mrsagarjain1/valocoach-desktop/releases/latest",
  neurowrt: "https://github.com/mrsagarjain1/neurowrt",
  ragEmbeddings: "https://github.com/mrsagarjain1/rag-embeddings",
  pdfReader: "https://github.com/mrsagarjain1/AI-PDF-Reader",
  iotGateway: "https://github.com/mrsagarjain1/IOT-GATEWAY",
  libpcap: "https://github.com/mrsagarjain1/libpcap",
  linkedin: "https://www.linkedin.com/in/mrsagarjain1/",
  github: "https://github.com/mrsagarjain1",
  x: "https://x.com/mrsagarjain1",
} as const;

// ---------------------------------------------------------------------------
// Navigation and page titles
// ---------------------------------------------------------------------------

export interface NavLink {
  label: string;
  href: string;
}

export const navLinks: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
];

/** Section ids in page order, with the label shown by the side dots. */
export const sections = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
] as const;

/** Browser tab title while each section is on screen. */
export const sectionTitles: Record<string, string> = {
  hero: "Sagar Jain | Applied AI Engineer",
  about: "Sagar Jain | About",
  projects: "Sagar Jain | Projects",
  experience: "Sagar Jain | Experience",
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
  detail:
    "I build AI products end to end, from data pipelines and models to the apps people use.",
  primaryCta: { label: "View projects", sectionId: "projects" },
  secondaryCta: { label: "Get in touch", sectionId: "contact" },
  photo: { src: "/headshot.jpg", alt: "Sagar Jain" },
};

// ---------------------------------------------------------------------------
// About and skills
// ---------------------------------------------------------------------------

export interface SkillGroup {
  name: string;
  items: string[];
}

export const about = {
  id: "about",
  eyebrow: "About",
  title: "About me",
  paragraphs: [
    "I'm an AI engineer and founder. I turn ideas into products people use, from data pipelines and LLM workflows to the apps on top.",
    "Before AI I spent almost four years writing firmware for routers, including secure networks for banks and ATMs.",
    "I like building for problems I know first-hand. I went from Iron 2 to Immortal in Valorant, then built the AI coaching platform I wished I'd had.",
  ],
  buildingLabel: "Currently building with",
  building: ["Agentic AI", "Deep Learning", "LangGraph", "LangChain"],
  githubLabel: "GitHub activity",
};

export const skills = {
  title: "Skills",
  groups: [
    {
      name: "AI and LLMs",
      items: ["LangChain", "LangGraph", "RAG", "Vector databases", "Prompt engineering"],
    },
    {
      name: "Backend and data",
      items: ["Python", "FastAPI", "MongoDB", "Redis", "APIs"],
    },
    {
      name: "Apps",
      items: ["Next.js", "React", "Flutter"],
    },
    {
      name: "Networking and embedded",
      items: ["C", "Shell", "Embedded Linux", "OpenWrt", "IPsec", "BGP and OSPF"],
    },
  ] as SkillGroup[],
};

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export interface ProjectLink {
  label: string;
  href: string;
}

export interface ShowcaseImage {
  src: string;
  alt: string;
}

export interface ProjectImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  urlBar: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  year: string;
  description: string;
  tags: string[];
  links: ProjectLink[];
  /** A screenshot makes the card wide, with the picture beside the text. */
  image?: ProjectImage;
}

/** Date the public stats page was captured for the web screenshot. */
export const snapshotDate = "20 Nov 2026";

/** Product visuals for the featured project. Add an image by dropping the file in public/work and listing it here. */
export const showcase = {
  web: {
    src: "/work/valocoach-web-stats.webp",
    width: 1891,
    height: 931,
    alt: "valocoach.ai player statistics page for the sample account venator#fear: KDR, headshot rate, ACS, win rate, current and peak rank, best and worst maps, and top agent.",
    urlBar: "valocoach.ai/statistics",
  },
  phones: [
    {
      src: "/work/valocoach-app-replay.webp",
      alt: "ValoCoach mobile app, replay tab for a Breeze victory: a 2D map with player positions, a round selector and an event log of kills.",
    },
    {
      src: "/work/valocoach-app-home.webp",
      alt: "ValoCoach mobile app, home screen with a player lookup box, a region picker and a premium Advanced Match Intelligence card.",
    },
  ] as ShowcaseImage[],
  caption: `Web app and mobile app. The web screenshot is a capture of the public stats page from ${snapshotDate}.`,
};

export const projects = {
  id: "projects",
  eyebrow: "Projects",
  title: "Things I've built.",
  lead: "A product with real users, then smaller builds across AI and networking.",
  featuredLabel: "Featured",
  featured: {
    title: "valocoach.ai",
    tagline: "AI coaching for competitive Valorant players",
    description:
      "AI-powered coaching platform that gives every competitive Valorant player access to personalized, data-driven improvement - the kind previously reserved for pro teams.",
    stats: [
      { value: metrics.users, label: "Users" },
      { value: metrics.impressions, label: "Monthly impressions" },
      { value: metrics.downloads, label: "App downloads" },
      { value: metrics.coaches, label: "Pro coaches consulted" },
    ] as Metric[],
    tags: ["Python", "FastAPI", "LangChain", "MongoDB", "Redis", "Vector DB", "Next.js", "Flutter"],
    links: [
      { label: "Open web app", href: links.web },
      { label: "Android", href: links.android },
      { label: "iOS", href: links.ios },
      { label: "Windows", href: links.windows },
    ] as ProjectLink[],
  },
  items: [
    {
      id: "neurowrt",
      title: "NeuroWRT",
      tagline: "An AI network assistant for OpenWrt routers",
      year: "2025",
      description:
        "Ask your router a question in plain English. NeuroWRT turns it into a command, sends it to the router and shows both the command and the router's answer.",
      tags: ["Python", "LangChain", "OpenWrt", "Streamlit"],
      links: [{ label: "GitHub", href: links.neurowrt }],
      image: {
        src: "/work/neurowrt-chat.webp",
        width: 1000,
        height: 741,
        alt: "NeuroWRT in the browser. The question 'What is the current routing table?' produces the command route -n and the router's routing table.",
        urlBar: "localhost:8501",
      },
    },
    {
      id: "rag-pipeline",
      title: "RAG pipeline with Pinecone",
      tagline: "Retrieval-augmented generation, end to end",
      year: "2025",
      description:
        "Load documents, split them into chunks, embed them, store the vectors in Pinecone and retrieve the right context for an LLM.",
      tags: ["Python", "LangChain", "Pinecone", "RAG"],
      links: [{ label: "GitHub", href: links.ragEmbeddings }],
    },
    {
      id: "pdf-reader",
      title: "AI PDF Reader",
      tagline: "Ask questions about a PDF",
      year: "2025",
      description:
        "Reads documents with LangChain's PyPDFLoader and answers questions about their content in plain language.",
      tags: ["Python", "LangChain"],
      links: [{ label: "GitHub", href: links.pdfReader }],
    },
    {
      id: "iot-gateway",
      title: "MQTT IoT gateway",
      tagline: "A bridge between local devices and a broker",
      year: "2023",
      description:
        "A prototype gateway with protocol translation, topic routing, optional preprocessing, TLS and offline buffering.",
      tags: ["Python", "MQTT", "IoT"],
      links: [{ label: "GitHub", href: links.iotGateway }],
    },
    {
      id: "libpcap",
      title: "Packet capture with libpcap",
      tagline: "Network packets on Linux, in C",
      year: "2022",
      description:
        "Captures packets on Linux devices with libpcap, following the Stanford libpcap tutorial.",
      tags: ["C", "libpcap", "Linux"],
      links: [{ label: "GitHub", href: links.libpcap }],
    },
  ] as Project[],
};

// ---------------------------------------------------------------------------
// Experience and credentials
// ---------------------------------------------------------------------------

export interface ExperienceEntry {
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

export const experience = {
  id: "experience",
  eyebrow: "Experience",
  title: "Where I've worked.",
  lead: "Router firmware first, then AI products.",
  nowLabel: "Now",
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
  ] as ExperienceEntry[],
};

export interface Credential {
  badge: string;
  name: string;
}

export const credentials = {
  title: "Certifications and education",
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
  footerRight: "Build fast. Learn faster. Play to win.",
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
