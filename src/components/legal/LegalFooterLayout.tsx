import Link from "next/link";
import Footer from "@/components/layout/Footer";
import LegalHtmlPageView from "@/components/legal/LegalHtmlPageView";
import type { CustomHtmlPageApi } from "@/types/custom-html-page";

/* п.10 — footer прибит к низу через flex-колонку */
export default function LegalFooterLayout({ page }: { page: CustomHtmlPageApi }) {
  return (
    <div className="page-layout-sticky-footer">
      <div className="container" style={{ flex: 1 }}>
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">
            Главная
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">{page.title}</span>
          {page.version?.version != null ? (
            <>
              <span className="breadcrumbs__sep">•</span>
              <span className="breadcrumbs__current">ред. v{page.version.version}</span>
            </>
          ) : null}
        </div>
        <LegalHtmlPageView page={page} />
      </div>
      <Footer />
    </div>
  );
}
