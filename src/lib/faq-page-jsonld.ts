import { htmlToPlainText } from "@/lib/html-plain-text";
import { absolutePageUrl } from "@/lib/page-seo";
import type { FaqCategory } from "@/types/faq-page";

/**
 * FAQPage: пары вопрос — ответ со страницы /faq.
 * Google: mainEntity[] Question + acceptedAnswer.text (без HTML).
 */
export function buildFaqPageJsonLd(
  categories: FaqCategory[],
): Record<string, unknown> | null {
  const mainEntity: Record<string, unknown>[] = [];

  for (const cat of categories) {
    for (const item of cat.items ?? []) {
      const name = htmlToPlainText(item.q);
      const text = htmlToPlainText(item.a);
      if (!name || !text) continue;
      mainEntity.push({
        "@type": "Question",
        name,
        acceptedAnswer: {
          "@type": "Answer",
          text,
        },
      });
    }
  }

  if (mainEntity.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: absolutePageUrl("/faq"),
    mainEntity,
  };
}
