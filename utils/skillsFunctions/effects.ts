// Quick white flash over the stage
export function flash(el: HTMLElement | null, peak: number, duration: number) {
  el?.animate([{ opacity: peak }, { opacity: 0 }], {
    duration,
    easing: "ease-out",
  });
}

// Small camera shake
export function shake(
  el: HTMLElement | null,
  amount: number,
  duration: number,
) {
  if (!el) return;
  const r = () => `${(Math.random() * 2 - 1) * amount}px`;
  el.animate(
    [
      { transform: `translate(${r()}, ${r()})` },
      { transform: `translate(${r()}, ${r()})` },
      { transform: "none" },
    ],
    { duration },
  );
}
