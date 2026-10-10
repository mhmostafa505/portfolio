import {
  HandleSelectFunctionType,
  MyProjectsContentsType,
  Project,
  ScrollHandleSelectFunctionsUsableTypes,
} from "@/types/myProjectsTypes";

interface MyProjectsListItemType extends ScrollHandleSelectFunctionsUsableTypes {
  i: number;
  item: Project;
  handleSelect: (args: HandleSelectFunctionType) => void;
  active: { index: number; direction: number };
  SCROLL_LOCK: boolean;
  offset: number;
  WHEEL_GAP: number;
  distance: number;
  themes: MyProjectsContentsType["themes"];
  pad: MyProjectsContentsType["pad"];
}

const MyProjectsListItem = ({
  i,
  item,
  handleSelect,
  active,
  SCROLL_LOCK,
  trackRef,
  setActive,
  getStep,
  stageRef,
  navTarget,
  navTimer,
  offset,
  WHEEL_GAP,
  distance,
  themes,
  pad,
}: MyProjectsListItemType) => {
  return (
    <button
      type="button"
      onClick={() =>
        // Click on a project name
        handleSelect({
          index: i,
          active,
          SCROLL_LOCK,
          trackRef,
          setActive,
          getStep,
          stageRef,
          navTarget,
          navTimer,
        })
      }
      style={{
        transform: `translateY(calc(-50% + ${offset * WHEEL_GAP}px)) translateX(${distance * distance * -8}px) scale(${1 - distance * 0.14})`,
        opacity: Math.max(0, 1 - distance * 0.42),
        animationDelay: `${1.1 + distance * 0.15}s`,
      }}
      className={`intro-item absolute top-1/2 left-3.5 right-2 flex h-14 origin-left cursor-pointer items-center gap-1.5 text-left text-[15px] font-semibold tracking-tight transition-[transform,opacity,color] duration-500 md:left-7 md:right-3 md:gap-3 md:text-[27px] ${
        i === active.index
          ? themes[item.color].text
          : "text-primary-white/55 hover:text-primary-white"
      }`}
    >
      <span className="font-mono text-[11px] font-normal opacity-65 md:text-[15px]">
        {pad(i + 1)}.
      </span>
      {item.name}
    </button>
  );
};

export default MyProjectsListItem;
