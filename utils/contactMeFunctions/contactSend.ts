import type { ContactPayload } from "@/types/contactMeTypes";

// ---------------------------------------------------------------------------
// SEND (placeholder)
// TODO (next step): replace the fake delay below with the real sending of
// `payload` to the server (Telegram / email). Right now nothing leaves the page.
// ---------------------------------------------------------------------------
export async function sendContactMessage(
  payload: ContactPayload,
): Promise<void> {
  void payload; // will be sent in the next step
  await new Promise((resolve) => setTimeout(resolve, 700));
}
