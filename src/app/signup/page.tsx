import { redirect } from "next/navigation";
import { fetchMeOnServerCached } from "@/lib/server-me";
import { withPageUrl } from "@/lib/page-seo";
import SignupPageClient from "./SignupPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = withPageUrl("/signup", {
  title: "Регистрация",
  robots: { index: false, follow: false },
});

export default async function SignupPage() {
  const me = await fetchMeOnServerCached();
  if (me?.user) {
    redirect("/");
  }
  return <SignupPageClient />;
}
