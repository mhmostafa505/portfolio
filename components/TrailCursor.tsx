"use client";
import { useEffect, useRef } from "react";

type ShapeName = "dot" | "pointer" | "help" | "text";

const HAND =
  "M6.75 1a.75.75 0 0 1 .75.75V8a.5.5 0 0 0 1 0V5.467l.086-.004c.317-.012.637-.008.816.027.134.027.294.096.448.182.077.042.15.147.15.314V8a.5.5 0 0 0 1 0V6.435l.106-.01c.316-.024.584-.01.708.04.118.046.3.207.486.43.081.096.15.19.2.259V8.5a.5.5 0 1 0 1 0v-1h.342a1 1 0 0 1 .995 1.1l-.271 2.715a2.5 2.5 0 0 1-.317.991l-1.395 2.442a.5.5 0 0 1-.434.252H6.118a.5.5 0 0 1-.447-.276l-1.232-2.465-2.512-4.185a.517.517 0 0 1 .809-.631l2.41 2.41A.5.5 0 0 0 6 9.5V1.75A.75.75 0 0 1 6.75 1M8.5 4.466V1.75a1.75 1.75 0 1 0-3.5 0v6.543L3.443 6.736A1.517 1.517 0 0 0 1.07 8.588l2.491 4.153 1.215 2.43A1.5 1.5 0 0 0 6.118 16h6.302a1.5 1.5 0 0 0 1.302-.756l1.395-2.441a3.5 3.5 0 0 0 .444-1.389l.271-2.715a2 2 0 0 0-1.99-2.199h-.581a5 5 0 0 0-.195-.248c-.191-.229-.51-.568-.88-.716-.364-.146-.846-.132-1.158-.108l-.132.012a1.26 1.26 0 0 0-.56-.642 2.6 2.6 0 0 0-.738-.288c-.31-.062-.739-.058-1.05-.046Z";
// const HAND =
//   "M8.5 1.75v2.716l.047-.002c.312-.012.742-.016 1.051.046.28.056.543.18.738.288.273.152.456.385.56.642l.132-.012c.312-.024.794-.038 1.158.108.37.148.689.487.88.716q.113.137.195.248h.582a2 2 0 0 1 1.99 2.199l-.272 2.715a3.5 3.5 0 0 1-.444 1.389l-1.395 2.441A1.5 1.5 0 0 1 12.42 16H6.118a1.5 1.5 0 0 1-1.342-.83l-1.215-2.43L1.07 8.589a1.517 1.517 0 0 1 2.373-1.852L5 8.293V1.75a1.75 1.75 0 0 1 3.5 0";
const HELP = "M -5.5 -6 C -5.5 -11 5.5 -11 5.5 -6 C 5.5 -2 0 -2.5 0 2.5";
const HELPDOT = "M 0 8 A 0.9 0.9 0 1 1 0 9.8 A 0.9 0.9 0 1 1 0 8 Z";
const TEXT = "M -4 -11 L 4 -11 L 0 -11 L 0 11 L -4 11 L 4 11";
const CIRCLE = "M 0 -3.4 A 3.4 3.4 0 1 1 0 3.4 A 3.4 3.4 0 1 1 0 -3.4 Z";

const COL: Record<ShapeName, [number[], number[]]> = {
  dot: [
    [23, 241, 209],
    [163, 116, 255],
  ],
  pointer: [
    [255, 105, 180],
    [255, 170, 60],
  ],
  help: [
    [255, 200, 60],
    [255, 120, 60],
  ],
  text: [
    [23, 241, 209],
    [163, 116, 255],
  ],
};

const N = 90; // points sampled per shape outline
const C = 6; // trailing dots
const FOLLOW = 0.3;
const SETTLE = 0.06;
const DUR = 220; // ms, shape morph duration
const IDLE_FADE = 160; // ms, how fast the trail disappears once you stop

