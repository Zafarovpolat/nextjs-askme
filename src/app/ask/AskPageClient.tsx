'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import LoginModal from "@/components/LoginModal"
import QuestionModal from "@/components/QuestionModal"
import SharePopup from "@/components/SharePopup"
import CustomSelect from "@/components/CustomSelect"
import { api } from "@/lib/api-client"
import { useAuthStore } from "@/store/authStore"

type Subcategory = { id: number; name: string; slug: string; icon_key: string | null }
type CategoryItem = { id: number; name: string; slug: string; icon_key: string | null; subcategories: Subcategory[] }
type QuestionListItem = { id: number; title: string; likes_count: number; latest_likers: { id: number; avatar_url: string }[] }
type ProjectLeader = { id: number; first_name: string; last_name: string; avatar_url: string; balls: number }
type MostDiscussedItem = { id: number; title: string; likes_count: number; latest_likers: { avatar_url: string }[] }
type PopularTopic = { id: number; name: string; slug: string; parent_slug: string | null; total_likes: number; latest_likers: { avatar_url: string }[] }

export type AskPageInitialData = {
  questions: QuestionListItem[]
  project_leaders: ProjectLeader[]
  most_discussed: MostDiscussedItem[]
  popular_topics: PopularTopic[]
  categories: CategoryItem[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

const FILTERS = [
  { label: 'Все', value: 'all' as const },
  { label: 'Открытые', value: 'open' as const },
  { label: 'На голосовании', value: 'voting' as const },
  { label: 'Решения', value: 'solved' as const },
]

export default function AskPageClient({ initialData }: { initialData: AskPageInitialData }) {
  const router = useRouter()
  const isAuthorized = useAuthStore((s) => s.isAuthorized)
  const categories = initialData.categories ?? []
  const [activeFilter, setActiveFilter] = useState(0)
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("")
  const [questions, setQuestions] = useState<QuestionListItem[]>(initialData.questions)
  const [currentPage, setCurrentPage] = useState(initialData.current_page)
  const [lastPage, setLastPage] = useState(initialData.last_page)
  const [loadingMore, setLoadingMore] = useState(false)
  const [loadingFilter, setLoadingFilter] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareData, setShareData] = useState({ title: '', url: '' })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const shareButtonRef = useRef<HTMLButtonElement | null>(null)

  const currentCategory = categories.find((c) => String(c.id) === selectedCategoryId)
  const subcategoryOptions = currentCategory?.subcategories ?? []

  const handleShareClick = useCallback((e: React.MouseEvent<HTMLButtonElement>, title: string, questionId: number) => {
    shareButtonRef.current = e.currentTarget
    setShareData({ title, url: `/question/${questionId}` })
    setIsShareOpen(true)
  }, [])

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value)
    setSelectedSubcategoryId("")
  }

  const handleFilterChange = async (index: number) => {
    if (index === activeFilter) return
    setActiveFilter(index)
    setLoadingFilter(true)
    try {
      const filter = FILTERS[index].value
      const data = await api.get<{ questions: QuestionListItem[]; current_page: number; last_page: number }>(
        `v1/questions?page=1&per_page=15&filter=${filter}`
      )
      setQuestions(data.questions)
      setCurrentPage(data.current_page)
      setLastPage(data.last_page)
    } finally {
      setLoadingFilter(false)
    }
  }

  const handleLoadMore = async () => {
    if (currentPage >= lastPage || loadingMore) return
    setLoadingMore(true)
    try {
      const filter = FILTERS[activeFilter].value
      const nextPage = currentPage + 1
      const data = await api.get<{ questions: QuestionListItem[]; current_page: number; last_page: number }>(
        `v1/questions?page=${nextPage}&per_page=15&filter=${filter}`
      )
      setQuestions((prev) => [...prev, ...data.questions])
      setCurrentPage(data.current_page)
      setLastPage(data.last_page)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)
    if (!isAuthorized) {
      setIsLoginModalOpen(true)
      return
    }
    const form = e.currentTarget
    const fd = new FormData(form)
    const title = (fd.get("title") as string)?.trim()
    const description = (fd.get("message") as string)?.trim()
    const receive_notifications = (fd.get("receive_notifications") as string) === "on"
    const allow_answer_comments = (fd.get("allow_answer_comments") as string) === "on"
    if (!title || !description) {
      setSubmitError("Заполните тему и текст вопроса.")
      return
    }
    const category_id = selectedCategoryId ? Number(selectedCategoryId) : 0
    const subcategory_id = selectedSubcategoryId ? Number(selectedSubcategoryId) : 0
    if (!category_id || !subcategory_id) {
      setSubmitError("Выберите категорию и подкатегорию.")
      return
    }
    setSubmitting(true)
    try {
      const data = await api.post<{ question: { id: number } }>("v1/questions", {
        title,
        description,
        category_id,
        subcategory_id,
        receive_notifications,
        allow_answer_comments,
      })
      router.push(`/question/${data.question.id}`)
    } catch (err: unknown) {
      const ex = err as Error & { errors?: Record<string, string[]> }
      const msg = ex.errors?.title?.[0] ?? ex.errors?.category_id?.[0] ?? ex.errors?.subcategory_id?.[0] ?? ex.message ?? "Ошибка при создании вопроса"
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const hasMore = currentPage < lastPage

  return (
    <>
      <Header />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">Главная</Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">Категории вопросов</span>
        </div>

        <div className="section ask_form_wrapper">
          <div className="blocks_title">
            <h1>Напишите свой вопрос здесь</h1>
          </div>

          <form className="ask_form form" onSubmit={handleSubmit}>
            {submitError && (
              <p className="secondary_text" style={{ color: "#c00", marginBottom: 12 }}>{submitError}</p>
            )}
            <div className="ask_form_item">
              <input name="title" type="text" placeholder="Тема вопроса" required />
            </div>
            <div className="ask_form_item ask_form_item_block_actions">
              <textarea name="message" placeholder="Как можно подробнее опишите свой вопрос" required />
              <div className="ask_form_item_actions">
                <div><svg width="15.67" height="13.71"><use xlinkHref="#add-file"></use></svg><p><span>Добавить файл</span><span>Файл</span></p></div>
                <div><svg width="13.71" height="12.73"><use xlinkHref="#add-video"></use></svg><p><span>Добавить видео</span><span>Видео</span></p></div>
                <div><svg width="12.73" height="12.73"><use xlinkHref="#add-link"></use></svg><p><span>Добавить ссылку</span><span>Ссылка</span></p></div>
              </div>
            </div>
            <div className="select_category_filters">
              <div className="select_category_item">
                <CustomSelect
                  value={selectedCategoryId}
                  onChange={handleCategoryChange}
                  placeholder="Выберите категорию вопроса"
                  options={categories.map((c) => ({ value: String(c.id), label: c.name }))}
                  icon={<svg width="18" height="18"><use xlinkHref="#grid-icon"></use></svg>}
                />
              </div>
              <div className="select_category_item">
                <CustomSelect
                  value={selectedSubcategoryId}
                  onChange={setSelectedSubcategoryId}
                  placeholder="Выберите подкатегорию вопроса"
                  options={subcategoryOptions.map((s) => ({ value: String(s.id), label: s.name }))}
                  disabled={!selectedCategoryId}
                  icon={<svg width="18" height="18"><use xlinkHref="#list-icon"></use></svg>}
                />
              </div>
            </div>
            <div className="asf_form_actions">
              <div className="ask_from_send_btn">
                <button type="submit" className="m_btn category_btn" disabled={submitting}>
                  {submitting ? "Отправка…" : "Опубликовать вопрос"}
                </button>
                <p>Нажимая на кнопку, вы принимаете условия <a href="/user-agreement/" target="_blank">пользовательского соглашения</a></p>
              </div>
              <div className="ask_form_checkboxes">
                <label className="chechbox_item"><input type="checkbox" name="receive_notifications" defaultChecked /><span>Получать уведомления (ответы, голоса, комментарии)</span></label>
                <label className="chechbox_item"><input type="checkbox" name="allow_answer_comments" defaultChecked /><span>Разрешить комментарии к ответам</span></label>
              </div>
            </div>
          </form>
        </div>

        <div className="line" />

        <div className="section populars_block">
          <div className="blocks_title">
            <h2>Похожие вопросы участников</h2>
            <div className="questions_filter">
              {FILTERS.map((tab, index) => (
                <button
                  key={tab.value}
                  type="button"
                  className={`s_btn ${activeFilter === index ? "s_btn_active" : ""}`}
                  onClick={() => handleFilterChange(index)}
                  disabled={loadingFilter}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="questions_list">
            {questions.map((q) => (
              <div key={q.id} className="question_list_item">
                <div className="question_item_top_data">
                  <div className="question_item_top_data_left">
                    <img src={q.latest_likers[0]?.avatar_url ?? "/images/icons/avatar.svg"} alt="" />
                    <div>
                      <p className="main_text">{q.title}</p>
                      <span>{q.likes_count} лайков</span>
                    </div>
                  </div>
                  <div className="question_item_top_data_right">
                    <button type="button" className="s_btn s_btn_icon btn-like" onClick={() => setIsLoginModalOpen(true)} title="Мне нравится">
                      <svg width="13.714355" height="12"><use xlinkHref="#like"></use></svg>
                    </button>
                    <button type="button" className="s_btn s_btn_icon share-this" title="Поделиться" onClick={(e) => handleShareClick(e, q.title, q.id)}>
                      <svg width="14" height="14"><use xlinkHref="#share"></use></svg>
                    </button>
                  </div>
                </div>
                <Link href={`/question/${q.id}`}>
                  <div className="question_list_item_left">
                    <img src={q.latest_likers[0]?.avatar_url ?? "/images/icons/avatar.svg"} alt="" />
                    <div>
                      <p className="main_text">{q.title}</p>
                      <span>{q.likes_count} лайков</span>
                    </div>
                  </div>
                </Link>
                <div className="question_list_item_right">
                  <div className="question_list_item_users">
                    {q.latest_likers.slice(0, 3).map((u) => (
                      <img key={u.id} src={u.avatar_url} alt="" />
                    ))}
                    <p className="main_text">+{q.likes_count}</p>
                  </div>
                  <div className="question_list_item_right_actions">
                    <button type="button" className="s_btn s_btn_icon btn-like" onClick={() => setIsLoginModalOpen(true)} title="Мне нравится">
                      <svg width="13.714355" height="12"><use xlinkHref="#like"></use></svg>
                    </button>
                    <button type="button" className="s_btn s_btn_icon share-this" title="Поделиться" onClick={(e) => handleShareClick(e, q.title, q.id)}>
                      <svg width="14" height="14"><use xlinkHref="#share"></use></svg>
                    </button>
                    <Link href={`/question/${q.id}`} className="s_btn">Посмотреть</Link>
                    <Link href={`/question/${q.id}#answer`} className="s_btn s_btn_active">Ответить</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {hasMore && (
            <div className="show_more_btn_wrapper">
              <button type="button" className="show_more_btn" onClick={handleLoadMore} disabled={loadingMore}>
                <svg width="22" height="22"><use xlinkHref="#sync"></use></svg>
                {loadingMore ? "Загрузка…" : "Показать еще"}
              </button>
            </div>
          )}
        </div>

        <div className="line" />

        <div className="tops_block">
          <div className="tops_block_item">
            <div className="blocks_title"><h2>Лидеры проекта</h2></div>
            <div className="tops_block_item_top_subjects">
              {(initialData.project_leaders ?? []).map((u) => (
                <div className="question_list_item" key={u.id}>
                  <Link href={`/profile/${u.id}`}>
                    <div className="question_list_item_left">
                      <img src={u.avatar_url} alt={u.first_name} />
                      <div>
                        <div className="main_text">{u.first_name} {u.last_name}</div>
                        <span>{u.balls} баллов</span>
                      </div>
                    </div>
                  </Link>
                  <div className="question_list_item_users">
                    <p className="main_text">—</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="tops_block_item">
            <div className="blocks_title"><h2>Самые обсуждаемые</h2></div>
            <div className="tops_block_item_top_subjects">
              {(initialData.most_discussed ?? []).map((q) => (
                <div className="question_list_item" key={q.id}>
                  <Link href={`/question/${q.id}`}>
                    <div className="question_list_item_left">
                      <img src={q.latest_likers[0]?.avatar_url ?? "/images/icons/avatar.svg"} alt="" />
                      <div>
                        <div className="main_text question_title_clamp">{q.title}</div>
                      </div>
                    </div>
                  </Link>
                  <div className="question_list_item_users">
                    {q.latest_likers.slice(0, 3).map((a, i) => (
                      <img key={i} src={a.avatar_url} alt="" />
                    ))}
                    <p className="main_text">+{q.likes_count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="tops_block_item">
            <div className="blocks_title"><h2>Популярные темы</h2></div>
            <div className="tops_block_item_top_subjects">
              {(initialData.popular_topics ?? []).map((t) => (
                <div className="question_list_item" key={t.id}>
                  <Link href={t.parent_slug ? `/categories/${t.parent_slug}/${t.slug}` : `/categories`}>
                    <div className="question_list_item_left">
                      <img src="/images/icons/avatar.svg" alt="" />
                      <div>
                        <div className="main_text">{t.name}</div>
                      </div>
                    </div>
                  </Link>
                  <div className="question_list_item_users">
                    {t.latest_likers.slice(0, 3).map((a, i) => (
                      <img key={i} src={a.avatar_url} alt="" />
                    ))}
                    <p className="main_text">+{t.total_likes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        <QuestionModal isOpen={isQuestionModalOpen} onClose={() => setIsQuestionModalOpen(false)} />
        <SharePopup isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} anchorRef={shareButtonRef} title={shareData.title} url={shareData.url} />
      </div>
      <Footer />
    </>
  )
}
