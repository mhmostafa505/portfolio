import type { LayoutMode, LayoutPreset, Rgb, Skill } from "@/types/skillsTypes";

// Main Data
export const SKILLS: Skill[] = [
  { id: "html", name: "HTML5", src: "/skills/html5.svg", color: "#E34F26" },
  { id: "css", name: "CSS3", src: "/skills/css3.svg", color: "#1572B6" },
  {
    id: "javascript",
    name: "JavaScript",
    src: "/skills/javascript.svg",
    color: "#F7DF1E",
  },
  {
    id: "typescript",
    name: "TypeScript",
    src: "/skills/typescript.svg",
    color: "#3178C6",
  },
  {
    id: "react",
    name: "React",
    src: "/skills/react.svg",
    color: "#61DAFB",
    hero: true,
  },
  {
    id: "next",
    name: "Next.js",
    src: "/skills/nextjs.svg",
    color: "#FFFFFF",
    invert: true,
  },
  {
    id: "tailwind",
    name: "Tailwind",
    src: "/skills/tailwindcss.svg",
    color: "#06B6D4",
  },
  { id: "docker", name: "Docker", src: "/skills/docker.svg", color: "#2496ED" },
  { id: "git", name: "Git", src: "/skills/git.svg", color: "#F05032" },
  { id: "vite", name: "Vite", src: "/skills/vitejs.svg", color: "#646CFF" },
  {
    id: "figma",
    name: "Figma",
    src: "/skills/figma.svg",
    color: "#F24E1E",
    labelColors: ["#F24E1E", "#FF7262", "#A259FF", "#1ABCFE", "#0ACF83"],
  },
  {
    id: "adobexd",
    name: "Adobe XD",
    src: "/skills/adobexd.svg",
    color: "#FF61F6",
    tint: "#FF61F6",
  },
];

/* Icon sampling */
export const SAMPLE_SIZE = 80;
export const SAMPLE_STEP = 2;
export const ALPHA_THRESHOLD = 140;

/* Opening sequence */
export const INTRO = {
  start: 0.6, // seconds before the first slam
  slot: 0.19, // max seconds per icon
  minSlot: 0.07, // with lots of skills the slots shrink...
  budget: 2.4, // ...so all non-hero icons together never take longer than this
  heroSlot: 0.55, // seconds for the hero (last) icon
  slamSpread: 0.12,
  liveDelay: 0.6,
};

/* Dust physics */
export const SPRING = {
  slam: { k: 260, damp: 28 },
  fly: { k: 55, damp: 9, duration: 0.9 },
  live: { k: 70, damp: 11 },
};
export const POINTER = { radius: 70, strength: 2200 };

/* Hover and idle motion */
export const HOVER = { scale: 1.35, dimAlpha: 0.3, floatSlowdown: 0.15 };
export const FLOAT = {
  amplitude: 6,
  rotation: 0.052,
  period: 6.4,
  periodStep: 0.8,
};

/* Starfield */
export const STAR: {
  base: Rgb;
  warpSpeed: number;
  idleSpeed: number;
  hoverSpeed: number;
} = {
  base: [255, 255, 227],
  warpSpeed: 3,
  idleSpeed: 0.06,
  hoverSpeed: 0.9,
};

// Stage heights. navOffset = the height of your fixed navbar in px
export const STAGE = {
  navOffset: 96, // icons are centered in the space BELOW this
  introHeight: "max(100svh, 520px)", // while the intro plays
  settledHeight: "min(100svh, 760px)", // after the intro
};

// Scroll behavior of the intro
export const SCROLL = {
  enterRatio: 0.5, // how much of the stage must be on screen before the intro can start
  idleMs: 150, // the page must stop scrolling this long first (fast scrolling never triggers it)
  duration: 800, // ms of the auto-scroll that aligns the stage
  tolerance: 6, // px; closer than this counts as aligned
};

export const LAYOUT_PRESETS: Record<LayoutMode, LayoutPreset> = {
  desktop: { baseSize: 60, gap: 34, marginX: 70, marginY: 60, maxIconPx: 92 },
  mobile: { baseSize: 46, gap: 24, marginX: 46, marginY: 50, maxIconPx: 56 },
};

// Where the icons live inside the full-width stage
export const CONTENT = { widthRatio: 0.94, heightRatio: 0.7, maxWidth: 1800 };

// Change this number to get a different random arrangement
export const LAYOUT_SEED = 7;

// How many arrangements are tried. The most balanced one wins
export const LAYOUT_ATTEMPTS = 60;

// How strongly icons are evened out before scoring (0 = fully random, 6 = nicely spread)
export const LAYOUT_EVENNESS = 6;

// Sizes cycle through these so icons don't look like a flat grid
export const DEPTHS = [0.92, 1.05, 0.95, 1, 0.9, 1.08];
export const HERO_DEPTH = 1.3;

/* Hover name (the spark writer) */
export const LABEL = {
  size: 28, // px at the normal icon size
  weight: 700, // bold letters keep the holes in "e" and "a" open
  gap: 28, // space between the icon and the top (or bottom) of the letters
  dotStep: 1.5, // distance between particles, in px (smaller = denser)
  dotSize: 1.6, // size of one particle, in px
  approach: 0.15, // seconds for the spark to fly from the icon to the first letter
  duration: 0.85, // seconds to write the whole name
  eraseSpeed: 3.2, // erasing is this many times faster than writing
  sparksPerSecond: 120,
  sparkLife: 0.45,
};
