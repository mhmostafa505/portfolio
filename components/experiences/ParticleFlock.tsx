"use client";
import { useEffect, useRef, useState } from "react";

const PARTICLE_COUNT = 22;
const REPEL_RADIUS = 70;
const REPEL_STRENGTH = 1.4;
const HOME_PULL = 0.0025;
const DAMPING = 0.92;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hx: number; // home x — resting position it drifts back to
  hy: number;
}

const ParticleFlock = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -999, y: -999 });
  const frameRef = useRef<number>(0);
  const [isHovering, setIsHovering] = useState(false);

  // (re)builds particles whenever the card's size is known/changes
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const setup = () => {
      const { clientWidth: w, clientHeight: h } = container;
      canvas.width = w;
      canvas.height = h;
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: 0,
        vy: 0,
        hx: Math.random() * w,
        hy: Math.random() * h,
      }));
    };

    setup();
    const observer = new ResizeObserver(setup);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // the draw loop only runs while hovering — started/stopped below
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (!isHovering) {
      cancelAnimationFrame(frameRef.current);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const draw = () => {
      const { width: w, height: h } = canvas;
      ctx.clearRect(0, 0, w, h);
      const { x: mx, y: my } = mouseRef.current;

      particlesRef.current.forEach((p) => {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d = Math.hypot(dx, dy);
        if (d < REPEL_RADIUS && d > 0) {
          const f = (1 - d / REPEL_RADIUS) * REPEL_STRENGTH;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx += (p.hx - p.x) * HOME_PULL;
        p.vy += (p.hy - p.y) * HOME_PULL;
        p.vx *= DAMPING;
        p.vy *= DAMPING;
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,208,116,0.9)";
        ctx.shadowColor = "rgba(255,208,116,0.85)";
        ctx.shadowBlur = 6;
        ctx.fill();
      });

      frameRef.current = requestAnimationFrame(draw);
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [isHovering]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={(e) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        mouseRef.current = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };
      }}
      style={{ pointerEvents: "auto" }}
    >
      <canvas
        ref={canvasRef}
        className={`h-full w-full transition-opacity duration-300 ${
          isHovering ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
};

export default ParticleFlock;
