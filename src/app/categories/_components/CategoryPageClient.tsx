'use client'

import { useState, useRef, useCallback } from 'react'
import Link from "next/link"
import { useRouter } from "next/navigation"
import LoginModal from "@/components/LoginModal"
import SharePopup from "@/components/SharePopup"
import QuestionListCard from "@/components/QuestionListCard"
import CategoryItemBg from "@/components/CategoryItemBg"
import { api } from "@/lib/api-client"
import { useFavoriteQuestion } from "@/hooks/useFavoriteQuestion"
import { useAuthStore } from "@/store/authStore"

type CategoryInfo = { id: number; name: string; slug: string; icon_key?: string | null }
type PopularCategory = { id: number; name: string; slug: string; icon_key?: string | null; subcategories: { id: number; name: string; slug: string }[] }
type QuestionItem = {
  id: number
  title: string
  created_at: string
  answers_count: number
  likes_count: number
  author: { id: number; full_name: string; avatar_url?: string | null; balls?: number }
  latest_likers: { id: number; avatar_url?: string | null }[]
}
type SharedBlocks = {
  popular_categories: PopularCategory[]
  project_leaders: { id: number; first_name: string; last_name: string; avatar_url?: string | null; balls: number }[]
  most_discussed: { id: number; title: string; likes_count: number; latest_likers: { avatar_url?: string | null }[] }[]
  popular_topics: { id: number; name: string; slug: string | null; parent_slug: string | null; parent_icon_key?: string | null; total_likes: number; latest_likers: { avatar_url?: string | null }[] }[]
}
type QuestionsPage = { questions: QuestionItem[]; current_page: number; last_page: number; per_page: number; total: number }

const tabs = [
  { id: "open", label: "Открытые" },
  { id: "voting", label: "На голосовании" },
  { id: "best", label: "Лучшие" },
] as const
type Filter = typeof tabs[number]["id"]

const numWord = (value: number, words: [string, string, string]): string => {
  const abs = Math.abs(value)
  const cases = [2, 0, 1, 1, 1, 2]
  const index = abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)]
  return `${value} ${words[index]}`
}

