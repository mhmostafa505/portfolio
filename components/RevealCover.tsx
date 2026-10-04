interface RevealCoverType {
  inView: boolean;
  EASE: string;
  color: string;
}

const RevealCover = ({ inView, EASE, color }: RevealCoverType) => {
  return (
    <div
      className={`bg-${color} absolute inset-0 pointer-events-none`}
      style={{
        transformOrigin: "right",
        transform: inView ? "scaleX(0)" : "scaleX(1)",
        transition: `transform 0.8s ${EASE}`,
        transitionDelay: "0.3s",
      }}
    ></div>
  );
};

export default RevealCover;
