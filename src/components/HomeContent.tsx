'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from "next/link"
import TopsBlock from "@/components/TopsBlock"
import { useRouter } from "next/navigation"
import SharePopup from "@/components/SharePopup"
import QuestionListCard from "@/components/QuestionListCard"
import CategoryItemBg from "@/components/CategoryItemBg"
import CategorySubjectIcon from "@/components/CategorySubjectIcon"
import QuestionsTabPagination from "@/components/QuestionsTabPagination"
import { useFavoriteQuestion } from "@/hooks/useFavoriteQuestion"
import { HydrationSafeInput, HydrationSafeTextarea } from "@/components/HydrationSafeInput"
import { api } from "@/lib/api-client"
import { SITE_NAME } from "@/lib/page-seo"
import { readHomeOwnQuestions } from "@/lib/home-own-questions"
import type {
  HomeQuestionFilter,
  HomeQuestionListItem,
  HomeQuestionsByFilter,
  HomeQuestionsPage,
} from "@/lib/home-questions-tabs"

type CategoryTop = { id: number; name: string; slug: string; icon_key: string | null; subcategories: { id: number; name: string; slug: string }[] }
type HomeInitialData = {
  categories: CategoryTop[]
  project_leaders: { id: number; first_name: string; last_name: string; avatar_url?: string | null; balls: number }[]
  most_discussed: { id: number; title: string; likes_count: number; latest_likers: { id?: number; avatar_url?: string | null; avatar_url_2x?: string | null }[] }[]
  popular_topics: { id: number; name: string; slug: string | null; parent_slug: string | null; parent_icon_key?: string | null; total_likes: number; latest_likers: { id?: number; avatar_url?: string | null; avatar_url_2x?: string | null }[] }[]
}

const tabs = [
  { id: "open", label: "Открытые" },
  { id: "voting", label: "На голосовании" },
  { id: "best", label: "Лучшие" },
  { id: "premium", label: "Премиум" },
] as const satisfies ReadonlyArray<{ id: HomeQuestionFilter; label: string }>

function questionsForTab(
  tab: HomeQuestionFilter,
  page: HomeQuestionsPage,
  own: HomeQuestionListItem[],
  startedFromFirstPage: boolean,
): HomeQuestionListItem[] {
  const list = page.questions ?? []
  if (!startedFromFirstPage) return list
  if (tab !== "open" && tab !== "premium") return list
  const extra = own.filter((q) => {
    if (list.some((item) => item.id === q.id)) return false
    if (tab === "premium") return Boolean(q.is_premium)
    return true
  })
  return [...extra, ...list]
}

export default function HomeContent({
  initialData,
  initialByFilter,
  initialFilter,
}: {
  initialData: HomeInitialData
  initialByFilter: HomeQuestionsByFilter
  initialFilter: HomeQuestionFilter
}) {
  const router = useRouter()
  const { toggleFavorite, isFavorited, isPending } = useFavoriteQuestion()
  const [activeTab, setActiveTab] = useState<HomeQuestionFilter>(initialFilter)
  const [byFilter, setByFilter] = useState(initialByFilter)
  const [loadingMore, setLoadingMore] = useState<Partial<Record<HomeQuestionFilter, boolean>>>({})
  const [ownQuestions, setOwnQuestions] = useState<HomeQuestionListItem[]>([])
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareData, setShareData] = useState({ title: '', url: '' })
  /* п.7+32 — текст из поля «Задайте свой вопрос» пробрасывается на /ask */
  const [questionDraft, setQuestionDraft] = useState('')
  const shareButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    setOwnQuestions(readHomeOwnQuestions())
  }, [])

  const loadMore = useCallback(async (tab: HomeQuestionFilter) => {
    const page = byFilter[tab]
    if (page.current_page >= page.last_page || loadingMore[tab]) return
    setLoadingMore((prev) => ({ ...prev, [tab]: true }))
    try {
      const nextPage = page.current_page + 1
      const params = new URLSearchParams({
        filter: tab,
        page: String(nextPage),
        per_page: String(page.per_page || 10),
      })
      const data = await api.get<HomeQuestionsPage>(`v1/main/questions?${params}`)
      setByFilter((prev) => ({
        ...prev,
        [tab]: {
          ...data,
          questions: [...prev[tab].questions, ...(data.questions ?? [])],
        },
      }))
    } catch {
      /* тихо */
    } finally {
      setLoadingMore((prev) => ({ ...prev, [tab]: false }))
    }
  }, [byFilter, loadingMore])

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
      <div className="blocks_title">
        <h1>{SITE_NAME} — вопросы и ответы</h1>
      </div>
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
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.id === "premium" ? (
                  <>
                    <svg className="premium-crown-icon" width="20" height="17" fill="currentColor" aria-hidden>
                      <use xlinkHref="/sprites.svg#rules" />
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
                const q = questionDraft.trim()
                router.push(q ? `/ask?draft=${encodeURIComponent(q)}` : '/ask')
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
              const q = questionDraft.trim()
              router.push(q ? `/ask?draft=${encodeURIComponent(q)}` : '/ask')
            }}
          >
            Задать вопрос
          </button>
        </div>

        {tabs.map((tab) => {
          const page = byFilter[tab.id]
          const questions = questionsForTab(
            tab.id,
            page,
            ownQuestions,
            (initialByFilter[tab.id].current_page ?? 1) === 1,
          )
          const hasMore = (page.current_page ?? 1) < (page.last_page ?? 1)
          return (
            <div key={tab.id} hidden={activeTab !== tab.id} data-questions-tab={tab.id}>
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
              {questions.length === 0 ? (
                <p className="secondary_text" style={{ textAlign: "center" }}>Пока нет вопросов</p>
              ) : null}
              {hasMore ? (
                <div className="show_more_btn_wrapper">
                  <button
                    className="show_more_btn"
                    type="button"
                    onClick={() => void loadMore(tab.id)}
                    disabled={Boolean(loadingMore[tab.id])}
                  >
                    <svg width="22" height="22">
                      <use xlinkHref="/sprites.svg#sync"></use>
                    </svg>
                    {loadingMore[tab.id] ? "Загрузка..." : "Показать еще"}
                  </button>
                </div>
              ) : null}
              <QuestionsTabPagination
                basePath="/"
                filter={tab.id}
                current={initialByFilter[tab.id].current_page ?? 1}
                last={initialByFilter[tab.id].last_page ?? 1}
              />
            </div>
          )
        })}
      </div>

      <div className="line"></div>

      <TopsBlock data={initialData} />

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
