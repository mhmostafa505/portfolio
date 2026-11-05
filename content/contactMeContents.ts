import type {
  ContactDetail,
  ContactTopic,
  ReachKind,
} from "@/types/contactMeTypes";

// ---------------------------------------------------------------------------
// LIMITS: every number that controls how much a visitor is allowed to type.
// The same numbers are used by the inputs (maxLength), the sanitizers and the
// validators, so changing one value here changes it everywhere.
// ---------------------------------------------------------------------------
export const CONTACT_LIMITS = {
  // Anything longer than this is cut off BEFORE any other work is done
  // (protects the page from huge pasted text)
  hardInputCap: 5000,
  name: { min: 2, max: 30 },
  reach: { max: 50 },
  message: {
    min: 10,
    max: 1000,
    maxLines: 30, // more lines than this are dropped
    maxLinks: 2, // more links than this = looks like spam
    maxRepeatRun: 12, // "aaaaaaaaaaaaaaaa" is shortened to 12 same characters
  },
} as const;

// Height (px) of the message box: it grows while typing, then starts scrolling
export const CONTACT_MESSAGE_HEIGHT = { min: 150, max: 360 } as const;

// ---------------------------------------------------------------------------
// TIMING: anti-spam and small UI timings
// ---------------------------------------------------------------------------
export const CONTACT_TIMING = {
  minFillMs: 4000, // a human needs more than this to fill the form; bots don't
  cooldownMs: 30000, // wait time between two messages from the same browser
  copiedResetMs: 1600, // how long "Copied" stays visible
  storageKey: "contact:lastSentAt", // where the last send time is remembered
} as const;

// true  = messages that contain HTML tags / script links are rejected
// false = they are allowed (the server must still escape them later)
export const CONTACT_BLOCK_HTML = true;

// ---------------------------------------------------------------------------
// TEXTS
// ---------------------------------------------------------------------------
export const CONTACT_PLACEHOLDERS = {
  name: "your name",
  reach: "email or @telegram",
  topic: "a project, a job...",
  message:
    "Tell me what you have in mind. The more details, the better my first reply.",
} as const;

export const CONTACT_TEXTS = {
  success: "Message sent. I will reply as soon as I can.",
  sending: "Sending...",
  send: "Send message",
  copied: "Copied",
  copyFailed: "Copy failed, select it manually",
} as const;

export const CONTACT_ERRORS = {
  name: `Use ${CONTACT_LIMITS.name.min}-${CONTACT_LIMITS.name.max} letters for your name (no links or symbols).`,
  reach: "Add a valid email or Telegram username.",
  topic: "Pick what it is about.",
  messageShort: `Write at least ${CONTACT_LIMITS.message.min} characters.`,
  messageHtml: "Please remove HTML or code tags from your message.",
  messageLinks: `Please include at most ${CONTACT_LIMITS.message.maxLinks} links.`,
  tooFast: "That was quick! Give it a moment and try again.",
  cooldown: (seconds: number) =>
    `Please wait ${seconds}s before sending another message.`,
  generic: "Something went wrong. Please try again.",
} as const;

// ---------------------------------------------------------------------------
// REACH INPUT COLORS (one full set of classes per state; only one set is
// applied at a time, so the classes never fight each other)
// ---------------------------------------------------------------------------
export const CONTACT_REACH_STYLES: Record<ReachKind, string> = {
  empty:
    "text-primary-yellow border-primary-yellow/40 focus:border-primary-yellow",
  email: "text-primary-purple border-primary-purple",
  telegram: "text-primary-hover border-primary-hover",
  invalid: "text-primary-yellow border-[#ff5c5c]",
};

// Colors of the name input
export const CONTACT_NAME_STYLE =
  "text-primary-yellow border-primary-yellow/40 focus:border-primary-yellow not-placeholder-shown:border-primary-yellow";

// ---------------------------------------------------------------------------
// TOPICS: the three allowed answers, each with its own color from the palette
// ---------------------------------------------------------------------------
export const CONTACT_TOPICS: ContactTopic[] = [
  {
    id: "project",
    label: "a project",
    wordIdleClass:
      "border-dashed border-primary-hover text-primary-white hover:text-primary-hover",
    wordActiveClass: "border-solid border-primary-hover text-primary-hover",
  },
  {
    id: "job",
    label: "a job",
    wordIdleClass:
      "border-dashed border-primary-purple text-primary-white hover:text-primary-purple",
    wordActiveClass: "border-solid border-primary-purple text-primary-purple",
  },
  {
    id: "hello",
    label: "just saying hello",
    wordIdleClass:
      "border-dashed border-primary-yellow text-primary-white hover:text-primary-yellow",
    wordActiveClass: "border-solid border-primary-yellow text-primary-yellow",
  },
];

// ---------------------------------------------------------------------------
// COPY ITEMS under the form
// TODO: replace the two values below with your real email and Telegram id
// ---------------------------------------------------------------------------
export const CONTACT_DETAILS: ContactDetail[] = [
  {
    id: "email",
    value: "name@gmail.com",
    iconClass: "text-primary-purple",
    hoverClass: "hover:border-primary-purple",
    copiedClass: "border-primary-purple",
  },
  {
    id: "telegram",
    value: "@yourhandle",
    iconClass: "text-primary-hover",
    hoverClass: "hover:border-primary-hover",
    copiedClass: "border-primary-hover",
  },
];

// Send button hover settings (change these numbers to tweak the feel)
export const SEND_BUTTON_FX = {
  rippleGrowSpeed: 10, // how fast the teal circle grows
  rippleShrinkSpeed: 8, // how fast it shrinks when the mouse leaves
  rippleMoveSpeed: 14, // how fast the circle center slides to the exit point
  riseEveryMs: 300, // one rising message icon every X ms while hovering
  riseMaxAlive: 12, // never show more than this many at once
  riseMinSize: 11,
  riseMaxSize: 20,
  riseMinDuration: 2200,
  riseMaxDuration: 3000,
  eyeRange: 40, // mouse distance (px) where the pupils reach their max move
  eyeMaxMove: 1.3, // how far the pupils move
  eyeFollowSpeed: 16, // how fast the pupils catch up with the mouse (higher = snappier)
  // Keeps the draw loop in phase after hover (matches the 2.8s loop in globals.css)
  drawResumeDelays: [-1.82, -1.37, -1.22],
} as const;

// Message icon shape (used by the button icon and the rising icons)
export const SEND_ICON_PATH =
  "M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z";

// Colors of the rising icons
export const SEND_RISE_COLORS = [
  "var(--color-primary-yellow)",
  "var(--color-primary-hover)",
  "var(--color-primary-purple)",
];
