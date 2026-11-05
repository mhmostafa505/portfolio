"use client";
import { useSendButtonFx } from "@/hooks/useSendButtonFx";
import { SEND_ICON_PATH } from "@/content/contactMeContents";

interface ContactMeSendButtonProps {
  disabled?: boolean;
  type?: "button" | "submit";
  label?: string;
  onClick?: () => void;
}

const ContactMeSendButton = ({
  disabled = false,
  type = "submit",
  label = "Send message",
  onClick,
}: ContactMeSendButtonProps) => {
  const {
    buttonRef,
    rippleRef,
    slotRef,
    riseRef,
    linesRef,
    eyesRef,
    handlers,
  } = useSendButtonFx(disabled);

  return (
    <button
      ref={buttonRef}
      type={type}
      data-cursor="pointer"
      data-load
      disabled={disabled}
      onClick={onClick}
      {...handlers}
      className="relative inline-flex cursor-pointer items-center gap-2.5 rounded-lg bg-primary-yellow px-6 py-2.5 text-[15px] font-medium text-primary-bg disabled:cursor-default"
    >
      {/* Teal ripple (clipped inside the button) */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      >
        <span
          ref={rippleRef}
          className="absolute inset-0 bg-primary-hover [clip-path:circle(0px_at_50%_50%)]"
        />
      </span>

      {/* Icon: draw loop normally, eyes on hover */}
      <span ref={slotRef} className="relative z-10 inline-flex h-5 w-5">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {/* Bubble outline */}
          <path className="send-draw" pathLength={1} d={SEND_ICON_PATH} />

          {/* Two text lines (hidden on hover) */}
          <g ref={linesRef} className="transition-opacity duration-200">
            <path
              className="send-draw send-draw-1"
              pathLength={1}
              d="M8 10h8"
            />
            <path
              className="send-draw send-draw-2"
              pathLength={1}
              d="M8 13.5h5"
            />
          </g>

          {/* Eyes (shown on hover) */}
          <g
            ref={eyesRef}
            className="opacity-0 transition-opacity duration-200"
          >
            <g className="send-eye">
              <circle cx="9" cy="11" r="2.7" strokeWidth={1.6} />
              <circle
                className="send-pupil"
                cx="9"
                cy="11"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </g>
            <g className="send-eye">
              <circle cx="15" cy="11" r="2.7" strokeWidth={1.6} />
              <circle
                className="send-pupil"
                cx="15"
                cy="11"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </g>
          </g>
        </svg>
      </span>

      {/* Label */}
      <span className="relative z-10">{label}</span>

      {/* Layer where the rising message icons float */}
      <span
        ref={riseRef}
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 z-30 h-0 w-0"
      />
    </button>
  );
};

export default ContactMeSendButton;
