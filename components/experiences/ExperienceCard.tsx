import { useState } from "react";
import ParticleFlock from "./ParticleFlock";
import { experienceItem } from "@/types/experienceTypes";

interface ExperienceCardType {
  children: React.ReactNode;
  item: experienceItem;
  setItemRef: (index: number, element: HTMLDivElement | null) => void;
  isLeft: boolean;
  isVisible: boolean;
  index: number;
}

const ExperienceCard = ({
  children,
  item,
  setItemRef,
  isLeft,
  isVisible,
  index,
}: ExperienceCardType) => {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePosition, setMousePosition] = useState({
    x: -999,
    y: -999,
  });

  return (
    <div
      ref={(el) => {
        setItemRef(index, el);
      }}
      className={`relative w-full pb-20 cursor-default transition-all duration-500 last:pb-0 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
      }
        `}
    >
      <div
        className={`group relative w-1/2 max-sm:w-full max-sm:pl-11 max-sm:pr-0 max-sm:text-left ${
          isLeft ? "left-0 pr-10 text-right" : "left-1/2 pl-10 text-left"
        } max-sm:left-0`}
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

        {/* Card Hover: Card Border Glow + Particle Flock */}
        <div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();

            setMousePosition({
              x: e.clientX - rect.left,
              y: e.clientY - rect.top,
            });

            e.currentTarget.style.setProperty(
              "--mx",
              `${e.clientX - rect.left}px`,
            );
            e.currentTarget.style.setProperty(
              "--my",
              `${e.clientY - rect.top}px`,
            );
          }}
          className={`${
            isHovering
              ? "border-primary-hover shadow-[0_8px_30px_rgba(23,241,209,0.15)] -translate-y-0.5"
              : "border-[#17f1d199]"
          } group relative inline-block max-w-full overflow-hidden rounded-2xl border-2 p-5 text-left transition-[border-color,box-shadow,translate] duration-300`}
          style={{
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <ParticleFlock
            isHovering={isHovering}
            mousePosition={mousePosition}
          />

          {/* Card Content */}
          <div className="relative pointer-events-none">
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-primary-yellow">
              {item.date}
            </div>
            <h3 className="mb-1 text-lg font-semibold text-primary-white">
              {item.title}
            </h3>
            <div className="mb-2 text-sm text-primary-purple">{item.role}</div>
            <p className="text-sm leading-relaxed text-neutral-300">
              {item.description}
            </p>
          </div>
        </div>
      </div>

      {/* Card Icons */}
      <div
        className={`${isLeft ? "right-50 pr-10 text-left" : "left-50 pl-10 text-right"} absolute top-0`}
      >
        {children}
      </div>
    </div>
  );
};

export default ExperienceCard;
