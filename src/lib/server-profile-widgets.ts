import { cache } from "react";
import { getApiFullUrl } from "@/config/api";

export type ProfileWidgetUser = {
  id: number;
  full_name: string;
  avatar_url?: string | null;
  level_name?: string | null;
  week_score?: number;
  /** Текущие баллы (виджет «Самые активные авторы» — отбор по вопросам за неделю). */
  balls?: number;
};

export type ProfileWidgetsPayload = {
  weekly_balls_leaders: ProfileWidgetUser[];
  weekly_active_authors: ProfileWidgetUser[];
};

const WIDGETS_REVALIDATE_SEC = 300;

/** GET v1/profile/widgets на сервере (кэш Laravel + Next revalidate). */
export async function fetchProfileWidgetsOnServer(): Promise<ProfileWidgetsPayload> {
  const url = getApiFullUrl("v1/profile/widgets");
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return { weekly_balls_leaders: [], weekly_active_authors: [] };
  }
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: WIDGETS_REVALIDATE_SEC },
    });
    if (!res.ok) {
      return { weekly_balls_leaders: [], weekly_active_authors: [] };
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return { weekly_balls_leaders: [], weekly_active_authors: [] };
    }
    const data = (await res.json()) as Partial<ProfileWidgetsPayload>;
    return {
      weekly_balls_leaders: Array.isArray(data.weekly_balls_leaders) ? data.weekly_balls_leaders : [],
      weekly_active_authors: Array.isArray(data.weekly_active_authors) ? data.weekly_active_authors : [],
    };
  } catch {
    return { weekly_balls_leaders: [], weekly_active_authors: [] };
  }
}

/** Один HTTP-запрос виджетов на весь серверный рендер страницы (параллельно с другими RSC). */
export const fetchProfileWidgetsCached = cache(fetchProfileWidgetsOnServer);
