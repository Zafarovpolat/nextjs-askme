import { redirect } from "next/navigation";
import { fetchMeOnServerCached } from "@/lib/server-me";
import LoginPageClient from "./LoginPageClient";

export default async function LoginPage() {
  const me = await fetchMeOnServerCached();
  if (me?.user) {
    redirect("/");
  }
  return <LoginPageClient />;
}
