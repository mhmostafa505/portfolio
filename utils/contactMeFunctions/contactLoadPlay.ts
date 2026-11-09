import { CONTACT_LOAD, CONTACT_LOAD_COLORS } from "@/content/contactMeContents";

// Teardrop shape of the ink drop
const TEAR_PATH =
  "M9 1C9 1 1.5 10 1.5 15.5a7.5 7.5 0 0 0 15 0C16.5 10 9 1 9 1z";

// Easing of the highlighter bar
const BAR_EASE = "cubic-bezier(.7,0,.3,1)";

// Form controls and buttons use their own box, text blocks and sentences use the box of their content
const CONTROL_TAGS = ["TEXTAREA", "INPUT", "SELECT", "BUTTON"];

type Box = { x: number; y: number; w: number; h: number };

// One box per line of an element (position inside the section, which must be position: relative)
const getLineBoxes = (el: HTMLElement, root: HTMLElement): Box[] => {
  const display = getComputedStyle(el).display;
  const useContent =
    !CONTROL_TAGS.includes(el.tagName) &&
    (display === "block" || display === "inline");

  let rects: DOMRect[];
  if (useContent) {
    const range = document.createRange();
    range.selectNodeContents(el);
    rects = Array.from(range.getClientRects());
  } else {
    rects = Array.from(el.getClientRects());
  }

  rects = rects.filter((r) => r.width > 1 && r.height > 1);
  if (rects.length === 0) rects = [el.getBoundingClientRect()];
  rects.sort((a, b) => a.top - b.top);

  // Pieces on the same line (text, inputs, icons) are merged into one box
  const lines: { top: number; bottom: number; left: number; right: number }[] =
    [];
  rects.forEach((r) => {
    const line = lines.find(
      (l) => r.top < l.bottom - 2 && r.bottom > l.top + 2,
    );
    if (line) {
      line.top = Math.min(line.top, r.top);
      line.bottom = Math.max(line.bottom, r.bottom);
      line.left = Math.min(line.left, r.left);
      line.right = Math.max(line.right, r.right);
    } else {
      lines.push({
        top: r.top,
        bottom: r.bottom,
        left: r.left,
        right: r.right,
      });
    }
  });

  const rootRect = root.getBoundingClientRect();
  return lines.map((l) => ({
    x: l.left - rootRect.left,
    y: l.top - rootRect.top,
    w: l.right - l.left,
    h: l.bottom - l.top,
  }));
};

// Box of the whole element (used for the Composer frame)
const getElementBox = (el: HTMLElement, root: HTMLElement): Box => {
  const a = el.getBoundingClientRect();
  const b = root.getBoundingClientRect();
  return { x: a.left - b.left, y: a.top - b.top, w: a.width, h: a.height };
};

// Highlighter that keeps the element's rounded corners (covers left to right, then wipes away to the right)
const getRoundedFrames = (round: string): Keyframe[] => [
  { clipPath: `inset(0% 100% 0% 0% round ${round})`, easing: BAR_EASE },
  {
    clipPath: `inset(0% 0% 0% 0% round ${round})`,
    offset: CONTACT_LOAD.coverAt,
  },
  {
    clipPath: `inset(0% 0% 0% 0% round ${round})`,
    offset: CONTACT_LOAD.coverAt + 0.001,
    easing: BAR_EASE,
  },
  { clipPath: `inset(0% 0% 0% 100% round ${round})` },
];

// Old flat highlighter (set roundedWipe to false in contactMeContents.ts to use it)
const getFlatFrames = (): Keyframe[] => [
  { transform: "scaleX(0)", transformOrigin: "0 50%", easing: BAR_EASE },
  {
    transform: "scaleX(1)",
    transformOrigin: "0 50%",
    offset: CONTACT_LOAD.coverAt,
  },
  {
    transform: "scaleX(1)",
    transformOrigin: "100% 50%",
    offset: CONTACT_LOAD.coverAt + 0.001,
    easing: BAR_EASE,
  },
  { transform: "scaleX(0)", transformOrigin: "100% 50%" },
];

