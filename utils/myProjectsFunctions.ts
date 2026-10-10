import {
  OnScrollFunctionType,
  HandleSelectFunctionType,
  HandleMagnetMoveFunctionType,
} from "@/types/myProjectsTypes";

export const onScroll = ({
  trackRef,
  getStep,
  stageRef,
  projects,
  navTarget,
  navTimer,
  setActive,
}: OnScrollFunctionType) => {
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
}: HandleSelectFunctionType) => {
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

// Magnet Function Stack Tags: pull every stack tag toward the mouse, stronger the closer it is
export const handleMagnetMove = ({
  e,
  stackRef,
  MAGNET,
  MAGNET_RADIUS,
  MAGNET_PULL,
}: HandleMagnetMoveFunctionType) => {
  if (!MAGNET || !stackRef.current) return;

  for (const wrapper of Array.from(
    stackRef.current.children,
  ) as HTMLElement[]) {
    const tag = wrapper.firstElementChild as HTMLElement | null;
    if (!tag) continue;

    // The wrapper never moves, so the distance is always measured from the tag's resting spot
    const rect = wrapper.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const distance = Math.hypot(dx, dy) || 1;
    const pull =
      distance < MAGNET_RADIUS
        ? (1 - distance / MAGNET_RADIUS) * MAGNET_PULL
        : 0;

    tag.style.transform = pull
      ? `translate(${(dx / distance) * pull}px, ${(dy / distance) * pull}px)`
      : "";
  }
};

// Magnet Function Stack Tags: reset magnetic effect on hover
export const resetMagnet = (
  stackRef: React.RefObject<HTMLDivElement | null>,
) => {
  if (!stackRef.current) return;

  for (const wrapper of Array.from(
    stackRef.current.children,
  ) as HTMLElement[]) {
    const tag = wrapper.firstElementChild as HTMLElement | null;
    if (tag) tag.style.transform = "";
  }
};
