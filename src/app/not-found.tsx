import type { Metadata } from "next";
import { headers } from "next/headers";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import NotFoundQuestions from "@/components/NotFoundQuestions";
import { fetchHomeQuestionsTabs } from "@/lib/home-questions-tabs";
import { ROBOTS_NOINDEX_FOLLOW, SITE_URL, absolutePageUrl } from "@/lib/page-seo";

const PAGE_TITLE = "Страница не найдена | otvetai";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = headers();
  const path = headerList.get("x-otvetai-path") || "";
  const canonical = path.startsWith("/") ? absolutePageUrl(path) : SITE_URL;

  return {
    title: { absolute: PAGE_TITLE },
    robots: ROBOTS_NOINDEX_FOLLOW,
    alternates: { canonical },
    openGraph: {
      title: PAGE_TITLE,
      url: canonical,
    },
    twitter: {
      title: PAGE_TITLE,
    },
  };
}

export default async function NotFound() {
  const initialByFilter = await fetchHomeQuestionsTabs(null, 1);

  return (
    <div className="not_found_wrapper">
      <div className="container">
        <div className="not_found_page">
          <img src="/images/404.png" alt="" />
          <h1>{PAGE_TITLE}</h1>
          <p>
            Попробуйте перейти на главную, в каталог категорий или найти нужное через поиск.
          </p>
          <div className="not_found_links">
            <Link href="/" className="m_btn category_btn">
              Главная
            </Link>
            <Link href="/categories" className="m_btn category_btn">
              Каталог
            </Link>
            <Link href="/search" className="m_btn category_btn">
              Поиск
            </Link>
          </div>
        </div>

        <NotFoundQuestions initialByFilter={initialByFilter} />
      </div>
      <Footer />
    </div>
  );
}
