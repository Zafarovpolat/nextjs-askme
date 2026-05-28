"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { displayUserName, displayUserSubtitle } from "@/lib/ai-user-display";
import type {
  LeaderCategory,
  LeaderUser,
  LeadersPageResponse,
} from "./page";

type LeadersPageContentProps = {
  initialData: LeadersPageResponse;
};

const PERIODS = [
  { value: "year", label: "За год" },
  { value: "month", label: "За месяц" },
  { value: "week", label: "За неделю" },
  { value: "day", label: "За день" },
] as const;

const METRICS = [
  { value: "answers", label: "По количеству ответов" },
  { value: "rating", label: "По рейтингу" },
  { value: "questions", label: "По количеству вопросов" },
] as const;

const numWord = (value: number, words: [string, string, string]): string => {
  const abs = Math.abs(value);
  const cases = [2, 0, 1, 1, 1, 2];
  const index = abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)];
  return `${value} ${words[index]}`;
};

function formatMetricLine(metric: string, metricValue: number): string {
  if (metric === "rating") {
    const abs = Math.abs(metricValue);
    const tail = numWord(abs, ["балл", "балла", "баллов"]).replace(/^\d+\s+/, "");
    if (metricValue > 0) return `+${abs} ${tail} за период`;
    if (metricValue < 0) return `-${abs} ${tail} за период`;
    return `0 ${tail} за период`;
  }
  if (metric === "questions") {
    return numWord(metricValue, ["вопрос", "вопроса", "вопросов"]);
  }
  return numWord(metricValue, ["ответ", "ответа", "ответов"]);
}

function buildLeadersQuery(
  period: string,
  metric: string,
  categoryId: string,
  subcategoryId: string
): string {
  const p = new URLSearchParams();
  p.set("period", period);
  p.set("metric", metric);
  p.set("page", "1");
  if (metric !== "rating") {
    if (categoryId) p.set("category_id", categoryId);
    if (subcategoryId) p.set("subcategory_id", subcategoryId);
  }
  return p.toString();
}

