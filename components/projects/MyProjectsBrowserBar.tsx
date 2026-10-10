import {
  MyProjectsContentsType,
  Project,
  ThemeColor,
} from "@/types/myProjectsTypes";

interface MyProjectBrowserBarType {
  theme: MyProjectsContentsType["themes"][ThemeColor];
  typeText: string;
  pad: MyProjectsContentsType["pad"];
  active: { index: number; direction: number };
  projects: Project[];
}

const MyProjectsBrowserBar = ({
  theme,
  typeText,
  pad,
  active,
  projects,
}: MyProjectBrowserBarType) => {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-primary-white/10 bg-primary-white/3 px-3 font-mono text-[11px] tracking-widest text-primary-white/55 md:grid-cols-[1fr_minmax(0,340px)_1fr] md:px-4">
      {/* Browser Dots */}
      <div className="flex gap-1.75">
        <span
          className="intro-dot size-2.5 rounded-full bg-primary-hover md:size-3"
          style={{ animationDelay: "0.1s" }}
        />
        <span
          className="intro-dot size-2.5 rounded-full bg-primary-yellow md:size-3"
          style={{ animationDelay: "0.25s" }}
        />
        <span
          className="intro-dot size-2.5 rounded-full bg-primary-purple md:size-3"
          style={{ animationDelay: "0.4s" }}
        />
      </div>

      <div className="flex items-center justify-center gap-2 truncate rounded-full bg-primary-white/6 px-4 py-1.5 text-xs tracking-wide text-primary-white">
        <span className={`${theme.text} text-[10px] transition-colors`}>●</span>

        {typeText}

        {/* Typing Cursor */}
        <span
          className={`${theme.bg} intro-cursor ml-0.5 inline-block h-3 w-1.75 transition-colors`}
        />
      </div>

      {/* Project Counter */}
      <div className="intro-count justify-self-end uppercase tabular-nums">
        <span className={`${theme.text} transition-colors`}>
          {pad(active.index + 1)}
        </span>{" "}
        / {pad(projects.length)}
      </div>
    </div>
  );
};

export default MyProjectsBrowserBar;
