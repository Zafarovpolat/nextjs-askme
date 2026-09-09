import { redirect } from "next/navigation";
import { fetchMeOnServerCached } from "@/lib/server-me";
import { withPageUrl } from "@/lib/page-seo";
import LoginPageClient from "./LoginPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = withPageUrl("/login", {
  title: "Вход",
  robots: { index: false, follow: false },
});

export default async function LoginPage() {
  const me = await fetchMeOnServerCached();
  if (me?.user) {
    redirect("/");
  }
  return <LoginPageClient />;
}
