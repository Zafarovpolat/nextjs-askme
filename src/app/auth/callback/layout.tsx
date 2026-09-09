import type { Metadata } from "next";
import { withPageUrl } from "@/lib/page-seo";

export const metadata: Metadata = withPageUrl("/auth/callback", {
  title: "Вход",
  robots: { index: false, follow: false },
});

export default function AuthCallbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
