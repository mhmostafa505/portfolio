import { CONTACT_COMPOSER } from "@/content/contactMeContents";

interface ContactMeComposerHeaderProps {
  doneSteps: number; // how many steps are finished (0 to 4)
}

// Top bar of the Composer window: title + "Step 2 of 4" + progress ticks
const ContactMeComposerHeader = ({
  doneSteps,
}: ContactMeComposerHeaderProps) => {
  const total = CONTACT_COMPOSER.totalSteps;
  const isReady = doneSteps >= total;
  const currentStep = Math.min(doneSteps + 1, total);

  return (
    <div
      data-load-line="bottom"
      className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-primary-white/15 px-4.5 py-3 text-[13px] sm:px-6"
    >
      {/* Title */}
      <span data-load className="font-medium text-primary-white">
        {CONTACT_COMPOSER.title}
      </span>

      {/* Status + progress ticks */}
      <span
        data-load
        className="ml-auto inline-flex items-center gap-2.5 text-primary-white/60"
      >
        <span>
          {isReady
            ? CONTACT_COMPOSER.ready
            : `${CONTACT_COMPOSER.step} ${currentStep} ${CONTACT_COMPOSER.of} ${total}`}
        </span>

        <span className="inline-flex gap-1" aria-hidden="true">
          {Array.from({ length: total }, (_, index) => (
            <i
              key={index}
              className={`h-1 w-4.5 rounded-full transition-colors duration-300 ${
                index < doneSteps
                  ? "bg-primary-yellow"
                  : index === doneSteps
                    ? "bg-primary-yellow/50"
                    : "bg-primary-white/15"
              }`}
            />
          ))}
        </span>
      </span>
    </div>
  );
};

export default ContactMeComposerHeader;