export default function CategoryPageClient({
  category,
  subcategory,
  shared,
  initialQuestions,
  questionsEndpoint,
}: {
  category: CategoryInfo
  subcategory: CategoryInfo | null
  shared: SharedBlocks
  initialQuestions: QuestionsPage
  questionsEndpoint: string
}) {
  const router = useRouter()
  const isAuthorized = useAuthStore((s) => s.isAuthorized)
  const { toggleFavorite, isFavorited, isPending } = useFavoriteQuestion()
  const [activeTab, setActiveTab] = useState<Filter>("open")
  const [questions, setQuestions] = useState<QuestionItem[]>(initialQuestions.questions ?? [])
  const [currentPage, setCurrentPage] = useState(initialQuestions.current_page ?? 1)
  const [lastPage, setLastPage] = useState(initialQuestions.last_page ?? 1)
  const [loadingList, setLoadingList] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareData, setShareData] = useState({ title: '', url: '' })
  const shareButtonRef = useRef<HTMLButtonElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchQuestions = useCallback(async (filter: Filter, page: number, append: boolean) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    if (append) setLoadingMore(true)
    else setLoadingList(true)
    try {
      const params = new URLSearchParams({ filter, page: String(page), per_page: "10" })
      const data = await api.get<QuestionsPage>(`${questionsEndpoint}?${params}`, { signal })
      if (append) setQuestions((prev) => [...prev, ...(data.questions ?? [])])
      else setQuestions(data.questions ?? [])
      setCurrentPage(data.current_page ?? 1)
      setLastPage(data.last_page ?? 1)
    } catch {
      if (!append) {
        setQuestions([])
        setCurrentPage(1)
        setLastPage(1)
      }
    } finally {
      setLoadingList(false)
      setLoadingMore(false)
      abortRef.current = null
    }
  }, [questionsEndpoint])

  const handleShareClick = useCallback((e: React.MouseEvent<HTMLButtonElement>, title: string, id: number) => {
    const btn = e.currentTarget
    if (shareButtonRef.current === btn && isShareOpen) {
      setIsShareOpen(false)
      return
    }
    shareButtonRef.current = btn
    setShareData({ title, url: `${typeof window !== 'undefined' ? window.location.origin : ''}/question/${id}` })
    setIsShareOpen(true)
  }, [isShareOpen])

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

  return (
    <div className="container">
      <div className="breadcrumbs">
        <Link href="/" className="breadcrumbs__link">Главная</Link>
        <span className="breadcrumbs__sep">•</span>
        <Link href="/categories" className="breadcrumbs__link">Категории вопросов</Link>
        <span className="breadcrumbs__sep">•</span>
        {subcategory ? (
          <>
            <Link href={`/categories/${category.slug}`} className="breadcrumbs__link">{category.name}</Link>
            <span className="breadcrumbs__sep">•</span>
            <span className="breadcrumbs__current">{subcategory.name}</span>
          </>
        ) : (
          <span className="breadcrumbs__current">{category.name}</span>
        )}
      </div>

      <div className="section populars_block">
        <div className="blocks_title category_page_block">
          <svg width="24" height="24" className="category_page_icon">
            <use xlinkHref={`#${category.icon_key || "gaming"}`}></use>
          </svg>
          <h2>{category.name}</h2>
          {subcategory ? (
            <div className="subcatogory_title">
              <div></div>
              <h3>{subcategory.name}</h3>
            </div>
          ) : null}

          <div className="questions_filter">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`s_btn ${activeTab === tab.id ? "s_btn_active" : ""}`}
                onClick={() => {
                  setActiveTab(tab.id)
                  fetchQuestions(tab.id, 1, false)
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="questions_block_search">
          <img src="/images/icons/ask.svg" alt="" />
          <input name="message" type="text" placeholder="Задайте свой вопрос здесь" readOnly />
          <textarea name="message-full" placeholder="Задайте свой вопрос здесь" readOnly></textarea>
          <button
            type="button"
            className="s_btn s_btn_active"
            onClick={() => (isAuthorized ? router.push("/ask") : setIsLoginModalOpen(true))}
          >
            Задать вопрос
          </button>
        </div>

        <div className="questions_list">
          {questions.map((question) => (
            <QuestionListCard
              key={question.id}
              question={question}
              isFavorited={isFavorited}
              isPending={isPending}
              onToggleFavorite={toggleFavorite}
              onShare={handleShareClick}
            />
          ))}
        </div>

        {loadingList ? <p className="secondary_text" style={{ textAlign: "center" }}>Загрузка вопросов…</p> : null}
        {currentPage < lastPage ? (
          <div className="show_more_btn_wrapper">
            <button className="show_more_btn" type="button" onClick={() => fetchQuestions(activeTab, currentPage + 1, true)} disabled={loadingMore}>
              <svg width="22" height="22"><use xlinkHref="#sync"></use></svg>
              {loadingMore ? "Загрузка…" : "Показать еще"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="line"></div>

      <div className="section popular-section">
        <div className="blocks_title"><h2>Популярные</h2></div>
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
            {(shared.popular_categories ?? []).map((c) => (
              <CategoryItemBg key={c.id}>
                <div className="subject_item_icon">
                  <svg width="24" height="24" className="category_icon">
                    <use xlinkHref={`#${c.icon_key || "gaming"}`}></use>
                  </svg>
                </div>
                <Link href={`/categories/${c.slug}`}><h3>{c.name}</h3></Link>
                <div className="subject_item_list">
                  {(c.subcategories ?? []).slice(0, 4).map((s) => (
                    <Link href={`/categories/${c.slug}/${s.slug}`} key={s.id}>
                      <div className="subject_item_list_item">
                        <img src="/images/icons/category-list-item.svg" alt="" />
                        <p>{s.name}</p>
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
              </CategoryItemBg>
            ))}
          </div>
        </div>
      </div>

      <div className="line"></div>

      <div className="tops_block">
        <div className="tops_block_item">
          <div className="blocks_title"><h2>Лидеры проекта</h2></div>
          <div className="tops_block_item_top_subjects">
            {(shared.project_leaders ?? []).map((u) => (
              <div className="question_list_item" key={u.id}>
                <Link href={`/profile/${u.id}`}>
                  <div className="question_list_item_left">
                    <img src={u.avatar_url || "/images/icons/avatar.svg"} alt={u.first_name} />
                    <div className="question_list_item_left__user_meta"><div className="main_text">{u.first_name} {u.last_name}</div><span>{numWord(u.balls ?? 0, ["балл", "балла", "баллов"])}</span></div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="tops_block_item">
          <div className="blocks_title"><h2>Самые обсуждаемые</h2></div>
          <div className="tops_block_item_top_subjects">
            {(shared.most_discussed ?? []).map((q) => (
              <div className="question_list_item" key={q.id}>
                <Link href={`/question/${q.id}`}>
                  <div className="question_list_item_left">
                    <img src={q.latest_likers[0]?.avatar_url || "/images/icons/avatar.svg"} alt="" />
                    <div className="question_list_item_left__user_meta">
                      <div className="main_text question_title_clamp">
                        {q.title}
                      </div>
                    </div>
                  </div>
                </Link>
                <div className="question_list_item_users">
                  {(q.latest_likers ?? []).slice(0, 3).map((u, idx) => <img key={idx} src={u.avatar_url || "/images/icons/avatar.svg"} alt="" />)}
                  <p className="main_text">+{q.likes_count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="tops_block_item">
          <div className="blocks_title"><h2>Популярные темы</h2></div>
          <div className="tops_block_item_top_subjects">
            {(shared.popular_topics ?? []).map((topic) => (
              <div className="question_list_item" key={topic.id}>
                <Link href={topic.parent_slug && topic.slug ? `/categories/${topic.parent_slug}/${topic.slug}` : "/categories"}>
                  <div className="question_list_item_left">
                    <svg width="24" height="24" className="topic_icon">
                      <use xlinkHref={`#${topic.parent_icon_key || "gaming"}`}></use>
                    </svg>
                    <div className="question_list_item_left__user_meta"><div className="main_text">{topic.name}</div></div>
                  </div>
                </Link>
                <div className="question_list_item_users">
                  {(topic.latest_likers ?? []).slice(0, 3).map((u, idx) => <img key={idx} src={u.avatar_url || "/images/icons/avatar.svg"} alt="" />)}
                  <p className="main_text">+{topic.total_likes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <SharePopup isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} anchorRef={shareButtonRef} title={shareData.title} url={shareData.url} />
    </div>
  )
}

