"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import { api } from "@/lib/api-client";
import { displayPremiumBadge, displayUserName, displayUserSubtitle } from "@/lib/ai-user-display";
import CustomSelect from "@/components/CustomSelect";
import type {
  LeaderCategory,
  LeaderUser,
  LeadersPageResponse,
} from "./page";
import { formatCompactNumWord } from "@/lib/format-compact-count";

type LeadersPageContentProps = {
  initialData: LeadersPageResponse;
};

const PERIODS = [
  { value: "day", label: "За день" },
  { value: "week", label: "За неделю" },
  { value: "month", label: "За месяц" },
  { value: "year", label: "За год" },
] as const;

const METRICS = [
  { value: "answers", label: "По количеству ответов" },
  { value: "rating", label: "По рейтингу" },
  { value: "questions", label: "По количеству вопросов" },
] as const;

const numWord = (value: number, words: [string, string, string]): string =>
  formatCompactNumWord(value, words);

function formatMetricLine(metric: string, metricValue: number): string {
  if (metric === "rating") {
    const abs = Math.abs(metricValue);
    const body = formatCompactNumWord(abs, ["балл", "балла", "баллов"]);
    if (metricValue > 0) return `+${body} за период`;
    if (metricValue < 0) return `-${body} за период`;
    return `${body} за период`;
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

  const resetFilters = () => {
    setPeriodFilter("day");
    setMetricFilter("answers");
    setCategoryFilter("");
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
      <div className="container">
        <Breadcrumbs
          items={[
            { name: "Главная", href: "/" },
            { name: "Лидеры", href: "/leaders" },
          ]}
        />
      </div>

      <div className="top_leaders_list_wrapper container">
        <div className="blocks_title">
          <h1>Лидеры по активности</h1>
          <button
            type="button"
            className="top_leaders_filter_reset"
            onClick={resetFilters}
          >
            Сбросить фильтр
          </button>
        </div>

        <div className="top_leaders_filter">
          <div className="top_leaders_filter_item">
            <CustomSelect
              className="custom-select--leaders-filter"
              value={periodFilter}
              onChange={setPeriodFilter}
              placeholder="Период"
              options={PERIODS.map((p) => ({ value: p.value, label: p.label }))}
              disabled={filterLoading}
              clearable
              defaultClearValue="day"
            />
          </div>
          <div className="top_leaders_filter_item">
            <CustomSelect
              className="custom-select--leaders-filter"
              value={metricFilter}
              onChange={handleMetricChange}
              placeholder="Метрика"
              options={METRICS.map((m) => ({ value: m.value, label: m.label }))}
              disabled={filterLoading}
              clearable
              defaultClearValue="answers"
            />
          </div>
          <div className="top_leaders_filter_item">
            <CustomSelect
              className="custom-select--leaders-filter"
              value={categoryFilter}
              onChange={handleCategoryChange}
              placeholder="Категория"
              options={categories.map((cat) => ({ value: String(cat.id), label: cat.name }))}
              disabled={filterLoading || categorySelectDisabled}
              clearable
              defaultClearValue=""
            />
          </div>
          <div className="top_leaders_filter_item">
            <CustomSelect
              className="custom-select--leaders-filter"
              value={subcategoryFilter}
              onChange={setSubcategoryFilter}
              placeholder="Все подкатегории"
              options={subcategoryOptions.map((sub) => ({ value: String(sub.id), label: sub.name }))}
              disabled={filterLoading || categorySelectDisabled || !categoryFilter}
              clearable
              defaultClearValue=""
            />
          </div>
        </div>
      </div>

      <div className="container">
        {filterLoading && (
          <p className="secondary_text" style={{ marginBottom: 12 }}>Обновление списка…</p>
        )}
        <div className="top_leaders_list">
          {topLeaders.map((user, index) => {
            const premium = user.premium_is_active ?? user.is_premium ?? false;
            const premiumText = displayPremiumBadge(user) ?? "Премиум";
            return (
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
                  <UserAvatar
                    src={user.avatar_url}
                    src2x={user.avatar_url_2x}
                    alt={displayUserName(user)}
                    size={97}
                    premium={premium}
                    premiumText={premiumText}
                    imgClassName="top_leader_card_image"
                  />
                  <img className="top_leader_place" src={topPlaceIcons[index]} alt="" />
                </div>
                <div className="top_leader_card_desc">
                  <h3 title={displayUserName(user)}>{displayUserName(user)}</h3>
                  <h4>{displayUserSubtitle(user)}</h4>
                  <p>{formatMetricLine(metricFilter, user.metric_value)}</p>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </div>

      <div className="project_leaders_list container" style={{ flex: 1 }}>
        <div className="blocks_title">
          <h2>Лидеры проекта</h2>
        </div>

        {tableLeaders.length > 0 ? (
          <div className="project_leaders_grid">
            {tableLeaders.map((user) => {
              const premium = user.premium_is_active ?? user.is_premium ?? false;
              const premiumText = displayPremiumBadge(user) ?? "Премиум";
              return (
              <Link
                key={user.id}
                href={`/profile/${user.id}`}
                className="question_list_item"
                aria-label={`Профиль: ${displayUserName(user)}`}
              >
                <div className="question_list_item-left">
                  <span className="leader_number">{user.rank}</span>
                  <div className="question_list_item_left">
                    <UserAvatar
                      src={user.avatar_url}
                      src2x={user.avatar_url_2x}
                      alt={displayUserName(user)}
                      size={40}
                      premium={premium}
                      premiumText={premiumText}
                    />
                    <div className="question_list_item_left__user_meta">
                      <p className="main_text" title={displayUserName(user)}>{displayUserName(user)}</p>
                      <span>{formatMetricLine(metricFilter, user.metric_value)}</span>
                    </div>
                  </div>
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
              </Link>
              );
            })}
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
                <use xlinkHref="/sprites.svg#sync"></use>
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
