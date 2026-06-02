import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import FaqPageClient from "./FaqPageClient";
import "@/styles/faq.css";

export const metadata: Metadata = {
  title: "Часто задаваемые вопросы — Otvetai",
  description: "Ответы на частые вопросы о платформе Otvetai: регистрация, вопросы и ответы, VIP статус, безопасность и технические проблемы.",
};

export default function FaqPage() {
  return (
    <>
      <Header />

      <div className="container">
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">Главная</Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">Частые вопросы</span>
        </div>
      </div>

      <FaqPageClient />

      <Footer />
    </>
  );
}
