'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from "next/link"
import TopsBlock from "@/components/TopsBlock"
import Breadcrumbs from "@/components/layout/Breadcrumbs"
import { useRouter } from "next/navigation"
import SharePopup from "@/components/SharePopup"
import QuestionListCard from "@/components/QuestionListCard"
import CategoryItemBg from "@/components/CategoryItemBg"
import CategorySubjectIcon from "@/components/CategorySubjectIcon"
import { useFavoriteQuestion } from "@/hooks/useFavoriteQuestion"
import { HydrationSafeInput, HydrationSafeTextarea } from "@/components/HydrationSafeInput"
import QuestionsTabPagination from "@/components/QuestionsTabPagination"
import { api } from "@/lib/api-client"
import {
  type CategoryQuestionFilter,
  type CategoryQuestionsByFilter,
  type CategoryQuestionsPage,
} from "@/lib/category-questions-tabs"

type CategoryInfo = { id: number; name: string; slug: string; icon_key?: string | null }
type PopularCategory = { id: number; name: string; slug: string; icon_key?: string | null; subcategories: { id: number; name: string; slug: string }[] }
type SharedBlocks = {
  popular_categories: PopularCategory[]
  project_leaders: { id: number; first_name: string; last_name: string; avatar_url?: string | null; balls: number }[]
  most_discussed: { id: number; title: string; likes_count: number; latest_likers: { id?: number; avatar_url?: string | null; avatar_url_2x?: string | null }[] }[]
  popular_topics: { id: number; name: string; slug: string | null; parent_slug: string | null; parent_icon_key?: string | null; total_likes: number; latest_likers: { id?: number; avatar_url?: string | null; avatar_url_2x?: string | null }[] }[]
}

const tabs = [
  { id: "open", label: "Открытые" },
  { id: "voting", label: "На голосовании" },
  { id: "best", label: "Лучшие" },
] as const satisfies ReadonlyArray<{ id: CategoryQuestionFilter; label: string }>

export default function CategoryPageClient({
  category,
  subcategory,
  shared,
  initialByFilter,
  initialFilter,
  listPath,
}: {
  category: CategoryInfo
  subcategory: CategoryInfo | null
  shared: SharedBlocks
  initialByFilter: CategoryQuestionsByFilter
  initialFilter: CategoryQuestionFilter
  listPath: string
}) {
  const router = useRouter()
  const { toggleFavorite, isFavorited, isPending } = useFavoriteQuestion()
  const [activeTab, setActiveTab] = useState<CategoryQuestionFilter>(initialFilter)
  const [byFilter, setByFilter] = useState(initialByFilter)
  const [loadingMore, setLoadingMore] = useState<Partial<Record<CategoryQuestionFilter, boolean>>>({})
  const [questionDraft, setQuestionDraft] = useState('')
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareData, setShareData] = useState({ title: '', url: '' })
  const shareButtonRef = useRef<HTMLButtonElement | null>(null)

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

  const questionsApiPath = `v1/category-pages${listPath.replace(/^\/categories/, "")}/questions`

  const loadMore = useCallback(async (tab: CategoryQuestionFilter) => {
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
      const data = await api.get<CategoryQuestionsPage>(`${questionsApiPath}?${params}`)
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
  }, [byFilter, loadingMore, questionsApiPath])

  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const scrollThumbRef = useRef<HTMLDivElement>(null)
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
  }, [shared.popular_categories])

  return (
    <div className="container">
      <Breadcrumbs
        items={[
          { name: "Главная", href: "/" },
          { name: "Категории вопросов", href: "/categories" },
          { name: category.name, href: `/categories/${category.slug}` },
          ...(subcategory
            ? [
                {
                  name: subcategory.name,
                  href: `/categories/${category.slug}/${subcategory.slug}`,
                },
              ]
            : []),
        ]}
      />

      <div className="section populars_block">
        <div className="blocks_title category_page_block">
          <svg width="24" height="24" className="category_page_icon">
            <use xlinkHref={`/sprites.svg#${category.icon_key || "gaming"}`}></use>
          </svg>
          {subcategory ? (
            <>
              <h2>{category.name}</h2>
              <div className="subcatogory_title">
                <div></div>
                <h1>{subcategory.name}</h1>
              </div>
            </>
          ) : (
            <h1>{category.name}</h1>
          )}

          <div className="questions_filter">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`s_btn ${activeTab === tab.id ? "s_btn_active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

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
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                const q = questionDraft.trim()
                router.push(q ? `/ask?draft=${encodeURIComponent(q)}` : '/ask')
              }
            }}
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
          const questions = page.questions ?? []
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
                basePath={listPath}
                filter={tab.id}
                current={initialByFilter[tab.id].current_page ?? 1}
                last={initialByFilter[tab.id].last_page ?? 1}
              />
            </div>
          )
        })}
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
                <CategorySubjectIcon
                  name={c.name}
                  slug={c.slug}
                  iconKey={c.icon_key}
                  fallbackIconKey="gaming"
                />
                <Link href={`/categories/${c.slug}`} title={c.name}><h3>{c.name}</h3></Link>
                <div className="subject_item_list">
                  {(c.subcategories ?? []).slice(0, 4).map((s) => (
                    <Link href={`/categories/${c.slug}/${s.slug}`} key={s.id} title={s.name}>
                      <span className="subject_item_list_item">
                        <img src="/images/icons/category-list-item.svg" alt="" title={s.name} />
                        <span>{s.name}</span>
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
        <div className="subjects_scroll_track" ref={scrollTrackRef}>
          <div className="subjects_scroll_thumb" ref={scrollThumbRef} />
        </div>
      </div>

      <div className="line"></div>

      <TopsBlock data={shared} />

      <SharePopup isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} anchorRef={shareButtonRef} title={shareData.title} url={shareData.url} />
    </div>
  )
}
