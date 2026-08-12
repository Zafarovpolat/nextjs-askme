/**
 * Slug в БД (custom_pages) = сегмент URL на фронте `/{slug}`
 * и параметр GET v1/custom-pages/{slug}.
 * Архив редакции: `/{slug}?v={version}`.
 *
 * Версионируются: user-agreement, privacy-policy, cookies.
 */
export const LEGAL_FOOTER_SLUGS = {
  userAgreement: "user-agreement",
  privacyPolicy: "privacy-policy",
  support: "support",
  cookies: "cookies",
} as const;

export function legalFooterHref(slug: string, version?: number | null): string {
  const base = `/${slug}`;
  if (version != null && version > 0) {
    return `${base}?v=${version}`;
  }
  return base;
}

/** Ссылка на кастомную страницу (тот же паттерн URL, что и у legal footer). */
export function customPageHref(slug: string, version?: number | null): string {
  const normalized = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!normalized) return "/";
  return legalFooterHref(normalized, version);
}
