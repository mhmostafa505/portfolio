import { AboutIsRevealedEASEType } from "@/types/aboutTypes";

const AboutRevealCover = ({ isRevealed, EASE }: AboutIsRevealedEASEType) => {
  return (
    <div
      className="absolute inset-0 bg-primary-purple pointer-events-none"
      style={{
        transformOrigin: "right",
        transform: isRevealed ? "scaleX(0)" : "scaleX(1)",
        transition: `transform 0.8s ${EASE}`,
        transitionDelay: "0.3s",
      }}
    ></div>
  );
};

export default AboutRevealCover;
