import { getApiFullUrl } from "@/config/api";
import LeadersPageContent from "./LeadersPageContent";

type LeaderUser = {
  id: number;
  full_name: string;
  avatar_url?: string | null;
  balls: number;
  level_name?: string | null;
};

type LeadersPageResponse = {
  top_leaders: LeaderUser[];
  leaders: LeaderUser[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

async function fetchLeaders(): Promise<LeadersPageResponse> {
  const fallback: LeadersPageResponse = {
    top_leaders: [],
    leaders: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  };

  const url = getApiFullUrl("v1/leaders?page=1&per_page=10");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return fallback;
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as Partial<LeadersPageResponse>;
    return {
      top_leaders: data.top_leaders ?? [],
      leaders: data.leaders ?? [],
      current_page: data.current_page ?? 1,
      last_page: data.last_page ?? 1,
      per_page: data.per_page ?? 10,
      total: data.total ?? 0,
    };
  } catch {
    return fallback;
  }
}

export default async function LeadersPage() {
  const initialData = await fetchLeaders();
  return <LeadersPageContent initialData={initialData} />;
}
