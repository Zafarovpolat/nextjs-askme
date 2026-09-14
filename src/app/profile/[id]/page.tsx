import { cache, Suspense } from "react";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getApiFullUrl } from "@/config/api";
import { AUTH_TOKEN_COOKIE_KEY } from "@/lib/auth-constants";
import type { PublicProfileUser } from "@/types";
import { fetchProfileWidgetsCached } from "@/lib/server-profile-widgets";
import PublicProfileContent from "./PublicProfileContent";
import { withPageUrl } from "@/lib/page-seo";
import { publicProfileDescription } from "@/lib/profile-page-metadata";

const PROFILE_REVALIDATE_SEC = 60;

async function fetchPublicProfileJson(
  id: string,
  init?: RequestInit & { next?: { revalidate?: number } },
): Promise<{ user: PublicProfileUser } | null> {
  const url = getApiFullUrl(`v1/users/${id}`);
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    console.error(
      "[profile] NEXT_PUBLIC_API_URL не задан или не абсолютный URL — серверный fetch к API невозможен. Укажите в .env.local, например: NEXT_PUBLIC_API_URL=http://127.0.0.1:8000",
    );
    return null;
  }
  const token = cookies().get(AUTH_TOKEN_COOKIE_KEY)?.value;
  const headers: HeadersInit = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  try {
    const res = await fetch(url, {
      ...init,
      headers,
    });
    if (!res.ok) return null;
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("application/json")) {
      return null;
    }
    const data = (await res.json()) as { user?: PublicProfileUser };
    if (!data?.user?.id) return null;
    return { user: data.user };
  } catch (e) {
    console.error("[profile] fetch / parse failed:", e);
    return null;
  }
}

/** Один HTTP-запрос к API на весь запрос страницы (generateMetadata + RSC). */
const getPublicProfileCached = cache(async (id: string) =>
  fetchPublicProfileJson(id, { next: { revalidate: PROFILE_REVALIDATE_SEC } }),
);

async function resolveId(
  params: Promise<{ id: string }> | { id: string },
): Promise<string | undefined> {
  const p = await Promise.resolve(params);
  return p?.id;
}

const PROFILE_ROBOTS = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  try {
    const id = await resolveId(params);
    if (!id || !/^\d+$/.test(id)) {
      return withPageUrl(id ? `/profile/${id}` : "/profile", {
        title: "Профиль",
        robots: PROFILE_ROBOTS,
      });
    }
    const data = await getPublicProfileCached(id);
    if (!data) {
      return withPageUrl(`/profile/${id}`, { title: "Профиль", robots: PROFILE_ROBOTS });
    }
    const u = data.user;
    const name = u.full_name || u.first_name || id;
    const description = await publicProfileDescription(u);
    return withPageUrl(`/profile/${id}`, {
      title: `${name} — профиль`,
      description,
      robots: PROFILE_ROBOTS,
      openGraph: { title: `${name} — профиль`, description },
      twitter: { title: `${name} — профиль`, description },
    });
  } catch {
    return { title: "Профиль", robots: PROFILE_ROBOTS };
  }
}

function ProfilePageFallback() {
  return (
    <div className="container" style={{ padding: 40 }}>
      Загрузка…
    </div>
  );
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const id = await resolveId(params);
  if (!id || !/^\d+$/.test(id)) {
    notFound();
  }
  const [data, initialWidgets] = await Promise.all([
    getPublicProfileCached(id),
    fetchProfileWidgetsCached(),
  ]);
  if (!data) {
    notFound();
  }

  return (
    <Suspense fallback={<ProfilePageFallback />}>
      <PublicProfileContent initialUser={data.user} initialWidgets={initialWidgets} />
    </Suspense>
  );
}