const ease = (t: number) => {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

interface ShapeDef {
  A: Float32Array;
  B: Float32Array;
  w: number;
  fill: boolean;
  outline: number;
}

const ShapeCursor = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Hidden SVG path used only to sample points along each shape's outline.
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "0");
    svg.setAttribute("height", "0");
    svg.style.cssText = "position:absolute;visibility:hidden";
    const probe = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path",
    );
    svg.appendChild(probe);
    document.body.appendChild(svg);

    const sample = (d: string, n: number, scale: number, ox = 0, oy = 0) => {
      probe.setAttribute("d", d);
      const len = probe.getTotalLength();
      const out = new Float32Array(n * 2);
      for (let k = 0; k < n; k++) {
        const t = n > 1 ? k / (n - 1) : 0;
        const p = probe.getPointAtLength(len * t);
        out[2 * k] = (p.x + ox) * scale;
        out[2 * k + 1] = (p.y + oy) * scale;
      }
      return out;
    };

    const makeShape = (
      main: string,
      dot: string | null,
      scale: number,
      mainW: number,
      ox: number,
      oy: number,
      fill: boolean,
      outline = 0,
    ): ShapeDef => {
      return {
        A: sample(main, N, scale, ox, oy),
        B: dot
          ? sample(dot, 16, scale, ox, oy)
          : sample("M 0 0 L 0.001 0", 16, scale, 0, 0),
        w: mainW,
        fill,
        outline,
      };
    };

    const SH: Record<ShapeName, ShapeDef> = {
      dot: makeShape(CIRCLE, null, 1, 6, 0, 0, false, 0),
      pointer: makeShape(HAND, null, 1.18, 1, -6.75, -4, true, 0.2),
      help: makeShape(HELP, HELPDOT, 0.75, 2.1, 0, -2, false, 0),
      text: makeShape(TEXT, null, 0.7, 2, 0, 0, false, 0),
    };

    const head = {
      curA: new Float32Array(SH.dot.A),
      curB: new Float32Array(SH.dot.B),
      curW: SH.dot.w,
      curOut: SH.dot.outline,
      fromA: new Float32Array(SH.dot.A),
      fromB: new Float32Array(SH.dot.B),
      fromW: SH.dot.w,
      fromOut: SH.dot.outline,
      toA: SH.dot.A,
      toB: SH.dot.B,
      toW: SH.dot.w,
      toOut: SH.dot.outline,
      t0: 0,
      name: "dot" as ShapeName,
      fill: false,
    };

    const trail = Array.from({ length: C }, () => ({ x: -200, y: -200 }));
    let hx = -200,
      hy = -200,
      mx = -200,
      my = -200;
    let inside = false,
      vis = 0,
      lastMove = 0;
    const curCol = [23, 241, 209];
    let W = window.innerWidth,
      H = window.innerHeight,
      dpr = 1;

    const fit = () => {
      dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = Math.round(W * dpr);
      canvas!.height = Math.round(H * dpr);
    };
    fit();
    window.addEventListener("resize", fit);

    const setShape = (name: ShapeName) => {
      if (name === head.name) return;
      head.fromA.set(head.curA);
      head.fromB.set(head.curB);
      head.fromW = head.curW;
      head.fromOut = head.curOut;
      head.toA = SH[name].A;
      head.toB = SH[name].B;
      head.toW = SH[name].w;
      head.toOut = SH[name].outline;
      head.t0 = performance.now();
      head.name = name;
      head.fill = SH[name].fill;
    };

    const TEXT_FIELDS =
      "input:not([type=button]):not([type=submit]):not([type=checkbox]):not([type=radio]):not([type=range]), textarea, [contenteditable=true]";

    const resolveShape = (target: EventTarget | null): ShapeName => {
      if (!(target instanceof Element)) return "dot";
      const explicit = target.closest<HTMLElement>("[data-cursor]");
      if (explicit) {
        const v = explicit.getAttribute("data-cursor") as ShapeName | null;
        if (v && SH[v]) return v;
      }
      if (target.closest(TEXT_FIELDS)) return "text";
      return "dot";
    };

    const onMove = (e: MouseEvent) => {
      const nx = e.clientX,
        ny = e.clientY;
      if (Math.hypot(nx - mx, ny - my) > 0.6) lastMove = performance.now();
      mx = nx;
      my = ny;
      if (!inside) {
        inside = true;
        hx = mx;
        hy = my;
        trail.forEach((p) => {
          p.x = mx;
          p.y = my;
        });
        lastMove = performance.now();
      }
    };
    const onOver = (e: MouseEvent) => {
      setShape(resolveShape(e.target));
    };
    const onLeaveWindow = () => {
      inside = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);

    const mixc = (a: number[], b: number[], t: number) => {
      return [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
      ];
    };

    const drawShape = (
      A: Float32Array,
      nA: number,
      B: Float32Array,
      nB: number,
      x: number,
      y: number,
      scale: number,
      w: number,
      outline: number,
      col: number[],
      alpha: number,
      fill: boolean,
    ) => {
      if (alpha < 0.01) return;
      ctx!.globalAlpha = alpha;
      const rgb = `rgb(${Math.round(col[0])},${Math.round(col[1])},${Math.round(col[2])})`;
      ctx!.beginPath();
      for (let k = 0; k < nA; k++) {
        const px = x + A[2 * k] * scale,
          py = y + A[2 * k + 1] * scale;
        if (k) ctx!.lineTo(px, py);
        else ctx!.moveTo(px, py);
      }
      if (fill) {
        ctx!.closePath();
        ctx!.fillStyle = rgb;
        ctx!.fill();
        if (outline > 0.05) {
          ctx!.strokeStyle = rgb;
          ctx!.lineWidth = outline * scale;
          ctx!.lineJoin = "round";
          ctx!.stroke();
        }
      } else {
        ctx!.strokeStyle = rgb;
        ctx!.lineWidth = Math.max(0.6, w * scale);
        ctx!.stroke();
      }
      if (nB > 2) {
        ctx!.beginPath();
        for (let k = 0; k < nB; k++) {
          const px = x + B[2 * k] * scale,
            py = y + B[2 * k + 1] * scale;
          if (k) ctx!.lineTo(px, py);
          else ctx!.moveTo(px, py);
        }
        if (fill) {
          ctx!.closePath();
          ctx!.fillStyle = rgb;
          ctx!.fill();
        } else {
          ctx!.strokeStyle = rgb;
          ctx!.lineWidth = Math.max(0.6, w * scale);
          ctx!.stroke();
        }
      }
    };

    let frameId = 0;
    const frame = (now: number) => {
      vis += ((inside ? 1 : 0) - vis) * 0.16;
      hx += (mx - hx) * 0.55;
      hy += (my - hy) * 0.55;
      if (Math.abs(mx - hx) < 0.05) hx = mx;
      if (Math.abs(my - hy) < 0.05) hy = my;

      let tx = hx,
        ty = hy;
      for (let i = 0; i < C; i++) {
        const p = trail[i];
        p.x += (tx - p.x) * FOLLOW;
        p.y += (ty - p.y) * FOLLOW;
        if (Math.abs(tx - p.x) < SETTLE) p.x = tx;
        if (Math.abs(ty - p.y) < SETTLE) p.y = ty;
        tx = p.x;
        ty = p.y;
      }

      const tt = Math.min(1, (now - head.t0) / DUR),
        e = ease(tt);
      for (let j = 0; j < head.curA.length; j++)
        head.curA[j] = head.fromA[j] + (head.toA[j] - head.fromA[j]) * e;
      for (let j = 0; j < head.curB.length; j++)
        head.curB[j] = head.fromB[j] + (head.toB[j] - head.fromB[j]) * e;
      head.curW = head.fromW + (head.toW - head.fromW) * e;
      head.curOut = head.fromOut + (head.toOut - head.fromOut) * e;

      const tgt = COL[head.name],
        hc = mixc(tgt[0], tgt[1], 0);
      curCol[0] += (hc[0] - curCol[0]) * 0.2;
      curCol[1] += (hc[1] - curCol[1]) * 0.2;
      curCol[2] += (hc[2] - curCol[2]) * 0.2;

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);
      ctx!.lineJoin = "round";
      ctx!.lineCap = "round";

      const nA = head.curA.length / 2,
        nB = head.curB.length / 2;
      const idleAlpha = Math.max(
        0,
        Math.min(1, 1 - (now - lastMove) / IDLE_FADE),
      );
      const shrink = head.fill ? 0.25 : 0.55;

      if (idleAlpha > 0.01) {
        for (let n = C - 1; n >= 0; n--) {
          const p = trail[n],
            f = (n + 1) / C;
          const sc = 1 - f * shrink;
          const al = (1 - f * 0.8) * vis * idleAlpha;
          const tc = mixc(tgt[0], tgt[1], 0.3 + f * 0.7);
          drawShape(
            head.curA,
            nA,
            head.curB,
            nB,
            p.x,
            p.y,
            sc,
            head.curW,
            0,
            tc,
            al,
            head.fill,
          );
        }
      }
      drawShape(
        head.curA,
        nA,
        head.curB,
        nB,
        hx,
        hy,
        1,
        head.curW,
        head.curOut,
        curCol,
        vis,
        head.fill,
      );

      frameId = requestAnimationFrame(frame);
    };
    frameId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener("resize", fit);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
      cancelAnimationFrame(frameId);
      svg.remove();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-9999 h-full w-full"
    />
  );
};

export default ShapeCursor;
