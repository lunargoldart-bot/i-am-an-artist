// Native-feel web utilities: haptics (structure only), share API, clipboard.
// All functions degrade gracefully on unsupported browsers.

/* ------------------------------------------------------------------ */
/* Haptics pipeline (structural only).
 * In a Capacitor build these would map to ImpactFeedback/SuccessFails.
 * Until then we map to the standardised Vibration API and pass through.
 * ------------------------------------------------------------------ */
const canVibrate = () => typeof navigator !== "undefined" && "vibrate" in navigator;

const vibrationPattern = {
  light: 5,
  medium: 12,
  heavy: 30,
  selection: 8,
  success: [12, 40, 14],
  error: [22, 40, 22],
};

function fire(pattern) {
  if (!canVibrate()) return;
  try { navigator.vibrate(pattern); } catch { /* no-op */ }
}

export function haptic(type = "light") {
  fire(vibrationPattern[type] || vibrationPattern.medium);
}

export const hapticLight = () => haptic("light");
export const hapticMedium = () => haptic("medium");
export const hapticHeavy = () => haptic("heavy");
export const hapticSelection = () => haptic("selection");
export const hapticSuccess = () => haptic("success");
export const hapticError = () => haptic("error");

/* ------------------------------------------------------------------ */
/* Clipboard */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    return true;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Web Share API with clipboard fallback.
 * Resolves { method: 'share' | 'clipboard', ok: boolean | undefined } */
export async function shareContent({ title = "", text = "", url = window.location.href } = {}) {
  const nav = typeof navigator !== "undefined" ? navigator : null;

  if (nav?.share) {
    try {
      await nav.share({ title, text, url });
      return { method: "share", ok: true };
    } catch (err) {
      // User cancelled — not an error.
      if (err?.name === "AbortError" || err?.name === "NotAllowedError") {
        return { method: "share", ok: false };
      }
      // Fall through to copy.
    }
  }

  const copied = await copyToClipboard(url || text);
  return { method: "clipboard", handled: copied };
}