export default function LeadersPageContent({ initialData }: LeadersPageContentProps) {
  const [categories, setCategories] = useState<LeaderCategory[]>(initialData.categories ?? []);
  const [periodFilter, setPeriodFilter] = useState(initialData.period ?? "day");
  const [metricFilter, setMetricFilter] = useState(initialData.metric ?? "answers");
  const [categoryFilter, setCategoryFilter] = useState<string>(
    initialData.category_id != null ? String(initialData.category_id) : ""
  );
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>(
    initialData.subcategory_id != null ? String(initialData.subcategory_id) : ""
  );

  const initialUsers = initialData.users ?? [];
  const [topLeaders, setTopLeaders] = useState<LeaderUser[]>(() => initialUsers.slice(0, 3));
  const [tableLeaders, setTableLeaders] = useState<LeaderUser[]>(() => initialUsers.slice(3));
  const [currentPage, setCurrentPage] = useState(initialData.current_page ?? 1);
  const [lastPage, setLastPage] = useState(initialData.last_page ?? 1);
  const [total, setTotal] = useState(initialData.total ?? 0);

  const [loadingMore, setLoadingMore] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  const skipFilterEffect = useRef(true);

  const currentCategory = useMemo(
    () => categories.find((c) => String(c.id) === categoryFilter),
    [categories, categoryFilter]
  );
  const subcategoryOptions = currentCategory?.subcategories ?? [];

  const topPlaceIcons = [
    "/images/icons/top-1.svg",
    "/images/icons/top-2.svg",
    "/images/icons/top-3.svg",
  ];

  const hasMore = currentPage < lastPage;
  const categorySelectDisabled = metricFilter === "rating";

  const refetchPage1 = useCallback(async () => {
    setFilterLoading(true);
    try {
      const qs = buildLeadersQuery(periodFilter, metricFilter, categoryFilter, subcategoryFilter);
      const data = await api.get<LeadersPageResponse>(`v1/leaders?${qs}`);
      setCategories(data.categories ?? []);
      const list = data.users ?? [];
      setTopLeaders(list.slice(0, 3));
      setTableLeaders(list.slice(3));
      setCurrentPage(data.current_page ?? 1);
      setLastPage(data.last_page ?? 1);
      setTotal(data.total ?? 0);
      if (data.metric) setMetricFilter(data.metric);
      if (data.period) setPeriodFilter(data.period);
    } catch {
      // оставляем предыдущие данные
    } finally {
      setFilterLoading(false);
    }
  }, [periodFilter, metricFilter, categoryFilter, subcategoryFilter]);

  useEffect(() => {
    if (skipFilterEffect.current) {
      skipFilterEffect.current = false;
      return;
    }
    void refetchPage1();
  }, [periodFilter, metricFilter, categoryFilter, subcategoryFilter, refetchPage1]);

  const handleMetricChange = (value: string) => {
    setMetricFilter(value);
    if (value === "rating") {
      setCategoryFilter("");
      setSubcategoryFilter("");
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setSubcategoryFilter("");
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore || filterLoading) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    try {
      const body: Record<string, unknown> = {
        period: periodFilter,
        metric: metricFilter,
        page: nextPage,
      };
      if (metricFilter !== "rating") {
        if (categoryFilter) body.category_id = Number(categoryFilter);
        if (subcategoryFilter) body.subcategory_id = Number(subcategoryFilter);
      }
      const data = await api.post<LeadersPageResponse>("v1/leaders/page", body);
      setTableLeaders((prev) => [...prev, ...(data.users ?? [])]);
      setCurrentPage(data.current_page ?? nextPage);
      setLastPage(data.last_page ?? lastPage);
      setTotal(data.total ?? total);
    } catch {
      // тихо
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="page-layout-sticky-footer">
      <Header />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">Главная</Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">Лидеры</span>
        </div>
      </div>

      <div className="top_leaders_list_wrapper container">
        <div className="blocks_title">
          <h2>Лидеры по активности</h2>
        </div>

        {/* п.13 — Кнопка «Сбросить фильтры» + крестики в каждом select */}
        <div className="top_leaders_filter">
          <div className="top_leaders_filter_item">
            <div className="select-with-clear">
              <select
                className="super-select"
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                disabled={filterLoading}
              >
                {PERIODS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
              {periodFilter !== "day" && (
                <button type="button" className="select-clear-btn" onClick={() => setPeriodFilter("day")} aria-label="Сбросить">×</button>
              )}
            </div>
          </div>
          <div className="top_leaders_filter_item">
            <div className="select-with-clear">
              <select
                className="super-select"
                value={metricFilter}
                onChange={(e) => handleMetricChange(e.target.value)}
                disabled={filterLoading}
              >
                {METRICS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              {metricFilter !== "answers" && (
                <button type="button" className="select-clear-btn" onClick={() => handleMetricChange("answers")} aria-label="Сбросить">×</button>
              )}
            </div>
          </div>
          <div className="top_leaders_filter_item">
            <div className="select-with-clear">
              <select
                className="super-select"
                value={categoryFilter}
                onChange={(e) => handleCategoryChange(e.target.value)}
                disabled={filterLoading || categorySelectDisabled}
              >
                <option value="">Категория</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={String(cat.id)}>{cat.name}</option>
                ))}
              </select>
              {categoryFilter && (
                <button type="button" className="select-clear-btn" onClick={() => handleCategoryChange("")} aria-label="Сбросить">×</button>
              )}
            </div>
          </div>
          <div className="top_leaders_filter_item">
            <div className="select-with-clear">
              <select
                className="super-select"
                value={subcategoryFilter}
                onChange={(e) => setSubcategoryFilter(e.target.value)}
                disabled={filterLoading || categorySelectDisabled || !categoryFilter}
              >
                <option value="">Все подкатегории</option>
                {subcategoryOptions.map((sub) => (
                  <option key={sub.id} value={String(sub.id)}>{sub.name}</option>
                ))}
              </select>
              {subcategoryFilter && (
                <button type="button" className="select-clear-btn" onClick={() => setSubcategoryFilter("")} aria-label="Сбросить">×</button>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="reset-filters-link"
          onClick={() => {
            setPeriodFilter("day");
            setMetricFilter("answers");
            setCategoryFilter("");
            setSubcategoryFilter("");
          }}
        >
          Сбросить фильтры
        </button>
      </div>

      <div className="container">
        {filterLoading && (
          <p className="secondary_text" style={{ marginBottom: 12 }}>Обновление списка…</p>
        )}
        <div className="top_leaders_list">
          {topLeaders.map((user, index) => (
            <Link
              key={user.id}
              href={`/profile/${user.id}`}
              className="top_leader_card"
              aria-label={`Профиль: ${displayUserName(user)}`}
            >
              <img className="top_leader_card_bg" src="/images/top-leader-bg.svg" alt="" />
              <img className="top_leader_card_bg_dark" src="/images/top-leader-bg-d.svg" alt="" />
              <img className="top_leader_card_rect" src="/images/blues-rect.svg" alt="" />
              <div className="top_leader_card_content">
                <div className="top_leader_card_img">
                  <img
                    className="top_leader_card_image"
                    src={user.avatar_url || "/images/icons/avatar.svg"}
                    alt={displayUserName(user)}
                  />
                  <img className="top_leader_place" src={topPlaceIcons[index]} alt="" />
                </div>
                <div className="top_leader_card_desc">
                  <h3>{displayUserName(user)}</h3>
                  <h4>{displayUserSubtitle(user)}</h4>
                  <p>{formatMetricLine(metricFilter, user.metric_value)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="project_leaders_list container" style={{ flex: 1 }}>
        <div className="blocks_title">
          <h2>Лидеры проекта</h2>
          {total > 0 && (
            <p className="secondary_text">Всего в выборке: {total}</p>
          )}
        </div>

        {tableLeaders.length > 0 ? (
          <div className="project_leaders_grid">
            {tableLeaders.map((user) => (
              <div className="question_list_item" key={user.id}>
                <div className="question_list_item-left">
                  <span className="leader_number">{user.rank}</span>
                  <Link href={`/profile/${user.id}`}>
                    <div className="question_list_item_left">
                      <img src={user.avatar_url || "/images/icons/avatar.svg"} alt={displayUserName(user)} />
                      <div className="question_list_item_left__user_meta">
                        <p className="main_text">{displayUserName(user)}</p>
                        <span>{formatMetricLine(metricFilter, user.metric_value)}</span>
                      </div>
                    </div>
                  </Link>
                </div>
                {(user.subscribers_count ?? 0) > 0 ? (
                  <div className="question_list_item_users">
                    {(user.subscriber_preview ?? []).map((s) => (
                      <img
                        key={s.id}
                        src={s.avatar_url || "/images/icons/avatar.svg"}
                        alt=""
                      />
                    ))}
                    <p className="main_text">
                      {numWord(user.subscribers_count ?? 0, [
                        "подписчик",
                        "подписчика",
                        "подписчиков",
                      ])}
                    </p>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : topLeaders.length === 0 && tableLeaders.length === 0 && !filterLoading ? (
          <div className="empty-list">
            <p className="secondary_text">Список пуст</p>
          </div>
        ) : null}

        {hasMore && (
          <div className="show_more_btn_wrapper">
            <button className="show_more_btn" onClick={() => void loadMore()} disabled={loadingMore || filterLoading}>
              <svg width="22" height="22">
                <use xlinkHref="#sync"></use>
              </svg>
              {loadingMore ? "Загрузка..." : "Показать еще"}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
