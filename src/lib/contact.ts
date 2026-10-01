/**
 * Contact details shown on the public pages come from each user's row in
 * site_layouts (Admin > Settings). Nothing here invents a fallback address:
 * a placeholder email that bounces costs a lead, so a missing value means the
 * row is simply not shown.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const cleanEmail = (raw?: string | null): string | null => {
  const value = raw?.trim();
  return value && EMAIL_PATTERN.test(value) ? value : null;
};

/**
 * wa.me only works with the full international number, digits only, no
 * leading zeros ("2348078660415", not "08078660415" or "+234 807..."). A
 * number that still starts with 0 has no country code, so we cannot know
 * which country it belongs to and return null instead of a broken link.
 */
export const whatsappDigits = (raw?: string | null): string | null => {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length < 8 || digits.length > 15 || digits.startsWith("0")) return null;
  return digits;
};

export const whatsappLink = (raw?: string | null): string | null => {
  const digits = whatsappDigits(raw);
  return digits ? `https://wa.me/${digits}` : null;
};

/** "+234 8078660415" style display, always with the plus sign. */
export const whatsappDisplay = (raw?: string | null): string | null => {
  const digits = whatsappDigits(raw);
  if (!digits) return null;
  const trimmed = raw!.trim();
  return trimmed.startsWith("+") ? trimmed : `+${digits}`;
};
