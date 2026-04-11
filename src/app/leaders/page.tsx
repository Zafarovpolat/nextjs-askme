import { getApiFullUrl } from "@/config/api";
import LeadersPageContent from "./LeadersPageContent";

export type LeaderSubcategory = {
  id: number;
  name: string;
  slug: string;
  icon_key?: string | null;
};

export type LeaderCategory = {
  id: number;
  name: string;
  slug: string;
  icon_key?: string | null;
  subcategories: LeaderSubcategory[];
};

export type LeaderUser = {
  rank: number;
  metric_value: number;
  id: number;
  full_name: string;
  avatar_url?: string | null;
  balls: number;
  level_name?: string | null;
};

export type LeadersPageResponse = {
  categories: LeaderCategory[];
  period: string;
  metric: string;
  category_id: number | null;
  subcategory_id: number | null;
  per_page: number;
  current_page: number;
  last_page: number;
  total: number;
  users: LeaderUser[];
};

async function fetchLeaders(): Promise<LeadersPageResponse> {
  const empty: LeadersPageResponse = {
    categories: [],
    period: "day",
    metric: "answers",
    category_id: null,
    subcategory_id: null,
    per_page: 15,
    current_page: 1,
    last_page: 1,
    total: 0,
    users: [],
  };

  const url = getApiFullUrl("v1/leaders?period=day&metric=answers&page=1");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return empty;
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return empty;
    const data = (await res.json()) as Partial<LeadersPageResponse>;
    return {
      categories: data.categories ?? [],
      period: data.period ?? "day",
      metric: data.metric ?? "answers",
      category_id: data.category_id ?? null,
      subcategory_id: data.subcategory_id ?? null,
      per_page: data.per_page ?? 15,
      current_page: data.current_page ?? 1,
      last_page: data.last_page ?? 1,
      total: data.total ?? 0,
      users: data.users ?? [],
    };
  } catch {
    return empty;
  }
}

export default async function LeadersPage() {
  const initialData = await fetchLeaders();
  return <LeadersPageContent initialData={initialData} />;
}
