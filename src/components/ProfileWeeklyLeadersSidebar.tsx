"use client";

import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import type { ProfileWidgetsPayload, ProfileWidgetUser } from "@/lib/server-profile-widgets";
import { formatCompactNumWord } from "@/lib/format-compact-count";

const numWord = (value: number, words: [string, string, string]): string =>
  formatCompactNumWord(value, words);

type Props = {
  /** Данные с сервера (SSR); без клиентского запроса к v1/profile/widgets. */
  initialWidgets: ProfileWidgetsPayload;
};

/**
 * Блоки «Лидеры проекта» / «Самые активные авторы».
 * Данные приходят с сервера вместе со страницей — без дублирующих запросов в браузере.
 */
export default function ProfileWeeklyLeadersSidebar({ initialWidgets }: Props) {
  const weeklyBallsLeaders: ProfileWidgetUser[] = initialWidgets.weekly_balls_leaders;
  const weeklyActiveAuthors: ProfileWidgetUser[] = initialWidgets.weekly_active_authors;

  return (
    <>
      <div className="question_leaders">
        <div className="blocks_title">
          <h2>Лидеры проекта</h2>
        </div>
        {weeklyBallsLeaders.length === 0 ? (
          <p className="secondary_text" style={{ padding: "8px 0 12px", fontSize: "13px" }}>
            Пока нет лидеров с лучшими ответами.
          </p>
        ) : (
          weeklyBallsLeaders.map((u) => {
            const p = u.premium_is_active ?? u.is_premium ?? false;
            const pt = u.premium_is_permanent
              ? "Постоянный"
              : u.premium_package_name?.trim() || "Премиум";
            return (
            <Link href={`/profile/${u.id}`} key={u.id}>
              <div className="question_list_item">
                <div className="question_list_item_left">
                  <UserAvatar
                    src={u.avatar_url}
                    src2x={u.avatar_url_2x}
                    alt=""
                    size={40}
                    premium={p}
                    premiumText={pt}
                  />
                  <div className="question_list_item_left__user_meta">
                    <p className="main_text" title={u.full_name}>{u.full_name}</p>
                    <span>{numWord(u.balls ?? 0, ["балл", "балла", "баллов"])}</span>
                  </div>
                </div>
              </div>
            </Link>
            );
          })
        )}
      </div>

      <div className="question_leaders">
        <div className="blocks_title">
          <h2>Самые активные авторы</h2>
        </div>
        {weeklyActiveAuthors.length === 0 ? (
          <p className="secondary_text" style={{ padding: "8px 0 12px", fontSize: "13px" }}>
            Пока нет активных авторов.
          </p>
        ) : (
          weeklyActiveAuthors.map((u) => {
            const p = u.premium_is_active ?? u.is_premium ?? false;
            const pt = u.premium_is_permanent
              ? "Постоянный"
              : u.premium_package_name?.trim() || "Премиум";
            return (
            <Link href={`/profile/${u.id}`} key={u.id}>
              <div className="question_list_item">
                <div className="question_list_item_left">
                  <UserAvatar
                    src={u.avatar_url}
                    src2x={u.avatar_url_2x}
                    alt=""
                    size={40}
                    premium={p}
                    premiumText={pt}
                  />
                  <div className="question_list_item_left__user_meta">
                    <p className="main_text" title={u.full_name}>{u.full_name}</p>
                    <span>{numWord(u.balls ?? 0, ["балл", "балла", "баллов"])}</span>
                  </div>
                </div>
              </div>
            </Link>
            );
          })
        )}
      </div>
    </>
  );
}
