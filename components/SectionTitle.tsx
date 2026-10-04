import RevealCover from "./RevealCover";
import { FaQuoteRight } from "react-icons/fa";

interface SectionTitleType {
  inView: boolean;
  EASE: string;
  color: string;
  title: string;
  number: number;
}

const SectionTitle = ({
  inView,
  EASE,
  color,
  title,
  number,
}: SectionTitleType) => {
  return (
    <div className="relative overflow-hidden pr-10 py-2">
      <h2
        className="relative text-5xl font-black ml-9.5"
        style={{
          transform: inView ? "translateY(0)" : "translateY(110%)",
          transition: `transform 0.7s ${EASE}`,
          transitionDelay: "0.1s",
        }}
      >
        <span className={`text-${color} font-mono text-xl pr-2`}>
          0{number}.
        </span>
        {title}
        <FaQuoteRight
          size={20}
          className={`text-${color} absolute -top-2 -right-8`}
        />
      </h2>
      <RevealCover inView={inView} EASE={EASE} color={color} />
    </div>
  );
};

export default SectionTitle;
