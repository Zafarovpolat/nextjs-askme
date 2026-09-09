import { cookies } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import type { Metadata } from "next";
import { getApiFullUrl } from "@/config/api";
import { fetchMainSidebarCategoriesCached } from "@/lib/server-main-sidebar-categories";
import { fetchProfileWidgetsCached } from "@/lib/server-profile-widgets";
import { metadataForQuestionPage } from "@/lib/question-page-metadata";
import { canonicalQuestionIdSegment } from "@/lib/question-canonical";
import type { AnswerAnchorRef } from "@/lib/question-answer-tree";
import type { QuestionPageData } from "@/types";
import JsonLd from "@/components/JsonLd";
import { buildQuestionQaPageJsonLd } from "@/lib/question-qapage-jsonld";
import QuestionPageContent from "./QuestionPageContent";

const TOKEN_KEY = "otvetai_token";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const canonicalId = canonicalQuestionIdSegment(id);
  if (!canonicalId) {
    return { title: "Вопрос" };
  }
  return metadataForQuestionPage(canonicalId);
}

export default async function QuestionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ answer?: string; coment?: string }>;
}) {
  const { id: rawId } = await params;
  const { answer, coment } = await searchParams;
  const id = canonicalQuestionIdSegment(rawId);
  if (!id) {
    notFound();
  }
  if (rawId !== id) {
    const q = new URLSearchParams();
    if (answer) q.set("answer", answer);
    if (coment) q.set("coment", coment);
    const qs = q.toString();
    permanentRedirect(`/question/${id}${qs ? `?${qs}` : ""}`);
  }

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
    <>
      <JsonLd data={buildQuestionQaPageJsonLd(data)} />
      <QuestionPageContent
        key={data.id}
        initialQuestion={data}
        initialAnchor={initialAnchor}
        sidebarCategories={sidebarCategories}
        widgets={widgets}
      />
    </>
  );
}
