'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { mockQuestions } from "@/data/mock-questions"
import { mockUsers } from "@/data/mock-users"

// Категории для сайдбара
const sidebarCategories = [
  {
    name: "Авто, Мото", slug: "auto-moto", svgIcon: "steering-wheel",
    subcategories: ["Автоспорт", "Автострахование", "Выбор автомобиля, мотоцикла", "ГИБДД, Обучение, Права", "ПДД, Вождение", "Оформление авто-мото сделок", "Сервис, Обслуживание, Тюнинг", "Прочие Авто-темы"]
  },
  {
    name: "Развлечения", slug: "entertainment", svgIcon: "gaming",
    subcategories: ["Игры без компьютера", "Клубы, Дискотеки", "Концерты, Выставки, Спектакли", "Охота и Рыбалка"]
  },
  {
    name: "Растения", slug: "plants", svgIcon: "gear",
    subcategories: ["Дикая природа", "Домашние", "Комнатные растения", "Сад-Огород"]
  },
  {
    name: "Красота и Здоровье", slug: "beauty-health", svgIcon: "heart",
    subcategories: ["Коронавирус", "Баня, Массаж, Фитнес", "Болезни, Лекарства", "Детское здоровье"]
  },
  {
    name: "Семья, Дом", slug: "family-home", svgIcon: "family",
    subcategories: ["Беременность, Роды", "Воспитание детей", "Домашняя бухгалтерия", "Домоводство"]
  },
  {
    name: "Бизнес, Финансы", slug: "business-finance", svgIcon: "business",
    subcategories: ["Банки и Кредиты", "Недвижимость, Ипотека"]
  },
  {
    name: "Еда, Кулинария", slug: "food-cooking", svgIcon: "food",
    subcategories: ["Вторые блюда", "Десерты, Сладости, Выпечка"]
  },
]

// Склонение
const numWord = (value: number, words: [string, string, string]): string => {
  const abs = Math.abs(value)
  const cases = [2, 0, 1, 1, 1, 2]
  const index = (abs % 100 > 4 && abs % 100 < 20) ? 2 : cases[Math.min(abs % 10, 5)]
  return `${value} ${words[index]}`
}

// Форматирование даты в "X месяцев назад"
const formatTimeAgo = (dateStr: string): string => {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 1) return 'сегодня'
  if (diffDays < 7) return numWord(diffDays, ['день', 'дня', 'дней']) + ' назад'
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return numWord(diffWeeks, ['неделю', 'недели', 'недель']) + ' назад'
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return numWord(diffMonths, ['месяц', 'месяца', 'месяцев']) + ' назад'
  const diffYears = Math.floor(diffDays / 365)
  return numWord(diffYears, ['год', 'года', 'лет']) + ' назад'
}

// Моковые ответы
interface MockAnswer {
  id: number
  author: typeof mockUsers[0]
  content: string
  rating: number
  isBestAnswer: boolean
  createdAt: string
  role: string
  isBlocked?: boolean
  parentId?: number
  hasMedia?: boolean
  mediaLink?: string
}

