import { Dispatch, SetStateAction } from "react";
import { experienceContents } from "@/content/experiencesContents";

interface updateProgressType {
  timelineRef: React.RefObject<HTMLDivElement | null>;
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
  const fraction =
    scrolledAtEnd > 0 ? Math.min(scrolledNow / scrolledAtEnd, 1) : 1;

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
