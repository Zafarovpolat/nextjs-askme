'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { mockQuestions } from "@/data/mock-questions"
import { mockUsers } from "@/data/mock-users"
import { mockCategories } from "@/data/mock-categories"

// Категории для сайдбара
const sidebarCategories = [
  {
    name: "Авто, Мото", slug: "auto-moto", svgIcon: "steering-wheel",
    subcategories: ["Автоспорт", "Автострахование", "Выбор автомобиля, мотоцикла", "ГИБДД, Обучение, Права"]
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

// Склонение слова "балл"
const numWord = (value: number, words: [string, string, string]): string => {
  const abs = Math.abs(value)
  const cases = [2, 0, 1, 1, 1, 2]
  const index = (abs % 100 > 4 && abs % 100 < 20) ? 2 : cases[Math.min(abs % 10, 5)]
  return `${value} ${words[index]}`
}

// Моковые ответы
const mockAnswers = [
  {
    id: 1,
    author: mockUsers[0],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает! — без лишних слов и сложных формулировок. Мы понимаем, что каждый вопрос заслуживает честного и точного ответа, и именно это мы предоставляем информацию каждый день. Наш сайт — это место, где любой может получить ответы на повседневные вопросы и научиться чему-то новому.',
    rating: 12,
    isBestAnswer: true,
    createdAt: '2 часа назад',
    role: 'Специалист дегтярного отдела',
  },
  {
    id: 2,
    author: mockUsers[1],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает! — без лишних слов и сложных формулировок. Мы понимаем, что каждый вопрос заслуживает честного и точного ответа.',
    rating: 8,
    isBestAnswer: false,
    createdAt: '3 часа назад',
    role: 'Специалист дегтярного отдела',
  },
  {
    id: 3,
    author: mockUsers[2],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает!',
    rating: 5,
    isBestAnswer: false,
    createdAt: '5 часов назад',
    role: 'Специалист дегтярного отдела',
  },
  {
    id: 4,
    author: mockUsers[3],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает! — без лишних слов и сложных формулировок.',
    rating: 3,
    isBestAnswer: false,
    createdAt: '6 часов назад',
    role: 'Специалист дегтярного отдела',
  },
  {
    id: 5,
    author: mockUsers[4],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире.',
    rating: 2,
    isBestAnswer: false,
    createdAt: '8 часов назад',
    role: 'Специалист дегтярного отдела',
  },
  {
    id: 6,
    author: mockUsers[5],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы и вот вы.',
    rating: 1,
    isBestAnswer: false,
    createdAt: '10 часов назад',
    role: 'Специалист дегтярного отдела',
  },
  {
    id: 7,
    author: mockUsers[6],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает! — без лишних слов и сложных формулировок. Мы понимаем, что каждый вопрос заслуживает честного и точного ответа, и именно это мы предоставляем информацию каждый день.',
    rating: 7,
    isBestAnswer: false,
    createdAt: '12 часов назад',
    role: 'Специалист дегтярного отдела',
    hasMedia: true,
  },
]

// Вопросы для правого сайдбара
const rightSidebarQuestions = mockQuestions.slice(0, 5)

export default function QuestionPage() {
  const params = useParams()
  const id = Number(params.id)

  const question = mockQuestions.find(q => q.id === id) ?? mockQuestions[0]
  const bestAnswer = mockAnswers.find(a => a.isBestAnswer)
  const regularAnswers = mockAnswers.filter(a => !a.isBestAnswer)

  const [sortBy, setSortBy] = useState<'rating' | 'date'>('rating')
  const [openCategories, setOpenCategories] = useState<string[]>([question.category.slug])

  const sortedAnswers = [...regularAnswers].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating
    return 0
  })

  const toggleCategory = (slug: string) => {
    setOpenCategories(prev =>
      prev.includes(slug)
        ? prev.filter(s => s !== slug)
        : [...prev, slug]
    )
  }

  // Рендер блока ответа
  const renderAnswer = (answer: typeof mockAnswers[0], isBest = false) => (
    <div
      className={`main_question_block ${isBest ? 'best_answer_block' : ''}`}
      key={answer.id}
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
      </div>

      <div className="main_question_block_text">
        <p>{answer.content}</p>
        {answer.hasMedia && (
          <div className="answer_media" style={{ marginTop: '15px' }}>
            <img src="/images/placeholder-video.jpg" alt="" style={{ borderRadius: '12px', width: '100%', maxWidth: '500px', aspectRatio: '16/9', objectFit: 'cover', background: '#e7e9f6' }} />
          </div>
        )}
      </div>

      <div className="main_question_block_actions">
        <div className="main_question_block_actions_left">
          {!isBest && (
            <button className="s_btn s_btn_active s_btn--answer">
              Комментировать
            </button>
          )}
          <button className="s_btn s_btn_icon btn-like" title="Мне нравится">
            <svg width="15" height="13">
              <use xlinkHref="#like"></use>
            </svg>
          </button>
          <p>
            <span className="likes_count">{answer.rating}</span> нравится
          </p>
        </div>
        <div className="main_question_block_actions_right">
          <button className="s_btn s_btn_icon" title="Поделиться">
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
        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">Главная</Link>
          <span className="breadcrumbs__sep">•</span>
          <Link href="/categories" className="breadcrumbs__link">Категории</Link>
          <span className="breadcrumbs__sep">•</span>
          <Link href={`/categories/${question.category.slug}`} className="breadcrumbs__link">
            {question.category.name}
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">{question.title}</span>
        </div>
      </div>

      {/* 3-колоночная раскладка */}
      <div className="question_wrapper container">
        {/* Левый сайдбар */}
        <div className="question_left_list">
          {/* Категории */}
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
                  <div>
                    {cat.subcategories.map((subcat, idx) => (
                      <Link
                        href={`/categories/${cat.slug}/${encodeURIComponent(subcat.toLowerCase())}`}
                        key={idx}
                      >
                        <div className="leader_quest">
                          <p>• {subcat}</p>
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
                <div className="leader_quest">
                  <img src={user.avatar || "/images/icons/avatar.svg"} alt="" width="24" height="24" style={{ borderRadius: '50%' }} />
                  <p>{user.displayName}</p>
                </div>
                <div className="leader_quest" style={{ marginTop: '-10px', marginLeft: '30px' }}>
                  <p style={{ fontSize: '11px', color: '#8B94A1' }}>
                    Legen {numWord(user.rating, ["балл", "балла", "баллов"])}
                  </p>
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
                <div className="leader_quest">
                  <img src={user.avatar || "/images/icons/avatar.svg"} alt="" width="24" height="24" style={{ borderRadius: '50%' }} />
                  <p>{user.displayName}</p>
                </div>
                <div className="leader_quest" style={{ marginTop: '-10px', marginLeft: '30px' }}>
                  <p style={{ fontSize: '11px', color: '#8B94A1' }}>
                    Legen {numWord(user.rating, ["балл", "балла", "баллов"])}
                  </p>
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
            <div className="question_list_item_left">
              <Link href={`/profile/${question.author.username}`}>
                <img src={question.author.avatar || "/images/icons/avatar.svg"} alt="" />
              </Link>
              <div>
                <Link href={`/profile/${question.author.username}`} className="main_text">
                  {question.author.displayName}
                </Link>
                <div className="quest_user_title">
                  <span>
                    {numWord(question.author.rating, ["балл", "балла", "баллов"])}
                  </span>
                </div>
                <span>2 часа назад</span>
              </div>
              <div className="quest_user_title">
                <span>
                  {numWord(question.author.rating, ["балл", "балла", "баллов"])}
                </span>
              </div>
            </div>
            <div className="main_question_block_title">
              <h2>{question.title}</h2>
            </div>
            <div className="main_question_block_text">
              <p>{question.content}</p>
            </div>

            <div className="main_question_block_actions">
              <div className="main_question_block_actions_left">
                <button className="s_btn s_btn_active answer_to_main_btn">
                  Ответить
                </button>
                <button className="s_btn s_btn_icon btn-like" title="Мне нравится">
                  <svg width="13.714" height="12">
                    <use xlinkHref="#like"></use>
                  </svg>
                </button>
                <p>
                  <span className="likes_count">{question.rating}</span> нравится
                </p>
              </div>
              <div className="main_question_block_actions_right">
                <button className="s_btn s_btn_icon" title="Поделиться">
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
          <div className="blocks_title mt_25px">
            <h2>Посмотрите все ответы</h2>
            <div className="questions_filter">
              <button
                className={`s_btn ${sortBy === 'rating' ? 's_btn_active' : ''}`}
                onClick={() => setSortBy('rating')}
              >
                <svg className="s_btn__icon" width="9" height="6">
                  <use xlinkHref="#arrow-down"></use>
                </svg>
                <span>По рейтингу</span>
              </button>
              <button
                className={`s_btn ${sortBy === 'date' ? 's_btn_active' : ''}`}
                onClick={() => setSortBy('date')}
              >
                <svg className="s_btn__icon" width="9" height="6">
                  <use xlinkHref="#arrow-down"></use>
                </svg>
                <span>По дате</span>
              </button>
            </div>
          </div>

          {/* Список ответов */}
          {sortedAnswers.map(answer => renderAnswer(answer))}

          {/* Ответить на вопрос */}
          <div className="blocks_title mt_25px comments-form__title">
            <h2>Ответить на вопрос</h2>
          </div>

          <form className="ask_question_form form" onSubmit={(e) => e.preventDefault()}>
            <div className="ask_form_item ask_form_item_block_actions">
              <textarea placeholder="Введите текст ответа" required></textarea>
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
              <div className="question_list_item" style={{ cursor: 'pointer' }}>
                <div className="question_list_item_left">
                  <img src={q.author.avatar || "/images/icons/avatar.svg"} alt="" />
                  <div>
                    <p className="main_text">{q.author.displayName}</p>
                    <span>{numWord(q.author.rating, ["балл", "балла", "баллов"])}</span>
                  </div>
                </div>
                <div className="question_text">
                  <p>{q.title}</p>
                </div>
                <div className="question_list_item_right">
                  <div className="question_list_item_users">
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <p className="main_text">+{q.commentsCount}</p>
                  </div>
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
      <div className="container" style={{ paddingBottom: '20px' }}>
        <div className="blocks_title">
          <h2>Похожие вопросы участников</h2>
          <div className="questions_filter">
            <button className="s_btn s_btn_active">Открытые</button>
            <button className="s_btn">На голосовании</button>
            <button className="s_btn">Лучшие</button>
          </div>
        </div>

        {mockQuestions.map(q => (
          <Link href={`/question/${q.id}`} key={q.id}>
            <div className="question_list_item">
              <div className="question_list_item_left">
                <img src={q.author.avatar || "/images/icons/avatar.svg"} alt="" />
                <div>
                  <p className="main_text">{q.author.displayName}</p>
                  <span>{numWord(q.author.rating, ["балл", "балла", "баллов"])}</span>
                </div>
              </div>
              <div className="question_text">
                <p>{q.title}</p>
              </div>
              <div className="question_list_item_right">
                <div className="question_list_item_rating">
                  <p className="rating_number">{q.rating / 10}</p>
                </div>
                <div className="question_list_item_users">
                  <img src="/images/icons/avatar.svg" alt="" />
                  <img src="/images/icons/avatar.svg" alt="" />
                  <img src="/images/icons/avatar.svg" alt="" />
                  <p className="main_text">+{q.commentsCount}</p>
                </div>
                <button className="s_btn">Посмотреть</button>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Footer />
    </>
  )
}
