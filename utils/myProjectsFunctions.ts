import {
  Project,
  ScrollHandleSelectFunctionsUsableTypes,
} from "@/types/myProjectsTypes";

interface onScrollFunctionType extends ScrollHandleSelectFunctionsUsableTypes {
  projects: Project[];
}

interface handleSelectFunctionType extends ScrollHandleSelectFunctionsUsableTypes {
  index: number;
  active: { index: number; direction: number };
  SCROLL_LOCK: boolean;
}

export const onScroll = ({
  trackRef,
  getStep,
  stageRef,
  projects,
  navTarget,
  navTimer,
  setActive,
}: onScrollFunctionType) => {
  const track = trackRef.current;
  if (!track) return;

  const step = getStep(track, stageRef.current);
  if (!step) return;

  const progress = -track.getBoundingClientRect().top / step;
  const index = Math.max(
    0,
    Math.min(projects.length - 1, Math.floor(progress)),
  );

  // A click started a smooth scroll: ignore the projects we pass on the way
  if (navTarget.current !== null) {
    if (navTimer.current) clearTimeout(navTimer.current);
    if (index === navTarget.current) {
      navTarget.current = null;
    } else {
      navTimer.current = setTimeout(() => {
        navTarget.current = null;
      }, 200);
    }
    return;
  }

  setActive((prev) =>
    prev.index === index
      ? prev
      : { index, direction: index > prev.index ? 1 : -1 },
  );
};

export const handleSelect = ({
  index,
  active,
  SCROLL_LOCK,
  trackRef,
  setActive,
  getStep,
  stageRef,
  navTarget,
  navTimer,
}: handleSelectFunctionType) => {
  if (index === active.index) return;

  const direction = index > active.index ? 1 : -1;

  if (!SCROLL_LOCK || !trackRef.current) {
    setActive({ index, direction });
    return;
  }

  const step = getStep(trackRef.current, stageRef.current);

  navTarget.current = index;
  if (navTimer.current) clearTimeout(navTimer.current);
  navTimer.current = setTimeout(() => {
    navTarget.current = null;
  }, 1500);

  setActive({ index, direction });
  window.scrollTo({
    top:
      window.scrollY +
      trackRef.current.getBoundingClientRect().top +
      index * step +
      step / 2,
    behavior: "smooth",
  });
};
