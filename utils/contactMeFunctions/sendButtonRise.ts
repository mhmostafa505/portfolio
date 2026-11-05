import {
  SEND_BUTTON_FX,
  SEND_ICON_PATH,
  SEND_RISE_COLORS,
} from "@/content/contactMeContents";

const random = (min: number, max: number) => min + Math.random() * (max - min);

// Filled message icon
const ICON_MARKUP = `<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor"><path d="${SEND_ICON_PATH}"/></svg>`;

// Creates one message icon that floats up from the top edge of the button, then removes itself
export const spawnRisingIcon = (
  layer: HTMLElement,
  button: HTMLElement,
  index: number,
) => {
  if (layer.childElementCount >= SEND_BUTTON_FX.riseMaxAlive) return;

  const halfWidth = button.offsetWidth / 2;
  const halfHeight = button.offsetHeight / 2;
  const x = random(-halfWidth * 0.8, halfWidth * 0.8);
  const sway = random(10, 20) * (Math.random() < 0.5 ? -1 : 1);
  const size = random(SEND_BUTTON_FX.riseMinSize, SEND_BUTTON_FX.riseMaxSize);
  const rise = random(70, 110);
  const tilt = random(-18, 18);

  const icon = document.createElement("span");
  icon.style.cssText = `position:absolute;left:0;top:0;display:block;pointer-events:none;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;color:${SEND_RISE_COLORS[index % SEND_RISE_COLORS.length]}`;
  icon.innerHTML = ICON_MARKUP;
  layer.appendChild(icon);

  const animation = icon.animate(
    [
      {
        transform: `translate(${x}px, ${-halfHeight}px) scale(0.3) rotate(0deg)`,
        opacity: 0,
      },
      {
        offset: 0.2,
        transform: `translate(${x}px, ${-halfHeight - 8}px) scale(1) rotate(${tilt * 0.3}deg)`,
        opacity: 0.95,
      },
      {
        offset: 0.6,
        transform: `translate(${x + sway}px, ${-halfHeight - rise * 0.55}px) scale(1) rotate(${tilt * 0.7}deg)`,
        opacity: 0.8,
      },
      {
        transform: `translate(${x - sway * 0.6}px, ${-halfHeight - rise}px) scale(1.1) rotate(${tilt}deg)`,
        opacity: 0,
      },
    ],
    {
      duration: random(
        SEND_BUTTON_FX.riseMinDuration,
        SEND_BUTTON_FX.riseMaxDuration,
      ),
      easing: "ease-in-out",
    },
  );

  animation.onfinish = () => icon.remove();
};
