'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from "next/link"
import TopsBlock from "@/components/TopsBlock"
import { useRouter } from "next/navigation"
import LoginModal from "@/components/LoginModal"
import SharePopup from "@/components/SharePopup"
import QuestionListCard from "@/components/QuestionListCard"
import CategoryItemBg from "@/components/CategoryItemBg"
import CategorySubjectIcon from "@/components/CategorySubjectIcon"
import { api } from "@/lib/api-client"
import { useFavoriteQuestion } from "@/hooks/useFavoriteQuestion"
import { useAuthStore } from "@/store/authStore"
import { HydrationSafeInput, HydrationSafeTextarea } from "@/components/HydrationSafeInput"

type CategoryTop = { id: number; name: string; slug: string; icon_key: string | null; subcategories: { id: number; name: string; slug: string }[] }
type HomeQuestionItem = {
  id: number
  title: string
  created_at: string
  answers_count: number
  likes_count: number
  is_premium?: boolean
  author: { id: number; full_name: string; avatar_url?: string | null; balls?: number }
  latest_likers: { id: number; avatar_url?: string | null }[]
}
type HomeInitialData = {
  categories: CategoryTop[]
  project_leaders: { id: number; first_name: string; last_name: string; avatar_url?: string | null; balls: number }[]
  most_discussed: { id: number; title: string; likes_count: number; latest_likers: { id?: number; avatar_url?: string | null; avatar_url_2x?: string | null }[] }[]
  popular_topics: { id: number; name: string; slug: string | null; parent_slug: string | null; parent_icon_key?: string | null; total_likes: number; latest_likers: { id?: number; avatar_url?: string | null; avatar_url_2x?: string | null }[] }[]
}
type HomeQuestionsPage = { questions: HomeQuestionItem[]; current_page: number; last_page: number; per_page: number; total: number }

const tabs = [
  { id: "open", label: "Открытые" },
  { id: "voting", label: "На голосовании" },
  { id: "best", label: "Лучшие" },
  { id: "premium", label: "Премиум" },
] as const
type HomeFilter = typeof tabs[number]["id"]

