import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import {
  CONTACT_ERRORS,
  CONTACT_TEXTS,
  CONTACT_TIMING,
} from "@/content/contactMeContents";
import type { ContactFeedback, ContactTopicId } from "@/types/contactMeTypes";
import {
  sanitizeMessage,
  sanitizeName,
  sanitizeReach,
} from "@/utils/contactMeFunctions/contactSanitizers";
import { sendContactMessage } from "@/utils/contactMeFunctions/contactSend";
import {
  detectReachKind,
  isNameValid,
  isTopicId,
  validateContactForm,
} from "@/utils/contactMeFunctions/contactValidators";

type TextField = HTMLInputElement | HTMLTextAreaElement;

// Remembers (in this browser) when the last message was sent.
// It only slows down careless repeats; the real limit will live on the server.
const readLastSentAt = (): number => {
  try {
    return Number(window.localStorage.getItem(CONTACT_TIMING.storageKey)) || 0;
  } catch {
    return 0; // storage blocked (private mode, etc.)
  }
};

const writeLastSentAt = () => {
  try {
    window.localStorage.setItem(CONTACT_TIMING.storageKey, String(Date.now()));
  } catch {
    // storage blocked: nothing to do
  }
};

const useContactForm = () => {
  // ---- What the visitor filled in ----
  const [name, setName] = useState("");
  const [reach, setReach] = useState("");
  const [topicId, setTopicId] = useState<ContactTopicId | null>(null);
  const [message, setMessage] = useState("");

  // ---- Hidden trap field: real people never see it, bots fill it ----
  const [honeypot, setHoneypot] = useState("");

  // ---- Status ----
  const [feedback, setFeedback] = useState<ContactFeedback | null>(null);
  const [isSending, setIsSending] = useState(false);

  const startedAtRef = useRef<number | null>(null); // when the visitor first touched the form
  const sendingRef = useRef(false); // blocks double clicks instantly
  const mountedRef = useRef(true); // avoids updating the state after leaving the page

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ---- Which step is open ----
  // The sentence works step by step: name -> email/telegram -> topic -> message.
  // A step opens only when every step before it is done.
  const reachKind = detectReachKind(reach);
  const stepsDone = [
    isNameValid(name),
    reachKind === "email" || reachKind === "telegram",
    topicId !== null,
    message.trim().length > 0,
  ];
  const firstUndone = stepsDone.findIndex((done) => !done);
  const openStep = firstUndone === -1 ? stepsDone.length - 1 : firstUndone;
  const isStepUnlocked = (step: number) => step <= openStep;

  // ---- Small helpers ----
  const markStarted = () => {
    if (startedAtRef.current === null) startedAtRef.current = Date.now();
  };

  // Sanitizes the new text and keeps the caret where the visitor was typing
  // (otherwise removing a bad character would throw the caret to the end)
  const applyField = (
    element: TextField,
    sanitize: (value: string) => string,
    setValue: (value: string) => void,
  ) => {
    const raw = element.value;
    const caret = element.selectionStart ?? raw.length;
    const clean = sanitize(raw);

    setValue(clean);
    markStarted();
    setFeedback(null);

    if (clean !== raw) {
      const nextCaret = Math.min(
        Math.max(0, caret - (raw.length - clean.length)),
        clean.length,
      );
      requestAnimationFrame(() => {
        try {
          element.setSelectionRange(nextCaret, nextCaret);
        } catch {
          // the field is no longer on the page
        }
      });
    }
  };

  // ---- Change handlers (one per field) ----
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) =>
    applyField(event.target, sanitizeName, setName);

  const handleReachChange = (event: ChangeEvent<HTMLInputElement>) =>
    applyField(event.target, sanitizeReach, setReach);

  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    applyField(event.target, sanitizeMessage, setMessage);

  const handleTopicSelect = (id: ContactTopicId) => {
    if (!isTopicId(id)) return; // only the allowed options can be selected
    setTopicId(id);
    markStarted();
    setFeedback(null);
  };

  const handleHoneypotChange = (event: ChangeEvent<HTMLInputElement>) =>
    setHoneypot(event.target.value.slice(0, 100));

  // ---- Back to an empty form ----
  const resetForm = () => {
    setName("");
    setReach("");
    setTopicId(null);
    setMessage("");
    setHoneypot("");
    startedAtRef.current = null;
  };

  // ---- Send button ----
  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault(); // never let the browser submit the form by itself
      if (sendingRef.current) return; // already sending

      // 1) Bot trap: a bot filled the hidden field -> pretend everything is fine
      //    and send nothing
      if (honeypot.trim() !== "") {
        resetForm();
        setFeedback({ type: "success", text: CONTACT_TEXTS.success });
        return;
      }

      // 2) Too fast: a human can't fill the whole form this quickly
      if (
        startedAtRef.current === null ||
        Date.now() - startedAtRef.current < CONTACT_TIMING.minFillMs
      ) {
        setFeedback({ type: "error", text: CONTACT_ERRORS.tooFast });
        return;
      }

      // 3) Cooldown: one message every few seconds at most
      const waitMs =
        CONTACT_TIMING.cooldownMs - (Date.now() - readLastSentAt());
      if (waitMs > 0) {
        setFeedback({
          type: "error",
          text: CONTACT_ERRORS.cooldown(Math.ceil(waitMs / 1000)),
        });
        return;
      }

      // 4) Full check of every field (sanitizes again, then validates)
      const result = validateContactForm({ name, reach, topicId, message });
      if (!result.ok) {
        setFeedback({ type: "error", text: result.error });
        return;
      }

      // 5) Send (placeholder for now)
      sendingRef.current = true;
      setIsSending(true);
      setFeedback(null);

      try {
        await sendContactMessage(result.payload);
        writeLastSentAt();
        if (!mountedRef.current) return;
        resetForm();
        setFeedback({ type: "success", text: CONTACT_TEXTS.success });
      } catch {
        if (mountedRef.current) {
          setFeedback({ type: "error", text: CONTACT_ERRORS.generic });
        }
      } finally {
        sendingRef.current = false;
        if (mountedRef.current) setIsSending(false);
      }
    },
    // resetForm only uses state setters and a ref, so it never changes
    [honeypot, name, reach, topicId, message],
  );

  return {
    values: { name, reach, topicId, message, honeypot },
    reachKind,
    feedback,
    isSending,
    isStepUnlocked,
    handleNameChange,
    handleReachChange,
    handleTopicSelect,
    handleMessageChange,
    handleHoneypotChange,
    handleSubmit,
  };
};

export default useContactForm;
