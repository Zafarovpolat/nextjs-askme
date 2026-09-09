"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { CheckIcon } from "@/components/AboutIcons";
import { getBallsToNextLevel, getLevelSegmentProgressPercent, getNextLevelThreshold } from "@/lib/user-points";
import {
  getProfileLevelCarouselIndex,
  PROFILE_LEVEL_DESCRIPTION,
  PROFILE_LEVEL_DAILY_LIMITS,
  PROFILE_LEVEL_POINTS_SYSTEM,
  PROFILE_LEVELS,
  type ProfileLevelItem,
} from "./profile-levels-data";

export type ProfileLevelsRulesUserSlice = {
  balls: number;
  level: number;
  kpd: number;
  levelName: string;
  ballsToNextLevel?: number | null;
  onBuyVip?: () => void;
};

type CarouselCardState = "passed" | "current" | "next" | "future";

const CAROUSEL_CARD_GAP = 11;

function updateCarouselFog(track: HTMLDivElement) {
  const maxScroll = track.scrollWidth - track.clientWidth;
  if (maxScroll <= 1) {
    return { left: false, right: false };
  }

  return {
    left: track.scrollLeft > 1,
    right: track.scrollLeft < maxScroll - 1,
  };
}

function formatBallsRemaining(n: number): string {
  const abs = Math.abs(n) % 100;
  const m = abs % 10;
  if (abs > 10 && abs < 20) {
    return `${n} баллов`;
  }
  if (m === 1) {
    return `${n} балл`;
  }
  if (m >= 2 && m <= 4) {
    return `${n} балла`;
  }
  return `${n} баллов`;
}

function getCarouselCardState(cardIndex: number, userLevelIndex: number): CarouselCardState {
  if (cardIndex < userLevelIndex) {
    return "passed";
  }
  if (cardIndex === userLevelIndex) {
    return "current";
  }
  if (cardIndex === userLevelIndex + 1) {
    return "next";
  }
  return "future";
}

function RankCardTitle({ title }: { title: string }) {
  return (
    <>
      {title.split("\n").map((line, i, arr) => (
        <span key={i}>
          {line}
          {i < arr.length - 1 ? <br /> : null}
        </span>
      ))}
    </>
  );
}

function RankCardPoints({ points, kpd }: { points: string; kpd?: string }) {
  return (
    <>
      <span className="profile-levels-rank-card__points-main">
        <RankCardTitle title={points} />
      </span>
      <span className="profile-levels-rank-card__points-kpd">{kpd ?? "\u00a0"}</span>
    </>
  );
}

const RANK_IMAGE_SIZES = {
  carousel: { width: 68, height: 88 },
  grid: { width: 90, height: 112 },
} as const;

function ProfileLevelRankVisual({
  item,
  imageClassName,
  size,
  priority = false,
}: {
  item: ProfileLevelItem;
  imageClassName: string;
  size: keyof typeof RANK_IMAGE_SIZES;
  priority?: boolean;
}) {
  const { width, height } = RANK_IMAGE_SIZES[size];

  return item.image ? (
    <Image
      src={item.image}
      alt=""
      width={width}
      height={height}
      className={imageClassName}
      priority={priority}
    />
  ) : (
    <div className={`${imageClassName} profile-levels-rank-card__image-wrap_empty`} />
  );
}

const PROFILE_LEVELS_CAROUSEL_ARROW_PATH =
  "M8.66569 3.07072L5.48537 0.130018C5.39459 0.0460757 5.27359 0 5.14457 0C5.01541 0 4.89448 0.0461419 4.8037 0.130018L4.51495 0.397072C4.42424 0.480882 4.37426 0.592828 4.37426 0.712188C4.37426 0.831482 4.42424 0.947201 4.51495 1.03101L6.3703 2.75031H0.475759C0.209993 2.75031 0 2.94269 0 3.18849V3.56604C0 3.81184 0.209993 4.02362 0.475759 4.02362H6.39135L4.51502 5.75252C4.42431 5.83646 4.37434 5.94536 4.37434 6.06472C4.37434 6.18395 4.42431 6.29444 4.51502 6.37831L4.80377 6.64451C4.89456 6.72845 5.01548 6.77419 5.14464 6.77419C5.27366 6.77419 5.39466 6.72785 5.48544 6.64391L8.66576 3.70327C8.75676 3.61906 8.80681 3.50666 8.80645 3.38716C8.80674 3.26727 8.75676 3.1548 8.66569 3.07072Z";

function ProfileLevelsCarouselNavArrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className={direction === "left" ? "profile-levels-carousel-nav__arrow profile-levels-carousel-nav__arrow_left" : "profile-levels-carousel-nav__arrow"}
      width="9"
      height="7"
      viewBox="0 0 9 7"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d={PROFILE_LEVELS_CAROUSEL_ARROW_PATH} fill="currentColor" />
    </svg>
  );
}

function ProfileLevelsCarouselNav({
  onPrev,
  onNext,
}: {
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="profile-levels-carousel-nav">
      <button type="button" className="profile-levels-carousel-nav__btn" onClick={onPrev} aria-label="Прокрутить назад">
        <ProfileLevelsCarouselNavArrow direction="left" />
      </button>
      <button type="button" className="profile-levels-carousel-nav__btn" onClick={onNext} aria-label="Прокрутить вперёд">
        <ProfileLevelsCarouselNavArrow direction="right" />
      </button>
    </div>
  );
}

function ProfileLevelsCarouselCheckIcon() {
  return (
    <span className="profile-levels-carousel-card__badge" aria-hidden>
      <svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4.27227 8.90713C4.18102 9.02282 4.02319 9.03165 3.92154 8.92673L0.0792276 4.96005C-0.0224147 4.85513 -0.0268339 4.67859 0.0692986 4.56773L1.29348 3.15675C1.38967 3.04588 1.55152 3.04106 1.65316 3.14592L3.75206 5.31262C3.85371 5.41754 4.01154 5.40871 4.10279 5.29303L8.20332 0.0961666C8.29457 -0.0195208 8.45607 -0.0327296 8.56208 0.0668693L9.91183 1.33405C10.0179 1.43358 10.03 1.60974 9.93869 1.72543L4.27227 8.90713Z"
          fill="#5E68FF"
        />
      </svg>
    </span>
  );
}

function ProfileLevelsCarouselCrossIcon() {
  return (
    <span className="profile-levels-carousel-card__badge profile-levels-carousel-card__badge_cross" aria-hidden>
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="4.35" y="2" width="1.3" height="6" rx="0.65" fill="#5E68FF" transform="rotate(45 5 5)" />
        <rect x="4.35" y="2" width="1.3" height="6" rx="0.65" fill="#5E68FF" transform="rotate(-45 5 5)" />
      </svg>
    </span>
  );
}

function ProfileLevelsCarouselCrownIcon() {
  return (
    <svg
      className="profile-levels-carousel-card__vip-icon"
      width="12"
      height="10"
      viewBox="0 0 14 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M11.8643 5.41583L10.0835 5.87565C10.0456 5.88569 10.0057 5.88413 9.96872 5.87117C9.93169 5.8582 9.8991 5.83439 9.87491 5.80263L7.9227 3.27793C7.80832 3.14077 7.66672 3.03072 7.50752 2.95529C7.34832 2.87986 7.17527 2.84081 7.00017 2.84081C6.82506 2.84081 6.65201 2.87986 6.49282 2.95529C6.33362 3.03072 6.19201 3.14077 6.07763 3.27793L4.1248 5.8033C4.09991 5.83432 4.06713 5.85754 4.03016 5.87033C3.9932 5.88311 3.95351 5.88496 3.91558 5.87566L2.13599 5.41583C1.99618 5.37967 1.8497 5.38156 1.71081 5.42132C1.57191 5.46108 1.44533 5.53736 1.34338 5.64273C1.24143 5.7481 1.16758 5.87897 1.12902 6.02261C1.09046 6.16626 1.08849 6.31779 1.12332 6.46245L2.23805 11.0738C2.30142 11.3385 2.44874 11.5736 2.65646 11.7415C2.86419 11.9094 3.12033 12.0004 3.38394 12H10.6161C10.8797 12.0004 11.1358 11.9094 11.3435 11.7415C11.5513 11.5736 11.6986 11.3385 11.7619 11.0738L12.8767 6.46245C12.9115 6.31782 12.9096 6.16632 12.871 6.0227C12.8325 5.87908 12.7587 5.74822 12.6567 5.64285C12.5548 5.53749 12.4283 5.4612 12.2894 5.42142C12.1506 5.38164 12.0041 5.37971 11.8643 5.41583Z"
        fill="#6069FF"
      />
      <path
        d="M0.976744 4.88367C1.51619 4.88367 1.95349 4.4313 1.95349 3.87326C1.95349 3.31522 1.51619 2.86284 0.976744 2.86284C0.437303 2.86284 0 3.31522 0 3.87326C0 4.4313 0.437303 4.88367 0.976744 4.88367Z"
        fill="#6069FF"
      />
      <path
        d="M13.0233 4.88367C13.5627 4.88367 14 4.4313 14 3.87326C14 3.31522 13.5627 2.86284 13.0233 2.86284C12.4838 2.86284 12.0465 3.31522 12.0465 3.87326C12.0465 4.4313 12.4838 4.88367 13.0233 4.88367Z"
        fill="#6069FF"
      />
      <path
        d="M7 2.02083C7.53944 2.02083 7.97674 1.56845 7.97674 1.01042C7.97674 0.452378 7.53944 0 7 0C6.46056 0 6.02326 0.452378 6.02326 1.01042C6.02326 1.56845 6.46056 2.02083 7 2.02083Z"
        fill="#6069FF"
      />
    </svg>
  );
}

