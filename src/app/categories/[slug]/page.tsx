'use client'

import { useState, useRef, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { mockQuestions } from "@/data/mock-questions"
import { mockUsers } from "@/data/mock-users"
import { mockCategories } from "@/data/mock-categories"
import LoginModal from "@/components/LoginModal"
import QuestionModal from "@/components/QuestionModal"
import SharePopup from "@/components/SharePopup"

// Данные категорий (slug -> name, icon)
const categoryMap: Record<string, { name: string; svgIcon: string }> = {
  "auto-moto": { name: "Авто, Мото", svgIcon: "steering-wheel" },
  "entertainment": { name: "Развлечения", svgIcon: "gaming" },
  "plants": { name: "Растения", svgIcon: "gear" },
  "beauty-health": { name: "Красота и Здоровье", svgIcon: "heart" },
  "family-home": { name: "Семья, Дом", svgIcon: "family" },
  "business-finance": { name: "Бизнес, Финансы", svgIcon: "business" },
  "food-cooking": { name: "Еда, Кулинария", svgIcon: "food" },
  "sport": { name: "Спорт", svgIcon: "sport" },
  "homework": { name: "Домашние задания", svgIcon: "homework" },
  "culture": { name: "Культура", svgIcon: "culture" },
  "programming": { name: "Программирование", svgIcon: "it" },
  "society-politics": { name: "Общество, Политика", svgIcon: "society" },
  "children": { name: "Дети", svgIcon: "children" },
  "science-tech": { name: "Наука, Техника", svgIcon: "science" },
  "photography": { name: "Фотография", svgIcon: "camera" },
  "video-games": { name: "Видео игры", svgIcon: "gaming" },
  "computers": { name: "Компьютеры, Связь", svgIcon: "computer" },
  "dating": { name: "Знакомства", svgIcon: "relationships" },
  "career": { name: "Работа, Карьера", svgIcon: "career" },
  "horoscopes": { name: "Гороскопы, Гадания", svgIcon: "horoscope" },
}

// Подкатегории для драггабл-блока
const subcategories: Record<string, string[]> = {
  "auto-moto": ["Автоспорт", "Автострахование", "Выбор автомобиля, мотоцикла", "ГИБДД, Обучение, Права"],
  entertainment: ["Игры без компьютера", "Клубы, Дискотеки", "Концерты, Выставки, Спектакли", "Охота и Рыбалка"],
  plants: ["Дикая природа", "Домашние", "Комнатные растения", "Сад-Огород"],
  "beauty-health": ["Коронавирус", "Баня, Массаж, Фитнес", "Болезни, Лекарства", "Детское здоровье"],
  "family-home": ["Беременность, Роды", "Воспитание детей", "Домашняя бухгалтерия", "Домоводство"],
}

const tabs = ["Открытые", "На голосовании", "Лучшие", "Решения"]

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const category = categoryMap[slug] ?? { name: slug, svgIcon: "gear" }

  const [activeTab, setActiveTab] = useState(0)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareData, setShareData] = useState({ title: '', url: '' })
  const shareButtonRef = useRef<HTMLButtonElement | null>(null)

  // Drag-to-scroll для блока категорий
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const hasDragged = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current
    if (!el) return
    isDragging.current = true
    hasDragged.current = false
    startX.current = e.pageX - el.offsetLeft
    scrollLeft.current = el.scrollLeft
    el.style.cursor = 'grabbing'
    el.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const el = scrollRef.current
    if (!el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = (x - startX.current) * 1.5
    if (Math.abs(walk) > 5) hasDragged.current = true
    el.scrollLeft = scrollLeft.current - walk
  }, [])

  const handleMouseUp = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    isDragging.current = false
    el.style.cursor = 'grab'
    el.style.removeProperty('user-select')
  }, [])

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault()
      e.stopPropagation()
      hasDragged.current = false
    }
  }, [])

  const handleShareClick = useCallback((e: React.MouseEvent<HTMLButtonElement>, title: string, questionSlug: string) => {
    const btn = e.currentTarget
    shareButtonRef.current = btn
    setShareData({ title, url: `/question/${questionSlug}` })
    setIsShareOpen(true)
  }, [])

  // Больше вопросов для страницы категории
  const categoryQuestions = [...mockQuestions, ...mockQuestions].map((q, i) => ({
    ...q,
    id: i + 1,
  }))

  const topUsers = mockUsers.slice(0, 4)
  const popularQuestions = mockQuestions.slice(0, 4)

  const popularTopics = [
    { id: 1, name: "Еда, Кулинария", slug: "food-cooking", svgIcon: "food" },
    { id: 2, name: "Знакомства", slug: "dating", svgIcon: "relationships" },
    { id: 3, name: "Программирование", slug: "programming", svgIcon: "it" },
    { id: 4, name: "Культура", slug: "culture", svgIcon: "culture" },
    { id: 5, name: "Фотография", slug: "photography", svgIcon: "camera" },
  ]

  return (
    <>
      <Header />
      <div className="container">
        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">Главная</Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">Категории вопросов</span>
        </div>

        {/* Блок вопросов категории */}
        <div className="section populars_block">
          <div className="blocks_title">
            <svg width="24" height="24" className="category_page_icon">
              <use xlinkHref={`#${category.svgIcon}`}></use>
            </svg>
            <h2>{category.name}</h2>

            <div className="questions_filter">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  className={`s_btn ${activeTab === index ? "s_btn_active" : ""}`}
                  onClick={() => setActiveTab(index)}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Поле "Задать свой вопрос" */}
          <div className="questions_block_search">
            <img src="/images/icons/ask.svg" alt="" />
            <input
              name="message"
              type="text"
              placeholder="Задайте свой вопрос здесь"
            />
            <textarea
              name="message-full"
              placeholder="Задайте свой вопрос здесь"
            ></textarea>
            <button
              type="button"
              className="s_btn s_btn_active"
              onClick={() => setIsQuestionModalOpen(true)}
            >
              Задать вопрос
            </button>
          </div>

          {/* Список вопросов */}
          <div className="questions_list">
            {categoryQuestions.map((question) => (
              <div key={question.id} className="question_list_item">
                {/* Верхняя панель (мобильная) */}
                <div className="question_item_top_data">
                  <div className="question_item_top_data_left">
                    <img
                      src={question.author.avatar || "/images/icons/avatar.svg"}
                      alt={question.author.displayName}
                    />
                    <div>
                      <p className="main_text">{question.author.displayName}</p>
                      <span>{question.author.rating} баллов</span>
                    </div>
                  </div>
                  <div className="question_item_top_data_right">
                    <button
                      title="Мне нравится"
                      className="s_btn s_btn_icon btn-like"
                      onClick={() => setIsLoginModalOpen(true)}
                    >
                      <svg width="13.714355" height="12.000000">
                        <use xlinkHref="#like"></use>
                      </svg>
                    </button>
                    <button
                      className="s_btn s_btn_icon share-this"
                      title="Поделиться"
                      onClick={(e) => handleShareClick(e, question.title, question.slug)}
                    >
                      <svg width="14" height="14.000000">
                        <use xlinkHref="#share"></use>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Основной контент */}
                <Link href={`/question/${question.slug}`}>
                  <div className="question_list_item_left">
                    <img
                      src={question.author.avatar || "/images/icons/avatar.svg"}
                      alt={question.author.displayName}
                    />
                    <div>
                      <p className="main_text">{question.title}</p>
                      <span>8 месяцев назад</span>
                    </div>
                  </div>
                </Link>

                <div className="question_list_item_right">
                  <div className="question_list_item_users">
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <p className="main_text">+5</p>
                  </div>

                  <div className="question_list_item_right_actions">
                    <button
                      title="Мне нравится"
                      className="s_btn s_btn_icon btn-like"
                      onClick={() => setIsLoginModalOpen(true)}
                    >
                      <svg width="13.714355" height="12.000000">
                        <use xlinkHref="#like"></use>
                      </svg>
                    </button>

                    <button
                      className="s_btn s_btn_icon share-this"
                      title="Поделиться"
                      onClick={(e) => handleShareClick(e, question.title, question.slug)}
                    >
                      <svg width="14" height="14.000000">
                        <use xlinkHref="#share"></use>
                      </svg>
                    </button>

                    <Link href={`/question/${question.slug}`} className="s_btn">
                      Посмотреть
                    </Link>

                    <Link
                      href={`/question/${question.slug}#answer`}
                      className="s_btn s_btn_active"
                    >
                      Комментировать
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Показать больше */}
          <div className="show_more_btn_wrapper">
            <button className="show_more_btn">
              <img src="/images/icons/Sync.svg" alt="" />
              Показать еще
            </button>
          </div>
        </div>

        <div className="line"></div>

        {/* Блок "Популярные категории" с драгом */}
        <div className="section popular-section">
          <div className="blocks_title">
            <h2>Популярные</h2>
          </div>

          <div
            className="subjects_list_wrapper"
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClickCapture={handleClickCapture}
            style={{ cursor: 'grab' }}
          >
            <div className="subjects_list">
              {mockCategories.slice(0, 5).map((cat) => (
                <div className="subject_item" key={cat.id}>
                  <div className="subject_item_icon">
                    <svg width="24" height="24" className="category_icon">
                      <use xlinkHref={`#${cat.svgIcon || "gaming"}`}></use>
                    </svg>
                  </div>

                  <Link href={`/categories/${cat.slug}`}>
                    <h3>{cat.name}</h3>
                  </Link>

                  <div className="subject_item_list">
                    {subcategories[cat.slug]
                      ?.slice(0, 4)
                      .map((subcat, index) => (
                        <Link
                          href={`/categories/${cat.slug}/${encodeURIComponent(subcat.toLowerCase())}`}
                          key={index}
                        >
                          <div className="subject_item_list_item">
                            <img
                              src="/images/icons/category-list-item.svg"
                              alt=""
                            />
                            <p>{subcat}</p>
                          </div>
                        </Link>
                      ))}
                  </div>

                  <Link href="/categories">
                    <div className="subject_item_more">
                      <p>Посмотреть все</p>
                      <img src="/images/icons/more-s-icon.svg" alt="" className="subject_item_more_arrow" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="line"></div>

        {/* Три блока внизу */}
        <div className="tops_block">
          {/* Лидеры проекта */}
          <div className="tops_block_item">
            <div className="blocks_title">
              <h2>Лидеры проекта</h2>
            </div>

            <div className="tops_block_item_top_subjects">
              {topUsers.map((user) => (
                <div className="question_list_item" key={user.id}>
                  <Link href={`/profile/${user.username}`}>
                    <div className="question_list_item_left">
                      <img
                        src={user.avatar || "/images/icons/avatar.svg"}
                        alt={user.displayName}
                      />
                      <div>
                        <div className="main_text">{user.displayName}</div>
                        <span>{user.rating} баллов</span>
                      </div>
                    </div>
                  </Link>
                  <div className="question_list_item_users">
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <p className="main_text">+4K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Самые обсуждаемые */}
          <div className="tops_block_item">
            <div className="blocks_title">
              <h2>Самые обсуждаемые</h2>
            </div>

            <div className="tops_block_item_top_subjects">
              {popularQuestions.map((question) => (
                <div className="question_list_item" key={question.id}>
                  <Link href={`/question/${question.slug}`}>
                    <div className="question_list_item_left">
                      <img
                        src={question.author.avatar || "/images/icons/avatar.svg"}
                        alt={question.author.displayName}
                      />
                      <div>
                        <div className="main_text question_title_clamp">
                          {question.title}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="question_list_item_users">
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <p className="main_text">+{question.commentsCount}K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Популярные темы */}
          <div className="tops_block_item">
            <div className="blocks_title">
              <h2>Популярные темы</h2>
            </div>

            <div className="tops_block_item_top_subjects">
              {popularTopics.map((topic) => (
                <div className="question_list_item" key={topic.id}>
                  <Link href={`/categories/${topic.slug}`}>
                    <div className="question_list_item_left">
                      <svg width="24" height="24" className="topic_icon">
                        <use xlinkHref={`#${topic.svgIcon}`}></use>
                      </svg>
                      <div>
                        <div className="main_text">{topic.name}</div>
                      </div>
                    </div>
                  </Link>
                  <div className="question_list_item_users">
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <p className="main_text">+4K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />

        <QuestionModal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
        />

        <SharePopup
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          anchorRef={shareButtonRef}
          title={shareData.title}
          url={shareData.url}
        />
      </div>
      <Footer />
    </>
  )
}
