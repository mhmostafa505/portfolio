import AboutRevealCover from "./AboutRevealCover";
import { AboutIsRevealedEASEType } from "@/types/aboutTypes";
import { FaQuoteRight } from "react-icons/fa";

const AboutTitle = ({ isRevealed, EASE }: AboutIsRevealedEASEType) => {
  return (
    <div className="relative overflow-hidden pr-10 py-2">
      <h2
        className="relative text-5xl font-black ml-9.5"
        style={{
          transform: isRevealed ? "translateY(0)" : "translateY(110%)",
          transition: `transform 0.7s ${EASE}`,
          transitionDelay: "0.1s",
        }}
      >
        <span className="font-mono text-xl text-primary-purple pr-2">01.</span>
        About Me
        <FaQuoteRight
          size={20}
          className="absolute -top-2 -right-8 text-primary-purple"
        />
      </h2>
      <AboutRevealCover isRevealed={isRevealed} EASE={EASE} />
    </div>
  );
};

export default AboutTitle;
