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
  { id: "figma", name: "Figma", src: "/skills/figma.svg", color: "#F24E1E" },
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

export const LAYOUT_PRESETS: Record<LayoutMode, LayoutPreset> = {
  desktop: {
    refW: 680,
    baseSize: 64,
    gap: 30,
    marginX: 64,
    marginY: 56,
    minH: 360,
  },
  mobile: {
    refW: 340,
    baseSize: 48,
    gap: 22,
    marginX: 50,
    marginY: 50,
    minH: 480,
  },
};

// Change this number to get a different random arrangement
export const LAYOUT_SEED = 7;

// Where the icons live inside the full-width stage (the canvas itself is full width)
export const CONTENT = { widthRatio: 0.86, heightRatio: 0.74, maxWidth: 1100 };

// Sizes cycle through these so icons don't look like a flat grid
export const DEPTHS = [0.92, 1.05, 0.95, 1, 0.9, 1.08];
export const HERO_DEPTH = 1.3;
