"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SearchResultCard from "@/components/SearchResultCard";
import SearchSimilarQuestionsBlock from "@/components/search/SearchSimilarQuestionsBlock";
import ProfileWeeklyLeadersSidebar from "@/components/ProfileWeeklyLeadersSidebar";
import CustomSelect from "@/components/CustomSelect";
import { getApiFullUrl } from "@/config/api";
import type { ProfileWidgetsPayload } from "@/lib/server-profile-widgets";
import type { ApiCategoryTree } from "@/lib/server-categories";
import type { SearchLeaderQuestion } from "@/lib/server-search-leaders";
import type { Question } from "@/types";
import {
  formatCompactNumWord,
} from "@/lib/format-compact-count";
import { usePageStickySidebars } from "@/hooks/usePageStickySidebars";

type SortMode = "date" | "relevance";

type ApiSearchQuestion = {
  id: number;
  title: string;
  description?: string;
  created_at: string;
  answers_count: number;
  status: string;
  is_premium?: boolean;
  category?: { name?: string; slug?: string; icon_key?: string } | null;
  author?: {
    id: number;
    full_name: string;
    avatar_url: string | null;
    avatar_url_2x?: string | null;
    balls?: number;
    is_premium?: boolean;
    premium_is_active?: boolean;
    premium_is_permanent?: boolean;
    premium_package_name?: string | null;
    is_ai?: boolean;
  } | null;
};

type SearchPageClientProps = {
  /** Полное дерево — селекты фильтра поиска */
  categories: ApiCategoryTree[];
  /** Как на главной (v1/main): короткий список для левого сайдбара */
  sidebarCategories: ApiCategoryTree[];
  widgets: ProfileWidgetsPayload;
  leaderQuestions: SearchLeaderQuestion[];
};

const SEARCH_PER_PAGE = 10;

const timeWord = (value: number, words: [string, string, string]): string => {
  const abs = Math.abs(value);
  const cases = [2, 0, 1, 1, 1, 2];
  const index =
    abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)];
  return `${value} ${words[index]}`;
};

const metricWord = (value: number, words: [string, string, string]): string =>
  formatCompactNumWord(value, words);

const formatTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "сегодня";
  if (diffDays < 7)
    return timeWord(diffDays, ["день", "дня", "дней"]) + " назад";
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4)
    return timeWord(diffWeeks, ["неделю", "недели", "недель"]) + " назад";
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12)
    return timeWord(diffMonths, ["месяц", "месяца", "месяцев"]) + " назад";
  const diffYears = Math.floor(diffDays / 365);
  return timeWord(diffYears, ["год", "года", "лет"]) + " назад";
};

function mapStatus(
  s: string,
): "opened" | "closed" | "voting" {
  if (s === "closed") return "closed";
  if (s === "voting") return "voting";
  return "opened";
}

function mapApiToQuestion(q: ApiSearchQuestion): Question {
  const created = q.created_at || new Date().toISOString();
  return {
    id: q.id,
    title: q.title,
    content: q.description || "",
    slug: String(q.id),
    author: {
      id: q.author?.id ?? 0,
      username: String(q.author?.id ?? ""),
      displayName: q.author?.full_name ?? "",
      email: "",
      avatar: q.author?.avatar_url || "/images/icons/avatar.svg",
      avatar2x: q.author?.avatar_url_2x ?? undefined,
      bio: "",
      rating: q.author?.balls ?? 0,
      balance: 0,
      vipStatus: false,
      followersCount: 0,
      followingsCount: 0,
      questionsCount: 0,
      answersCount: 0,
      createdAt: created,
      role: "",
      is_premium: q.author?.is_premium,
      premium_is_active: q.author?.premium_is_active,
      premium_is_permanent: q.author?.premium_is_permanent,
      premium_package_name: q.author?.premium_package_name ?? null,
    },
    category: {
      id: 0,
      name: q.category?.name || "Без категории",
      slug: q.category?.slug || "",
      description: "",
      svgIcon: q.category?.icon_key || "business",
      parent: null,
      children: [],
      questionsCount: 0,
    },
    rating: q.author?.balls ?? 0,
    status: mapStatus(q.status),
    commentsCount: q.answers_count,
    createdAt: created,
    updatedAt: created,
    is_premium: q.is_premium ?? false,
  };
}

