import { isStoredUrlSlug } from "@/lib/site-path-canonical";

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
    label: "Политика обработки персональных данных",
  },
  {
    slug: LEGAL_FOOTER_SLUGS.consentAdvertising,
    label: "Согласие на обработку персональных данных",
  },
  {
    slug: LEGAL_FOOTER_SLUGS.cookies,
    label: "Уведомление о файлах Cookie",
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
  const exact = slug.trim();
  if (!isStoredUrlSlug(exact)) return "/";
  return legalFooterHref(exact, version);
}
