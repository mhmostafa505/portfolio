import AboutSpanFlipText from "./AboutSpanFlipText";
import RevealCover from "../RevealCover";
import useInView from "@/hooks/useInView";
import { EASE } from "@/content/ease";

const AboutParagraph = () => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <div ref={ref} className="relative overflow-hidden text-[23px]/relaxed">
      <p
        style={{
          transform: inView ? "translateY(0)" : "translateY(110%)",
          transition: `transform 0.8s ${EASE}`,
          transitionDelay: "0.3s",
        }}
      >
        I&apos;m{" "}
        <strong className="inline-block text-primary-hover hover:-rotate-2 transition-transform duration-200">
          Mohammad Hossein Mostafa
        </strong>
        , a{" "}
        <span className="inline-block group">
          <span className="inline-block text-primary-yellow group-hover:animate-[bounceOnce_0.5s_ease]">
            Front-End Developer
          </span>
        </span>{" "}
        who loves turning ideas into clean, responsive, and genuinely enjoyable
        web experiences. I work mainly with{" "}
        <AboutSpanFlipText text="React" className="text-primary-purple" />,{" "}
        <AboutSpanFlipText text="TypeScript" className="text-primary-hover" />,
        and <AboutSpanFlipText text="Next.js" className="text-primary-yellow" />
        , building projects like a task manager, an e-commerce platform, and a
        Twitter-inspired social app — each one an excuse to sharpen my eye for
        UI/UX and my instinct for reusable, maintainable code. These days
        I&apos;m thinking about exploring animations and 3D web experiences with
        tools like Three.js — and who knows, full-stack development might be
        next!
      </p>
      <RevealCover inView={inView} EASE={EASE} color="primary-purple" />
    </div>
  );
};

export default AboutParagraph;
