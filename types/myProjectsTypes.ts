import { StaticImageData } from "next/image";
import { Dispatch, SetStateAction } from "react";

export type ThemeColor = "primary-hover" | "primary-yellow" | "primary-purple";

export interface Project {
  name: string;
  image: StaticImageData;
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

export interface ScrollHandleSelectFunctionsUsableTypes {
  trackRef: React.RefObject<HTMLDivElement | null>;
  getStep: (track: HTMLElement | null, stage: HTMLElement | null) => number;
  stageRef: React.RefObject<HTMLDivElement | null>;
  navTarget: React.RefObject<number | null>;
  navTimer: React.RefObject<ReturnType<typeof setTimeout> | null>;
  setActive: Dispatch<SetStateAction<{ index: number; direction: number }>>;
}
