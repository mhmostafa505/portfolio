import type { Dispatch, SetStateAction } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import type { StaticImageData } from "next/image";

export type ThemeColor = "primary-hover" | "primary-yellow" | "primary-purple";

export interface Project {
  name: string;
  image?: StaticImageData;
  type: string;
  description: string;
  stack: string[];
  github: string;
  live: string; // leave "" to hide the "Live demo" button
  color: ThemeColor;
}

export interface MyProjectsContentsType {
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
      tagHover: string;
    }
  >;
  projects: Project[];
  SCROLL_LOCK: boolean;
  SCROLL_PER_PROJECT: number; // vh of scrolling each project gets
  WHEEL_GAP: number; // px between the names in the drum wheel
  BOX_MAX_HEIGHT: number;
  BOX_GAP: number; // px always kept free above and below the box while pinned
  GAP_ABOVE: number; // px between the header and the box before it pins
  GAP_BELOW: number; // px between the box and the next section after it unpins
  INTRO: boolean;
  INTRO_DURATION: number; // ms, must be longer than the last intro animation (about 2s)
  TYPE_DELAY: number; // ms before the address bar starts typing
  TYPE_SPEED: number; // ms per letter
  RETYPE: boolean; // set to false to turn the retype off
  RETYPE_SPEED: number; // ms per letter when the project switches
  RETYPE_CURSOR: number; // ms the cursor stays after the last letter
  MAGNET: boolean; // set to false to remove the magnet hover
  MAGNET_RADIUS: number; // px: how close the mouse must be to pull a tag
  MAGNET_PULL: number; // px: the strongest pull
  pad: (n: number) => string;
}

export interface ScrollHandleSelectFunctionsUsableTypes {
  trackRef: React.RefObject<HTMLDivElement | null>;
  getStep: (track: HTMLElement | null, stage: HTMLElement | null) => number;
  stageRef: React.RefObject<HTMLDivElement | null>;
  navTarget: React.RefObject<number | null>;
  navTimer: React.RefObject<ReturnType<typeof setTimeout> | null>;
  setActive: Dispatch<SetStateAction<{ index: number; direction: number }>>;
}

export interface OnScrollFunctionType extends ScrollHandleSelectFunctionsUsableTypes {
  projects: Project[];
}

export interface HandleSelectFunctionType extends ScrollHandleSelectFunctionsUsableTypes {
  index: number;
  active: { index: number; direction: number };
  SCROLL_LOCK: boolean;
}

export interface HandleMagnetMoveFunctionType {
  e: ReactMouseEvent<HTMLDivElement>;
  stackRef: React.RefObject<HTMLDivElement | null>;
  MAGNET: boolean;
  MAGNET_RADIUS: number;
  MAGNET_PULL: number;
}

export type MyProjectsMainBoxType = ScrollHandleSelectFunctionsUsableTypes & {
  boxRef: React.RefObject<HTMLDivElement | null>;

  theme: MyProjectsContentsType["themes"][ThemeColor];
  themes: MyProjectsContentsType["themes"];

  project: Project;
  projects: Project[];

  pad: MyProjectsContentsType["pad"];
  WHEEL_GAP: MyProjectsContentsType["WHEEL_GAP"];

  MAGNET: MyProjectsContentsType["MAGNET"];
  MAGNET_RADIUS: MyProjectsContentsType["MAGNET_RADIUS"];
  MAGNET_PULL: MyProjectsContentsType["MAGNET_PULL"];

  intro: "pre" | "playing" | "done";
  typeText: string;
  isPlaying: boolean;
  BOX_HEIGHT: string;

  active: { index: number; direction: number };
  SCROLL_LOCK: boolean;

  handleSelect: (args: HandleSelectFunctionType) => void;
  handleMagnetMove: (args: HandleMagnetMoveFunctionType) => void;

  stackRef: React.RefObject<HTMLDivElement | null>;
  resetMagnet: (stackRef: React.RefObject<HTMLDivElement | null>) => void;
};
