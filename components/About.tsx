"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useScrollSpy } from "@/contexts/ScrollSpyContext";
import { FaQuoteRight } from "react-icons/fa";
import photo from "@/assets/images/about-me-photo.webp";

const About = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);

  const { revealed } = useScrollSpy();
  const isRevealed = revealed.has("about");

  // Paragraph Initial Loading
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlaying(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }, // fires once 30% of the section is visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      className={`transition-opacity duration-700 ${
        isRevealed ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex justify-between items-center my-15">
        <h2 className="relative text-5xl font-black ml-9.5">
          <span className="font-mono text-xl text-primary-purple pr-2">
            01.
          </span>
          About Me
          <FaQuoteRight
            size={20}
            className="absolute -top-2 -right-8 text-primary-purple"
          />
        </h2>
        <div className="flex items-center gap-12 mr-15">
          <div className="w-17 h-4 bg-primary-purple rounded-full"></div>
          <div className="w-17 h-4 bg-primary-purple rounded-full"></div>
          <div className="w-17 h-4 bg-primary-purple rounded-full"></div>
        </div>
      </div>
      <div className="flex justify-center items-center gap-8 mb-10">
        <div
          ref={wrapRef}
          className="relative w-3/5 overflow-hidden text-[23px]/relaxed"
        >
          <p
            style={{
              transform: playing ? "translateY(0)" : "translateY(110%)",
              transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1)",
            }}
          >
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
          <div
            className="absolute inset-0 bg-primary-purple pointer-events-none"
            style={{
              transformOrigin: "right",
              transform: playing ? "scaleX(0)" : "scaleX(1)",
              transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1)",
            }}
          ></div>
        </div>
        <div className="relative w-90 h-90 rounded-full overflow-hidden border-6 border-primary-hover hover:border-primary-yellow hover:rotate-y-360 transition-transform duration-700 ease-in-out">
          <Image
            src={photo}
            alt="My-Photo"
            fill
            sizes="360px"
            className="object-cover rotate-12 pl-10 pb-17 scale-160"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
