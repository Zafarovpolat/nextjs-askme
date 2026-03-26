import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getApiFullUrl } from "@/config/api";
import type { QuestionPageData } from "@/types";
import QuestionPageContent from "./QuestionPageContent";

const TOKEN_KEY = "otvetai_token";

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const url = getApiFullUrl(`v1/questions/${id}`);
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_KEY)?.value;
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  const res = await fetch(url, { headers, next: { revalidate: 60 } });
  if (!res.ok) {
    if (res.status === 404) notFound();
    notFound();
  }
  const data: QuestionPageData = await res.json();
  return <QuestionPageContent initialQuestion={data} />;
}
