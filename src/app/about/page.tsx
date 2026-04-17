import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AboutSidebarTabs from "@/components/about/AboutSidebarTabs";
import AboutBlocksContent from "@/components/about/AboutBlocksContent";
import { fetchAboutPage } from "@/lib/fetch-about-page";
import "@/styles/about.css";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const data = await fetchAboutPage();
  const title = data?.title?.trim() || "О нас";
  const description = data?.description?.trim() || undefined;
  const keywordsRaw = data?.keywords?.trim();
  const keywords = keywordsRaw
    ? keywordsRaw.split(/[,;]\s*/).filter(Boolean)
    : undefined;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function AboutPage() {
  const data = await fetchAboutPage();
  const pageTitle = data?.title?.trim() || "О нас";
  const blocks = data?.blocks ?? [];

  return (
    <>
      <Header />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">
            Главная
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">{pageTitle}</span>
        </div>
      </div>

      <div className="question_wrapper container about-page-wrapper">
        <div className="question_left_list">
          <AboutSidebarTabs />
        </div>

        <div className="questions_page_list">
          {!data ? (
            <section className="about-content-section">
              <div className="about-section-body">
                <p className="about-text">
                  Контент страницы временно недоступен. Проверьте настройку{" "}
                  <code>NEXT_PUBLIC_API_URL</code> и наличие записи{" "}
                  <code>about</code> в кастомных страницах.
                </p>
              </div>
            </section>
          ) : (
            <AboutBlocksContent blocks={blocks} />
          )}
        </div>

        <div className="question_right_list">
          <div className="vip_status_block">
            <div className="vip_icon">
              <img src="/images/vip.svg" alt="VIP" />
            </div>
            <p className="vip_gift_text">Подарить</p>
            <h3 className="vip_title">VIP статус</h3>
            <button type="button" className="vip_button">
              ПОДАРИТЬ
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
