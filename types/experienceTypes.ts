export interface experienceItem {
  date: string;
  title: string;
  role: string;
  description: string;
}

export interface experienceContentsType {
  experienceItems: experienceItem[];
  CUE_TO_TRAVELER_THRESHOLD: number;
  TRIGGER: number;
  DOT_LERP_FACTOR: number;
}
