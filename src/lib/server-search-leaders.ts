import { cache } from "react";
import { getApiFullUrl } from "@/config/api";

export type SearchLeaderQuestion = {
  id: number;
  title: string;
  created_at: string | null;
  likes_count: number;
  author: {
    id: number;
    full_name: string;
    avatar_url: string | null;
  } | null;
};

type LeaderPayload = { questions?: SearchLeaderQuestion[] };

const REVALIDATE_SEC = 300;

async function fetchSearchLeaderQuestionsOnServer(): Promise<
  SearchLeaderQuestion[]
> {
  const url = getApiFullUrl("v1/search/leader-questions");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return [];
  }
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: REVALIDATE_SEC },
    });
    if (!res.ok) return [];
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) return [];
    const data = (await res.json()) as LeaderPayload;
    return Array.isArray(data.questions) ? data.questions : [];
  } catch {
    return [];
  }
}

export const fetchSearchLeaderQuestionsCached = cache(
  fetchSearchLeaderQuestionsOnServer,
);
