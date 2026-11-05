import { SEND_BUTTON_FX } from "@/content/contactMeContents";

// Smoothly freezes the icon with the bubble fully drawn
export const holdIcon = (paths: SVGPathElement[]) => {
  paths.forEach((path) => {
    const current = getComputedStyle(path).strokeDashoffset;
    path.style.animation = "none";
    path.style.strokeDashoffset = current;
    path.getBoundingClientRect(); // forces the browser to apply the line above first
    path.style.transition = "stroke-dashoffset 0.3s";
    path.style.strokeDashoffset = "0";
  });
};

// Lets the draw loop continue from the drawn state (no jump)
export const releaseIcon = (paths: SVGPathElement[]) => {
  paths.forEach((path, i) => {
    path.style.transition = "";
    path.style.strokeDashoffset = "";
    path.style.animation = "";
    path.style.animationDelay = `${SEND_BUTTON_FX.drawResumeDelays[i] ?? 0}s`;
  });
};

// Controls the pupils: they ease toward the mouse every frame (smooth, no ticking)
export const createEyes = (slot: HTMLElement) => {
  const pupils = Array.from(
    slot.querySelectorAll<SVGCircleElement>(".send-pupil"),
  );
  const current = { x: 0, y: 0 }; // where the pupils are now
  const mouse = { x: 0, y: 0 }; // where the mouse is on the screen
  let following = false;
  let frame = 0;
  let lastTime = 0;

  const tick = (time: number) => {
    const dt = Math.min(0.05, (time - lastTime) / 1000 || 0.016);
    lastTime = time;

    // Where the pupils want to be (middle when the mouse is gone)
    let goalX = 0;
    let goalY = 0;
    if (following) {
      const rect = slot.getBoundingClientRect();
      const dx = mouse.x - (rect.left + rect.width / 2);
      const dy = mouse.y - (rect.top + rect.height / 2);
      const distance = Math.hypot(dx, dy) || 1;
      const move =
        Math.min(1, distance / SEND_BUTTON_FX.eyeRange) *
        SEND_BUTTON_FX.eyeMaxMove;
      goalX = (dx / distance) * move;
      goalY = (dy / distance) * move;
    }

    const ease = 1 - Math.exp(-dt * SEND_BUTTON_FX.eyeFollowSpeed);
    current.x += (goalX - current.x) * ease;
    current.y += (goalY - current.y) * ease;

    // Back in the middle and mouse gone: stop the loop
    if (
      !following &&
      Math.abs(current.x) < 0.01 &&
      Math.abs(current.y) < 0.01
    ) {
      pupils.forEach((pupil) => {
        pupil.style.transform = "";
      });
      frame = 0;
      return;
    }

    pupils.forEach((pupil) => {
      pupil.style.transform = `translate(${current.x.toFixed(3)}px, ${current.y.toFixed(3)}px)`;
    });
    frame = requestAnimationFrame(tick);
  };

  const run = () => {
    if (frame) return;
    lastTime = performance.now();
    frame = requestAnimationFrame(tick);
  };

  return {
    // Call on enter and on every mouse move
    follow: (x: number, y: number) => {
      mouse.x = x;
      mouse.y = y;
      following = true;
      run();
    },
    // Call on leave: pupils glide back to the middle
    release: () => {
      following = false;
      run();
    },
    destroy: () => cancelAnimationFrame(frame),
  };
};
