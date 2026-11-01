import { CONTACT_LIMITS } from "@/content/contactMeContents";

// ---------------------------------------------------------------------------
// SANITIZERS
// They run on EVERY change of an input (typing, paste, drag and drop,
// autofill...) and quietly remove everything the field must not accept.
// They only use plain string work, so the same file can be reused on the
// server in the next step.
// ---------------------------------------------------------------------------

// Regexes with \p{...} (Unicode categories) are built with the RegExp
// constructor, so TypeScript doesn't complain when tsconfig "target" is below ES2018
const rx = (source: string, flags: string) => new RegExp(source, flags);

// Control characters (null, backspace, escape, ...) and line/paragraph separators
const CONTROLS_ALL = rx("[\\u0000-\\u001F\\u007F-\\u009F\\u2028\\u2029]", "g");
// Same, but a normal new line (\n) is allowed (used by the message box)
const CONTROLS_KEEP_NEWLINE = rx(
  "[\\u0000-\\u0009\\u000B-\\u001F\\u007F-\\u009F]",
  "g",
);
// Invisible "format" characters (zero-width spaces, right-to-left overrides,
// byte order marks, invisible tag characters...) used for spoofing
const FORMAT_CHARS = rx("\\p{Cf}", "gu");
// Broken emoji halves (lone surrogates)
const LONE_SURROGATES = rx("\\p{Cs}", "gu");
// Many joiners in a row
const JOINER_RUNS = rx("[\\u200C\\u200D]{2,}", "g");

// Name: everything that is NOT a letter, accent mark, half-space (Persian),
// space, apostrophe, dot or hyphen
const NAME_DISALLOWED = rx("[^\\p{L}\\p{M}\\u200C' .\\-\\u2019]", "gu");
// A name must start with a letter
const NAME_LEADING_JUNK = rx("^[^\\p{L}]+", "u");
// "--", "''", ".." are shortened to one
const NAME_REPEATED_PUNCT = rx("([ '.\\-\\u2019])\\1+", "g");

// Reach: only the characters an email or a Telegram username can contain
const REACH_DISALLOWED = /[^A-Za-z0-9._%+\-@]/g;

// Message: one character repeated too many times in a row
const REPEATED_CHARS = rx(
  `(.)\\1{${CONTACT_LIMITS.message.maxRepeatRun},}`,
  "gsu",
);

// Half-space (ZWNJ) and joiner (ZWJ) are needed for Persian/Arabic writing and
// emoji, so they are the only invisible characters we keep
const keepJoiners = (char: string): string =>
  char === "\u200C" || char === "\u200D" ? char : "";

// Removes control characters, invisible characters and broken emoji halves
function stripUnsafeChars(value: string, allowNewline: boolean): string {
  return value
    .replace(allowNewline ? CONTROLS_KEEP_NEWLINE : CONTROLS_ALL, "")
    .replace(FORMAT_CHARS, keepJoiners)
    .replace(LONE_SURROGATES, "")
    .replace(JOINER_RUNS, "\u200C");
}

// NAME: letters (any language), accents, space, ' . - only. Max 30 characters.
// Blocks numbers, links, "@", "/", "<", ">", quotes, emoji and anything else.
export function sanitizeName(raw: string): string {
  const cleaned = stripUnsafeChars(
    raw.slice(0, CONTACT_LIMITS.hardInputCap).normalize("NFC"),
    false,
  )
    .replace(NAME_DISALLOWED, "")
    .replace(/ {2,}/g, " ")
    .replace(NAME_REPEATED_PUNCT, "$1")
    .replace(NAME_LEADING_JUNK, "");

  // Cut to the limit, then remove a broken emoji half if the cut created one
  return cleaned.slice(0, CONTACT_LIMITS.name.max).replace(LONE_SURROGATES, "");
}

// REACH (email or Telegram): plain English letters, numbers and . _ % + - @
// only. No spaces, one "@" at most, no ".." Max 50 characters.
export function sanitizeReach(raw: string): string {
  let value = stripUnsafeChars(
    // NFKC turns look-alike characters (like a full-width "@") into normal ones
    raw.slice(0, CONTACT_LIMITS.hardInputCap).normalize("NFKC"),
    false,
  ).replace(REACH_DISALLOWED, "");

  // Keep only the first "@"
  const firstAt = value.indexOf("@");
  if (firstAt !== -1) {
    value =
      value.slice(0, firstAt + 1) + value.slice(firstAt + 1).replace(/@/g, "");
  }

  return value.replace(/\.{2,}/g, ".").slice(0, CONTACT_LIMITS.reach.max);
}

// MESSAGE: normal text, emoji and new lines. Max 1000 characters, max 30 lines.
// Blocks control characters, invisible tricks, giant blank gaps and keyboard-mash.
export function sanitizeMessage(raw: string): string {
  let value = raw
    .slice(0, CONTACT_LIMITS.hardInputCap)
    .normalize("NFC")
    .replace(/\r\n?|\u2028|\u2029/g, "\n") // every kind of new line becomes "\n"
    .replace(/\t/g, " "); // tabs become a space

  value = stripUnsafeChars(value, true)
    .replace(/^\s+/, "") // can't start with spaces or empty lines
    .replace(/[ ]{2,}/g, " ") // many spaces in a row become one
    .replace(/\n{3,}/g, "\n\n") // max one empty line in a row
    .replace(REPEATED_CHARS, (_match, char: string) =>
      char.repeat(CONTACT_LIMITS.message.maxRepeatRun),
    );

  // Max number of lines
  const lines = value.split("\n");
  if (lines.length > CONTACT_LIMITS.message.maxLines) {
    value = lines.slice(0, CONTACT_LIMITS.message.maxLines).join("\n");
  }

  return value
    .slice(0, CONTACT_LIMITS.message.max)
    .replace(LONE_SURROGATES, "");
}
