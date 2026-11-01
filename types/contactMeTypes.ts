// What the visitor typed in the "you can reach me at" input
// - empty:    nothing typed yet
// - email:    looks like a valid email address
// - telegram: looks like a valid Telegram username
// - invalid:  something was typed but it is neither of the two
export type ReachKind = "empty" | "email" | "telegram" | "invalid";

// The only three answers allowed for "I'd like to talk about"
export type ContactTopicId = "project" | "job" | "hello";

// One option of "I'd like to talk about"
export interface ContactTopic {
  id: ContactTopicId;
  label: string;
  // Tailwind classes must be written in full (Tailwind can't see class names
  // that are built with string pieces), so every color lives here as full classes
  wordIdleClass: string; // the word when it is not selected
  wordActiveClass: string; // the word when it is selected (highlighted)
}

// One "copy me" item under the form (email / telegram)
export interface ContactDetail {
  id: "email" | "telegram";
  value: string;
  iconClass: string; // color of the left icon
  hoverClass: string; // border color on hover
  copiedClass: string; // border color right after copying
}

// Message shown under the form (error or success)
export interface ContactFeedback {
  type: "error" | "success";
  text: string;
}

// Everything the visitor can fill in
export interface ContactValues {
  name: string;
  reach: string;
  topicId: ContactTopicId | null;
  message: string;
}

// The clean, checked data that will be sent (in the next step)
export interface ContactPayload {
  name: string;
  reach: string;
  reachKind: "email" | "telegram";
  topic: ContactTopicId;
  message: string;
}

// Result of the full validation
export type ContactValidationResult =
  | { ok: true; payload: ContactPayload }
  | { ok: false; error: string };
