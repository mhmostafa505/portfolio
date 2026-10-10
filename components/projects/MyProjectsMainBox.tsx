import MyProjectsBrowserBar from "./MyProjectsBrowserBar";
import MyProjectsListItem from "./MyProjectsListItem";
import MyProjectsItemDetails from "./MyProjectItemDetails";
import { MyProjectsMainBoxType } from "@/types/myProjectsTypes";

const MyProjectsMainBox = ({
  boxRef,
  theme,
  themes,
  project,
  projects,
  pad,
  WHEEL_GAP,
  MAGNET,
  MAGNET_RADIUS,
  MAGNET_PULL,
  intro,
  typeText,
  isPlaying,
  BOX_HEIGHT,
  active,
  SCROLL_LOCK,
  handleSelect,
  handleMagnetMove,
  stackRef,
  resetMagnet,
  trackRef,
  setActive,
  getStep,
  stageRef,
  navTarget,
  navTimer,
}: MyProjectsMainBoxType) => {
  return (
    <div
      ref={boxRef}
      className={`${theme.glow} ${intro === "pre" ? "opacity-0" : ""} ${isPlaying ? "is-intro" : ""} pointer-events-auto relative grid w-full max-w-5xl grid-rows-[48px_1fr] overflow-hidden rounded-xl border border-primary-white/10 bg-primary-bg shadow-[0_24px_70px_-28px] transition-shadow duration-500`}
      style={{ height: BOX_HEIGHT }}
    >
      {/* Browser bar: dots, project type, counter */}
      <MyProjectsBrowserBar
        theme={theme}
        typeText={typeText}
        pad={pad}
        active={active}
        projects={projects}
      />

      <div className="grid min-h-0 grid-cols-[150px_1fr] md:grid-cols-[340px_1fr]">
        {/* Drum wheel */}
        <div className="relative overflow-hidden border-r border-primary-white/10">
          {/* Selection band */}
          <div
            className={`${theme.line} intro-band pointer-events-none absolute inset-x-0 top-1/2 h-19 -translate-y-1/2 border-y transition-colors duration-500`}
          />

          {/* Project List */}
          {projects.map((item, i) => {
            const offset = i - active.index;
            const distance = Math.abs(offset);

            return (
              <MyProjectsListItem
                key={item.name}
                i={i}
                item={item}
                handleSelect={handleSelect}
                active={active}
                SCROLL_LOCK={SCROLL_LOCK}
                trackRef={trackRef}
                setActive={setActive}
                getStep={getStep}
                stageRef={stageRef}
                navTarget={navTarget}
                navTimer={navTimer}
                offset={offset}
                WHEEL_GAP={WHEEL_GAP}
                distance={distance}
                themes={themes}
                pad={pad}
              />
            );
          })}
        </div>

        {/* Project details */}
        <div
          onMouseMove={(e) =>
            handleMagnetMove({
              e,
              stackRef,
              MAGNET,
              MAGNET_RADIUS,
              MAGNET_PULL,
            })
          }
          onMouseLeave={() => resetMagnet(stackRef)}
          className="intro-view min-h-0 overflow-hidden p-4 md:px-10 md:py-9"
        >
          <MyProjectsItemDetails
            project={project}
            active={active}
            theme={theme}
            stackRef={stackRef}
          />
        </div>
      </div>
    </div>
  );
};

export default MyProjectsMainBox;
