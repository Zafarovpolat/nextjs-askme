'use client'

import { useState } from 'react'
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { mockUsers } from "@/data/mock-users"

// Категории для фильтров
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
]

// Склонение слова "балл"
const numWord = (value: number, words: [string, string, string]): string => {
  const abs = Math.abs(value)
  const cases = [2, 0, 1, 1, 1, 2]
  const index = (abs % 100 > 4 && abs % 100 < 20) ? 2 : cases[Math.min(abs % 10, 5)]
  return `${value} ${words[index]}`
}

export default function LeadersPage() {
  const [periodFilter, setPeriodFilter] = useState("week")
  const [sortFilter, setSortFilter] = useState("answers")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [subcategoryFilter, setSubcategoryFilter] = useState("")

  // Подкатегории выбранной категории
  const currentCategory = categories.find(c => c.slug === categoryFilter)
  const subcategoryOptions = currentCategory?.subcategories ?? []

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
    setSubcategoryFilter("")
  }

  // Топ-3 лидера
  const topLeaders = mockUsers.slice(0, 3)
  // Остальные лидеры
  const projectLeaders = mockUsers.slice(3)

  const topPlaceIcons = [
    "/images/icons/top-1.svg",
    "/images/icons/top-2.svg",
    "/images/icons/top-3.svg",
  ]

  return (
    <>
      <Header />
      <div className="container">
        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">Главная</Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">Лидеры</span>
        </div>
      </div>

      {/* Заголовок + фильтры */}
      <div className="top_leaders_list_wrapper container">
        <div className="blocks_title">
          <h2>Лидеры по активности</h2>
        </div>

        {/* 4 фильтра */}
        <div className="top_leaders_filter">
          <div className="top_leaders_filter_item">
            <select
              className="super-select"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option value="year">За год</option>
              <option value="month">За месяц</option>
              <option value="week">За неделю</option>
              <option value="day">За день</option>
            </select>
          </div>
          <div className="top_leaders_filter_item">
            <select
              className="super-select"
              value={sortFilter}
              onChange={(e) => setSortFilter(e.target.value)}
            >
              <option value="answers">По количеству ответов</option>
              <option value="rating">По рейтингу</option>
              <option value="questions">По количеству вопросов</option>
            </select>
          </div>
          <div className="top_leaders_filter_item">
            <select
              className="super-select"
              value={categoryFilter}
              onChange={(e) => handleCategoryChange(e.target.value)}
            >
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

      {/* Топ-3 лидера */}
      <div className="container">
        <div className="top_leaders_list">
          {topLeaders.map((user, index) => (
            <div className="top_leader_card" key={user.id}>
              <img
                className="top_leader_card_bg"
                src="/images/top-leader-bg.svg"
                alt=""
              />
              <img
                className="top_leader_card_bg_dark"
                src="/images/top-leader-bg-d.svg"
                alt=""
              />
              <img
                className="top_leader_card_rect"
                src="/images/blues-rect.svg"
                alt=""
              />
              <div className="top_leader_card_content">
                <div className="top_leader_card_img">
                  <img
                    className="top_leader_card_image"
                    src={user.avatar || "/images/icons/avatar.svg"}
                    alt={user.displayName}
                  />
                  <img
                    className="top_leader_place"
                    src={topPlaceIcons[index]}
                    alt={`${index + 1} место`}
                  />
                </div>
                <div className="top_leader_card_desc">
                  <h3>{user.displayName}</h3>
                  <h4>{user.role}</h4>
                  <p>{numWord(user.rating, ["балл", "балла", "баллов"])}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Лидеры проекта */}
      <div className="project_leaders_list container">
        <div className="blocks_title">
          <h2>Лидеры проекта</h2>
        </div>

        {projectLeaders.length > 0 ? (
          <div className="project_leaders_grid">
            {projectLeaders.map((user, index) => (
              <div className="question_list_item" key={user.id}>
                <div className='question_list_item-left'>
                  <span className="leader_number">{index + 1}</span>
                <Link href={`/profile/${user.username}`}>
                  <div className="question_list_item_left">
                    <img
                      src={user.avatar || "/images/icons/avatar.svg"}
                      alt={user.displayName}
                    />
                    <div>
                      <p className="main_text">{user.displayName}</p>
                      <span>{numWord(user.rating, ["балл", "балла", "баллов"])}</span>
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

        {/* Показать еще */}
        <div className="show_more_btn_wrapper">
          <button className="show_more_btn">
            <svg width="22" height="22">
              <use xlinkHref="#sync"></use>
            </svg>
            Показать еще
          </button>
        </div>
      </div>

      <Footer />
    </>
  )
}
