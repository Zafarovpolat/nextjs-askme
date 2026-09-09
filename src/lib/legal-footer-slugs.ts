/**
 * Slug в БД (custom_pages) = сегмент URL на фронте `/{slug}`
 * и параметр GET v1/custom-pages/{slug}.
 * Архив редакции: `/{slug}?v={version}`.
 *
 * Документы: user-agreement, privacy-policy, consent-advertising, cookies, support.
 * (consent-personal-data не используем — вместо него user-agreement.)
 */
export const LEGAL_FOOTER_SLUGS = {
  userAgreement: "user-agreement",
  privacyPolicy: "privacy-policy",
  consentAdvertising: "consent-advertising",
  support: "support",
  cookies: "cookies",
} as const;

/** Ссылки футера (5 документов). */
export const LEGAL_FOOTER_LINKS = [
  {
    slug: LEGAL_FOOTER_SLUGS.userAgreement,
    label: "Пользовательское соглашение",
  },
  {
    slug: LEGAL_FOOTER_SLUGS.privacyPolicy,
    label: "Политика конфиденциальности",
  },
  {
    slug: LEGAL_FOOTER_SLUGS.consentAdvertising,
    label: "Согласие на рекламу",
  },
  {
    slug: LEGAL_FOOTER_SLUGS.cookies,
    label: "Файлы Cookie",
  },
  {
    slug: LEGAL_FOOTER_SLUGS.support,
    label: "Служба поддержки",
  },
] as const;

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
