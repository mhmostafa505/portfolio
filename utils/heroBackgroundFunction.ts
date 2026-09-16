export const heroBackground = (
  canvas: HTMLCanvasElement | null,
  heroEl: HTMLElement | null,
  ctx: CanvasRenderingContext2D | null,
) => {
  let rafId: number;
  let width = 0;
  let height = 0;

  const resize = () => {
    width = canvas!.width = heroEl!.clientWidth;
    height = canvas!.height = heroEl!.clientHeight;
  };

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

  const handleMove = (e: MouseEvent) => {
    const r = heroEl!.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  };

  const handleLeave = () => {
    mouse.x = -9999;
    mouse.y = -9999;
  };

  if (!heroEl) return;

  heroEl.addEventListener("mousemove", handleMove);
  heroEl.addEventListener("mouseleave", handleLeave);

  const tick = () => {
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

      const dm = Math.hypot(particles[i].x - mouse.x, particles[i].y - mouse.y);
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
  };

  tick();

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", resize);
    heroEl.removeEventListener("mousemove", handleMove);
    heroEl.removeEventListener("mouseleave", handleLeave);
  };
};