function ProfileLevelsCarouselCard({
  item,
  state,
  balls,
  nextThreshold,
  segmentPct,
  onBuyVip,
}: {
  item: ProfileLevelItem;
  state: CarouselCardState;
  balls: number;
  nextThreshold: number | null;
  segmentPct: number;
  onBuyVip?: () => void;
}) {
  const pctStr = `${Math.round(segmentPct)}%`;

  if (state === "next") {
    return (
      <article className={`profile-levels-carousel-card profile-levels-carousel-card_${state}`}>
        <div className="profile-levels-carousel-card__base" aria-hidden>
          <h3 className="profile-levels-carousel-card__title">
            <RankCardTitle title={item.title} />
          </h3>
          <div className="profile-levels-carousel-card__image-wrap">
            <ProfileLevelRankVisual item={item} imageClassName="profile-levels-carousel-card__image" size="carousel" />
          </div>
        </div>

        <div className="profile-levels-carousel-card__overlay">
          <h3 className="profile-levels-carousel-card__overlay-title">
            <RankCardTitle title={item.title} />
          </h3>

          <div className="profile-levels-carousel-card__overlay-progress">
            <p className="profile-levels-carousel-card__points-label">Баллы</p>
            <div className="profile-levels-carousel-card__mini-progress">
              <div className="profile-levels-carousel-card__mini-progress-track">
                <div className="profile-levels-carousel-card__mini-progress-fill" style={{ width: pctStr }} />
              </div>
            </div>
            <p className="profile-levels-carousel-card__points-value">
              {balls}
              {nextThreshold != null ? `/${nextThreshold}` : ""}
            </p>
          </div>

          <button type="button" className="profile-levels-carousel-card__vip-btn" onClick={onBuyVip}>
            <ProfileLevelsCarouselCrownIcon />
            <span className="profile-levels-carousel-card__vip-text">Или купить VIP</span>
          </button>
        </div>
      </article>
    );
  }

  if (state === "current") {
    return (
      <article className={`profile-levels-carousel-card profile-levels-carousel-card_${state}`}>
        <h3 className="profile-levels-carousel-card__title">
          <RankCardTitle title={item.title} />
        </h3>

        <div className="profile-levels-carousel-card__image-wrap">
          <ProfileLevelRankVisual item={item} imageClassName="profile-levels-carousel-card__image" size="carousel" />
        </div>

        <div className="profile-levels-carousel-card__footer">
          <span className="profile-levels-carousel-card__current-btn">
            Текущий
            <br />
            уровень
          </span>
        </div>
      </article>
    );
  }

  return (
    <article className={`profile-levels-carousel-card profile-levels-carousel-card_${state}`}>
      <h3 className="profile-levels-carousel-card__title">
        <RankCardTitle title={item.title} />
      </h3>

      <div className="profile-levels-carousel-card__image-wrap">
        <ProfileLevelRankVisual item={item} imageClassName="profile-levels-carousel-card__image" size="carousel" />
      </div>

      <div className="profile-levels-carousel-card__footer">
        {state === "passed" || state === "future" ? (
          <>
            <p className="profile-levels-carousel-card__status">Пройдено</p>
            {state === "passed" ? <ProfileLevelsCarouselCheckIcon /> : <ProfileLevelsCarouselCrossIcon />}
          </>
        ) : null}
      </div>
    </article>
  );
}

