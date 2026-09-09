import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import LegalHtmlPageView from "@/components/legal/LegalHtmlPageView";
import type { CustomHtmlPageApi } from "@/types/custom-html-page";

/* п.10 — footer прибит к низу через flex-колонку */
export default function LegalFooterLayout({ page }: { page: CustomHtmlPageApi }) {
  return (
    <div className="page-layout-sticky-footer">
      <div className="container" style={{ flex: 1 }}>
        <Breadcrumbs
          items={[
            { name: "Главная", href: "/" },
            { name: page.title, href: `/${page.slug}` },
          ]}
        />
        <LegalHtmlPageView page={page} />
      </div>
      <Footer />
    </div>
  );
}
