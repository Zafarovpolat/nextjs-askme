"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { api } from "@/lib/api-client";

type LeaderUser = {
  id: number;
  full_name: string;
  avatar_url?: string | null;
  balls: number;
  level_name?: string | null;
};

type LeadersPageResponse = {
  top_leaders: LeaderUser[];
  leaders: LeaderUser[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

type LeadersPageContentProps = {
  initialData: LeadersPageResponse;
};

const categories = [
  { slug: "auto-moto", name: "Авто, Мото", subcategories: ["Автоспорт", "Автострахование", "Выбор автомобиля"] },
  { slug: "entertainment", name: "Развлечения", subcategories: ["Игры без компьютера", "Клубы, Дискотеки"] },
  { slug: "plants", name: "Растения", subcategories: ["Дикая природа", "Комнатные растения"] },
  { slug: "beauty-health", name: "Красота и Здоровье", subcategories: ["Баня, Массаж, Фитнес", "Болезни, Лекарства"] },
  { slug: "family-home", name: "Семья, Дом", subcategories: ["Беременность, Роды", "Воспитание детей"] },
  { slug: "business-finance", name: "Бизнес, Финансы", subcategories: ["Банки и Кредиты", "Недвижимость, Ипотека"] },
  { slug: "food-cooking", name: "Еда, Кулинария", subcategories: ["Вторые блюда", "Десерты, Сладости, Выпечка"] },
  { slug: "sport", name: "Спорт", subcategories: ["Теннис", "Футбол", "Хоккей"] },
  { slug: "homework", name: "Домашние задания", subcategories: ["Математика", "Алгебра", "Геометрия"] },
  { slug: "programming", name: "Программирование", subcategories: ["Android", "C/C++", "Python"] },
];

const numWord = (value: number, words: [string, string, string]): string => {
  const abs = Math.abs(value);
  const cases = [2, 0, 1, 1, 1, 2];
  const index = abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)];
  return `${value} ${words[index]}`;
};

export default function LeadersPageContent({ initialData }: LeadersPageContentProps) {
  const [periodFilter, setPeriodFilter] = useState("week");
  const [sortFilter, setSortFilter] = useState("answers");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subcategoryFilter, setSubcategoryFilter] = useState("");

  const [topLeaders] = useState<LeaderUser[]>(initialData.top_leaders ?? []);
  const [leaders, setLeaders] = useState<LeaderUser[]>(initialData.leaders ?? []);
  const [currentPage, setCurrentPage] = useState<number>(initialData.current_page ?? 1);
  const [lastPage, setLastPage] = useState<number>(initialData.last_page ?? 1);
  const [perPage] = useState<number>(initialData.per_page ?? 10);
  const [loadingMore, setLoadingMore] = useState(false);

  const currentCategory = categories.find((c) => c.slug === categoryFilter);
  const subcategoryOptions = currentCategory?.subcategories ?? [];

  const topPlaceIcons = [
    "/images/icons/top-1.svg",
    "/images/icons/top-2.svg",
    "/images/icons/top-3.svg",
  ];

  const hasMore = currentPage < lastPage;

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    setSubcategoryFilter("");
  };

  const loadMore = async () => {
    if (!hasMore || loadingMore) return;
    const nextPage = currentPage + 1;
    setLoadingMore(true);
    try {
      const data = await api.get<LeadersPageResponse>(`v1/leaders?page=${nextPage}&per_page=${perPage}`);
      setLeaders((prev) => [...prev, ...(data.leaders ?? [])]);
      setCurrentPage(data.current_page ?? nextPage);
      setLastPage(data.last_page ?? lastPage);
    } catch {
      // Ошибку скрываем: базовый список уже отрендерен сервером.
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <>
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

        <div className="top_leaders_filter">
          <div className="top_leaders_filter_item">
            <select className="super-select" value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}>
              <option value="year">За год</option>
              <option value="month">За месяц</option>
              <option value="week">За неделю</option>
              <option value="day">За день</option>
            </select>
          </div>
          <div className="top_leaders_filter_item">
            <select className="super-select" value={sortFilter} onChange={(e) => setSortFilter(e.target.value)}>
              <option value="answers">По количеству ответов</option>
              <option value="rating">По рейтингу</option>
              <option value="questions">По количеству вопросов</option>
            </select>
          </div>
          <div className="top_leaders_filter_item">
            <select className="super-select" value={categoryFilter} onChange={(e) => handleCategoryChange(e.target.value)}>
              <option value="">Категория</option>
              {categories.map((cat) => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="top_leaders_filter_item">
            <select
              className="super-select"
              value={subcategoryFilter}
              onChange={(e) => setSubcategoryFilter(e.target.value)}
              disabled={!categoryFilter}
            >
              <option value="">Все подкатегории</option>
              {subcategoryOptions.map((subcat) => (
                <option key={subcat} value={subcat}>{subcat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="top_leaders_list">
          {topLeaders.map((user, index) => (
            <div className="top_leader_card" key={user.id}>
              <img className="top_leader_card_bg" src="/images/top-leader-bg.svg" alt="" />
              <img className="top_leader_card_bg_dark" src="/images/top-leader-bg-d.svg" alt="" />
              <img className="top_leader_card_rect" src="/images/blues-rect.svg" alt="" />
              <div className="top_leader_card_content">
                <div className="top_leader_card_img">
                  <img
                    className="top_leader_card_image"
                    src={user.avatar_url || "/images/icons/avatar.svg"}
                    alt={user.full_name}
                  />
                  <img className="top_leader_place" src={topPlaceIcons[index]} alt={`${index + 1} место`} />
                </div>
                <div className="top_leader_card_desc">
                  <h3>{user.full_name}</h3>
                  <h4>{user.level_name || ""}</h4>
                  <p>{numWord(user.balls ?? 0, ["балл", "балла", "баллов"])}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="project_leaders_list container">
        <div className="blocks_title">
          <h2>Лидеры проекта</h2>
        </div>

        {leaders.length > 0 ? (
          <div className="project_leaders_grid">
            {leaders.map((user, index) => (
              <div className="question_list_item" key={user.id}>
                <div className="question_list_item-left">
                  <span className="leader_number">{4 + index}</span>
                  <Link href={`/profile/${user.id}`}>
                    <div className="question_list_item_left">
                      <img src={user.avatar_url || "/images/icons/avatar.svg"} alt={user.full_name} />
                      <div>
                        <p className="main_text">{user.full_name}</p>
                        <span>{numWord(user.balls ?? 0, ["балл", "балла", "баллов"])}</span>
                      </div>
                    </div>
                  </Link>
                </div>
                <div className="question_list_item_users">
                  <img src="/images/icons/avatar.svg" alt="" />
                  <img src="/images/icons/avatar.svg" alt="" />
                  <img src="/images/icons/avatar.svg" alt="" />
                  <p className="main_text">+4K</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-list">
            <p className="secondary_text">Список пуст</p>
          </div>
        )}

        {hasMore && (
          <div className="show_more_btn_wrapper">
            <button className="show_more_btn" onClick={loadMore} disabled={loadingMore}>
              <svg width="22" height="22">
                <use xlinkHref="#sync"></use>
              </svg>
              {loadingMore ? "Загрузка..." : "Показать еще"}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}
