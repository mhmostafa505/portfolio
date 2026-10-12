"use client";
import { useEffect, useRef } from "react";

const ICON_BASE_MS = 1700; // length of the whole sequence at normal speed
const ICON_SPEED = 1.5; // 2 = twice as fast, 0.5 = twice as slow  <- change this to test timings
const ICON_BIG_SCALE = 1.55; // size of the big arrow at the end
const ICON_FLY = "15px -15px"; // where the small arrow flies to

// Phases, as a fraction of the whole sequence (0 = start, 1 = end)
const FLY_END = 0.18; // the small arrow has flown away
const SQUARE_START = 0.06; // the square starts to undraw
const SQUARE_END = 0.59; // the square is gone
const SHAFT = [0.58, 0.8]; // the big arrow's shaft draws
const HEAD = [0.7, 0.92]; // the big arrow's head draws

export const useLiveIcon = (watch: string) => {
  const iconRef = useRef<HTMLSpanElement>(null);
  const anims = useRef<Animation[]>([]);

  // "watch" changes when the project changes, because the details are re-created
  useEffect(() => {
    const svg = iconRef.current?.querySelector("svg");
    if (!svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;

    const square = svg.querySelector<SVGPathElement>("path");
    const head = svg.querySelector<SVGPolylineElement>("polyline");
    const shaft = svg.querySelector<SVGLineElement>("line");
    if (!square || !head || !shaft) return;

    // Real stroke lengths, so a stroke can be "undrawn" with dashoffset
    const [sq, hd, sh] = [square, head, shaft].map((p) => p.getTotalLength());
    [square, head, shaft].forEach((p, i) => {
      const length = [sq, hd, sh][i];
      p.style.strokeDasharray = `${length} ${length * 2}`;
      p.style.strokeDashoffset = "0";
    });

    // Both arrow strokes scale from the tip of the arrow
    [head, shaft].forEach((p) => {
      p.style.transformBox = "view-box";
      p.style.transformOrigin = "21px 3px";
    });

    // Small arrow flies away -> big arrow draws itself (from..to) in the same place
    const arrowFrames = (length: number, [from, to]: number[]): Keyframe[] => {
      const hidden = length * 1.05;
      const big = { translate: "0 0", scale: ICON_BIG_SCALE, opacity: 1 };

      return [
        {
          translate: "0 0",
          scale: 1,
          opacity: 1,
          strokeDashoffset: 0,
          offset: 0,
          easing: "cubic-bezier(.5,0,.9,.4)",
        },
        {
          translate: ICON_FLY,
          scale: 1,
          opacity: 0,
          strokeDashoffset: 0,
          offset: FLY_END,
        },
        { ...big, strokeDashoffset: hidden, offset: FLY_END },
        { ...big, strokeDashoffset: hidden, offset: from, easing: "ease-out" },
        { ...big, strokeDashoffset: 0, offset: to },
        { ...big, strokeDashoffset: 0, offset: 1 },
      ];
    };

    // The square undraws slowly and stays gone
    const squareFrames: Keyframe[] = [
      { strokeDashoffset: 0, offset: 0 },
      { strokeDashoffset: 0, offset: SQUARE_START, easing: "ease-in-out" },
      { strokeDashoffset: sq * 1.05, offset: SQUARE_END },
      { strokeDashoffset: sq * 1.05, offset: 1 },
    ];

    // Same duration for all parts, so they rewind together as one timeline
    const options = {
      duration: ICON_BASE_MS / ICON_SPEED,
      fill: "both" as const,
      easing: "linear",
    };

    anims.current = [
      square.animate(squareFrames, options),
      shaft.animate(arrowFrames(sh, SHAFT), options),
      head.animate(arrowFrames(hd, HEAD), options),
    ];
    anims.current.forEach((a) => {
      a.pause();
      a.currentTime = 0;
    });

    return () => anims.current.forEach((a) => a.cancel());
  }, [watch]);

  const playIcon = () =>
    anims.current.forEach((a) => {
      a.playbackRate = 1;
      a.play();
    });

  // Rewind from wherever it is (does nothing if it never started)
  const rewindIcon = () =>
    anims.current.forEach((a) => {
      if (!(Number(a.currentTime ?? 0) > 0) && a.playState !== "running")
        return;
      a.playbackRate = -1;
      a.play();
    });

  return { iconRef, playIcon, rewindIcon };
};
