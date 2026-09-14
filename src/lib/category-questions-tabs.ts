import { notFound } from "next/navigation";
import { getApiFullUrl } from "@/config/api";

export const CATEGORY_QUESTION_FILTERS = ["open", "voting", "best"] as const;
export type CategoryQuestionFilter = (typeof CATEGORY_QUESTION_FILTERS)[number];

export type CategoryQuestionListItem = {
  id: number;
  title: string;
  created_at: string;
  answers_count: number;
  likes_count: number;
  author: { id: number; full_name: string; avatar_url?: string | null; balls?: number };
  latest_likers: { id: number; avatar_url?: string | null }[];
};

export type CategoryQuestionsPage = {
  questions: CategoryQuestionListItem[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type CategoryQuestionsByFilter = Record<CategoryQuestionFilter, CategoryQuestionsPage>;

const PER_PAGE = 10;

function emptyQuestionsPage(page = 1): CategoryQuestionsPage {
  return {
    questions: [],
    current_page: page,
    last_page: 1,
    per_page: PER_PAGE,
    total: 0,
  };
}

export function parseCategoryQuestionFilter(raw: unknown): CategoryQuestionFilter {
  if (raw === "voting" || raw === "best" || raw === "open") return raw;
  return "open";
}

/** Явно указанный filter в URL; иначе page идёт на все вкладки. */
export function parseExplicitCategoryFilter(raw: unknown): CategoryQuestionFilter | null {
  if (raw === "voting" || raw === "best" || raw === "open") return raw;
  return null;
}

export function parseCategoryQuestionPage(raw: unknown): number {
  const n = Number.parseInt(String(raw ?? "1"), 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

/** Ссылка вкладки/страницы списка. Дефолт (открытые, стр. 1) — без query. */
export function categoryQuestionsHref(
  basePath: string,
  filter: CategoryQuestionFilter,
  page: number,
): string {
  const qs = new URLSearchParams();
  if (filter !== "open") qs.set("filter", filter);
  if (page > 1) qs.set("page", String(page));
  const q = qs.toString();
  return q ? `${basePath}?${q}` : basePath;
}

function normalizeQuestionsPage(
  data: Partial<CategoryQuestionsPage> | undefined,
  fallbackPage: number,
): CategoryQuestionsPage {
  return {
    questions: data?.questions ?? [],
    current_page: data?.current_page ?? fallbackPage,
    last_page: Math.max(1, data?.last_page ?? 1),
    per_page: data?.per_page ?? PER_PAGE,
    total: data?.total ?? 0,
  };
}

/** Первые экраны всех вкладок одним запросом.
 *  Без explicitFilter — запрошенная страница у всех вкладок. */
export async function fetchCategoryQuestionsTabs(
  tabsEndpoint: string,
  explicitFilter: CategoryQuestionFilter | null,
  activePage: number,
): Promise<CategoryQuestionsByFilter> {
  const params = new URLSearchParams({
    page: String(activePage),
    per_page: String(PER_PAGE),
  });
  if (explicitFilter) params.set("filter", explicitFilter);
  const res = await fetch(getApiFullUrl(`${tabsEndpoint}?${params}`), {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (res.status === 404) notFound();
  if (!res.ok) {
    return {
      open: emptyQuestionsPage(explicitFilter == null || explicitFilter === "open" ? activePage : 1),
      voting: emptyQuestionsPage(explicitFilter == null || explicitFilter === "voting" ? activePage : 1),
      best: emptyQuestionsPage(explicitFilter == null || explicitFilter === "best" ? activePage : 1),
    };
  }
  const data = (await res.json()) as Partial<Record<CategoryQuestionFilter, Partial<CategoryQuestionsPage>>>;
  return {
    open: normalizeQuestionsPage(data.open, explicitFilter == null || explicitFilter === "open" ? activePage : 1),
    voting: normalizeQuestionsPage(data.voting, explicitFilter == null || explicitFilter === "voting" ? activePage : 1),
    best: normalizeQuestionsPage(data.best, explicitFilter == null || explicitFilter === "best" ? activePage : 1),
  };
}
