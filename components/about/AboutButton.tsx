"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useInView from "@/hooks/useInView";
import { EASE } from "@/content/ease";
import { FaArrowRightLong } from "react-icons/fa6";

const AboutButton = () => {
  const [ref, inView] = useInView<HTMLButtonElement>({ threshold: 0.1 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const box = entry.borderBoxSize?.[0];
      if (box) {
        setSize({ width: box.inlineSize, height: box.blockSize });
      } else {
        setSize({ width: el.offsetWidth, height: el.offsetHeight });
      }
    });

    observer.observe(el, { box: "border-box" });
    return () => observer.disconnect();
  }, []);

  const strokeInset = 1.5;

  return (
    <Link href="#contact">
      <button
        ref={(el) => {
          btnRef.current = el;
          ref.current = el;
        }}
        className="group relative flex items-center justify-center gap-3 bg-transparent text-primary-purple text-center w-2/5 py-4 px-6 rounded-2xl cursor-pointer overflow-hidden"
        data-cursor="pointer"
        style={{
          opacity: inView ? 1 : 0,
          transitionDelay: "0.3s",
          transition: "opacity 0.1s",
        }}
      >
        {size.width > 0 && (
          <svg
            viewBox={`0 0 ${size.width} ${size.height}`}
            className="absolute inset-0 w-full h-full pointer-events-none"
          >
            <rect
              x={strokeInset}
              y={strokeInset}
              width={size.width - strokeInset * 2}
              height={size.height - strokeInset * 2}
              rx="16"
              fill="none"
              stroke="var(--color-primary-purple, #7c3aed)"
              strokeWidth="2"
              pathLength="100"
              style={{
                strokeDasharray: 100,
                strokeDashoffset: inView ? 0 : 100,
                transition: `stroke-dashoffset 0.9s ${EASE}`,
                transitionDelay: "0.3s",
              }}
            />
          </svg>
        )}

        {/* hover animation */}
        <span className="fill absolute inset-0 bg-primary-purple origin-left scale-x-0 transition-transform duration-200 ease-[cubic-bezier(0.65,0,0.35,1)] group-hover:scale-x-100" />

        <span
          className="relative flex items-center gap-3 group-hover:text-primary-bg transition-colors duration-200"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? "translateY(0)" : "translateY(4px)",
            transition: `opacity 0.35s ease, transform 0.35s ease`,
            transitionDelay: "0.9s",
          }}
        >
          <FaArrowRightLong
            size={15}
            className="animate-[bounceHorizontal_0.7s_infinite]"
          />
          Contact Me
        </span>
      </button>
    </Link>
  );
};

export default AboutButton;
