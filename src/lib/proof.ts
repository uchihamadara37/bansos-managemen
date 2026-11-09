// Hanya mengembalikan URL jika berskema https. Selain itu null.
export function safeProofUrl(value?: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}