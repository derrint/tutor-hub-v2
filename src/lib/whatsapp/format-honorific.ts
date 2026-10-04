/** Stored honorifics omit the trailing dot; messages add it after "ya," (e.g. "Ma."). */
export function normalizeHonorificStored(honorific: string): string {
  return honorific.trim().replace(/\.+$/, "");
}

/** Honorific as it appears in Bahasa WhatsApp body copy. */
export function honorificInMessage(honorific: string): string {
  const base = normalizeHonorificStored(honorific);
  return base ? `${base}.` : "";
}
