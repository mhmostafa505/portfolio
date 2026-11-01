import { useCallback, useEffect, useRef, useState } from "react";

// Which item was just copied and if the copy worked
type CopyStatus = { id: string; ok: boolean } | null;

// Old-school copy, used when the modern clipboard isn't available
// (for example on a page that isn't https)
function fallbackCopy(text: string): boolean {
  try {
    const helper = document.createElement("textarea");
    helper.value = text;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(helper);
    return ok;
  } catch {
    return false;
  }
}

// Copies a text to the clipboard and remembers it for a short time
// (so the button can show "Copied")
const useCopyToClipboard = (resetMs: number) => {
  const [status, setStatus] = useState<CopyStatus>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop the timer when the component disappears
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const copy = useCallback(
    async (id: string, text: string) => {
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        ok = fallbackCopy(text);
      }

      setStatus({ id, ok });
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setStatus(null), resetMs);
    },
    [resetMs],
  );

  return { status, copy };
};

export default useCopyToClipboard;
