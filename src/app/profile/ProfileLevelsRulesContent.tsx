"use client";

import { useMemo } from "react";
import { CheckIcon } from "@/components/AboutIcons";
import {
  answerRewardForNewTopLevelAnswer,
  getBallsToNextLevel,
  getLevelSegmentProgressPercent,
  LOW_KPD_ANSWERS_STUB,
} from "@/lib/user-points";
import { ProfileLevelsHexLeftSvg, ProfileLevelsHexRightSvg } from "./ProfileLevelsSvgs";

export type ProfileLevelsRulesUserSlice = {
  balls: number;
  level: number;
  kpd: number;
  levelName: string;
  ballsToNextLevel?: number | null;
  onBuyVip?: () => void;
};

function formatAnswersCountLabel(n: number): string {
  const abs = Math.abs(n) % 100;
  const m = abs % 10;
  if (abs > 10 && abs < 20) {
    return `${n} ответов`;
  }
  if (m === 1) {
    return `${n} ответ`;
  }
  if (m >= 2 && m <= 4) {
    return `${n} ответа`;
  }
  return `${n} ответов`;
}

export function ProfileLevelsMenuInner(p: ProfileLevelsRulesUserSlice) {
  const { balls, level, kpd, levelName } = p;

  const { rightLabel, barPct } = useMemo(() => {
    const pct = getLevelSegmentProgressPercent(balls);
    const toNext =
      p.ballsToNextLevel != null && p.ballsToNextLevel !== undefined
        ? Math.max(0, p.ballsToNextLevel)
        : getBallsToNextLevel(balls);

    if (toNext === null) {
      return { rightLabel: "Максимальный уровень", barPct: pct };
    }

    const perAnswer = answerRewardForNewTopLevelAnswer(level, kpd);
    const label =
      perAnswer <= 0
        ? formatAnswersCountLabel(LOW_KPD_ANSWERS_STUB)
        : formatAnswersCountLabel(Math.ceil(toNext / perAnswer));

    return { rightLabel: label, barPct: pct };
  }, [balls, level, kpd, p.ballsToNextLevel]);

  const pctStr = `${Math.round(barPct)}%`;

  return (
    <div className="user_profile_page_content profile-levels">
      <div className="blocks_title">
        <h2>Уровни</h2>
      </div>
      <div className="user_profile_page_content_wrapper">
        <p className="secondary_text current_level_label">Текущий уровень</p>
        <div className="levels_card">
          <div className="levels_card_left">
            <ProfileLevelsHexLeftSvg />
          </div>
          <div className="levels_card_center">
            <div className="levels_progress_wrapper">
              <div className="levels_progress_labels mobile">
                <span>До следующего уровня осталось</span>
              </div>
              <div className="levels_progress_bar">
                <div className="levels_progress_value" style={{ width: pctStr }} />
                <div className="levels_progress_thumb" style={{ left: pctStr }} />
              </div>
              <div className="levels_progress_labels">
                <span>До следующего уровня осталось</span>
                <span>{rightLabel}</span>
              </div>
            </div>
          </div>
          <div className="levels_card_right">
            <ProfileLevelsHexRightSvg />
          </div>
        </div>

        <div className="levels_info_text">
          <h3 className="levels_info_title">{levelName || "Уровень"}</h3>
          <p className="secondary_text">
            Категории были формальными и жёсткими рамками. Мы сделали на основе них пространства —
            тематические разделы, в которых люди находят единомышленников, обсуждают важные и не очень
            вопросы, делятся опытом и поддержкой. Каждое пространство — это полноценный подсайт, со
            своими героями, мемами, спорами и поддержкой.
          </p>
        </div>

        <div className="levels_actions">
          <button className="m_btn vip_buy_btn_new" type="button" onClick={p.onBuyVip}>
            Купить VIP
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProfileRulesMenuInner() {
  return (
    <div className="user_profile_page_content profile-rules">
      <div className="blocks_title">
        <h2>Ограничения</h2>
      </div>
      <div className="user_profile_page_content_wrapper">
        <section className="profile_rules_section">
          <h3 className="rules_subtitle">Правила</h3>
          <p className="rules_text_bold rules_text_bold_new">Основные принципы:</p>
          <ul className="profile_rules_list">
            <li>
              <CheckIcon />
              <span>
                Не публикуйте спам и рекламу: материалы рекламного характера или не имеющие ценности
                для пользователей Ответов будут удаляться.
              </span>
            </li>
            <li>
              <CheckIcon />
              <span>Не вводите в заблуждение и не обманывайте других.</span>
            </li>
            <li>
              <CheckIcon />
              <span>
                Не собирайте деньги и не продвигайте схемы заработка любых цветов (белые, серые,
                черные) Соблюдайте законы РФ.
              </span>
            </li>
            <li>
              <CheckIcon />
              <span>
                Соблюдайте авторские права: указывайте источники при использовании материалов,
                созданных другими людьми.
              </span>
            </li>
            <li>
              <CheckIcon />
              <span>
                Оставайтесь в рамках темы пространства: публикации должны соответствовать тематике
                пространства, в котором они размещаются.
              </span>
            </li>
            <li>
              <CheckIcon />
              <span>Уважайте собеседников и будьте вежливы.</span>
            </li>
          </ul>
        </section>

        <section className="profile_rules_section">
          <h3 className="rules_subtitle rules_text_bold_new">Модерация и безопасность</h3>
          <ul className="profile_rules_list">
            <li>
              <CheckIcon />
              <span>Алгоритмы находят спам и запрещённый контент автоматически.</span>
            </li>
            <li>
              <CheckIcon />
              <span>Команда модерации внимательно следит за жалобами и нарушениями.</span>
            </li>
            <li>
              <CheckIcon />
              <span>
                Любой пользователь может пожаловаться на нарушение. Решение будет принято как можно
                быстрее. При удалении поста пользователь получает уведомление и (в большинстве
                случаев) может обжаловать решение. Чтобы обжаловать решение, перейдите по этой
                ссылке.
              </span>
            </li>
          </ul>
        </section>

        <section className="profile_rules_section">
          <h3 className="rules_subtitle rules_text_bold_new">Как сервис работает</h3>
          <ul className="profile_rules_list">
            <li>
              <CheckIcon />
              <span>Зарегистрируйтесь или войдите. Можно выбрать любой ник и аватар.</span>
            </li>
            <li>
              <CheckIcon />
              <span>Создайте пост и выберите его тип: Знания, Мнения или Истории.</span>
            </li>
            <li>
              <CheckIcon />
              <span>Получайте ответы и вступайте в продвинутые обсуждения в ветках.</span>
            </li>
            <li>
              <CheckIcon />
              <span>
                Повышайте карму за полезные, смешные и интересные ответы. В каждом типе постов — своя
                система оценки и изменения Кармы.
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
