"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const NAME = "Mohammad Hossein Mostafa";
const EYEBROW = "frontend developer";
const ROLES = [
  "Building interfaces with React & Next.js",
  "Turning ideas into pixel-perfect UI",
  "Obsessed with performance and clean code",
  "Currently deepening my UI/UX craft",
];
const FLOAT_TAGS = [
  {
    text: "Design",
    color: "#A374FF",
    border: "#33254F",
    top: "18%",
    left: "16%",
    duration: "4.5s",
    delay: "0s",
    url: "https://dictionary.cambridge.org/dictionary/english/design",
  },
  {
    text: "Creativity",
    color: "#17F1D1",
    border: "#1E4A46",
    top: "26%",
    right: "14%",
    duration: "5.5s",
    delay: ".3s",
    url: "https://dictionary.cambridge.org/dictionary/english/creativity",
  },
  {
    text: "Responsive",
    color: "#FFD074",
    border: "#4A3E1E",
    bottom: "24%",
    left: "20%",
    duration: "5s",
    delay: ".6s",
    url: "https://dictionary.cambridge.org/dictionary/english/responsive",
  },
  {
    text: "Performance",
    color: "#ffffe3",
    border: "#3A3A3A",
    bottom: "20%",
    right: "18%",
    duration: "4.8s",
    delay: ".2s",
    url: "https://dictionary.cambridge.org/dictionary/english/performance",
  },
];

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#$%&";

// Typewriter timing (ms)
const TYPE_SPEED = 45;
const DELETE_SPEED = 25;
const HOLD_TIME = 1400;
const PAUSE_BEFORE_NEXT = 300;
const DOTS_DURATION = 10;

function randomChar() {
  return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
}

