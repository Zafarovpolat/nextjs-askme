import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { fetchMeOnServerCached } from "@/lib/server-me";
import { fetchProfileWidgetsCached } from "@/lib/server-profile-widgets";
import ProfilePageClient from "./ProfilePageClient";
import { SITE_NAME, withPageUrl } from "@/lib/page-seo";

export async function generateMetadata(): Promise<Metadata> {
  const me = await fetchMeOnServerCached();
  if (!me?.user) {
    return withPageUrl("/profile", {
      title: "Личный кабинет",
      description: `Войдите в аккаунт ${SITE_NAME}, чтобы открыть профиль, вопросы, ответы и настройки.`,
      robots: { index: false, follow: false },
    });
  }
  const u = me.user;
  const display =
    (typeof u.first_name === "string" && u.first_name.trim()) || "Профиль";
  const qc = u.questions_count ?? 0;
  const ac = u.answers_count ?? 0;
  const balls = u.balls ?? 0;
  const level = u.level_name?.trim();
  const descriptionParts = [
    `Личный кабинет ${SITE_NAME}: вопросов — ${qc}, ответов — ${ac}, баллов — ${balls}.`,
  ];
  if (level) {
    descriptionParts.push(`Уровень: ${level}.`);
  }
  descriptionParts.push("Настройки, подписки и уведомления.");
  return withPageUrl("/profile", {
    title: display,
    description: descriptionParts.join(" "),
    robots: { index: false, follow: false },
  });
}

export default async function ProfilePage() {
  const [initialMe, initialWidgets] = await Promise.all([
    fetchMeOnServerCached(),
    fetchProfileWidgetsCached(),
  ]);
  if (!initialMe?.user) {
    redirect("/login");
  }
  return <ProfilePageClient initialMe={initialMe} initialWidgets={initialWidgets} />;
}
