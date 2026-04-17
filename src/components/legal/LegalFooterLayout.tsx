import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import LegalHtmlPageView from "@/components/legal/LegalHtmlPageView";
import type { CustomHtmlPageApi } from "@/types/custom-html-page";

export default function LegalFooterLayout({ page }: { page: CustomHtmlPageApi }) {
  return (
    <>
      <Header />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">
            Главная
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">{page.title}</span>
        </div>
      </div>
      <div className="container">
        <LegalHtmlPageView page={page} />
      </div>
      <Footer />
    </>
  );
}