// Plays the initial load for a group of items. Returns a function that stops it and cleans up
export const playContactLoad = (root: HTMLElement, items: HTMLElement[]) => {
  // Position of each item among ALL items (keeps colors and drop spots the same on every load)
  const allItems = Array.from(
    root.querySelectorAll<HTMLElement>("[data-load]"),
  );
  const animations: Animation[] = [];

  // Layer that holds the drops, splashes and bars (above the section, never blocks the mouse)
  const layer = document.createElement("div");
  layer.setAttribute("aria-hidden", "true");
  layer.style.cssText =
    "position:absolute;inset:0;pointer-events:none;z-index:20;";
  root.appendChild(layer);

  const animate = (
    el: Element,
    frames: Keyframe[],
    options: KeyframeAnimationOptions,
  ) => {
    const animation = el.animate(frames, {
      fill: "both",
      easing: "ease",
      ...options,
    });
    animations.push(animation);
    return animation;
  };

  // The ink drop falls, then flattens when it hits the element
  const addDrop = (
    x: number,
    startY: number,
    y: number,
    color: string,
    delay: number,
    impactAt: number,
  ) => {
    const drop = document.createElement("div");
    drop.style.cssText = `position:absolute;left:0;top:0;width:16px;height:22px;margin:-11px 0 0 -8px;opacity:0;color:${color};`;
    drop.innerHTML = `<svg viewBox="0 0 18 24" width="100%" height="100%" fill="currentColor"><path d="${TEAR_PATH}"/></svg>`;
    layer.appendChild(drop);

    const stretch = "scale(.8,1.25)";
    const at = `translate(${x}px,${y}px)`;

    animate(
      drop,
      [
        { transform: `translate(${x}px,${startY}px) ${stretch}`, opacity: 0 },
        {
          transform: `translate(${x}px,${startY + (y - startY) * 0.2}px) ${stretch}`,
          opacity: 1,
          offset: 0.2,
        },
        { transform: `${at} ${stretch}`, opacity: 1 },
      ],
      {
        delay,
        duration: CONTACT_LOAD.fallMs,
        easing: "cubic-bezier(.5,0,.9,.6)",
      },
    );

    animate(
      drop,
      [
        { transform: `${at} ${stretch}`, opacity: 1 },
        { transform: `${at} scale(2,.3)`, opacity: 0 },
      ],
      { delay: impactAt, duration: 150, easing: "ease-out", fill: "forwards" },
    );
  };

  // Tiny droplets that spray up and fall back (hidden until the moment of impact)
  const addSplash = (x: number, y: number, color: string, impactAt: number) => {
    const count = CONTACT_LOAD.splashDroplets;
    for (let k = 0; k < count; k++) {
      const angle =
        ((-165 + k * (150 / Math.max(1, count - 1))) * Math.PI) / 180;
      const distance = 18 + Math.random() * 26;
      const vx = Math.cos(angle) * distance * 1.6;
      const vy = Math.sin(angle) * distance;
      const size = 4 + Math.random() * 3;

      const dot = document.createElement("div");
      dot.style.cssText = `position:absolute;left:0;top:0;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;background:${color};opacity:0;`;
      layer.appendChild(dot);

      animate(
        dot,
        [
          { transform: `translate(${x}px,${y}px)`, opacity: 1 },
          {
            transform: `translate(${x + vx * 0.7}px,${y + vy}px)`,
            opacity: 1,
            offset: 0.45,
          },
          {
            transform: `translate(${x + vx}px,${y + 10}px) scale(.4)`,
            opacity: 0,
          },
        ],
        {
          delay: impactAt,
          duration: 540,
          easing: "ease-out",
          fill: "forwards",
        },
      );
    }
  };

  // Highlighter: covers the element, then wipes away and reveals it (starts together with the splash)
  const addBar = (
    el: HTMLElement,
    boxes: Box[],
    color: string,
    impactAt: number,
  ) => {
    const radius = getComputedStyle(el).borderTopLeftRadius;
    const round = radius === "0px" ? "3px" : radius;

    boxes.forEach((box) => {
      const bar = document.createElement("div");
      bar.style.cssText = `position:absolute;left:${box.x - 2}px;top:${box.y - 1}px;width:${box.w + 4}px;height:${box.h + 2}px;border-radius:${round};background:${color};`;
      layer.appendChild(bar);

      animate(
        bar,
        CONTACT_LOAD.roundedWipe ? getRoundedFrames(round) : getFlatFrames(),
        {
          delay: impactAt,
          duration: CONTACT_LOAD.barMs,
          easing: "linear",
        },
      );
    });

    // The element itself shows up at the moment the bar fully covers it
    animate(
      el,
      [
        { visibility: "hidden" },
        { visibility: "hidden", offset: CONTACT_LOAD.coverAt },
        { visibility: "visible", offset: CONTACT_LOAD.coverAt + 0.001 },
        { visibility: "visible" },
      ],
      { delay: impactAt, duration: CONTACT_LOAD.barMs, easing: "linear" },
    );
  };

  // Border color fades in (used by the Composer frame and its divider lines)
  const fadeBorder = (
    el: HTMLElement,
    prop: "borderColor" | "borderTopColor" | "borderBottomColor",
  ) => {
    const readProp = prop === "borderColor" ? "borderTopColor" : prop;
    const finalColor = getComputedStyle(el)[readProp];

    animate(
      el,
      [
        { [prop]: "transparent" },
        { [prop]: "transparent", offset: 0.75 },
        { [prop]: finalColor },
      ],
      { duration: 900, easing: "ease-in-out" },
    );
  };

  // The Composer frame draws its own yellow outline, then its normal border fades in
  const addFrame = (frame: HTMLElement, box: Box) => {
    const svgNS = "http://www.w3.org/2000/svg";
    const radius = parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0;

    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("width", String(box.w));
    svg.setAttribute("height", String(box.h));
    svg.style.cssText = `position:absolute;left:${box.x}px;top:${box.y}px;overflow:visible;`;

    const rect = document.createElementNS(svgNS, "rect");
    rect.setAttribute("x", "0.75");
    rect.setAttribute("y", "0.75");
    rect.setAttribute("width", String(box.w - 1.5));
    rect.setAttribute("height", String(box.h - 1.5));
    rect.setAttribute("rx", String(radius));
    rect.setAttribute("fill", "none");
    rect.setAttribute("stroke-width", "1.5");
    rect.setAttribute("pathLength", "1");
    rect.style.stroke = "var(--color-primary-yellow)";
    rect.style.strokeDasharray = "1";
    svg.appendChild(rect);
    layer.appendChild(svg);

    animate(
      rect,
      [
        { strokeDashoffset: 1, opacity: 1 },
        { strokeDashoffset: 0, opacity: 1, offset: 0.75 },
        { strokeDashoffset: 0, opacity: 0 },
      ],
      { duration: 900, easing: "ease-in-out" },
    );
  };

  // Composer window: draw the frame once, together with the first items that live inside it
  const frames = Array.from(
    root.querySelectorAll<HTMLElement>(
      "[data-load-frame]:not([data-load-started])",
    ),
  ).filter((frame) => items.some((item) => frame.contains(item)));

  frames.forEach((frame) => {
    const lines = Array.from(
      frame.querySelectorAll<HTMLElement>("[data-load-line]"),
    );

    // The attribute lets the real border colors come back, the animations keep them hidden
    frame.setAttribute("data-load-started", "");
    lines.forEach((line) => line.setAttribute("data-load-started", ""));

    addFrame(frame, getElementBox(frame, root));
    fadeBorder(frame, "borderColor");
    lines.forEach((line) =>
      fadeBorder(
        line,
        line.dataset.loadLine === "top"
          ? "borderTopColor"
          : "borderBottomColor",
      ),
    );
  });

  // Measure everything first, then start every animation
  const allBoxes = items.map((el) => getLineBoxes(el, root));

  items.forEach((el, i) => {
    const boxes = allBoxes[i];
    const first = boxes[0];
    const globalIndex = Math.max(0, allItems.indexOf(el));
    const color =
      el.dataset.loadColor ??
      CONTACT_LOAD_COLORS[globalIndex % CONTACT_LOAD_COLORS.length];
    const landing = CONTACT_LOAD.dropX[globalIndex % CONTACT_LOAD.dropX.length];
    const x = first.x + first.w * landing;
    const y = first.y + first.h / 2;
    const startY = Math.max(-30, y - CONTACT_LOAD.fallPx);
    const dropDelay = i * CONTACT_LOAD.dropEveryMs;
    const impactAt = dropDelay + CONTACT_LOAD.fallMs;

    addDrop(x, startY, y, color, dropDelay, impactAt);
    addSplash(x, y, color, impactAt);
    addBar(el, boxes, color, impactAt);
  });

  // Gives everything back to normal CSS (so locked steps keep their own dimmed look)
  const finish = () => {
    animations.forEach((animation) => animation.cancel());
    layer.remove();
  };

  Promise.all(animations.map((animation) => animation.finished))
    .then(finish)
    .catch(() => {});

  return finish;
};
