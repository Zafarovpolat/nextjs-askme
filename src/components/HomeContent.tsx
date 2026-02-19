'use client'

import { useState, useRef, useCallback } from 'react'
import { mockQuestions } from "@/data/mock-questions"
import { mockCategories } from "@/data/mock-categories"
import { mockUsers } from "@/data/mock-users"
import Link from "next/link"
import LoginModal from "@/components/LoginModal"
import QuestionModal from "@/components/QuestionModal"
import SharePopup from "@/components/SharePopup"

// Подкатегории для каждой категории
const subcategories: Record<string, string[]> = {
  "auto-moto": ["Автоспорт", "Автострахование", "Выбор автомобиля, мотоцикла", "ГИБДД, Обучение, Права"],
  entertainment: ["Игры без компьютера", "Клубы, Дискотеки", "Концерты, Выставки, Спектакли", "Охота и Рыбалка"],
  plants: ["Дикая природа", "Домашние", "Комнатные растения", "Сад-Огород"],
  "beauty-health": ["Коронавирус", "Баня, Массаж, Фитнес", "Болезни, Лекарства", "Детское здоровье"],
  "family-home": ["Беременность, Роды", "Воспитание детей", "Домашняя бухгалтерия", "Домоводство"],
}

// Данные для блока "Популярные темы" с уникальными иконками
const popularTopics = [
  { id: 101, name: "Еда, Кулинария", slug: "food", svgIcon: "food" },
  { id: 102, name: "Знакомства, Любовь, Отношения", slug: "relationships", svgIcon: "relationships" },
  { id: 103, name: "Программирование", slug: "programming", svgIcon: "it" },
  { id: 104, name: "Философия, Непознанное", slug: "philosophy", svgIcon: "philosophy" },
  { id: 105, name: "Фотография, Видеосъемка", slug: "photo-video", svgIcon: "camera" },
]

const tabs = ["Открытые", "На голосовании", "Лучшие"]

export default function HomeContent() {
  const [activeTab, setActiveTab] = useState(0)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareData, setShareData] = useState({ title: '', url: '' })
  const shareButtonRef = useRef<HTMLButtonElement | null>(null)

  // Обработчик клика по кнопке "Поделиться"
  const handleShareClick = useCallback((e: React.MouseEvent<HTMLButtonElement>, title: string, slug: string) => {
    const btn = e.currentTarget
    if (shareButtonRef.current === btn && isShareOpen) {
      setIsShareOpen(false)
      return
    }
    shareButtonRef.current = btn
    setShareData({ title, url: `${typeof window !== 'undefined' ? window.location.origin : ''}/question/${slug}` })
    setIsShareOpen(true)
  }, [isShareOpen])

  // Drag-to-scroll для списка категорий
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
    el.style.cursor = 'default'
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
    el.style.cursor = 'default'
    el.style.removeProperty('user-select')
  }, [])

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault()
      e.stopPropagation()
      hasDragged.current = false
    }
  }, [])

  // Топ 4 пользователя для блока "Лидеры"
  const topUsers = mockUsers.slice(0, 5)

  // Популярные вопросы (для блока "Самые обсуждаемые")
  const popularQuestions = mockQuestions.slice(0, 5)

  return (
    <div className="container">
      {/* Блок "Популярные категории" */}
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
          style={{ cursor: 'default' }}
        >
          <div className="subjects_list">
            {mockCategories.slice(0, 5).map((category) => (
              <div className="subject_item" key={category.id}>
                <div className="subject_item_icon">
                  <svg width="24" height="24" className="category_icon">
                    <use xlinkHref={`#${category.svgIcon || "gaming"}`}></use>
                  </svg>
                </div>

                <Link href={`/categories/${category.slug}`}>
                  <h3>{category.name}</h3>
                </Link>

                {/* Список подкатегорий */}
                <div className="subject_item_list">
                  {subcategories[category.slug]
                    ?.slice(0, 4)
                    .map((subcat, index) => (
                      <Link
                        href={`/categories/${category.slug}/${encodeURIComponent(subcat.toLowerCase())}`}
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

                {/* Посмотреть все */}
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

      {/* Блок "Вопросы участников" */}
      <div className="section populars_block">
        <div className="blocks_title">
          <h2>Вопросы участников</h2>

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
          {mockQuestions.map((question) => (
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
                {/* Аватары пользователей */}
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
                    Ответить
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Показать больше */}
        <div className="show_more_btn_wrapper">
          <button className="show_more_btn">
            <svg width="22" height="22">
              <use xlinkHref="#sync"></use>
            </svg>
            Показать еще
          </button>
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
                      src={
                        question.author.avatar || "/images/icons/avatar.svg"
                      }
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
  )
}
