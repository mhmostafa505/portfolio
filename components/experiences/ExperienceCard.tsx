import { DiffLine, experienceItem } from "@/types/experienceTypes";

interface ExperienceCardType {
  item: experienceItem;
  setItemRef: (index: number, element: HTMLDivElement | null) => void;
  isLeft: boolean;
  isVisible: boolean;
  diffLines: DiffLine[];
  index: number;
}

const ExperienceCard = ({
  item,
  setItemRef,
  isLeft,
  isVisible,
  diffLines,
  index,
}: ExperienceCardType) => {
  return (
    <div
      key={item.title}
      ref={(el) => {
        setItemRef(index, el);
      }}
      className={`relative w-1/2 pb-20 cursor-default transition-all duration-500 last:pb-0 max-sm:w-full max-sm:pl-11 max-sm:pr-0 max-sm:text-left ${
        isLeft ? "left-0 pr-10 text-right" : "left-1/2 pl-10 text-left"
      } max-sm:left-0 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }`}
    >
      {/* Dot Near Each Card */}
      <div
        className={`absolute top-0.5 h-6 w-6 max-sm:left-3.5 max-sm:right-auto ${
          isLeft ? "-right-3" : "-left-3"
        }`}
      >
        {/* Core Dot*/}
        <div
          className={`absolute inset-0 z-10 rounded-full transition-colors duration-300 ${
            isVisible
              ? "bg-primary-yellow shadow-[0_0_8px_rgba(250,204,21,0.6)]"
              : "bg-neutral-700"
          }`}
        />

        {/* Halo Rings */}
        {isVisible && (
          <>
            <div className="pointer-events-none absolute inset-0 animate-[haloPulse_1.3s_ease-out_infinite] rounded-full border-[1.5px] border-primary-yellow" />
            <div className="pointer-events-none absolute inset-0 animate-[haloPulse_1.3s_ease-out_infinite] rounded-full border-[1.5px] border-primary-yellow [animation-delay:0.65s]" />
          </>
        )}
      </div>

      {/* Card Hover: Card Border Glow + Git-Diff Code Reveal */}
      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty(
            "--mx",
            `${e.clientX - rect.left}px`,
          );
          e.currentTarget.style.setProperty(
            "--my",
            `${e.clientY - rect.top}px`,
          );
        }}
        className="group relative inline-block max-w-full overflow-hidden rounded-2xl border-2 border-[#17f1d199] p-5 text-left backdrop-blur-md transition-[border-color,box-shadow,translate] duration-300 hover:border-primary-hover hover:shadow-[0_8px_30px_rgba(23,241,209,0.15)] hover:-translate-y-0.5"
        style={{
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden whitespace-pre font-mono text-[11px] leading-[1.7] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            WebkitMaskImage:
              "radial-gradient(150px circle at var(--mx, 50%) var(--my, 0%), #000, transparent 75%)",
            maskImage:
              "radial-gradient(150px circle at var(--mx, 50%) var(--my, 0%), #000, transparent 75%)",
          }}
        >
          {diffLines.map((line, i) => (
            <div
              key={i}
              className={
                line.type === "add"
                  ? "text-primary-hover/85"
                  : line.type === "rem"
                    ? "text-red-400/60"
                    : "text-primary-yellow/80"
              }
            >
              {line.type === "add" ? "+ " : line.type === "rem" ? "- " : "  "}
              {line.text}
            </div>
          ))}
        </div>

        {/* Card Content */}
        <div className="relative">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-primary-yellow">
            {item.date}
          </div>
          <h3 className="mb-1 text-base font-semibold text-primary-white">
            {item.title}
          </h3>
          <div className="mb-2 text-sm text-primary-purple">{item.role}</div>
          <p className="text-sm leading-relaxed text-neutral-300">
            {item.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;
