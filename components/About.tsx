import Image from "next/image";
import photo from "@/assets/images/about-me-photo.jpg";

const About = () => {
  return (
    <section>
      <h2 className="text-4xl font-bold text-center mt-15 mb-20">About Me</h2>
      <div className="flex justify-center items-center gap-6 mb-10">
        <div className="w-3/5 text-2xl/relaxed">
          <p>
            I&apos;m{" "}
            <strong className="text-primary-hover">
              Mohammad Hossein Mostafa
            </strong>
            , a <span className="text-primary-yellow">Front-End Developer</span>{" "}
            who loves turning ideas into clean, responsive, and genuinely
            enjoyable web experiences. I work mainly with{" "}
            <span className="text-primary-purple">React</span>,{" "}
            <span className="text-primary-hover">TypeScript</span>, and{" "}
            <span className="text-primary-yellow">Next.js</span>, building
            projects like a task manager, an e-commerce platform, and a
            Twitter-inspired social app — each one an excuse to sharpen my eye
            for UI/UX and my instinct for reusable, maintainable code. These
            days I&apos;m thinking about exploring animations and 3D web
            experiences with tools like Three.js — and who knows, full-stack
            development might be next!
          </p>
        </div>
        <div className="w-95 h-95 rounded-full overflow-hidden">
          <Image
            src={photo}
            alt="My-Photo"
            width={0}
            height={0}
            className="w-full h-full object-cover rotate-12 pl-10 pb-17 scale-160"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
