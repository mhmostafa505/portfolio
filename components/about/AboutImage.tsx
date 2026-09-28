import Image from "next/image";
import { IsRevealedEASEType } from "@/types/isRevealedEASEType";
import photo from "@/assets/images/about-me-photo.webp";

const AboutImage = ({ isRevealed, EASE }: IsRevealedEASEType) => {
  return (
    <div
      className="group relative w-103 h-103 rounded-full overflow-hidden border-6 border-primary-hover hover:border-primary-yellow transition-colors duration-500"
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? "scale(1)" : "scale(0.85)",
        transition: `opacity 0.8s ${EASE}, transform 0.8s ${EASE}`,
        transitionDelay: "0.6s",
      }}
    >
      <Image
        src={photo}
        alt="My-Photo"
        fill
        sizes="360px"
        className="object-cover rotate-12 pl-10 pb-17 scale-160"
      />
      {/* scan bar */}
      <div
        className="pointer-events-none absolute inset-x-0 h-5 bg-white/60 blur-sm
               -translate-y-10 transition-transform duration-700 ease-in-out
               group-hover:translate-y-102"
      />
    </div>
  );
};

export default AboutImage;