export default function HomeContent({
  initialData,
  initialQuestions,
}: {
  initialData: HomeInitialData
  initialQuestions: HomeQuestionsPage
}) {
  const router = useRouter()
  const isAuthorized = useAuthStore((s) => s.isAuthorized)
  const { toggleFavorite, isFavorited, isPending } = useFavoriteQuestion()
  const [activeTab, setActiveTab] = useState<HomeFilter>("open")
  const [questions, setQuestions] = useState<HomeQuestionItem[]>(initialQuestions.questions ?? [])
  const [currentPage, setCurrentPage] = useState(initialQuestions.current_page ?? 1)
  const [lastPage, setLastPage] = useState(initialQuestions.last_page ?? 1)
  const [loadingList, setLoadingList] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareData, setShareData] = useState({ title: '', url: '' })
  /* п.7+32 — текст из поля «Задайте свой вопрос» пробрасывается на /ask */
  const [questionDraft, setQuestionDraft] = useState('')
  const shareButtonRef = useRef<HTMLButtonElement | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const fetchQuestions = useCallback(async (filter: HomeFilter, page: number, append: boolean) => {
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal
    if (append) setLoadingMore(true)
    else setLoadingList(true)
    try {
      const params = new URLSearchParams({
        filter,
        page: String(page),
        per_page: "10",
      })
      const data = await api.get<HomeQuestionsPage>(`v1/main/questions?${params}`, { signal })
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
  }, [])

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
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const scrollThumbRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const hasDragged = useRef(false)

  /* п.6 — кастомный скроллбар для мобилки; скрываем, если горизонтальный скролл не нужен */
  useEffect(() => {
    const el = scrollRef.current
    const thumb = scrollThumbRef.current
    const track = scrollTrackRef.current
    if (!el || !thumb) return
    const update = () => {
      const scrollable = el.scrollWidth > el.clientWidth + 1
      el.classList.toggle('is-scrollable', scrollable)
      track?.classList.toggle('is-visible', scrollable)
      if (!scrollable) {
        thumb.style.width = '0'
        thumb.style.left = '0'
        return
      }
      const ratio = el.clientWidth / el.scrollWidth
      const pos = el.scrollLeft / (el.scrollWidth - el.clientWidth)
      thumb.style.width = `${Math.max(ratio * 100, 20)}%`
      thumb.style.left = `${pos * (100 - Math.max(ratio * 100, 20))}%`
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null
    const inner = el.querySelector('.subjects_list')
    ro?.observe(el)
    if (inner) ro?.observe(inner)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      ro?.disconnect()
    }
  }, [initialData.categories])

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
            {(initialData.categories ?? []).map((category) => (
              <CategoryItemBg key={category.id}>
                <CategorySubjectIcon
                  name={category.name}
                  slug={category.slug}
                  iconKey={category.icon_key}
                  fallbackIconKey="gaming"
                />
                <Link href={`/categories/${category.slug}`} title={category.name}>
                  <h3>{category.name}</h3>
                </Link>
                <div className="subject_item_list">
                  {(category.subcategories ?? []).slice(0, 4).map((subcat) => (
                    <Link href={`/categories/${category.slug}/${subcat.slug}`} key={subcat.id} title={subcat.name}>
                      <span className="subject_item_list_item">
                        <img src="/images/icons/category-list-item.svg" alt="" title={subcat.name} />
                        <span>{subcat.name}</span>
                      </span>
                    </Link>
                  ))}
                </div>
                <Link href="/categories" title="Посмотреть все категории">
                  <div className="subject_item_more" title="Посмотреть все категории">
                    <p>Посмотреть все</p>
                    <img src="/images/icons/more-s-icon.svg" alt="" className="subject_item_more_arrow" />
                  </div>
                </Link>
              </CategoryItemBg>
            ))}
          </div>
        </div>
        {/* п.6 — кастомный скроллбар, видим на мобилке */}
        <div className="subjects_scroll_track" ref={scrollTrackRef}>
          <div className="subjects_scroll_thumb" ref={scrollThumbRef} />
        </div>
      </div>

      <div className="line"></div>

      <div className="section populars_block">
        <div className="blocks_title">
          <h2>Вопросы участников</h2>
          <div className="questions_filter">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`s_btn ${activeTab === tab.id ? "s_btn_active" : ""} ${tab.id === "premium" ? "premium-filter-btn" : ""}`}
                onClick={() => {
                  setActiveTab(tab.id)
                  fetchQuestions(tab.id, 1, false)
                }}
              >
                {tab.id === "premium" ? (
                  <>
                    <svg className="premium-crown-icon" width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M16.949 7.47907L14.405 8.11407C14.3509 8.12793 14.2939 8.12578 14.241 8.10788C14.1881 8.08997 14.1416 8.05709 14.107 8.01323L11.3181 4.52671C11.1548 4.33729 10.9525 4.18532 10.725 4.08115C10.4976 3.97698 10.2504 3.92306 10.0002 3.92306C9.75009 3.92306 9.50288 3.97698 9.27545 4.08115C9.04802 4.18532 8.84572 4.33729 8.68233 4.52671L5.89257 8.01415C5.85701 8.057 5.81018 8.08906 5.75738 8.10672C5.70457 8.12438 5.64787 8.12693 5.59369 8.11408L3.05141 7.47907C2.85168 7.42913 2.64243 7.43175 2.44401 7.48666C2.24559 7.54157 2.06476 7.6469 1.91912 7.79241C1.77347 7.93792 1.66798 8.11865 1.61289 8.31702C1.5578 8.51539 1.55499 8.72464 1.60474 8.92442L3.19721 15.2925C3.28774 15.6581 3.4982 15.9827 3.79495 16.2146C4.0917 16.4464 4.45761 16.5721 4.8342 16.5716H15.1658C15.5424 16.5721 15.9083 16.4464 16.205 16.2146C16.5018 15.9827 16.7123 15.6581 16.8028 15.2925L18.3953 8.92442C18.445 8.72468 18.4422 8.51547 18.3872 8.31714C18.3321 8.1188 18.2267 7.93809 18.0811 7.79258C17.9355 7.64708 17.7547 7.54173 17.5563 7.48679C17.3579 7.43186 17.1487 7.42919 16.949 7.47907Z" fill="currentColor" />
                      <path d="M1.39535 6.74419C2.16598 6.74419 2.7907 6.11947 2.7907 5.34884C2.7907 4.57821 2.16598 3.95349 1.39535 3.95349C0.624719 3.95349 0 4.57821 0 5.34884C0 6.11947 0.624719 6.74419 1.39535 6.74419Z" fill="currentColor" />
                      <path d="M18.6047 6.74419C19.3753 6.74419 20 6.11947 20 5.34884C20 4.57821 19.3753 3.95349 18.6047 3.95349C17.834 3.95349 17.2093 4.57821 17.2093 5.34884C17.2093 6.11947 17.834 6.74419 18.6047 6.74419Z" fill="currentColor" />
                      <path d="M10 2.7907C10.7706 2.7907 11.3953 2.16598 11.3953 1.39535C11.3953 0.624719 10.7706 0 10 0C9.22937 0 8.60465 0.624719 8.60465 1.39535C8.60465 2.16598 9.22937 2.7907 10 2.7907Z" fill="currentColor" />
                    </svg>
                    {tab.label}
                  </>
                ) : (
                  tab.label
                )}
              </button>
            ))}
          </div>
        </div>

        {/* п.7+32 — поле принимает текст, кнопка редиректит на /ask с текстом */}
        <div className="questions_block_search">
          <img src="/images/icons/ask.svg" alt="" />
          <HydrationSafeInput
            name="message"
            type="text"
            placeholder="Задайте свой вопрос здесь"
            value={questionDraft}
            onChange={(e) => setQuestionDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                if (isAuthorized) {
                  const q = questionDraft.trim()
                  router.push(q ? `/ask?draft=${encodeURIComponent(q)}` : '/ask')
                } else {
                  setIsLoginModalOpen(true)
                }
              }
            }}
          />
          <HydrationSafeTextarea
            name="message-full"
            placeholder="Задайте свой вопрос здесь"
            value={questionDraft}
            onChange={(e) => setQuestionDraft(e.target.value)}
          />
          <button
            type="button"
            className="s_btn s_btn_active"
            onClick={() => {
              if (isAuthorized) {
                const q = questionDraft.trim()
                router.push(q ? `/ask?draft=${encodeURIComponent(q)}` : '/ask')
              } else {
                setIsLoginModalOpen(true)
              }
            }}
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

        {loadingList ? (
          <p className="secondary_text" style={{ textAlign: "center" }}>Загрузка вопросов…</p>
        ) : null}

        {currentPage < lastPage ? (
          <div className="show_more_btn_wrapper">
            <button
              className="show_more_btn"
              type="button"
              onClick={() => fetchQuestions(activeTab, currentPage + 1, true)}
              disabled={loadingMore}
            >
              <svg width="22" height="22">
                <use xlinkHref="#sync"></use>
              </svg>
              {loadingMore ? "Загрузка…" : "Показать еще"}
            </button>
          </div>
        ) : null}
      </div>

      <div className="line"></div>

      <TopsBlock data={initialData} />

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

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