const mockAnswers: MockAnswer[] = [
  {
    id: 1, author: mockUsers[0],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает! — без лишних слов и сложных формулировок. Мы понимаем, что каждый вопрос заслуживает честного и точного ответа, и именно это мы предоставляем информацию каждый день. Наш сайт — это место, где любой может получить ответы на повседневные вопросы и научиться чему-то новому. В своём стремлении предоставлять контент, мы работаем над каждым словом и предложением, чтобы информация была доступной для каждого.',
    rating: 12, isBestAnswer: true, createdAt: '2 часа назад', role: 'Специалист дегтярного отдела',
  },
  {
    id: 2, author: mockUsers[1],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает! — без лишних слов и сложных формулировок. Мы понимаем, что каждый вопрос заслуживает честного и точного ответа.',
    rating: 8, isBestAnswer: false, createdAt: '3 часа назад', role: 'Специалист дегтярного отдела',
  },
  {
    id: 3, author: mockUsers[2],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает!',
    rating: 5, isBestAnswer: false, createdAt: '5 часов назад', role: 'Специалист дегтярного отдела',
  },
  {
    id: 4, author: mockUsers[3],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает! — без лишних слов и сложных формулировок.',
    rating: 3, isBestAnswer: false, createdAt: '6 часов назад', role: 'Специалист дегтярного отдела',
    isBlocked: true,
  },
  {
    id: 5, author: mockUsers[4],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире.',
    rating: 2, isBestAnswer: false, createdAt: '8 часов назад', role: 'Специалист дегтярного отдела',
    parentId: 2,
  },
  {
    id: 6, author: mockUsers[5],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы и вот вы.',
    rating: 1, isBestAnswer: false, createdAt: '10 часов назад', role: 'Специалист дегтярного отдела',
  },
  {
    id: 7, author: mockUsers[6],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает! — без лишних слов и сложных формулировок. Мы понимаем, что каждый вопрос заслуживает честного и точного ответа, и именно это мы предоставляем информацию каждый день.',
    rating: 7, isBestAnswer: false, createdAt: '12 часов назад', role: 'Специалист дегтярного отдела',
    hasMedia: true, mediaLink: 'www.video-source.com',
  },
]

const rightSidebarQuestions = mockQuestions.slice(0, 5)

