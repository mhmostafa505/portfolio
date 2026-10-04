"use client";
import SectionTitle from "./SectionTitle";
import ThreeFlipPills from "./ThreeFlipPills";
import useInView from "@/hooks/useInView";
import { EASE } from "@/content/ease";

interface SectionHeaderType {
  pills: string[];
  activePillsIndex: number | null;
  setActivePillsIndex: React.Dispatch<React.SetStateAction<number | null>>;
  color: string;
  title: string;
  number: number;
  isReverse: boolean;
}

const SectionHeader = ({
  pills,
  activePillsIndex,
  setActivePillsIndex,
  color,
  title,
  number,
  isReverse,
}: SectionHeaderType) => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.9 });

  return (
    <div
      ref={ref}
      className={`flex ${isReverse ? "flex-row-reverse" : ""} justify-between items-center my-15`}
    >
      {/* Title: wipe-reveal, fires first */}
      <SectionTitle
        inView={inView}
        EASE={EASE}
        color={color}
        title={title}
        number={number}
      />

      {/* Pills: slide up, staggered, after the title */}
      <div className="flex items-center gap-12 mr-15">
        {pills.map((text, i) => (
          <div
            key={text}
            style={{
              opacity: inView ? 1 : 0,
              transform: inView ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.6s ${EASE}`,
              transitionDelay: `${0.5 + i * 0.12}s`,
            }}
          >
            <ThreeFlipPills
              key={text}
              text={text}
              flipped={activePillsIndex === i}
              onClick={() =>
                setActivePillsIndex((prev) => (prev === i ? null : i))
              }
              color={color}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionHeader;
