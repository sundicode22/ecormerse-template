/** Convert a display name into a URL-safe slug. */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Convert a display name into a SKU (uppercase, hyphenated). */
export function generateSku(value: string): string {
  return slugify(value).toUpperCase()
}
