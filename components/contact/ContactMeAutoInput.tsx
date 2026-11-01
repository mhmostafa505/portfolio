import type { InputHTMLAttributes, ReactNode } from "react";

type ContactMeAutoInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "value" | "placeholder"
> & {
  value: string;
  placeholder: string;
  colorClass: string; // text + underline colors (full Tailwind classes)
  paddingClass?: string; // left/right space inside the input
  sizerText?: string; // optional longest text, so the width never goes below it
  icon?: ReactNode; // small icon shown inside the left side of the input
};

// An input that is exactly as wide as its text (or its placeholder), so it can
// sit inside a sentence. The width comes from hidden copies of the text placed
// in the same grid cell: the widest copy decides the width and the real input
// stretches over it. No JavaScript measuring is needed.
const ContactMeAutoInput = ({
  value,
  placeholder,
  colorClass,
  paddingClass = "px-1",
  sizerText,
  icon,
  ...inputProps
}: ContactMeAutoInputProps) => {
  // Hidden copy of a text (same font and padding as the input)
  const sizerClass = `${paddingClass} invisible col-start-1 row-start-1 min-w-0 overflow-hidden whitespace-pre border-b border-transparent leading-normal`;

  return (
    <span className="relative inline-grid max-w-full align-baseline">
      {/* Icon on the left side of the input (never changes the text position) */}
      {icon && (
        <span className="pointer-events-none absolute top-1/2 left-1.5 flex text-[0.8em] -translate-y-1/2">
          {icon}
        </span>
      )}

      {/* Hidden copies that decide the width ("\u00A0" adds a little room for the caret) */}
      <span aria-hidden="true" className={sizerClass}>
        {value}
        {"\u00A0"}
      </span>
      <span aria-hidden="true" className={sizerClass}>
        {placeholder}
        {"\u00A0"}
      </span>
      {sizerText && (
        <span aria-hidden="true" className={sizerClass}>
          {sizerText}
          {"\u00A0"}
        </span>
      )}

      {/* The real input (the disabled: classes stop Safari from re-coloring and fading locked inputs) */}
      <input
        {...inputProps}
        value={value}
        placeholder={placeholder}
        className={`${paddingClass} ${colorClass} col-start-1 row-start-1 w-full min-w-0 rounded-none border-0 border-b border-dashed bg-transparent text-center outline-none leading-normal placeholder:text-primary-white/35 placeholder:text-[1.4rem] focus:border-solid disabled:cursor-default disabled:opacity-100 disabled:[-webkit-text-fill-color:currentColor] disabled:placeholder:[-webkit-text-fill-color:color-mix(in_srgb,var(--color-primary-white)_55%,transparent)] not-placeholder-shown:border-solid`}
      />
    </span>
  );
};

export default ContactMeAutoInput;
