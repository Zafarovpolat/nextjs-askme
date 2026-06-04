import { redirect } from "next/navigation";
import { fetchMeOnServerCached } from "@/lib/server-me";
import SignupPageClient from "./SignupPageClient";

export default async function SignupPage() {
  const me = await fetchMeOnServerCached();
  if (me?.user) {
    redirect("/");
  }
  return <SignupPageClient />;
}
