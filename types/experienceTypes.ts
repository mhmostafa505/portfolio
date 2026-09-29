export type DiffLine = { type: "add" | "rem" | "ctx"; text: string };

export interface experienceItem {
  date: string;
  title: string;
  role: string;
  description: string;
}

export interface experienceContentsType {
  diffPattern: DiffLine[];
  experienceItems: experienceItem[];
  CUE_TO_TRAVELER_THRESHOLD: number;
  TRIGGER: number;
  DOT_LERP_FACTOR: number;
}
