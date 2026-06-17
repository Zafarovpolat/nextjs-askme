import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getApiFullUrl } from "@/config/api";
import { fetchMainSidebarCategoriesCached } from "@/lib/server-main-sidebar-categories";
import { fetchProfileWidgetsCached } from "@/lib/server-profile-widgets";
import { metadataForQuestionPage } from "@/lib/question-page-metadata";
import type { AnswerAnchorRef } from "@/lib/question-answer-tree";
import type { QuestionPageData } from "@/types";
import QuestionPageContent from "./QuestionPageContent";

const TOKEN_KEY = "otvetai_token";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return metadataForQuestionPage(id);
}

export default async function QuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ answer?: string; coment?: string }>;
}) {
  const { id } = await params;
  const { answer, coment } = await searchParams;

  let initialAnchor: AnswerAnchorRef | undefined;
  let anchorTargetId: string | null = null;

  if (coment && /^\d+$/.test(coment) && answer && /^\d+$/.test(answer)) {
    initialAnchor = {
      rootAnswerId: Number(answer),
      targetId: Number(coment),
    };
    anchorTargetId = coment;
  } else if (answer && /^\d+$/.test(answer)) {
    initialAnchor = { targetId: Number(answer) };
    anchorTargetId = answer;
  }

  const url = getApiFullUrl(
    `v1/questions/${id}?sort_by=rating&sort_dir=desc${
      anchorTargetId ? `&anchor_answer_id=${anchorTargetId}` : ""
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
      key={data.id}
      initialQuestion={data}
      initialAnchor={initialAnchor}
      sidebarCategories={sidebarCategories}
      widgets={widgets}
    />
  );
}
