import {
  sanitizeMessage,
  sanitizeName,
  sanitizeReach,
} from "./contactSanitizers";
import {
  CONTACT_BLOCK_HTML,
  CONTACT_ERRORS,
  CONTACT_LIMITS,
  CONTACT_TOPICS,
} from "@/content/contactMeContents";
import type {
  ContactTopicId,
  ContactValidationResult,
  ContactValues,
  ReachKind,
} from "@/types/contactMeTypes";

// ---------------------------------------------------------------------------
// VALIDATORS
// They answer "is this value acceptable?". They always run on already
// sanitized (and length-limited) text, so no regex can be slowed down by huge input.
// ---------------------------------------------------------------------------

// Regexes with \p{...} are built with the RegExp constructor (see sanitizers file)
const rx = (source: string, flags: string) => new RegExp(source, flags);

const LETTER_GLOBAL = rx("\\p{L}", "gu");
const HAS_LETTER_OR_NUMBER = rx("[\\p{L}\\p{N}]", "u");
// Letters first, then letters / accents / half-space / space / ' . -
const NAME_PATTERN = rx("^\\p{L}[\\p{L}\\p{M}\\u200C' .\\-\\u2019]*$", "u");
// "site.com", "www.x.com": a dot between two letters looks like a link
const LINK_LIKE_NAME = rx("\\p{L}\\.\\p{L}", "u");

// Telegram username: starts with a letter, 5-32 letters/numbers/underscores, optional "@"
const TELEGRAM_PATTERN = /^@?[a-z][a-z0-9_]{4,31}$/i;

// Things that look like HTML tags or script links
const HTML_TAG_PATTERN = /<\/?[a-z][^<>]*>/i;
const DANGEROUS_SCHEME_PATTERN =
  /\b(?:javascript|vbscript)\s*:|data\s*:\s*text\/html/i;
// Links: http(s)://something or www.something
const LINK_PATTERN = /\b(?:https?:\/\/|www\.)\S+/gi;

// NAME: 2-30 characters, at least 2 letters, no link-like text
export function isNameValid(value: string): boolean {
  const name = value.trim();
  if (
    name.length < CONTACT_LIMITS.name.min ||
    name.length > CONTACT_LIMITS.name.max
  ) {
    return false;
  }
  const letters = name.match(LETTER_GLOBAL)?.length ?? 0;
  return (
    letters >= CONTACT_LIMITS.name.min &&
    NAME_PATTERN.test(name) &&
    !LINK_LIKE_NAME.test(name)
  );
}

// EMAIL: checked piece by piece (no complicated regex)
function isEmail(value: string): boolean {
  if (value.length > CONTACT_LIMITS.reach.max) return false;

  const parts = value.split("@");
  if (parts.length !== 2) return false;
  const [local, domain] = parts;

  // Before the "@": starts and ends with a letter/number, max 64 characters
  if (!local || local.length > 64) return false;
  if (!/^[a-z0-9][a-z0-9._%+-]*$/i.test(local) || !/[a-z0-9]$/i.test(local)) {
    return false;
  }

  // After the "@": labels separated by dots, last one (like "com") only letters
  const labels = domain.split(".");
  if (labels.length < 2) return false;
  if (!/^[a-z]{2,24}$/i.test(labels[labels.length - 1])) return false;

  return labels.every(
    (label) =>
      label.length >= 1 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label),
  );
}

// REACH: decides if the text is an email, a Telegram username or neither
export function detectReachKind(value: string): ReachKind {
  const reach = value.trim();
  if (!reach) return "empty";
  if (isEmail(reach)) return "email";
  if (TELEGRAM_PATTERN.test(reach)) return "telegram";
  return "invalid";
}

// TOPIC: only the ids written in CONTACT_TOPICS are accepted
export function isTopicId(value: unknown): value is ContactTopicId {
  return CONTACT_TOPICS.some((topic) => topic.id === value);
}

// MESSAGE: returns the first problem found, or null when the message is fine
export function getMessageProblem(value: string): string | null {
  const message = value.trim();

  if (
    message.length < CONTACT_LIMITS.message.min ||
    !HAS_LETTER_OR_NUMBER.test(message)
  ) {
    return CONTACT_ERRORS.messageShort;
  }

  if (
    CONTACT_BLOCK_HTML &&
    (HTML_TAG_PATTERN.test(message) || DANGEROUS_SCHEME_PATTERN.test(message))
  ) {
    return CONTACT_ERRORS.messageHtml;
  }

  const linkCount = message.match(LINK_PATTERN)?.length ?? 0;
  if (linkCount > CONTACT_LIMITS.message.maxLinks) {
    return CONTACT_ERRORS.messageLinks;
  }

  return null;
}

// FULL CHECK (used when the visitor presses Send).
// It sanitizes everything again (in case the page was tampered with),
// checks every field and returns the clean data that is safe to send.
export function validateContactForm(
  values: ContactValues,
): ContactValidationResult {
  // Name
  const name = sanitizeName(values.name).trim();
  if (!isNameValid(name)) return { ok: false, error: CONTACT_ERRORS.name };

  // Reach (email or Telegram)
  const reach = sanitizeReach(values.reach).trim();
  const reachKind = detectReachKind(reach);
  if (reachKind !== "email" && reachKind !== "telegram") {
    return { ok: false, error: CONTACT_ERRORS.reach };
  }

  // Topic
  if (!isTopicId(values.topicId)) {
    return { ok: false, error: CONTACT_ERRORS.topic };
  }

  // Message
  const message = sanitizeMessage(values.message).trim();
  const problem = getMessageProblem(message);
  if (problem) return { ok: false, error: problem };

  return {
    ok: true,
    payload: {
      name,
      // Emails and Telegram usernames are not case sensitive: store them lowercase
      reach:
        reachKind === "telegram"
          ? `@${reach.replace(/^@/, "").toLowerCase()}`
          : reach.toLowerCase(),
      reachKind,
      topic: values.topicId,
      message,
    },
  };
}
