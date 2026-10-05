export type ThemeColor = "primary-hover" | "primary-yellow" | "primary-purple";

export interface Project {
  name: string;
  type: string;
  description: string;
  stack: string[];
  github: string;
  live: string; // leave "" to hide the "Live demo" button
  color: ThemeColor;
}

export interface myProjectsContentsType {
  themes: Record<
    ThemeColor,
    {
      text: string;
      bg: string;
      border: string;
      tint: string;
      line: string;
      glow: string;
      hover: string;
    }
  >;
  projects: Project[];
}
