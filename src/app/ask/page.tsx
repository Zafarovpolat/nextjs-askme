'use client'

import { useState, useRef, useCallback } from 'react'
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { mockQuestions } from "@/data/mock-questions"
import { mockUsers } from "@/data/mock-users"
import LoginModal from "@/components/LoginModal"
import QuestionModal from "@/components/QuestionModal"
import SharePopup from "@/components/SharePopup"

// Категории для селектов
const categories = [
  { slug: "auto-moto", name: "Авто, Мото", subcategories: ["Автоспорт", "Автострахование", "Выбор автомобиля, мотоцикла", "ГИБДД, Обучение, Права", "ПДД, Вождение", "Сервис, Обслуживание, Тюнинг"] },
  { slug: "entertainment", name: "Развлечения", subcategories: ["Игры без компьютера", "Клубы, Дискотеки", "Концерты, Выставки, Спектакли", "Охота и Рыбалка"] },
  { slug: "plants", name: "Растения", subcategories: ["Дикая природа", "Домашние", "Комнатные растения", "Сад-Огород"] },
  { slug: "beauty-health", name: "Красота и Здоровье", subcategories: ["Баня, Массаж, Фитнес", "Болезни, Лекарства", "Врачи, Клиники, Страхование", "Здоровый образ жизни"] },
  { slug: "family-home", name: "Семья, Дом", subcategories: ["Беременность, Роды", "Воспитание детей", "Домашняя бухгалтерия", "Домоводство"] },
  { slug: "business-finance", name: "Бизнес, Финансы", subcategories: ["Банки и Кредиты", "Бухгалтерия, Аудит, Налоги", "Недвижимость, Ипотека", "Собственный бизнес"] },
  { slug: "food-cooking", name: "Еда, Кулинария", subcategories: ["Вторые блюда", "Десерты, Сладости, Выпечка", "Закуски и Салаты", "Консервирование"] },
  { slug: "sport", name: "Спорт", subcategories: ["Теннис", "Футбол", "Хоккей", "Зимние виды спорта"] },
  { slug: "homework", name: "Домашние задания", subcategories: ["Математика", "Алгебра", "Геометрия", "Иностранные языки"] },
  { slug: "programming", name: "Программирование", subcategories: ["Android", "C/C++", "Python", "Веб-дизайн"] },
]

const tabs = ["Открытые", "На голосовании", "Лучшие", "Решения"]

export default function AskPage() {
  const [activeTab, setActiveTab] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareData, setShareData] = useState({ title: '', url: '' })
  const shareButtonRef = useRef<HTMLButtonElement | null>(null)

  // Подкатегории для выбранной категории
  const currentCategory = categories.find(c => c.slug === selectedCategory)
  const subcategoryOptions = currentCategory?.subcategories ?? []

  const handleShareClick = useCallback((e: React.MouseEvent<HTMLButtonElement>, title: string, questionSlug: string) => {
    const btn = e.currentTarget
    shareButtonRef.current = btn
    setShareData({ title, url: `/question/${questionSlug}` })
    setIsShareOpen(true)
  }, [])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setSelectedSubcategory("")
  }

  const similarQuestions = mockQuestions.slice(0, 6)
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

        {/* Блок формы задать вопрос */}
        <div className="section ask_form_wrapper">
          <div className="blocks_title">
            <h2>Напишите свой вопрос здесь</h2>
          </div>

          <form className="ask_form form" onSubmit={(e) => e.preventDefault()}>
            {/* Тема вопроса */}
            <div className="ask_form_item">
              <input name="title" type="text" placeholder="Тема вопроса" required />
            </div>

            {/* Textarea с действиями */}
            <div className="ask_form_item ask_form_item_block_actions">
              <textarea name="message" placeholder="Как можно подробнее опишите свой вопрос" required></textarea>
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

            {/* Селекты категорий */}
            <div className="select_category_filters">
              <div className="select_category_item">
                <div className="select_category_item_inner">
                  <svg width="18" height="18" className="select_category_icon">
                    <use xlinkHref="#grid-icon"></use>
                  </svg>
                  <select
                    className="super-select"
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option value="">Выберите категорию вопроса</option>
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="select_category_item">
                <div className="select_category_item_inner">
                  <svg width="18" height="18" className="select_category_icon">
                    <use xlinkHref="#list-icon"></use>
                  </svg>
                  <select
                    className="super-select"
                    value={selectedSubcategory}
                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                    disabled={!selectedCategory}
                  >
                    <option value="">Выберите подкатегорию вопроса</option>
                    {subcategoryOptions.map((subcat) => (
                      <option key={subcat} value={subcat}>{subcat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Действия формы */}
            <div className="asf_form_actions">
              <div className="ask_from_send_btn">
                <button type="submit" className="m_btn category_btn">
                  Опубликовать вопрос
                </button>
                <p>
                  Нажимая на кнопку, вы принимаете условия{' '}
                  <a href="/user-agreement/" target="_blank">пользовательского соглашения</a>
                </p>
              </div>
              <div className="ask_form_checkboxes">
                <label className="chechbox_item">
                  <input type="checkbox" defaultChecked />
                  <span>Получать уведомления (ответы, голоса, комментарии)</span>
                </label>
                <label className="chechbox_item">
                  <input type="checkbox" defaultChecked />
                  <span>Разрешить комментарии к ответам</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="line"></div>

        {/* Похожие вопросы участников */}
        <div className="section populars_block">
          <div className="blocks_title">
            <h2>Похожие вопросы участников</h2>

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

          {/* Список вопросов */}
          <div className="questions_list">
            {similarQuestions.map((question) => (
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