function useHasMounted() {
  return useSyncExternalStore(
    () => () => {}, // subscribe: no-op, nothing to subscribe to
    () => true, // client snapshot
    () => false, // server snapshot
  );
}

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [displayName, setDisplayName] = useState(NAME);
  const [nameDecoded, setNameDecoded] = useState(false);
  const [roleText, setRoleText] = useState("");
  const [hasEntered, setHasEntered] = useState(false);
  const [showDots, setShowDots] = useState(true);

  const hasMounted = useHasMounted();

  // Name: scramble-decode on mount
  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      queueMicrotask(() => {
        setDisplayName(NAME);
        setNameDecoded(true);
      });
      return;
    }

    let frame = 0;
    const totalFrames = 30;
    const revealAt = NAME.split("").map(
      (_, i) => Math.floor((i / NAME.length) * totalFrames * 0.7) + 8,
    );

    const timer = setInterval(() => {
      let out = "";
      for (let i = 0; i < NAME.length; i++) {
        const ch = NAME[i];
        if (ch === " ") {
          out += " ";
          continue;
        }
        out += frame >= revealAt[i] ? ch : randomChar();
      }
      setDisplayName(out);
      frame++;

      if (frame > totalFrames + 8) {
        clearInterval(timer);
        setDisplayName(NAME);
        setNameDecoded(true);
      }
    }, 35);

    return () => clearInterval(timer);
  }, []);

  // Role line: typewriter, types then deletes then types the next
  useEffect(() => {
    if (!nameDecoded) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) {
      queueMicrotask(() => setRoleText(ROLES[0]));
      return;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    function tick() {
      const current = ROLES[roleIndex];

      if (!deleting) {
        charIndex++;
        setRoleText(current.slice(0, charIndex));

        if (charIndex === current.length) {
          deleting = true;
          timeoutId = setTimeout(tick, HOLD_TIME);
          return;
        }
        timeoutId = setTimeout(tick, TYPE_SPEED);
      } else {
        charIndex--;
        setRoleText(current.slice(0, charIndex));

        if (charIndex === 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % ROLES.length;
          timeoutId = setTimeout(tick, PAUSE_BEFORE_NEXT);
          return;
        }
        timeoutId = setTimeout(tick, DELETE_SPEED);
      }
    }

    const dotsTimer = setTimeout(() => {
      setShowDots(false);
      timeoutId = setTimeout(tick, TYPE_SPEED);
    }, DOTS_DURATION);

    return () => {
      clearTimeout(dotsTimer);
      clearTimeout(timeoutId);
    };
  }, [nameDecoded]);

  // Magnetic letters: nudge nearby letters toward the cursor
  useEffect(() => {
    const heroEl = heroRef.current;
    const nameEl = nameRef.current;
    if (!heroEl || !nameEl) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    function handleMove(e: MouseEvent) {
      const spans = nameEl!.querySelectorAll<HTMLSpanElement>("span");
      const radius = 90;
      const colors = ["#A374FF", "#FFD074", "#17F1D1"];

      spans.forEach((span, i) => {
        const r = span.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
          const s = 1 - dist / radius;
          span.style.transform = `translateY(${-12 * s}px) scale(${
            1 + 0.3 * s
          })`;
          span.style.color = colors[i % colors.length];
        } else {
          span.style.transform = "translateY(0) scale(1)";
          span.style.color = "";
        }
      });
    }

    heroEl.addEventListener("mousemove", handleMove);
    return () => heroEl.removeEventListener("mousemove", handleMove);
  }, []);

  // Particle constellation background
  useEffect(() => {
    const canvas = canvasRef.current;
    const heroEl = heroRef.current;
    if (!canvas || !heroEl) return;

    const ctx = canvas.getContext("2d");
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!ctx || reduceMotion) return;

    let rafId: number;
    let width = 0;
    let height = 0;

    function resize() {
      width = canvas!.width = heroEl!.clientWidth;
      height = canvas!.height = heroEl!.clientHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const count = window.innerWidth < 640 ? 30 : 70;
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
    }));

    const mouse = { x: -9999, y: -9999 };

    function handleMove(e: MouseEvent) {
      const r = heroEl!.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }
    function handleLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }
    heroEl.addEventListener("mousemove", handleMove);
    heroEl.addEventListener("mouseleave", handleLeave);

    function tick() {
      ctx!.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 115) {
            ctx!.strokeStyle = `rgba(139,124,255,${1 - d / 115})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }

        const dm = Math.hypot(
          particles[i].x - mouse.x,
          particles[i].y - mouse.y,
        );
        if (dm < 160) {
          ctx!.strokeStyle = `rgba(79,209,197,${1 - dm / 160})`;
          ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(particles[i].x, particles[i].y);
          ctx!.lineTo(mouse.x, mouse.y);
          ctx!.stroke();
        }
      }

      particles.forEach((p) => {
        ctx!.fillStyle = "#EDEFF3";
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx!.fill();
      });

      rafId = requestAnimationFrame(tick);
    }
    tick();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      heroEl.removeEventListener("mousemove", handleMove);
      heroEl.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <section
      id="home"
      ref={heroRef}
      className="relative flex h-screen flex-col items-center justify-center overflow-hidden text-center bg-primary-bg"
    >
      <canvas ref={canvasRef} className="absolute w-full inset-0 z-1" />

      {FLOAT_TAGS.map((tag, index) => (
        <Link
          key={tag.text}
          href={tag.url}
          target="_blank"
          className={`${index % 2 === 0 ? "hover:rotate-15" : "hover:-rotate-15"} absolute z-2 whitespace-nowrap rounded-full border px-4 py-1.5 backdrop-blur-[2px] cursor-pointer hover:scale-105 transition-transform duration-150`}
          style={{
            color: tag.color,
            borderColor: tag.border,
            backgroundColor: "rgba(14,16,15,0.75)",
            top: tag.top,
            left: tag.left,
            right: tag.right,
            bottom: tag.bottom,
            animation: `floaty ${tag.duration} ease-in-out infinite`,
            animationDelay: tag.delay,
          }}
        >
          {tag.text}
        </Link>
      ))}

      <div className="relative z-3 px-5">
        <Link
          href="https://www.w3schools.com/whatis/whatis_frontenddev.asp"
          target="_blank"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#333] px-3.5 py-1.5 font-mono text-[13px] text-[#ddd] cursor-help hover:text-primary-white"
        >
          <span
            className="h-1.75 w-1.75 rounded-full bg-primary-hover"
            style={{ animation: "pulseDot 1.8s ease-in-out infinite" }}
          />
          <span
            className="text-primary-hover opacity-0"
            style={{ animation: "bracketPop 0.3s ease forwards" }}
          >
            &lt;
          </span>
          <span
            className="opacity-0"
            style={{
              letterSpacing: "0.5em",
              animation: "trackingCollapse 0.7s ease forwards 0.3s",
            }}
          >
            {EYEBROW}
          </span>
          <span
            className="text-primary-hover opacity-0"
            style={{ animation: "bracketPop 0.3s ease forwards 0.1s" }}
          >
            /&gt;
          </span>
        </Link>

        <h1
          ref={nameRef}
          className="mb-4 text-5xl font-bold leading-none text-primary-white sm:text-7xl cursor-default"
        >
          {(hasMounted ? displayName : NAME).split("").map((ch, i) => (
            <span
              key={i}
              className="inline-block transition-transform duration-150 ease-out"
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </h1>

        <div className="mx-auto mb-8 flex h-6 max-w-lg items-center justify-center gap-1 font-mono text-base text-primary-yellow">
          {showDots ? (
            <span className="inline-flex gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary-yellow"
                style={{
                  animation: "dotbounce 1s ease-in-out infinite",
                  animationDelay: "0s",
                }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary-yellow"
                style={{
                  animation: "dotbounce 1s ease-in-out infinite",
                  animationDelay: "0.15s",
                }}
              />
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary-yellow"
                style={{
                  animation: "dotbounce 1s ease-in-out infinite",
                  animationDelay: "0.3s",
                }}
              />
            </span>
          ) : (
            <>
              <span>{roleText}</span>
              <span className="h-4 w-0.5 shrink-0 animate-pulse bg-primary-yellow" />
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-3.5">
          <Link
            href="#projects"
            onAnimationEnd={() => setHasEntered(true)}
            className={`group inline-flex items-center gap-2 rounded-lg bg-primary-white px-6 py-3 text-sm text-primary-bg ${
              hasEntered
                ? "opacity-100"
                : "animate-[riseBounce_0.6s_cubic-bezier(.22,1,.36,1)_forwards] opacity-0"
            }`}
            style={{ animationDelay: "400ms" }}
          >
            <span className="glitch-label" data-text="View my work">
              View my work
            </span>
          </Link>

          <Link
            href="#"
            download
            className="group relative inline-flex animate-[riseBounce_0.6s_cubic-bezier(.22,1,.36,1)_forwards] items-center gap-2 rounded-lg border border-primary-white px-6 py-3 text-sm text-primary-white opacity-0 transition-colors hover:border-primary-hover"
            style={{ animationDelay: "500ms" }}
          >
            Download CV
            <span className="relative h-4 w-4">
              <svg
                className="absolute inset-0 transition-all duration-300 ease-out group-hover:translate-y-2.5 group-hover:opacity-0"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M8 2v9M4 8l4 4 4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <svg
                className="absolute inset-0 -translate-y-1.5 opacity-0 transition-all delay-100 duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M2 10v3a1 1 0 001 1h10a1 1 0 001-1v-3M5 7l3 3 3-3M8 1v8"
                  stroke="#17F1D1"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>

      {/* <div className="absolute bottom-7 left-1/2 z-3 flex -translate-x-1/2 flex-col items-center gap-1.5 text-[11px] text-neutral-600">
        <span className="h-8 w-px animate-[scrolldown_1.8s_ease-in-out_infinite] bg-linear-to-b from-neutral-600 to-transparent" />
      </div> */}
    </section>
  );
};

export default Hero;
