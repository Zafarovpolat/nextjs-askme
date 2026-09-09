import type { Metadata } from "next";
import { withPageUrl } from "@/lib/page-seo";

export const metadata: Metadata = withPageUrl("/modals", {
  title: "Модалки",
  robots: { index: false, follow: false },
});

export default function ModalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
