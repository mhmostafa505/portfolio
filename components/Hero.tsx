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

const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#$%&";

// Typewriter timing (ms)
const TYPE_SPEED = 45;
const DELETE_SPEED = 25;
const HOLD_TIME = 1400;
const PAUSE_BEFORE_NEXT = 300;

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

  // Initialize with a scrambled placeholder (same length as NAME) so there's
  // no blank flash before the decode effect kicks in on mount.
  const [displayName, setDisplayName] = useState(NAME);
  const [nameDecoded, setNameDecoded] = useState(false);
  const [roleText, setRoleText] = useState("");

  const hasMounted = useHasMounted();

  /* ---------------- Name: scramble-decode on mount ---------------- */
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

  /* ---------------- Role line: typewriter, types then deletes then types the next ---------------- */
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

    timeoutId = setTimeout(tick, TYPE_SPEED);
    return () => clearTimeout(timeoutId);
  }, [nameDecoded]);

  /* ---------------- Magnetic letters: nudge nearby letters toward the cursor ---------------- */
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

  /* ---------------- Particle constellation background ---------------- */
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

      <div className="relative z-3 px-5">
        <p className="mb-3 text-sm text-neutral-400">{EYEBROW}</p>

        <h1
          ref={nameRef}
          className="mb-4 text-5xl font-bold leading-none text-primary-white sm:text-7xl"
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

        <div className="mx-auto mb-8 flex min-h-5.5 max-w-lg items-center justify-center gap-0.5 font-mono text-base text-primary-yellow">
          <span className="h-6">{roleText}</span>
          <span className="h-4 w-0.5 shrink-0 animate-pulse bg-primary-yellow" />
        </div>

        <div className="flex flex-wrap justify-center gap-3.5">
          <Link
            href="#projects"
            className="rounded-lg bg-primary-white px-6 py-3 text-sm text-neutral-950 transition-transform hover:-translate-y-0.5"
          >
            View my work
          </Link>

          <a
            href="#"
            className="rounded-lg border border-primary-white px-6 py-3 text-sm text-primary-white transition-colors hover:border-primary-hover hover:text-primary-hover"
          >
            My Resume
          </a>
        </div>
      </div>

      {/* <div className="absolute bottom-7 left-1/2 z-3 flex -translate-x-1/2 flex-col items-center gap-1.5 text-[11px] text-neutral-600">
        <span className="h-8 w-px animate-[scrolldown_1.8s_ease-in-out_infinite] bg-linear-to-b from-neutral-600 to-transparent" />
      </div> */}
    </section>
  );
};

export default Hero;
