import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import { getApiFullUrl } from "@/config/api";
import type { PublicProfileUser } from "@/types";

/**
 * useSearchParams + тяжёлый клиентский UI: при SSR в Next 14 иногда падает с 500.
 * Рендер только на клиенте — API Laravel при этом не трогается.
 */
const PublicProfileContent = dynamic(() => import("./PublicProfileContent"), {
  ssr: false,
  loading: () => (
    <div className="container" style={{ padding: 40 }}>
      Загрузка…
    </div>
  ),
});

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
  try {
    const res = await fetch(url, init);
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

async function resolveId(
  params: Promise<{ id: string }> | { id: string },
): Promise<string | undefined> {
  const p = await Promise.resolve(params);
  return p?.id;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  try {
    const id = await resolveId(params);
    if (!id || !/^\d+$/.test(id)) {
      return { title: "Профиль" };
    }
    const data = await fetchPublicProfileJson(id, { next: { revalidate: 60 } });
    if (!data) {
      return { title: "Профиль" };
    }
    const u = data.user;
    const name = u.full_name || u.first_name || id;
    return { title: `${name} — профиль` };
  } catch {
    return { title: "Профиль" };
  }
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
  const data = await fetchPublicProfileJson(id, { next: { revalidate: 30 } });
  if (!data) {
    notFound();
  }

  return <PublicProfileContent initialUser={data.user} />;
}
