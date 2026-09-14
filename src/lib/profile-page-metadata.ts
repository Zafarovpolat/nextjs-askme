import { cache } from "react";
import { getApiFullUrl } from "@/config/api";
import { displayUserName, displayUserSubtitle } from "@/lib/ai-user-display";
import { formatCompactNumWord } from "@/lib/format-compact-count";
import type { PublicProfileUser } from "@/types";

const fetchProfileTopics = cache(async (id: string): Promise<string[]> => {
  const url = getApiFullUrl(`v1/users/${id}/questions?filter=all&per_page=10&page=1`);
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return [];
  }
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      questions?: { category?: { name?: string | null } | null }[];
    };
    const seen = new Set<string>();
    const names: string[] = [];
    for (const q of data.questions ?? []) {
      const name = q.category?.name?.trim();
      if (!name || seen.has(name)) continue;
      seen.add(name);
      names.push(name);
      if (names.length >= 3) break;
    }
    return names;
  } catch {
    return [];
  }
});

export function buildPublicProfileDescription(
  user: PublicProfileUser,
  topics: string[],
): string {
  const name = displayUserName(user);
  const rank = displayUserSubtitle(user);
  const answers = formatCompactNumWord(user.answers_count ?? 0, [
    "ответ",
    "ответа",
    "ответов",
  ]);
  const head = rank ? `${name}, ${rank}` : name;
  if (topics.length > 0) {
    return `${head}. ${answers}. Основные темы: ${topics.join(", ")}.`;
  }
  return `${head}. ${answers} на otvetai.`;
}

export async function publicProfileDescription(user: PublicProfileUser): Promise<string> {
  const topics = await fetchProfileTopics(String(user.id));
  return buildPublicProfileDescription(user, topics);
}
