export type LayoutMode = "desktop" | "mobile";
export type Rgb = readonly [number, number, number];

export interface Skill {
  id: string;
  name: string;
  src: string;
  // Official brand color (hover subtitle + star tint)
  color: string;
  // Paint every pixel of a single-color SVG with this color
  tint?: string;
  // Invert pixel colors (for logos that are black on transparent)
  invert?: boolean;
  // The center icon. It loads last, bigger and with a longer slam. Use it on one skill.
  hero?: boolean;
}

export interface LayoutSlot {
  id: string;
  x: number;
  y: number;
  depth: number;
}

export interface LayoutDef {
  refW: number;
  refH: number;
  baseSize: number;
  slots: LayoutSlot[];
}

export interface IconSample {
  ox: number;
  oy: number;
  color: number;
}

export interface Particle {
  icon: number;
  ox: number;
  oy: number;
  color: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  delay: number;
  phase: number;
  ready: boolean;
}

export interface FieldEvents {
  onStart: () => void;
  onSlam: (skill: Skill, order: number) => void;
  onIntroEnd: () => void;
  onHover: (index: number | null) => void;
}

export interface LayoutPreset {
  refW: number;
  baseSize: number;
  gap: number;
  marginX: number;
  marginY: number;
  minH: number;
}

export interface IconState {
  skill: Skill;
  x: number;
  y: number;
  depth: number;
  size: number;
  fp: number;
  block: number;
  slamScale: number;
  slamBlock: number;
  hs: number;
  ia: number;
  tf: number;
  ts: number;
  cur: { x: number; y: number; r: number };
  cos: number;
  sin: number;
  alphaByte: number;
  start: number;
  end: number;
}
