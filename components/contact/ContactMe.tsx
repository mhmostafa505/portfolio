"use client";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useScrollSpy } from "@/contexts/ScrollSpyContext";
import SectionHeader from "../SectionHeader";
import ContactMeAutoInput from "./ContactMeAutoInput";
import ContactMeSendButton from "./ContactMeSendButton";
import useContactForm from "@/hooks/useContactForm";
import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import {
  CONTACT_DETAILS,
  CONTACT_LIMITS,
  CONTACT_MESSAGE_HEIGHT,
  CONTACT_NAME_STYLE,
  CONTACT_PLACEHOLDERS,
  CONTACT_REACH_STYLES,
  CONTACT_TEXTS,
  CONTACT_TIMING,
  CONTACT_TOPICS,
} from "@/content/contactMeContents";
import { FiAlertCircle, FiCheck, FiCopy, FiMail } from "react-icons/fi";
import { FaTelegramPlane } from "react-icons/fa";

const pills = ["#Gmail", "#Telegram", "#Discord"];

const ContactMe = () => {
  const { registerSection } = useScrollSpy();
  const [activePillsIndex, setActivePillsIndex] = useState<number | null>(null);

  const messageRef = useRef<HTMLTextAreaElement>(null);

  // All the form logic (values, steps, checks, spam protection) lives in this hook
  const {
    values,
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
  } = useContactForm();

  // "Copied" feedback for the email / telegram buttons under the form
  const { status: copyStatus, copy } = useCopyToClipboard(
    CONTACT_TIMING.copiedResetMs,
  );

  // A step is dimmed until the step before it is done
  const stepClass = (step: number) =>
    `transition-opacity duration-300 ${
      isStepUnlocked(step) ? "opacity-100" : "pointer-events-none opacity-15"
    }`;

  // A step can't be used while it is locked (or while sending)
  const isLocked = (step: number) => !isStepUnlocked(step) || isSending;

  const messageLength = values.message.length;

  // Small icon inside the "reach me" input: tells what was detected
  const reachIcon =
    reachKind === "email" ? (
      <FiMail className="text-primary-purple" aria-hidden="true" />
    ) : reachKind === "telegram" ? (
      <FaTelegramPlane className="text-primary-hover" aria-hidden="true" />
    ) : reachKind === "invalid" ? (
      <FiAlertCircle className="text-[#ff5c5c]" aria-hidden="true" />
    ) : null;

  const setContactRef = useCallback(
    (el: HTMLElement | null) => registerSection("contact", el),
    [registerSection],
  );

  // Message box grows while typing, then starts scrolling at the max height
  useEffect(() => {
    const el = messageRef.current;
    if (!el) return;
    el.style.height = "auto";
    const { min, max } = CONTACT_MESSAGE_HEIGHT;
    el.style.height = `${Math.min(Math.max(el.scrollHeight, min), max)}px`;
    el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
  }, [values.message]);

  return (
    <section
      id="contact"
      ref={setContactRef}
      className="mt-10 mb-40 scroll-mt-37"
    >
      {/* Title and Pills */}
      <SectionHeader
        pills={pills}
        activePillsIndex={activePillsIndex}
        setActivePillsIndex={setActivePillsIndex}
        color="primary-yellow"
        title="Contact Me"
        number={5}
        isReverse={false}
      />

      <form
        onSubmit={handleSubmit}
        noValidate
        autoComplete="off"
        className="relative mt-10 text-primary-white"
      >
        {/* Hidden trap field: people can't see or reach it, bots fill it */}
        <div
          aria-hidden="true"
          className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
        >
          <label>
            Leave this field empty
            <input
              type="text"
              name="contact_confirm"
              tabIndex={-1}
              autoComplete="off"
              value={values.honeypot}
              onChange={handleHoneypotChange}
            />
          </label>
        </div>

        {/* Sentence: name + email/telegram */}
        <div className="text-xl leading-[2.4] sm:text-2xl sm:leading-[2.4]">
          {/* Step 1: name */}
          <span className={stepClass(0)}>
            Hi, I&apos;m{" "}
            <ContactMeAutoInput
              value={values.name}
              placeholder={CONTACT_PLACEHOLDERS.name}
              colorClass={CONTACT_NAME_STYLE}
              onChange={handleNameChange}
              maxLength={CONTACT_LIMITS.name.max}
              disabled={isLocked(0)}
              dir="auto"
              autoComplete="off"
              spellCheck={false}
              aria-label="Your name"
            />
          </span>{" "}
          {/* Step 2: email or telegram (icon shows what was detected) */}
          <span className={stepClass(1)}>
            and you can reach me at{" "}
            <ContactMeAutoInput
              value={values.reach}
              placeholder={CONTACT_PLACEHOLDERS.reach}
              colorClass={CONTACT_REACH_STYLES[reachKind]}
              paddingClass="pl-[30px] pr-1.5"
              icon={reachIcon}
              onChange={handleReachChange}
              maxLength={CONTACT_LIMITS.reach.max}
              disabled={isLocked(1)}
              dir="ltr"
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Your email or Telegram username"
              aria-invalid={reachKind === "invalid"}
            />{" "}
            .
          </span>{" "}
          {/* Step 3: topic (the three options are words inside the sentence) */}
          <div className={stepClass(2)}>
            I&apos;d like to talk about{" "}
            <span role="group" aria-label="What would you like to talk about?">
              {CONTACT_TOPICS.map((topic, index) => {
                const isSelected = topic.id === values.topicId;

                return (
                  <Fragment key={topic.id}>
                    {index > 0 && (
                      <span className="px-1 text-primary-white/30">/</span>
                    )}
                    <button
                      type="button"
                      data-cursor="pointer"
                      aria-pressed={isSelected}
                      disabled={isLocked(2)}
                      onClick={() => handleTopicSelect(topic.id)}
                      className={`cursor-pointer border-b px-[0.15em] leading-[1.7] transition-[opacity,color,background-color] duration-200 disabled:cursor-default ${
                        isSelected ? topic.wordActiveClass : topic.wordIdleClass
                      } ${values.topicId && !isSelected ? "opacity-35" : ""}`}
                    >
                      {topic.label}
                    </button>
                  </Fragment>
                );
              })}
            </span>{" "}
            .
          </div>
        </div>

        {/* Step 4: message + send */}
        <div className={`mt-9 ${stepClass(3)}`}>
          <p
            id="contact-message-label"
            className="mb-3 text-[22px] sm:text-2xl"
          >
            Here&apos;s the full story:
          </p>

          <textarea
            id="contact-message"
            aria-labelledby="contact-message-label"
            ref={messageRef}
            value={values.message}
            onChange={handleMessageChange}
            maxLength={CONTACT_LIMITS.message.max}
            disabled={isLocked(3)}
            placeholder={CONTACT_PLACEHOLDERS.message}
            dir="auto"
            rows={5}
            autoComplete="off"
            className="block w-full resize-none overflow-x-hidden rounded-xl border border-primary-white/15 bg-transparent px-4.5 py-4 text-lg leading-relaxed text-[#fffcd4] outline-none transition-colors wrap-anywhere placeholder:text-primary-white/35 focus:border-primary-yellow disabled:cursor-default disabled:opacity-100 disabled:[-webkit-text-fill-color:currentColor] disabled:placeholder:[-webkit-text-fill-color:color-mix(in_srgb,var(--color-primary-white)_35%,transparent)] not-placeholder-shown:border-primary-yellow"
          />

          {/* Character counter (turns yellow near the limit) */}
          <div
            className={`mt-2.5 mr-2 text-right text-xs ${
              messageLength >= CONTACT_LIMITS.message.max * 0.9
                ? "text-primary-yellow"
                : "text-primary-white/40"
            }`}
          >
            {messageLength} / {CONTACT_LIMITS.message.max}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <span className="min-w-0 text-lg text-primary-white/60 wrap-anywhere">
              Thanks,{" "}
              <span className="text-primary-yellow">
                {values.name.trim() || "you"}
              </span>
            </span>

            {/* Send Message Buttons */}
            <ContactMeSendButton
              disabled={isLocked(3)}
              label={isSending ? CONTACT_TEXTS.sending : CONTACT_TEXTS.send}
            />
          </div>
        </div>

        {/* Error / success message (outside the dimmed steps so it stays clear) */}
        <p
          role="status"
          aria-live="polite"
          className={`mt-3 min-h-5 text-sm ${
            feedback?.type === "success"
              ? "text-primary-hover"
              : "text-primary-yellow"
          }`}
        >
          {feedback?.text}
        </p>
      </form>

      {/* Not a form person? Copy my email or telegram */}
      <div className="mt-10 border-t border-dashed border-primary-white/15 pt-6">
        <p className="mb-1 text-lg text-primary-white">
          Forms not your thing? Fair enough.
        </p>
        <p className="mb-3.5 text-sm text-primary-white/60">
          Grab one of these and message me the old-fashioned way. Click to copy.
        </p>

        <div className="flex flex-wrap gap-3">
          {CONTACT_DETAILS.map((detail) => {
            // Was THIS button the last one clicked, and did the copy work?
            const copiedOk = copyStatus?.id === detail.id && copyStatus.ok;
            const copyFailed = copyStatus?.id === detail.id && !copyStatus.ok;

            return (
              <button
                key={detail.id}
                type="button"
                data-cursor="pointer"
                onClick={() => copy(detail.id, detail.value)}
                aria-label={`Copy ${detail.value}`}
                className={`inline-flex cursor-pointer items-center gap-2.5 rounded-[10px] border px-4 py-2.5 text-sm text-primary-white transition-colors ${
                  copiedOk ? detail.copiedClass : "border-primary-white/15"
                } ${detail.hoverClass}`}
              >
                {detail.id === "email" ? (
                  <FiMail
                    className={`text-lg ${detail.iconClass}`}
                    aria-hidden="true"
                  />
                ) : (
                  <FaTelegramPlane
                    className={`text-lg ${detail.iconClass}`}
                    aria-hidden="true"
                  />
                )}

                <span>
                  {copiedOk
                    ? CONTACT_TEXTS.copied
                    : copyFailed
                      ? CONTACT_TEXTS.copyFailed
                      : detail.value}
                </span>

                {copiedOk ? (
                  <FiCheck
                    className={`text-base ${detail.iconClass}`}
                    aria-hidden="true"
                  />
                ) : copyFailed ? (
                  <FiAlertCircle
                    className="text-base text-[#ff5c5c]"
                    aria-hidden="true"
                  />
                ) : (
                  <FiCopy
                    className="text-base text-primary-white/50"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ContactMe;
