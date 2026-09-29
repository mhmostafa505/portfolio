import { heroContentsType } from "@/types/heroTypes";

export const heroContents: heroContentsType = {
  NAME: "Mohammad Hossein Mostafa",
  ROLES: [
    "Building interfaces with React & Next.js",
    "Turning ideas into pixel-perfect UI",
    "Obsessed with performance and clean code",
    "Currently deepening my UI/UX craft",
  ],
  FLOAT_TAGS: [
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
  ],

  SCRAMBLE_CHARS: "!<>-_\\/[]{}—=+*^?#$%&",

  // Typewriter timing (ms)
  TYPE_SPEED: 45,
  DELETE_SPEED: 25,
  HOLD_TIME: 1400,
  PAUSE_BEFORE_NEXT: 300,
  DOTS_DURATION: 10,
};
