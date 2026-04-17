import type { CustomHtmlPageApi } from "@/types/custom-html-page";
import "@/styles/legal-doc.css";

export default function LegalHtmlPageView({ page }: { page: CustomHtmlPageApi }) {
  return (
    <article className="legal-doc">
      <h1 className="legal-doc__title">{page.title}</h1>
      <div
        className="legal-doc__body"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </article>
  );
}