export function ProfileLevelsMenuInner(p: ProfileLevelsRulesUserSlice) {
  const { balls, level, levelName } = p;
  const carouselWrapRef = useRef<HTMLDivElement>(null);
  const [carouselFog, setCarouselFog] = useState({ left: false, right: true });

  const userLevelIndex = useMemo(
    () => getProfileLevelCarouselIndex(levelName || "Уличный бот", level),
    [level, levelName],
  );

  const currentRankName = levelName || PROFILE_LEVELS[userLevelIndex]?.rankName || "Уличный бот";

  const scrollByCard = useCallback((direction: -1 | 1) => {
    const wrap = carouselWrapRef.current;
    if (!wrap) {
      return;
    }

    const firstCard = wrap.querySelector<HTMLElement>(".profile-levels-carousel-card");
    if (!firstCard) {
      return;
    }

    const step = firstCard.offsetWidth + CAROUSEL_CARD_GAP;
    wrap.scrollBy({ left: direction * step, behavior: "smooth" });
  }, []);

  const goPrev = useCallback(() => {
    scrollByCard(-1);
  }, [scrollByCard]);

  const goNext = useCallback(() => {
    scrollByCard(1);
  }, [scrollByCard]);

  useEffect(() => {
    const wrap = carouselWrapRef.current;
    if (!wrap) {
      return;
    }

    const carousel = wrap.querySelector<HTMLElement>(".profile-levels-carousel");
    const card = carousel?.children[userLevelIndex] as HTMLElement | undefined;
    if (card) {
      const step = card.offsetWidth + CAROUSEL_CARD_GAP;
      wrap.scrollTo({ left: Math.max(0, userLevelIndex * step), behavior: "auto" });
    }

    const syncFog = () => {
      setCarouselFog(updateCarouselFog(wrap));
    };

    syncFog();
    const rafId = window.requestAnimationFrame(syncFog);

    wrap.addEventListener("scroll", syncFog, { passive: true });
    window.addEventListener("resize", syncFog);

    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncFog) : null;
    resizeObserver?.observe(wrap);
    if (carousel) {
      resizeObserver?.observe(carousel);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      wrap.removeEventListener("scroll", syncFog);
      window.removeEventListener("resize", syncFog);
      resizeObserver?.disconnect();
    };
  }, [userLevelIndex]);

  const { barPct, ballsRemaining, isMaxLevel, nextThreshold } = useMemo(() => {
    const pct = getLevelSegmentProgressPercent(balls);
    const toNext =
      p.ballsToNextLevel != null && p.ballsToNextLevel !== undefined
        ? Math.max(0, p.ballsToNextLevel)
        : getBallsToNextLevel(balls);
    const next = getNextLevelThreshold(balls);

    if (toNext === null) {
      return { barPct: pct, ballsRemaining: null as number | null, isMaxLevel: true, nextThreshold: next };
    }

    return { barPct: pct, ballsRemaining: toNext, isMaxLevel: false, nextThreshold: next };
  }, [balls, p.ballsToNextLevel]);

  const pctStr = `${Math.round(barPct)}%`;

  return (
    <div className="user_profile_page_content profile-levels profile-levels-v2">
      <div className="blocks_title">
        <h2>Ваш уровень</h2>
      </div>

      <section className="profile-levels-section profile-levels-section_your">
        <div className="profile-levels-your-card">
          <div className="profile-levels-your-card__header">
            <p className="profile-levels-your-card__rank">{currentRankName}</p>
            <ProfileLevelsCarouselNav onPrev={goPrev} onNext={goNext} />
          </div>

          <div className="profile-levels-carousel-outer">
            <div
              className={[
                "profile-levels-carousel-viewport",
                carouselFog.left ? "profile-levels-carousel-viewport_fog-left" : "",
                carouselFog.right ? "profile-levels-carousel-viewport_fog-right" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div ref={carouselWrapRef} className="profile-levels-carousel-scroller">
                <div className="profile-levels-carousel">
                  {PROFILE_LEVELS.map((item, index) => (
                    <ProfileLevelsCarouselCard
                      key={item.id}
                      item={item}
                      state={getCarouselCardState(index, userLevelIndex)}
                      balls={balls}
                      nextThreshold={nextThreshold}
                      segmentPct={barPct}
                      onBuyVip={p.onBuyVip}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="profile-levels-your-card__footer">
            <div className="profile-levels-progress">
              <div className="profile-levels-progress__track">
                <div className="profile-levels-progress__track-inner">
                  <div className="profile-levels-progress__fill" style={{ width: pctStr }} />
                </div>
                <div className="profile-levels-progress__thumb" style={{ left: pctStr }} />
              </div>
              <img
                className="profile-levels-progress__ruler"
                src="/images/profile-levels/progress-ruler.svg"
                alt=""
                width={847}
                height={9}
              />
            </div>

            <div className="profile-levels-progress__meta">
              <p className="profile-levels-progress__meta-left">
                Ваш текущий ранг: <strong>{currentRankName}</strong>
              </p>
              <p className="profile-levels-progress__meta-right">
                {isMaxLevel ? (
                  <strong>Максимальный ранг</strong>
                ) : (
                  <>
                    До следующего ранга:{" "}
                    <strong>Осталось {formatBallsRemaining(ballsRemaining ?? 0)}</strong>
                  </>
                )}
              </p>
            </div>

            <div className="profile-levels-your-card__info">
              <h3 className="profile-levels-your-card__info-title">{currentRankName}</h3>
              <p className="profile-levels-your-card__info-text">{PROFILE_LEVEL_DESCRIPTION}</p>
            </div>

            <button className="profile-levels-vip-btn" type="button" onClick={p.onBuyVip}>
              Купить VIP
            </button>
          </div>
        </div>
      </section>

      <section className="profile-levels-section profile-levels-section_ranks">
        <h3 className="rules_subtitle">Уровни</h3>
        <div className="profile-levels-panel">
          <div className="profile-levels-ranks-grid">
            {PROFILE_LEVELS.map((card) => (
              <article key={card.id} className="profile-levels-rank-card">
                <h3 className="profile-levels-rank-card__title">
                  <RankCardTitle title={card.title} />
                </h3>
                <div className="profile-levels-rank-card__image-wrap">
                  <ProfileLevelRankVisual item={card} imageClassName="profile-levels-rank-card__image" size="grid" />
                </div>
                <p className="profile-levels-rank-card__label">Баллы</p>
                <p className="profile-levels-rank-card__points">
                  <RankCardPoints points={card.points} kpd={card.kpd} />
                </p>
              </article>
            ))}
          </div>

          <h3 className="profile-levels-limits-title">Максимальное количество действий за 24 часа</h3>

          <div className="profile-levels-table profile-levels-table_limits">
            <div className="profile-levels-table__row profile-levels-table__row_head">
              <span>Ранг</span>
              <span>Баллы</span>
              <span>Вопросы</span>
              <span>Ответы</span>
              <span>Комментарии</span>
              <span>Голос за лучший</span>
              <span>Оценка вопроса</span>
            </div>
            {PROFILE_LEVEL_DAILY_LIMITS.map((row) => (
              <div key={row.rank} className="profile-levels-table__row">
                <span>{row.rank}</span>
                <span>{row.points}</span>
                <span>{row.questions}</span>
                <span>{row.answers}</span>
                <span>{row.comments}</span>
                <span>{row.voteBest}</span>
                <span>{row.voteQuestion}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="profile-levels-section profile-levels-section_points">
        <h3 className="rules_subtitle">Система баллов проекта</h3>
        <div className="profile-levels-panel">
          <div className="profile-levels-table profile-levels-table_points">
            <div className="profile-levels-table__row profile-levels-table__row_head profile-levels-table__row_points">
              <span>Действие</span>
              <span>Баллы</span>
              <span>Уровень</span>
            </div>
            {PROFILE_LEVEL_POINTS_SYSTEM.map((row, index) => (
              <div key={`${row.action}-${index}`} className="profile-levels-table__row profile-levels-table__row_points">
                <span>{row.action}</span>
                <span>{row.points}</span>
                <span>{row.level}</span>
              </div>
            ))}
          </div>

          <div className="profile-levels-points-footnotes">
            <p>* не чаще одного раза в сутки.</p>
            <p>** голосование за вариант «все ответы неверны» не дает баллов.</p>
            <p>
              *** начиная с уровня Нео-аналитик, количество баллов за 1 ответ зависит от текущего КПД:
            </p>
            <ul>
              <li>КПД меньше 2% — 0 баллов за ответ.</li>
              <li>КПД от 2% до 3,9% — 1 балл за ответ.</li>
              <li>КПД от 4% до 11,9% — 2 балла за ответ.</li>
              <li>КПД от 12% до 17,9% — 3 балла за ответ.</li>
              <li>КПД от 18% до 29,9% — 4 балла за ответ.</li>
              <li>КПД 30% и выше — 5 баллов за ответ.</li>
            </ul>
            <p>**** за многократное нарушение правил доступ на проект может быть закрыт.</p>
          </div>
        </div>
      </section>
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
