import { Dispatch, SetStateAction } from "react";
import { experienceContents } from "@/content/experiencesContents";

interface updateProgressType {
  timelineRef: React.RefObject<HTMLDivElement | null>;
  completedRef: React.RefObject<boolean>;
  setIsBouncing: Dispatch<SetStateAction<boolean>>;
  setIntroDone: Dispatch<SetStateAction<boolean>>;
  setIntroStarted: Dispatch<SetStateAction<boolean>>;
  targetHeightRef: React.RefObject<number>;
  setVisibleCount: Dispatch<SetStateAction<number>>;
  dotOffsets: number[];
}

const { CUE_TO_TRAVELER_THRESHOLD, TRIGGER } = experienceContents;

export const updateProgress = ({
  timelineRef,
  completedRef,
  setIsBouncing,
  setIntroDone,
  setIntroStarted,
  targetHeightRef,
  setVisibleCount,
  dotOffsets,
}: updateProgressType) => {
  if (!timelineRef || !timelineRef.current) return;
  const el = timelineRef.current;

  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  const total = rect.height;

  const scrolledNow = Math.max(vh * TRIGGER - rect.top, 0);
  const scrolledAtEnd = total;
  const rawFraction =
    scrolledAtEnd > 0 ? Math.min(scrolledNow / scrolledAtEnd, 1) : 1;

  // once the user has scrolled all the way through, lock it at 100%
  if (rawFraction >= 0.999 && window.scrollY > 0) completedRef.current = true;

  const fraction = completedRef.current ? 1 : rawFraction;

  const heightPx = fraction * total;
  setIsBouncing(fraction <= CUE_TO_TRAVELER_THRESHOLD);
  if (fraction > CUE_TO_TRAVELER_THRESHOLD) setIntroDone(true);
  if (rect.top < vh * 0.85) setIntroStarted(true);
  targetHeightRef.current = heightPx;

  setVisibleCount(
    fraction <= CUE_TO_TRAVELER_THRESHOLD
      ? 0
      : dotOffsets.reduce(
          (count, offset) => (heightPx >= offset ? count + 1 : count),
          0,
        ),
  );
};
