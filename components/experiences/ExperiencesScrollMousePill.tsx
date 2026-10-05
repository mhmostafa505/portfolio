import { Dispatch, SetStateAction } from "react";

interface ExperiencesScrollMousePillType {
  setIntroDone: Dispatch<SetStateAction<boolean>>;
  isBouncing: boolean;
  introDone: boolean;
  introStarted: boolean;
  dotTop: number;
}

const ExperiencesScrollMousePill = ({
  setIntroDone,
  isBouncing,
  introDone,
  introStarted,
  dotTop,
}: ExperiencesScrollMousePillType) => {
  return (
    <div
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setIntroDone(true);
      }}
      data-cursor="help"
      className={`group absolute left-1/2 -translate-x-1/2 z-10 transition-[width,border-radius,border-color,background-color,box-shadow] duration-500 ease-out max-sm:left-5 ${
        isBouncing
          ? `w-8 h-14 rounded-full border-[1.5px] border-primary-yellow bg-transparent cursor-help  ${
              introDone
                ? ""
                : introStarted
                  ? "animate-[pillIntro_1.0s_cubic-bezier(.4,0,.2,1)_both]"
                  : "opacity-0"
            }`
          : "w-8 h-8 rounded-full border-transparent bg-primary-yellow animate-[neonFlicker_1.4s_ease-in-out_infinite]"
      }`}
      style={{ top: dotTop - 16 }}
    >
      {/* Scroll-Mouse Wheel */}
      <div
        className={`absolute left-1/2 top-2.25 ml-[-1.5px] h-2.5 w-0.75 transition-opacity duration-300 ${
          isBouncing && introDone ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          className={`h-full w-full rounded-full bg-primary-yellow ${
            isBouncing ? "animate-[wheelBounce_1.2s_ease-in-out_infinite]" : ""
          }`}
        />
      </div>

      {/* Scroll-Mouse Hover Tooltip */}
      {isBouncing && introDone && (
        <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-x-1.5 -translate-y-1/2 whitespace-nowrap rounded-[10px] border border-primary-purple bg-white/5 px-3 py-1.5 text-[0.82rem] font-semibold text-primary-white opacity-0 backdrop-blur-md transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          {/* little arrow pointing back at the pill */}
          <span className="absolute -left-1.25 top-1/2 -mt-1 h-2 w-2 rotate-45 border-b border-l border-primary-purple bg-[#101312]" />
          Scroll?
        </div>
      )}
    </div>
  );
};

export default ExperiencesScrollMousePill;
