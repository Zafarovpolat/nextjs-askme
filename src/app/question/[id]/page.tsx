import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getApiFullUrl } from "@/config/api";
import { fetchMainSidebarCategoriesCached } from "@/lib/server-main-sidebar-categories";
import { fetchProfileWidgetsCached } from "@/lib/server-profile-widgets";
import type { QuestionPageData } from "@/types";
import QuestionPageContent from "./QuestionPageContent";

const TOKEN_KEY = "otvetai_token";

export default async function QuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ answer?: string }>;
}) {
  const { id } = await params;
  const { answer } = await searchParams;
  const anchorId = answer && /^\d+$/.test(answer) ? answer : null;
  const url = getApiFullUrl(
    `v1/questions/${id}?sort_by=rating&sort_dir=desc${
      anchorId ? `&anchor_answer_id=${anchorId}` : ""
    }`
  );
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_KEY)?.value;
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  const [res, sidebarCategories, widgets] = await Promise.all([
    /* user_vote / auth_extra — персональные: нельзя кэшировать ответ с чужой страницы/без токена */
    fetch(url, { headers, cache: "no-store" }),
    fetchMainSidebarCategoriesCached(),
    fetchProfileWidgetsCached(),
  ]);
  if (!res.ok) {
    if (res.status === 404) notFound();
    notFound();
  }
  const data: QuestionPageData = await res.json();
  return (
    <QuestionPageContent
      initialQuestion={data}
      initialAnchorAnswerId={anchorId ? Number(anchorId) : undefined}
      sidebarCategories={sidebarCategories}
      widgets={widgets}
    />
  );
}
