"use client";

import Link from "next/link";
import type { ProfileWidgetsPayload, ProfileWidgetUser } from "@/lib/server-profile-widgets";

function numWord(value: number, words: [string, string, string]): string {
  const abs = Math.abs(value);
  const cases = [2, 0, 1, 1, 1, 2];
  const index = abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)];
  return `${value} ${words[index]}`;
}

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
            Рейтинг за неделю появится после фонового обновления данных.
          </p>
        ) : (
          weeklyBallsLeaders.map((u) => (
            <Link href={`/profile/${u.id}`} key={u.id}>
              <div className="question_list_item">
                <div className="question_list_item_left">
                  <img src={u.avatar_url || "/images/icons/avatar.svg"} alt="" />
                  <div>
                    <p className="main_text">{u.full_name}</p>
                    <span>{numWord(u.week_score ?? 0, ["балл", "балла", "баллов"])} за неделю</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="question_leaders">
        <div className="blocks_title">
          <h2>Самые активные авторы</h2>
        </div>
        {weeklyActiveAuthors.length === 0 ? (
          <p className="secondary_text" style={{ padding: "8px 0 12px", fontSize: "13px" }}>
            Топ авторов по вопросам за неделю появится после фонового обновления данных.
          </p>
        ) : (
          weeklyActiveAuthors.map((u) => (
            <Link href={`/profile/${u.id}`} key={u.id}>
              <div className="question_list_item">
                <div className="question_list_item_left">
                  <img src={u.avatar_url || "/images/icons/avatar.svg"} alt="" />
                  <div>
                    <p className="main_text">{u.full_name}</p>
                    <span>{numWord(u.balls ?? 0, ["балл", "балла", "баллов"])}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
