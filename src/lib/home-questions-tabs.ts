import { getApiFullUrl } from "@/config/api";

export const HOME_QUESTION_FILTERS = ["open", "voting", "best", "premium"] as const;
export type HomeQuestionFilter = (typeof HOME_QUESTION_FILTERS)[number];

export type HomeQuestionListItem = {
  id: number;
  title: string;
  created_at: string;
  answers_count: number;
  likes_count: number;
  is_premium?: boolean;
  author: { id: number; full_name: string; avatar_url?: string | null; balls?: number };
  latest_likers: { id: number; avatar_url?: string | null }[];
};

export type HomeQuestionsPage = {
  questions: HomeQuestionListItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type HomeQuestionsByFilter = Record<HomeQuestionFilter, HomeQuestionsPage>;

const PER_PAGE = 10;

function emptyQuestionsPage(page = 1): HomeQuestionsPage {
  return {
    questions: [],
    current_page: page,
    last_page: 1,
    per_page: PER_PAGE,
    total: 0,
  };
}

export function parseHomeQuestionFilter(raw: unknown): HomeQuestionFilter {
  if (raw === "voting" || raw === "best" || raw === "premium" || raw === "open") return raw;
  return "open";
}

export function parseHomeQuestionPage(raw: unknown): number {
  const n = Number.parseInt(String(raw ?? "1"), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function normalizeQuestionsPage(
  data: Partial<HomeQuestionsPage> | undefined,
  fallbackPage: number,
): HomeQuestionsPage {
  return {
    questions: data?.questions ?? [],
    current_page: data?.current_page ?? fallbackPage,
    last_page: Math.max(1, data?.last_page ?? 1),
    per_page: data?.per_page ?? PER_PAGE,
    total: data?.total ?? 0,
  };
}

export async function fetchHomeQuestionsTabs(
  activeFilter: HomeQuestionFilter,
  activePage: number,
): Promise<HomeQuestionsByFilter> {
  const params = new URLSearchParams({
    filter: activeFilter,
    page: String(activePage),
    per_page: String(PER_PAGE),
  });
  const res = await fetch(getApiFullUrl(`v1/main/questions-tabs?${params}`), {
    headers: { Accept: "application/json" },
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    return {
      open: emptyQuestionsPage(activeFilter === "open" ? activePage : 1),
      voting: emptyQuestionsPage(activeFilter === "voting" ? activePage : 1),
      best: emptyQuestionsPage(activeFilter === "best" ? activePage : 1),
      premium: emptyQuestionsPage(activeFilter === "premium" ? activePage : 1),
    };
  }
  const data = (await res.json()) as Partial<Record<HomeQuestionFilter, Partial<HomeQuestionsPage>>>;
  return {
    open: normalizeQuestionsPage(data.open, activeFilter === "open" ? activePage : 1),
    voting: normalizeQuestionsPage(data.voting, activeFilter === "voting" ? activePage : 1),
    best: normalizeQuestionsPage(data.best, activeFilter === "best" ? activePage : 1),
    premium: normalizeQuestionsPage(data.premium, activeFilter === "premium" ? activePage : 1),
  };
}