export default function QuestionPage() {
  const params = useParams()
  const id = Number(params.id)

  const question = mockQuestions.find(q => q.id === id) ?? mockQuestions[0]
  const bestAnswer = mockAnswers.find(a => a.isBestAnswer)
  const regularAnswers = mockAnswers.filter(a => !a.isBestAnswer)

  const [sortBy, setSortBy] = useState<'rating' | 'date'>('rating')
  const [similarFilter, setSimilarFilter] = useState<'opened' | 'voting' | 'best'>('opened')
  const [openCategories, setOpenCategories] = useState<string[]>([question.category.slug])

  const sortedAnswers = [...regularAnswers].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating
    return 0
  })

  // Разделяем: основные и вложенные
  const topLevelAnswers = sortedAnswers.filter(a => !a.parentId)
  const nestedAnswers = sortedAnswers.filter(a => a.parentId)

  const toggleCategory = (slug: string) => {
    setOpenCategories(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  // Рендер блока ответа
  const renderAnswer = (answer: MockAnswer, isBest = false, isNested = false) => (
    <div
      className={`main_question_block ${isBest ? 'best_answer_block' : ''} ${answer.isBlocked ? 'blocked_question_block' : ''} ${isNested ? 'secondary_question_block' : ''}`}
      key={answer.id}
      style={isNested ? { width: 'calc(100% - 40px)', marginLeft: '40px' } : undefined}
    >
      <div className="question_list_item-info">
        <div className="question_list_item_left">
          <Link href={`/profile/${answer.author.username}`}>
            <img src={answer.author.avatar || "/images/icons/avatar.svg"} alt="" />
          </Link>
          <div>
            <Link href={`/profile/${answer.author.username}`} className="main_text">
              {answer.author.displayName}
            </Link>
            <div className="quest_user_title">
              <p>{answer.role}</p>
            </div>
            <span>{answer.createdAt}</span>
          </div>
          <div className="quest_user_title">
            <p>{answer.role}</p>
          </div>
        </div>
        <div className="question_list_item_right">
          <button className={`s_btn s_btn_icon ${isBest ? 'btn_star_answer_active' : 'btn_star_answer'} btn_star_tooltip`}>
            <svg width="15" height="15">
              <use xlinkHref="#star-best"></use>
            </svg>
            <span className="star_tooltip_text">Выбрать как лучший ответ</span>
          </button>
        </div>
      </div>

      {isBest && (
        <div className="main_question_block_title mobile_only_title">
          <h1>{question.title}</h1>
        </div>
      )}

      <div className="main_question_block_text">
        <p>{answer.content}</p>
        {answer.hasMedia && (
          <>
            <a href="#" className="answer_link_url">
              <svg width="13" height="13">
                <use xlinkHref="#answer-link"></use>
              </svg>
              {answer.mediaLink}
            </a>
            <div className="answer_media" style={{ marginTop: '15px' }}>
              <div className="answer_media_item">
                <div className="answer_media_play">
                  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="30" fill="#ffffff" />
                  <path d="M42 30L24 40.5V19.5L42 30Z" fill="#646BFF" />
                  </svg>
                </div>
              </div>
              <div className="answer_media_item">
                <div className="answer_media_play">
                  <svg width="62" height="56" viewBox="0 0 62 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.9251 44.5365C11.8456 44.5365 8.21682 41.9279 6.89914 38.0444L6.81002 37.7517C6.49926 36.7233 6.36908 35.8584 6.36908 34.993V17.6414L0.187084 38.2503C-0.608003 41.2816 1.20381 44.4242 4.24371 45.2616L43.6477 55.8004C44.1395 55.9277 44.6313 55.9887 45.1156 55.9887C47.6535 55.9887 49.9725 54.3065 50.6224 51.8274L52.9181 44.5365H15.9251Z" fill="white"/>
                    <path d="M22.9329 17.8148C25.7437 17.8148 28.0292 15.5319 28.0292 12.7248C28.0292 9.91766 25.7437 7.63478 22.9329 7.63478C20.1221 7.63478 17.8363 9.91766 17.8363 12.7248C17.8363 15.5319 20.1221 17.8148 22.9329 17.8148Z" fill="white"/>
                    <path d="M54.7859 0H16.562C13.0508 0 10.1915 2.85559 10.1915 6.36263V34.3565C10.1915 37.8635 13.0508 40.7191 16.562 40.7191H54.7859C58.2976 40.7191 61.1569 37.8635 61.1569 34.3565V6.36263C61.1569 2.85559 58.2976 0 54.7859 0ZM16.562 5.09001H54.7859C55.4896 5.09001 56.0602 5.65991 56.0602 6.36263V24.4291L48.0104 15.0482C47.1565 14.0482 45.9205 13.5137 44.593 13.4834C43.273 13.4909 42.0346 14.0762 41.1887 15.0892L31.7242 26.4342L28.6409 23.3624C26.8981 21.6219 24.0616 21.6219 22.3212 23.3624L15.2882 30.3839V6.36263C15.2882 5.65991 15.8588 5.09001 16.562 5.09001Z" fill="white"/>
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="main_question_block_actions">
        <div className="main_question_block_actions_left">
          <button className="s_btn s_btn_active s_btn--answer">
            Ответить
          </button>
          <button className="s_btn s_btn_icon btn_thumb_up" title="Мне нравится">
            <svg width="15" height="13">
              <use xlinkHref="#thumb-up"></use>
            </svg>
          </button>
          <p>
            <span className="likes_count">{answer.rating}</span><span className="likes_word"> нравится</span>
          </p>
        </div>
        <div className="main_question_block_actions_right">
          <button className="s_btn s_btn_icon btn_action_outline" title="Пожаловаться">
            Пожаловаться
          </button>
          <button className="s_btn s_btn_icon btn_action_outline" title="Мне нравится">
            <svg width="14" height="12">
              <use xlinkHref="#like"></use>
            </svg>
          </button>
          <button className="s_btn s_btn_icon btn_action_outline" title="Поделиться">
            <svg width="14" height="14">
              <use xlinkHref="#share"></use>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Header />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">Главная</Link>
          <span className="breadcrumbs__sep">•</span>
          <Link href="/categories" className="breadcrumbs__link">Категории вопросов</Link>
          <span className="breadcrumbs__sep">•</span>
          <Link href={`/categories/${question.category.slug}`} className="breadcrumbs__link">
            {question.category.name}
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">{question.title}</span>
        </div>
      </div>

      <div className="question_wrapper container">
        {/* Левый сайдбар */}
        <div className="question_left_list">
          <div className="quest_catogories_list">
            <div className="blocks_title">
              <h2>Категории</h2>
            </div>
            {sidebarCategories.map(cat => (
              <div
                className={`quest_catogory ${openCategories.includes(cat.slug) ? 'active_quest_catogory' : ''}`}
                key={cat.slug}
              >
                <div className="quest_catogory_title" onClick={() => toggleCategory(cat.slug)}>
                  <div>
                    <svg width="18" height="18">
                      <use xlinkHref={`#${cat.svgIcon}`}></use>
                    </svg>
                    <p>{cat.name}</p>
                  </div>
                  <svg className="quest_catogory_arrow" width="9" height="6" style={{ fill: 'rgb(91, 103, 255)' }}>
                    <use xlinkHref="#arrow-down"></use>
                  </svg>
                </div>
                <div className="quest_catogory_content">
                  <div className="subject_item_list">
                    {cat.subcategories.map((subcat, idx) => (
                      <Link href={`/categories/${cat.slug}/${encodeURIComponent(subcat.toLowerCase())}`} key={idx}>
                        <div className="subject_item_list_item">
                          <img src="/images/icons/category-list-item.svg" alt="" />
                          <p>{subcat}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Лидеры проекта */}
          <div className="question_leaders">
            <div className="blocks_title">
              <h2>Лидеры проекта</h2>
            </div>
            {mockUsers.slice(0, 5).map(user => (
              <Link href={`/profile/${user.username}`} key={user.id}>
                <div className="question_list_item">
                  <div className="question_list_item_left">
                    <img src={user.avatar || "/images/icons/avatar.svg"} alt="" />
                    <div>
                      <p className="main_text">{user.displayName}</p>
                      <span>Legen {numWord(user.rating, ["балл", "балла", "баллов"])}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Самые активные авторы */}
          <div className="question_leaders">
            <div className="blocks_title">
              <h2>Самые активные авторы</h2>
            </div>
            {mockUsers.slice(3, 8).map(user => (
              <Link href={`/profile/${user.username}`} key={user.id}>
                <div className="question_list_item">
                  <div className="question_list_item_left">
                    <img src={user.avatar || "/images/icons/avatar.svg"} alt="" />
                    <div>
                      <p className="main_text">{user.displayName}</p>
                      <span>Legen {numWord(user.rating, ["балл", "балла", "баллов"])}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Основной контент */}
        <div className="questions_page_list">
          <div className="blocks_title questions_page_list_title">
            <h2>Ваш вопрос</h2>
          </div>

          {/* Блок вопроса */}
          <div className="main_question_block main_question_block_item">
            <div className="main_question_bg_wrapper">
              <div className="main_question_block_top_bg">
              <img src="/images/top-leader-bg.svg" className="top_bg_light" alt="" />
              <img src="/images/top-leader-bg-d.svg" className="top_bg_dark" alt="" />
              <img src="/images/blues-rect.svg" className="top_bg_rect top_bg_rect_light" alt="" />
              <img src="/images/blues-rect-dark.svg" className="top_bg_rect top_bg_rect_dark" alt="" />
            </div>
            </div>
            <div className="question_list_item-info">
              <div className="question_list_item_left">
                <Link href={`/profile/${question.author.username}`}>
                  <img src={question.author.avatar || "/images/icons/avatar.svg"} alt="" />
                </Link>
                <div>
                  <Link href={`/profile/${question.author.username}`} className="main_text">
                    {question.author.displayName}
                  </Link>
                  <div className="quest_user_title">
                    <span>Гуру</span>
                  </div>
                  <span>Решено 2 часа назад</span>
                </div>
                <div className="quest_user_title">
                  <span>Гуру</span>
                </div>
              </div>
              <div className="question_list_item_right">
                <button className="s_btn s_btn_icon btn_star_answer btn_star_tooltip">
                  <svg width="15" height="15">
                    <use xlinkHref="#star-best"></use>
                  </svg>
                  <span className="star_tooltip_text">Выбрать как лучший ответ</span>
                </button>
              </div>
            </div>
            <div className="main_question_block_title">
              <h2>{question.title}</h2>
            </div>
            <div className="leader_quest question_leader_badge">
              <svg width="12" height="12">
                <use xlinkHref="#trophy"></use>
              </svg>
              <p>Вопрос лидер</p>
            </div>
            <div className="main_question_block_text">
              <p>{question.content}</p>
            </div>

            <div className="main_question_block_actions">
              <div className="main_question_block_actions_left">
                <button className="s_btn s_btn_active answer_to_main_btn">
                  Дать ответ
                </button>
                <button className="s_btn s_btn_icon btn_thumb_up" title="Мне нравится">
                  <svg width="15" height="15">
                    <use xlinkHref="#thumb-up"></use>
                  </svg>
                </button>
                <p>
                  <span className="likes_count">{question.rating}</span><span className="likes_word"> нравится</span>
                </p>
              </div>
              <div className="main_question_block_actions_right">
                <button className="s_btn s_btn_icon btn_action_outline" title="Пожаловаться">
                  Пожаловаться
                </button>
                <button className="s_btn s_btn_icon btn_action_outline" title="Мне нравится">
                  <svg width="14" height="12">
                    <use xlinkHref="#like"></use>
                  </svg>
                </button>
                <button className="s_btn s_btn_icon btn_action_outline" title="Поделиться">
                  <svg width="14" height="14">
                    <use xlinkHref="#share"></use>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Лучший ответ */}
          {bestAnswer && (
            <div className="best-comments" style={{ display: 'block' }}>
              <div className="blocks_title mt_25px">
                <h2>Лучший ответ</h2>
              </div>
              {renderAnswer(bestAnswer, true)}
            </div>
          )}

          {/* Посмотрите все ответы */}
          <div className="blocks_title mt_25px all-questions">
            <div className="blocks_title-inner">
              <h2>Посмотрите все ответы</h2>
            <span className="answers_count_badge">+{regularAnswers.length}</span>
            </div>
            <div className="questions_filter">
              <button
                className={`s_btn ${sortBy === 'rating' ? 's_btn_active' : ''}`}
                onClick={() => setSortBy('rating')}
              >
                <span>По рейтингу</span>
              </button>
              <button
                className={`s_btn ${sortBy === 'date' ? 's_btn_active' : ''}`}
                onClick={() => setSortBy('date')}
              >
                <span>По дате</span>
              </button>
            </div>
          </div>

          {/* Список ответов */}
          {topLevelAnswers.map(answer => (
            <div key={answer.id}>
              {renderAnswer(answer)}
              {nestedAnswers
                .filter(na => na.parentId === answer.id)
                .map(nested => renderAnswer(nested, false, true))}
            </div>
          ))}

          {/* Ответить на вопрос */}
          <div className="blocks_title mt_25px comments-form__title">
            <h2>Ответить на вопрос</h2>
          </div>

          <form className="ask_question_form form" onSubmit={(e) => e.preventDefault()}>
            <div className="ask_form_item ask_form_item_block_actions">
              <textarea name="message" placeholder="Введите текст ответа" required></textarea>
              <div className="ask_form_item_actions">
                <div>
                  <svg width="15.67" height="13.71">
                    <use xlinkHref="#add-file"></use>
                  </svg>
                  <p><span>Добавить файл</span><span>Файл</span></p>
                </div>
                <div>
                  <svg width="13.71" height="12.73">
                    <use xlinkHref="#add-video"></use>
                  </svg>
                  <p><span>Добавить видео</span><span>Видео</span></p>
                </div>
                <div>
                  <svg width="12.73" height="12.73">
                    <use xlinkHref="#add-link"></use>
                  </svg>
                  <p><span>Добавить ссылку</span><span>Ссылка</span></p>
                </div>
              </div>
            </div>
            <div className="ask_from_send_btn" style={{ marginTop: '15px' }}>
              <button type="submit" className="m_btn category_btn">Ответить</button>
              <p>
                Нажимая на кнопку, вы принимаете условия <br />
                <a href="/privacy">пользовательского соглашения</a>
              </p>
            </div>
          </form>
        </div>

        {/* Правый сайдбар */}
        <div className="question_right_list">
          <div className="blocks_title">
            <h2>Вопросы лидеры</h2>
          </div>
          {rightSidebarQuestions.map(q => (
            <Link href={`/question/${q.id}`} key={q.id}>
              <div className="question_list_item question_leader_card" style={{ cursor: 'pointer' }}>
                <div className="question_list_item_left">
                  <img src={q.author.avatar || "/images/icons/avatar.svg"} alt="" />
                  <div>
                    <p className="main_text">{q.author.displayName}</p>
                    <span>{formatTimeAgo(q.createdAt)}</span>
                  </div>
                </div>
                <div className="question_text">
                  <p>{q.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Не нашли то, что искали? */}
      <div className="container">
        <div className="ask_question">
          <p>Не нашли то, что искали?</p>
          <Link href="/ask" className="ask_question__button">
            Задайте свой вопрос
          </Link>
        </div>
      </div>

      {/* Похожие вопросы участников */}
      <div className="similar_questions_block container">
        <div className="blocks_title">
          <h2>Похожие вопросы участников</h2>
          <div className="questions_filter">
            <button
              className={`s_btn ${similarFilter === 'opened' ? 's_btn_active' : ''}`}
              onClick={() => setSimilarFilter('opened')}
            >Открытые</button>
            <button
              className={`s_btn ${similarFilter === 'voting' ? 's_btn_active' : ''}`}
              onClick={() => setSimilarFilter('voting')}
            >На голосовании</button>
            <button
              className={`s_btn ${similarFilter === 'best' ? 's_btn_active' : ''}`}
              onClick={() => setSimilarFilter('best')}
            >Лучшие</button>
          </div>
        </div>

        {mockQuestions.map(q => (
          <div className="question_list_item" key={q.id}>
            <div className="question_item_top_data">
              <div className="question_item_top_data_left">
                <img src={q.author.avatar || "/images/icons/avatar.svg"} alt={q.author.displayName} />
                <div>
                  <p className="main_text">{q.author.displayName}</p>
                  <span>{numWord(q.author.rating, ["балл", "балла", "баллов"])}</span>
                </div>
              </div>
              <div className="question_item_top_data_right">
                <button title="Мне нравится" className="s_btn s_btn_icon btn-like">
                  <svg width="13.71" height="12">
                    <use xlinkHref="#like"></use>
                  </svg>
                </button>
                <button className="s_btn s_btn_icon share-this" title="Поделиться">
                  <svg width="14" height="14">
                    <use xlinkHref="#share"></use>
                  </svg>
                </button>
              </div>
            </div>
            <Link href={`/question/${q.id}`}>
              <div className="question_list_item_left">
                <img src={q.author.avatar || "/images/icons/avatar.svg"} alt={q.author.displayName} />
                <div>
                  <p className="main_text">{q.title}</p>
                  <span>{formatTimeAgo(q.createdAt)}</span>
                </div>
              </div>
            </Link>
            <div className="question_list_item_right">
              <div className="question_list_item_users">
                <img src="/images/icons/avatar.svg" alt="" />
                <img src="/images/icons/avatar.svg" alt="" />
                <img src="/images/icons/avatar.svg" alt="" />
                <p className="main_text">+{q.commentsCount}</p>
              </div>
              <div className="question_list_item_right_actions">
                <button title="Мне нравится" className="s_btn s_btn_icon btn-like">
                  <svg width="13.71" height="12">
                    <use xlinkHref="#like"></use>
                  </svg>
                </button>
                <button className="s_btn s_btn_icon share-this" title="Поделиться">
                  <svg width="14" height="14">
                    <use xlinkHref="#share"></use>
                  </svg>
                </button>
                <Link className="s_btn" href={`/question/${q.id}`}>Посмотреть</Link>
                <Link className="s_btn s_btn_active" href={`/question/${q.id}#answer`}>Ответить</Link>
              </div>
            </div>
          </div>
        ))}

        <div className="show_more_btn_wrapper" style={{ display: 'flex', justifyContent: 'center'}}>
          <button className="show_more_btn" type="button">
            <svg width="22" height="22">
              <use xlinkHref="#sync"></use>
            </svg>
            <span>Загрузить еще</span>
          </button>
        </div>
      </div>

      <Footer />
    </>
  )
}
