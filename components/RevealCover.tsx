import { IsRevealedEASEType } from "@/types/isRevealedEASEType";

type RevealCoverType = IsRevealedEASEType & {
  color: string;
};

const RevealCover = ({ isRevealed, EASE, color }: RevealCoverType) => {
  return (
    <div
      className={`bg-${color} absolute inset-0 pointer-events-none`}
      style={{
        transformOrigin: "right",
        transform: isRevealed ? "scaleX(0)" : "scaleX(1)",
        transition: `transform 0.8s ${EASE}`,
        transitionDelay: "0.3s",
      }}
    ></div>
  );
};

export default RevealCover;
