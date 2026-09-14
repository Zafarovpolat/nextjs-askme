import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ROBOTS_NOINDEX_FOLLOW } from "@/lib/page-seo";

/** Индексация закрыта, обход ссылок разрешён. */
export const metadata: Metadata = {
  robots: ROBOTS_NOINDEX_FOLLOW,
};

export default function PublicProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
