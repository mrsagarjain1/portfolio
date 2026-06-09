# Sagar Jain - Portfolio

A modern, high-performance developer portfolio built with Next.js, Framer Motion, and Tailwind CSS. Featuring a premium "Glassmorphism" aesthetic, cinematic animations, and real-time GitHub contributions.


## 🚀 Features

- **Immersive Intro Sequence**: Cinematic loading screen with orbital particle animations and text reveals.
- **Glassmorphism UI**: Premium frosted-glass cards, navbars, and buttons using advanced backdrop filters.
- **Live GitHub Timeline**: Integrates directly with the GitHub API to show your real commit heatmap.
- **Dynamic Interactions**: Features a magnetic cursor, scroll-velocity blurs, and hover-triggered decrypt effects.
- **Fully Responsive**: Optimized mobile menu with staggered Framer Motion reveal animations.
- **SEO Optimized**: Pre-configured with Next.js Metadata API, sitemaps, and robots.txt.

## 🛠 Tech Stack

**Frontend & UI**
- **Framework**: React, Next.js 14
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Components**: React GitHub Calendar, Custom Canvas Elements

## ⚙️ Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🎨 Customization

### Updating the GitHub Calendar
To show your own GitHub contributions, edit `app/components/GitHubHeatmap.tsx` and change the `username` prop:
```tsx
<GitHubCalendar username="your-github-username" ... />
```

### Theme Colors
The primary brand color is `#6ee7b7` (emerald-300). To change this across the site, update the Tailwind classes or the specific hex codes in the Framer Motion configuration files.

## 📄 License

MIT
