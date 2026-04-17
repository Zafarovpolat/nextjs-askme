/**
 * Slug в БД (custom_pages) = сегмент URL на фронте и параметр GET v1/custom-pages/{slug}.
 * При смене slug: обновите константу, переименуйте папку `app/{slug}/`, перезапустите сидер
 * с новым slug (или правьте запись в админке) и проверьте футер.
 */
export const LEGAL_FOOTER_SLUGS = {
  userAgreement: "user-agreement",
  support: "support",
  cookies: "cookies",
} as const;

export function legalFooterHref(slug: string): string {
  return `/${slug}`;
}