function buildSearchParams(opts: {
  q: string;
  exact: boolean;
  categoryId: string;
  subcategoryId: string;
  sort: SortMode;
}): URLSearchParams {
  const p = new URLSearchParams();
  const q = opts.q.trim();
  if (q) p.set("q", q);
  if (opts.exact) p.set("exact", "1");
  if (opts.categoryId) p.set("category_id", opts.categoryId);
  if (opts.subcategoryId) p.set("subcategory_id", opts.subcategoryId);
  if (opts.sort === "relevance") p.set("sort", "relevance");
  return p;
}

export default function SearchPageClient({
  categories,
  sidebarCategories,
  widgets,
  leaderQuestions,
}: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [qInput, setQInput] = useState("");
  const [exact, setExact] = useState(false);
  const [categoryIdStr, setCategoryIdStr] = useState("");
  const [subcategoryIdStr, setSubcategoryIdStr] = useState("");
  const [sortFromUrl, setSortFromUrl] = useState<SortMode>("date");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [openCategories, setOpenCategories] = useState<string[]>(() =>
    sidebarCategories.length ? [sidebarCategories[0].slug] : [],
  );

  const { wrapperRef, leftSidebarRef, rightSidebarRef } = usePageStickySidebars();

  const subOptions = useMemo(() => {
    if (!categoryIdStr) return [];
    const parent = categories.find((c) => String(c.id) === categoryIdStr);
    return parent?.subcategories ?? [];
  }, [categories, categoryIdStr]);

  const categorySelectOptions = useMemo(
    () => categories.map((cat) => ({ value: String(cat.id), label: cat.name })),
    [categories],
  );

  const subcategorySelectOptions = useMemo(
    () => subOptions.map((sub) => ({ value: String(sub.id), label: sub.name })),
    [subOptions],
  );

  const fetchPage = useCallback(
    async (
      page: number,
      opts: {
        q: string;
        exact: boolean;
        categoryId: string;
        subcategoryId: string;
        sort: SortMode;
      },
      append: boolean,
    ): Promise<void> => {
      const q = opts.q.trim();
      if (!q) {
        setQuestions([]);
        setTotal(0);
        setCurrentPage(1);
        setLastPage(1);
        return;
      }
      const headers: Record<string, string> = { Accept: "application/json" };

      const api = new URLSearchParams();
      api.set("q", q);
      if (opts.exact) api.set("exact", "1");
      if (opts.categoryId) api.set("category_id", opts.categoryId);
      if (opts.subcategoryId) api.set("subcategory_id", opts.subcategoryId);
      api.set("sort", opts.sort);
      api.set("page", String(page));
      api.set("per_page", String(SEARCH_PER_PAGE));

      const url = getApiFullUrl(`v1/search/questions?${api.toString()}`);
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Ошибка ${res.status}`);
      }
      const data = (await res.json()) as {
        questions?: ApiSearchQuestion[];
        current_page?: number;
        last_page?: number;
        total?: number;
        message?: string;
      };
      if (data.message) throw new Error(data.message);

      const rawList = data.questions ?? [];
      const nextQuestions = rawList.map((item) => mapApiToQuestion(item));
      setQuestions((prev) =>
        append ? [...prev, ...nextQuestions] : nextQuestions,
      );
      setTotal(
        typeof data.total === "number"
          ? data.total
          : nextQuestions.length,
      );
      setCurrentPage(data.current_page ?? page);
      setLastPage(data.last_page ?? 1);
    },
    [],
  );

  useEffect(() => {
    const q = searchParams.get("q")?.trim() ?? "";
    const exactP = searchParams.get("exact") === "1";
    const cat = searchParams.get("category_id") ?? "";
    const sub = searchParams.get("subcategory_id") ?? "";
    const sortP: SortMode =
      searchParams.get("sort") === "relevance" ? "relevance" : "date";

    setQInput(q);
    setExact(exactP);
    setCategoryIdStr(cat);
    setSubcategoryIdStr(sub);
    setSortFromUrl(sortP);

    if (!q) {
      setQuestions([]);
      setTotal(0);
      setCurrentPage(1);
      setLastPage(1);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    void (async () => {
      try {
        await fetchPage(1, {
          q,
          exact: exactP,
          categoryId: cat,
          subcategoryId: sub,
          sort: sortP,
        }, false);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Ошибка поиска");
          setQuestions([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, fetchPage]);

  const qTrimmed = searchParams.get("q")?.trim() ?? "";

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = buildSearchParams({
      q: qInput,
      exact,
      categoryId: categoryIdStr,
      subcategoryId: subcategoryIdStr,
      sort: sortFromUrl,
    });
    const qs = p.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  };

  const onSortChange = (sort: SortMode) => {
    setSortFromUrl(sort);
    const p = buildSearchParams({
      q: qInput,
      exact,
      categoryId: categoryIdStr,
      subcategoryId: subcategoryIdStr,
      sort,
    });
    const qs = p.toString();
    router.push(qs ? `/search?${qs}` : "/search");
  };

  const onLoadMore = async () => {
    if (currentPage >= lastPage || loadingMore || loading) return;
    const q = searchParams.get("q")?.trim() ?? "";
    if (!q) return;
    setLoadingMore(true);
    setError(null);
    try {
      await fetchPage(
        currentPage + 1,
        {
          q,
          exact: searchParams.get("exact") === "1",
          categoryId: searchParams.get("category_id") ?? "",
          subcategoryId: searchParams.get("subcategory_id") ?? "",
          sort:
            searchParams.get("sort") === "relevance" ? "relevance" : "date",
        },
        true,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleCategory = (slug: string) => {
    setOpenCategories((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  return (
    <>
      <Header />
      <div className="search-page-wrapper">
        <div className="container">
          <div className="breadcrumbs breadcrumbs--search">
            <Link href="/" className="breadcrumbs__link">
              Главная
            </Link>
            <span className="breadcrumbs__sep">•</span>
            <span className="breadcrumbs__current">Результаты поиска</span>
          </div>
        </div>

        <div
          className="question_wrapper container"
          style={{ paddingBottom: "25px" }}
          ref={wrapperRef}
        >
          <div className="question_left_list" ref={leftSidebarRef}>
            <div className="quest_catogories_list">
              <div className="blocks_title">
                <h2>Категории</h2>
              </div>
              {sidebarCategories.map((cat) => (
                <div
                  className={`quest_catogory ${openCategories.includes(cat.slug) ? "active_quest_catogory" : ""}`}
                  key={cat.slug}
                >
                  <div
                    className="quest_catogory_title"
                    title={cat.name}
                    onClick={() => toggleCategory(cat.slug)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleCategory(cat.slug);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div>
                      <span className="quest_catogory_icon" title={cat.name}>
                        <svg width="18" height="18" aria-hidden>
                          <use
                            xlinkHref={`#${cat.icon_key || "business"}`}
                          ></use>
                        </svg>
                      </span>
                      <p title={cat.name}>{cat.name}</p>
                    </div>
                    <svg
                      className="quest_catogory_arrow"
                      width="9"
                      height="6"
                      style={{ fill: "rgb(91, 103, 255)" }}
                    >
                      <use xlinkHref="#arrow-down"></use>
                    </svg>
                  </div>
                  <div className="quest_catogory_content">
                    <div className="subject_item_list">
                      {(cat.subcategories ?? []).map((sub) => (
                        <Link
                          href={`/categories/${cat.slug}/${sub.slug}`}
                          key={sub.id}
                          title={sub.name}
                        >
                          <span className="subject_item_list_item">
                            <img
                              src="/images/icons/category-list-item.svg"
                              alt=""
                              title={sub.name}
                            />
                            <span title={sub.name}>{sub.name}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 0 }}>
              <ProfileWeeklyLeadersSidebar initialWidgets={widgets} />
            </div>
          </div>

          <div className="questions_page_list">
            <div
              className="main_question_block main_question_block_item search-form-block"
              style={{ marginTop: "0" }}
            >
              <div className="main_question_bg_wrapper">
                <div className="main_question_block_top_bg">
                  <img
                    src="/images/top-leader-bg.svg"
                    className="top_bg_light"
                    alt=""
                  />
                  <img
                    src="/images/top-leader-bg-d-2.svg"
                    className="top_bg_dark"
                    alt=""
                  />
                  <img
                    src="/images/blues-rect.svg"
                    className="top_bg_rect top_bg_rect_light"
                    alt=""
                  />
                  <img
                    src="/images/blues-rect-dark.svg"
                    className="top_bg_rect top_bg_rect_dark"
                    alt=""
                  />
                </div>
              </div>

              <div
                className="main_question_block_title"
                style={{ marginBottom: "10px" }}
              >
                <h1 style={{ margin: 0 }}>Результаты поиска</h1>
              </div>

              <form
                onSubmit={onSubmitSearch}
                style={{ position: "relative", zIndex: 2 }}
              >
                <div
                  className="search-form-header"
                  style={{
                    display: "flex",
                    gap: "15px",
                    alignItems: "stretch",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    className="ask_form_item"
                    style={{
                      flex: 1,
                      marginBottom: 0,
                      position: "relative",
                    }}
                  >
                    <img
                      src="/images/icons/search.svg"
                      alt=""
                      style={{
                        position: "absolute",
                        left: "18px",
                        top: "50%",
                        transform: "translateY(-50%) scaleX(-1)",
                        width: "18px",
                        height: "18px",
                        zIndex: 1,
                      }}
                      className="light_logo"
                    />
                    <img
                      src="/images/icons/mob-search.svg"
                      alt=""
                      style={{
                        position: "absolute",
                        left: "18px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "18px",
                        height: "18px",
                        zIndex: 1,
                        fill: "#fff",
                      }}
                      className="dark_logo"
                    />
                    <input
                      type="text"
                      name="q"
                      placeholder="Что хотите найти?"
                      value={qInput}
                      onChange={(e) => setQInput(e.target.value)}
                      style={{ paddingLeft: "45px", width: "100%" }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="m_btn category_btn"
                    style={{
                      height: "50px",
                      borderRadius: "12px",
                      padding: "0 40px",
                      fontSize: "16px",
                      textTransform: "none",
                    }}
                  >
                    Искать
                  </button>
                </div>

                <div
                  className="ask_form_item search-form-selects"
                  style={{
                    display: "flex",
                    gap: "15px",
                    marginBottom: "14px",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: 1, minWidth: "250px" }}>
                    <CustomSelect
                      value={categoryIdStr}
                      onChange={(value) => {
                        setCategoryIdStr(value);
                        setSubcategoryIdStr("");
                      }}
                      placeholder="Все категории"
                      options={categorySelectOptions}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: "250px" }}>
                    <CustomSelect
                      value={subcategoryIdStr}
                      onChange={setSubcategoryIdStr}
                      placeholder="Все подкатегории"
                      options={subcategorySelectOptions}
                      disabled={!categoryIdStr}
                    />
                  </div>
                </div>

                <div
                  className="ask_form_checkboxes search-page-checkboxes"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <label className="chechbox_item">
                    <input
                      type="checkbox"
                      checked={exact}
                      onChange={(e) => setExact(e.target.checked)}
                      style={{
                        width: "22px",
                        height: "22px",
                        minWidth: "22px",
                      }}
                    />
                    <span>Только точные совпадения</span>
                  </label>
                  <button
                    type="button"
                    className="search-advanced-toggle"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      color: "#5B67FF",
                      fontSize: "14px",
                      fontWeight: 700,
                      letterSpacing: "0.5px",
                      transition: "opacity 0.2s ease",
                      visibility: "hidden",
                    }}
                    aria-hidden
                    tabIndex={-1}
                  >
                    РАСШИРЕННЫЙ
                    <svg
                      width="10"
                      height="7"
                      style={{
                        transform: "translateY(-1px)",
                        fill: "currentColor",
                      }}
                    >
                      <use xlinkHref="#arrow-down"></use>
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            <div style={{ marginTop: "15px", paddingBottom: "0px" }}>
              <div className="search-results-header">
                <h2 className="search-results-count">
                  {searchParams.get("q")?.trim()
                    ? loading
                      ? "Поиск…"
                      : metricWord(total, [
                          "совпадение",
                          "совпадения",
                          "совпадений",
                        ])
                    : "Введите запрос и нажмите «Искать»"}
                </h2>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    fontWeight: 500,
                  }}
                >
                  <button
                    type="button"
                    className={`search-sort-btn ${sortFromUrl === "date" ? "active" : ""}`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontWeight: 600,
                      fontSize: "14px",
                    }}
                    onClick={() => onSortChange("date")}
                  >
                    По дате
                  </button>
                  <span style={{ color: "#ccd7e6" }}>|</span>
                  <button
                    type="button"
                    className={`search-sort-btn ${sortFromUrl === "relevance" ? "active" : ""}`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                    onClick={() => onSortChange("relevance")}
                  >
                    По релевантности
                  </button>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    padding: "16px",
                    color: "#c0392b",
                    marginBottom: "12px",
                  }}
                >
                  {error}
                </div>
              )}

              <div
                className="search-results-list"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                {!searchParams.get("q")?.trim() ? (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#899AB5",
                    }}
                  >
                    Укажите текст в поле выше и нажмите «Искать», либо откройте
                    страницу с параметром{" "}
                    <code style={{ fontSize: "13px" }}>?q=…</code> в адресе.
                  </div>
                ) : loading ? (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#899AB5",
                    }}
                  >
                    Загрузка…
                  </div>
                ) : questions.length > 0 ? (
                  questions.map((q) => (
                    <SearchResultCard key={q.id} question={q} />
                  ))
                ) : (
                  <div
                    style={{
                      padding: "40px",
                      textAlign: "center",
                      color: "#899AB5",
                    }}
                  >
                    По вашему запросу ничего не найдено
                  </div>
                )}
              </div>

              {searchParams.get("q")?.trim() &&
                !loading &&
                currentPage < lastPage && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginTop: "20px",
                    }}
                  >
                    <button
                      className="show_more_btn search-load-more-btn"
                      type="button"
                      disabled={loadingMore}
                      onClick={() => void onLoadMore()}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        background: "none",
                        fontSize: "15px",
                        fontWeight: 400,
                        cursor: loadingMore ? "wait" : "pointer",
                      }}
                    >
                      <svg width="22" height="22">
                        <use xlinkHref="#sync"></use>
                      </svg>
                      {loadingMore ? "Загрузка…" : "Загрузить еще"}
                    </button>
                  </div>
                )}
            </div>
          </div>

          <div className="question_right_list" ref={rightSidebarRef}>
            <div className="blocks_title">
              <h2>Вопросы лидеры</h2>
            </div>
            {leaderQuestions.length === 0 ? (
              <p style={{ color: "#899AB5", fontSize: "14px" }}>
                Список обновляется по расписанию. Выполните{" "}
                <code style={{ fontSize: "12px" }}>php artisan profile:warm-widgets</code> на
                сервере.
              </p>
            ) : (
              leaderQuestions.map((q) => (
                <Link href={`/question/${q.id}`} key={q.id}>
                  <div
                    className="question_list_item question_leader_card"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="question_list_item_left">
                      <img
                        src={
                          q.author?.avatar_url ||
                          "/images/icons/avatar.svg"
                        }
                        alt=""
                      />
                      <div className="question_list_item_left__user_meta">
                        <p className="main_text" title={q.author?.full_name ?? undefined}>
                          {q.author?.full_name ?? "—"}
                        </p>
                        <span>
                          {q.created_at
                            ? formatTimeAgo(q.created_at)
                            : ""}
                        </span>
                      </div>
                    </div>
                    <div className="question_text">
                      <p>{q.title}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="container" style={{ paddingTop: "8px" }}>
          <div className="ask_question">
            <p>Не нашли то, что искали?</p>
            <Link href="/ask" className="ask_question__button">
              Задайте свой вопрос
            </Link>
          </div>
        </div>

        <SearchSimilarQuestionsBlock query={qTrimmed} />
      </div>
      <Footer />
    </>
  );
}
