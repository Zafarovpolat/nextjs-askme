'use client'

import { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import TopsBlock from "@/components/TopsBlock"
import LoginModal from "@/components/LoginModal"
import QuestionModal from "@/components/QuestionModal"
import SharePopup from "@/components/SharePopup"
import VipPurchaseModal from "@/components/VipPurchaseModal"
import CustomSelect from "@/components/CustomSelect"
import PremiumFilterCrownIcon from "@/components/PremiumFilterCrownIcon"
import { api } from "@/lib/api-client"
import { getToken } from "@/lib/cookies"
import { useAuthStore } from "@/store/authStore"
import { useFavoriteQuestion } from "@/hooks/useFavoriteQuestion"
import AnswerLinkUrl from "@/components/AnswerLinkUrl"
import { getApiFullUrl } from "@/config/api"
import { resizeTextarea } from "@/lib/resize-textarea"
import LinkInputModal from "@/components/LinkInputModal"
import type { ApiUser } from "@/types"
import {
  compactCountTitle,
  formatCompactCountPlus,
  formatCompactNumWord,
} from "@/lib/format-compact-count"
import {
  containsSpamUnicode,
  PLAIN_TEXT_SPAM_MESSAGE,
  sanitizePlainTextInput,
} from "@/lib/plain-text-spam-guard"

type Subcategory = { id: number; name: string; slug: string; icon_key: string | null }
type CategoryItem = { id: number; name: string; slug: string; icon_key: string | null; subcategories: Subcategory[] }
type QuestionListItem = {
  id: number
  title: string
  likes_count: number
  is_premium?: boolean
  latest_likers: { id: number; avatar_url: string }[]
}
type ProjectLeader = { id: number; first_name: string; last_name: string; avatar_url: string; balls: number }
type MostDiscussedItem = { id: number; title: string; likes_count: number; latest_likers: { id?: number; avatar_url?: string | null; avatar_url_2x?: string | null }[] }
type PopularTopic = { id: number; name: string; slug: string; parent_slug: string | null; parent_icon_key?: string | null; total_likes: number; latest_likers: { id?: number; avatar_url?: string | null; avatar_url_2x?: string | null }[] }

export type AskPageInitialData = {
  project_leaders: ProjectLeader[]
  most_discussed: MostDiscussedItem[]
  popular_topics: PopularTopic[]
  categories: CategoryItem[]
}

const SIMILAR_PER_PAGE = 15
const SIMILAR_DEBOUNCE_MS = 2000

/** null / undefined = без лимита; иначе остаток > 0 */
function canAddAttachment(remaining: number | null | undefined): boolean {
  if (remaining === null || remaining === undefined) return true
  return remaining > 0
}

const FILTERS = [
  { label: 'Все', value: 'all' as const },
  { label: 'Открытые', value: 'open' as const },
  { label: 'На голосовании', value: 'voting' as const },
  { label: 'Решения', value: 'solved' as const },
  { label: 'Премиум', value: 'premium' as const },
]

/** Нет доступных слотов премиум-вопроса (не безлимит). */
function isPremiumQuestionChoiceDisabled(user: ApiUser): boolean {
  if (user.premium_questions_quota_is_unlimited) {
    return false
  }
  const avail = user.premium_questions_quota_available
  if (avail != null) {
    return avail <= 0
  }
  const total = user.premium_questions_quota_total
  const used = user.premium_questions_quota_used ?? 0
  if (total != null && total > 0) {
    return used >= total
  }
  return false
}

function formatPremiumAskButtonLabel(user: {
  premium_questions_quota_is_unlimited?: boolean
  premium_questions_quota_total?: number | null
  premium_questions_quota_used?: number
}): string {
  if (user.premium_questions_quota_is_unlimited) {
    return "Премиум вопрос (безлимит)"
  }
  const total = user.premium_questions_quota_total
  const used = user.premium_questions_quota_used ?? 0
  if (total != null && total > 0) {
    return `Премиум вопрос ${used} из ${total}`
  }
  return "Премиум вопрос"
}

export default function AskPageClient({ initialData }: { initialData: AskPageInitialData }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isAuthorized = useAuthStore((s) => s.isAuthorized)
  const user = useAuthStore((s) => s.user)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const categories = initialData.categories ?? []
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("")
  /* ?draft= — текст с главной / категорий; подставляем в описание и сразу ищем похожие */
  const [titleInput, setTitleInput] = useState("")
  const [messageInput, setMessageInput] = useState(() => searchParams.get("draft") ?? "")
  const [similarFilter, setSimilarFilter] = useState<typeof FILTERS[number]['value']>('all')
  const [similarQuestions, setSimilarQuestions] = useState<QuestionListItem[]>([])
  const [similarCurrentPage, setSimilarCurrentPage] = useState(1)
  const [similarLastPage, setSimilarLastPage] = useState(1)
  const [similarLoading, setSimilarLoading] = useState(false)
  const [similarLoadingMore, setSimilarLoadingMore] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [vipModalOpen, setVipModalOpen] = useState(false)
  const [shareData, setShareData] = useState({ title: '', url: '' })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [fileAttachment, setFileAttachment] = useState<{ file: File; previewUrl: string } | null>(null)
  const [videoAttachment, setVideoAttachment] = useState<{ file: File; previewUrl: string } | null>(null)
  const [linkAttachment, setLinkAttachment] = useState<string | null>(null)
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false)
  const messageRef = useRef<HTMLTextAreaElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const videoInputRef = useRef<HTMLInputElement | null>(null)
  const shareButtonRef = useRef<HTMLButtonElement | null>(null)
  const fetchSimilarAbortRef = useRef<AbortController | null>(null)
  const similarFilterRef = useRef(similarFilter)
  const skipNextSimilarDebounceRef = useRef(Boolean(searchParams.get("draft")?.trim()))
  similarFilterRef.current = similarFilter

  const currentCategory = categories.find((c) => String(c.id) === selectedCategoryId)
  const subcategoryOptions = currentCategory?.subcategories ?? []
  const { toggleFavorite, isFavorited, isPending } = useFavoriteQuestion()

  const handleShareClick = useCallback((e: React.MouseEvent<HTMLButtonElement>, title: string, questionId: number) => {
    shareButtonRef.current = e.currentTarget
    setShareData({ title, url: `/question/${questionId}` })
    setIsShareOpen(true)
  }, [])

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value)
    setSelectedSubcategoryId("")
  }

  useLayoutEffect(() => {
    resizeTextarea(messageRef.current)
  }, [messageInput])

  const fetchSimilar = useCallback(
    async (q: string, page: number, append: boolean, filter: string) => {
      const query = q.trim()
      if (!query) {
        if (!append) {
          setSimilarQuestions([])
          setSimilarCurrentPage(1)
          setSimilarLastPage(1)
        }
        return
      }
      if (fetchSimilarAbortRef.current) {
        fetchSimilarAbortRef.current.abort()
      }
      fetchSimilarAbortRef.current = new AbortController()
      const signal = fetchSimilarAbortRef.current.signal
      if (append) {
        setSimilarLoadingMore(true)
      } else {
        setSimilarLoading(true)
      }
      try {
        const params = new URLSearchParams({
          q: query,
          page: String(page),
          per_page: String(SIMILAR_PER_PAGE),
          filter,
        })
        const data = await api.get<{
          questions: QuestionListItem[]
          current_page: number
          last_page: number
        }>(`v1/questions/similar?${params}`, { signal })
        if (append) {
          setSimilarQuestions((prev) => [...prev, ...data.questions])
        } else {
          setSimilarQuestions(data.questions)
        }
        setSimilarCurrentPage(data.current_page)
        setSimilarLastPage(data.last_page)
      } catch (err) {
        if ((err as Error).name !== "AbortError" && !append) {
          setSimilarQuestions([])
        }
      } finally {
        setSimilarLoading(false)
        setSimilarLoadingMore(false)
        fetchSimilarAbortRef.current = null
      }
    },
    []
  )

  useEffect(() => {
    const draft = searchParams.get("draft")?.trim()
    if (!draft) return
    setMessageInput(draft)
    skipNextSimilarDebounceRef.current = true
  }, [searchParams])

  useEffect(() => {
    const trimmed = titleInput.trim() || messageInput.trim()
    if (!trimmed) return
    const delay = skipNextSimilarDebounceRef.current ? 0 : SIMILAR_DEBOUNCE_MS
    skipNextSimilarDebounceRef.current = false
    const timer = setTimeout(() => {
      fetchSimilar(trimmed, 1, false, similarFilterRef.current)
    }, delay)
    return () => clearTimeout(timer)
  }, [titleInput, messageInput, fetchSimilar])

  useEffect(() => {
    if (isAuthorized === 1) {
      void fetchMe()
    }
  }, [isAuthorized, fetchMe])

  const isPremiumUser = Boolean(user?.is_premium ?? user?.premium_is_active)
  const premiumQuestionCheckboxDisabled = Boolean(
    user && isPremiumUser && isPremiumQuestionChoiceDisabled(user),
  )
  const canAddFileAttachment = canAddAttachment(user?.attachment_remaining?.file)
  const canAddVideoAttachment = canAddAttachment(user?.attachment_remaining?.video)

  const canPublishQuestion = useMemo(
    () =>
      Boolean(
        titleInput.trim() &&
          messageInput.trim() &&
          selectedCategoryId &&
          selectedSubcategoryId,
      ),
    [titleInput, messageInput, selectedCategoryId, selectedSubcategoryId],
  )

  useEffect(() => {
    return () => {
      if (fileAttachment?.previewUrl) URL.revokeObjectURL(fileAttachment.previewUrl)
      if (videoAttachment?.previewUrl) URL.revokeObjectURL(videoAttachment.previewUrl)
    }
  }, [fileAttachment, videoAttachment])

  const onAddFileClick = useCallback(() => {
    if (!canAddFileAttachment) return
    fileInputRef.current?.click()
  }, [canAddFileAttachment])

  const onAddVideoClick = useCallback(() => {
    if (!canAddVideoAttachment) return
    videoInputRef.current?.click()
  }, [canAddVideoAttachment])

  const onAddLinkClick = useCallback(() => {
    setIsLinkModalOpen(true)
  }, [])

  const onFileSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setSubmitError(null)
    if (fileAttachment?.previewUrl) URL.revokeObjectURL(fileAttachment.previewUrl)
    setFileAttachment({ file: f, previewUrl: URL.createObjectURL(f) })
  }, [fileAttachment])

  const onVideoSelected = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setSubmitError(null)
    if (videoAttachment?.previewUrl) URL.revokeObjectURL(videoAttachment.previewUrl)
    setVideoAttachment({ file: f, previewUrl: URL.createObjectURL(f) })
  }, [videoAttachment])

  const handleLoadMoreSimilar = () => {
    const trimmed = titleInput.trim()
    if (!trimmed || similarCurrentPage >= similarLastPage || similarLoadingMore) return
    fetchSimilar(trimmed, similarCurrentPage + 1, true, similarFilter)
  }

  const handleSimilarFilterChange = (index: number) => {
    const filter = FILTERS[index].value
    setSimilarFilter(filter)
    const trimmed = titleInput.trim()
    if (trimmed) {
      fetchSimilar(trimmed, 1, false, filter)
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
    const description = messageInput.trim() || (fd.get("message") as string)?.trim()
    const receive_notifications = (fd.get("receive_notifications") as string) === "on"
    const allow_answer_comments = (fd.get("allow_answer_comments") as string) === "on"
    let is_premium = false
    if (user && isPremiumUser && !isPremiumQuestionChoiceDisabled(user)) {
      is_premium = (fd.get("is_premium") as string) === "on"
    }
    if (!title || !description) {
      setSubmitError("Заполните тему и текст вопроса.")
      return
    }
    if (containsSpamUnicode(title) || containsSpamUnicode(description)) {
      setSubmitError(PLAIN_TEXT_SPAM_MESSAGE)
      return
    }
    const category_id = selectedCategoryId ? Number(selectedCategoryId) : 0
    const subcategory_id = selectedSubcategoryId ? Number(selectedSubcategoryId) : 0
    if (!category_id || !subcategory_id) {
      setSubmitError("Выберите категорию и подкатегорию.")
      return
    }
    const token = getToken()
    if (!token) {
      setIsLoginModalOpen(true)
      return
    }

    setSubmitting(true)
    try {
      const fdSend = new FormData()
      fdSend.append("title", title)
      fdSend.append("description", description)
      fdSend.append("category_id", String(category_id))
      fdSend.append("subcategory_id", String(subcategory_id))
      fdSend.append("receive_notifications", receive_notifications ? "1" : "0")
      fdSend.append("allow_answer_comments", allow_answer_comments ? "1" : "0")
      fdSend.append("is_premium", is_premium ? "1" : "0")
      if (linkAttachment) fdSend.append("links", linkAttachment)
      if (fileAttachment?.file) fdSend.append("file", fileAttachment.file)
      if (videoAttachment?.file) fdSend.append("video", videoAttachment.file)

      const res = await fetch(getApiFullUrl("v1/questions"), {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: fdSend,
      })
      const data = (await res.json().catch(() => ({}))) as any
      if (!res.ok) {
        const first =
          data?.errors?.is_premium?.[0] ??
          data?.errors?.title?.[0] ??
          data?.errors?.description?.[0] ??
          data?.errors?.category_id?.[0] ??
          data?.errors?.subcategory_id?.[0] ??
          data?.message
        throw new Error(first || "Ошибка при создании вопроса")
      }

      router.push(`/question/${data.question.id}`)
    } catch (err: unknown) {
      setSubmitError((err as Error)?.message ?? "Ошибка при создании вопроса")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">Главная</Link>
          <span className="breadcrumbs__sep">•</span>
          <Link href="/categories" className="breadcrumbs__link">Категории вопросов</Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">Задать вопрос</span>
        </div>

        <div className="section ask_form_wrapper">
          <div className="blocks_title">
            <h1>Напишите свой вопрос здесь</h1>
          </div>

          <form className="ask_form form" onSubmit={handleSubmit}>
            <div className="ask_form_item">
              <input
                name="title"
                type="text"
                placeholder="Тема вопроса"
                required
                value={titleInput}
                onChange={(e) => setTitleInput(sanitizePlainTextInput(e.target.value))}
              />
            </div>
            <div className="ask_form_item ask_form_item_block_actions">
              <textarea
                ref={messageRef}
                name="message"
                placeholder="Как можно подробнее опишите свой вопрос"
                required
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(sanitizePlainTextInput(e.target.value))
                  resizeTextarea(e.target)
                }}
              />
              <div className="ask_form_item_actions">
                <div
                  className={!canAddFileAttachment ? "attachment-action-disabled" : undefined}
                  title={!canAddFileAttachment ? "Достигнут лимит публикаций с фото за сутки" : undefined}
                  onClick={onAddFileClick}
                >
                  <svg width="15.67" height="13.71"><use xlinkHref="#add-file"></use></svg>
                  <p><span>Добавить файл</span><span>Файл</span></p>
                </div>
                <div
                  className={!canAddVideoAttachment ? "attachment-action-disabled" : undefined}
                  title={!canAddVideoAttachment ? "Достигнут лимит публикаций с видео за сутки" : undefined}
                  onClick={onAddVideoClick}
                >
                  <svg width="13.71" height="12.73"><use xlinkHref="#add-video"></use></svg>
                  <p><span>Добавить видео</span><span>Видео</span></p>
                </div>
                <div onClick={onAddLinkClick}>
                  <svg width="12.73" height="12.73"><use xlinkHref="#add-link"></use></svg>
                  <p><span>Добавить ссылку</span><span>Ссылка</span></p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                style={{ display: "none" }}
                onChange={onFileSelected}
              />
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                style={{ display: "none" }}
                onChange={onVideoSelected}
              />

              {(fileAttachment || videoAttachment || linkAttachment) ? (
                <div className="form_attachments_preview">
                  {linkAttachment ? (
                    <div className="form_attachment_link_wrap">
                      <AnswerLinkUrl href={linkAttachment} />
                      <button
                        type="button"
                        className="form_attachment_remove_inline"
                        aria-label="Удалить ссылку"
                        onClick={() => setLinkAttachment(null)}
                      >
                        ×
                      </button>
                    </div>
                  ) : null}
                  {fileAttachment ? (
                    <div className="answer_media" style={{ marginTop: 0 }}>
                      <div className="answer_media_item answer_media_item--image">
                        <a
                          href={fileAttachment.previewUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Открыть изображение в новой вкладке"
                        >
                          <img src={fileAttachment.previewUrl} alt="" loading="lazy" decoding="async" />
                        </a>
                        <button
                          type="button"
                          className="form_attachment_remove_overlay"
                          aria-label="Удалить фото"
                          onClick={() => {
                            if (fileAttachment.previewUrl) URL.revokeObjectURL(fileAttachment.previewUrl)
                            setFileAttachment(null)
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <button
                        type="button"
                        style={{ display: "none" }}
                        aria-hidden
                      />
                    </div>
                  ) : null}
                  {videoAttachment ? (
                    <div className="answer_media" style={{ marginTop: 0 }}>
                      <div className="answer_media_item answer_media_item--inline-player answer_media_item--file-video">
                        <video
                          className="answer_media_inline_video"
                          src={videoAttachment.previewUrl}
                          controls
                          playsInline
                          preload="metadata"
                        />
                        <button
                          type="button"
                          className="form_attachment_remove_overlay"
                          aria-label="Удалить видео"
                          onClick={() => {
                            if (videoAttachment.previewUrl) URL.revokeObjectURL(videoAttachment.previewUrl)
                            setVideoAttachment(null)
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <button
                        type="button"
                        style={{ display: "none" }}
                        aria-hidden
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
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
            {submitError && (
              <p className="secondary_text" style={{ color: "#c00", marginTop: 12 }}>
                {submitError}
              </p>
            )}
            <div className="asf_form_actions">
              <div className="ask_from_send_btn">
                <button
                  type="submit"
                  className="m_btn category_btn"
                  disabled={submitting || (isAuthorized === 1 && !canPublishQuestion)}
                  title={
                    isAuthorized === 1 && !canPublishQuestion
                      ? "Укажите тему, текст вопроса, категорию и подкатегорию"
                      : undefined
                  }
                >
                  {submitting ? "Отправка…" : "Опубликовать вопрос"}
                </button>
                <p>Нажимая на кнопку, вы принимаете условия <a href="/user-agreement/" target="_blank">пользовательского соглашения</a></p>
              </div>
              <div className="ask_form_checkboxes">
                <label className="chechbox_item"><input type="checkbox" name="receive_notifications" defaultChecked /><span>Получать уведомления (ответы, голоса, комментарии)</span></label>
                <label className="chechbox_item"><input type="checkbox" name="allow_answer_comments" defaultChecked /><span>Разрешить комментарии к ответам</span></label>
                {isPremiumUser && user ? (
                  <div className="ask_premium_field">
                    <label
                      className={`ask_premium_btn ask_premium_btn--label ${premiumQuestionCheckboxDisabled ? "is-disabled" : ""}`}
                    >
                      <input
                        type="checkbox"
                        name="is_premium"
                        className="ask_premium_btn__check"
                        disabled={premiumQuestionCheckboxDisabled}
                        aria-label="Опубликовать как премиум-вопрос"
                      />
                      <svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg" className="premium_crown_icon" aria-hidden>
                        <path d="M16.949 7.47907L14.405 8.11407C14.3509 8.12793 14.2939 8.12578 14.241 8.10788C14.1881 8.08997 14.1416 8.05709 14.107 8.01323L11.3181 4.52671C11.1548 4.33729 10.9525 4.18532 10.725 4.08115C10.4976 3.97698 10.2504 3.92306 10.0002 3.92306C9.75009 3.92306 9.50288 3.97698 9.27545 4.08115C9.04802 4.18532 8.84572 4.33729 8.68233 4.52671L5.89257 8.01415C5.85701 8.057 5.81018 8.08906 5.75738 8.10672C5.70457 8.12438 5.64787 8.12693 5.59369 8.11408L3.05141 7.47907C2.85168 7.42913 2.64243 7.43175 2.44401 7.48666C2.24559 7.54157 2.06476 7.6469 1.91912 7.79241C1.77347 7.93792 1.66798 8.11865 1.61289 8.31702C1.5578 8.51539 1.55499 8.72464 1.60474 8.92442L3.19721 15.2925C3.28774 15.6581 3.4982 15.9827 3.79495 16.2146C4.0917 16.4464 4.45761 16.5721 4.8342 16.5716H15.1658C15.5424 16.5721 15.9083 16.4464 16.205 16.2146C16.5018 15.9827 16.7123 15.6581 16.8028 15.2925L18.3953 8.92442C18.445 8.72468 18.4422 8.51547 18.3872 8.31714C18.3321 8.1188 18.2267 7.93809 18.0811 7.79258C17.9355 7.64708 17.7547 7.54173 17.5563 7.48679C17.3579 7.43186 17.1487 7.42919 16.949 7.47907Z" fill="currentColor" />
                        <path d="M1.39535 6.74419C2.16598 6.74419 2.7907 6.11947 2.7907 5.34884C2.7907 4.57821 2.16598 3.95349 1.39535 3.95349C0.624719 3.95349 0 4.57821 0 5.34884C0 6.11947 0.624719 6.74419 1.39535 6.74419Z" fill="currentColor" />
                        <path d="M18.6047 6.74419C19.3753 6.74419 20 6.11947 20 5.34884C20 4.57821 19.3753 3.95349 18.6047 3.95349C17.834 3.95349 17.2093 4.57821 17.2093 5.34884C17.2093 6.11947 17.834 6.74419 18.6047 6.74419Z" fill="currentColor" />
                        <path d="M10 2.7907C10.7706 2.7907 11.3953 2.16598 11.3953 1.39535C11.3953 0.624719 10.7706 0 10 0C9.22937 0 8.60465 0.624719 8.60465 1.39535C8.60465 2.16598 9.22937 2.7907 10 2.7907Z" fill="currentColor" />
                      </svg>
                      <span>{formatPremiumAskButtonLabel(user)}</span>
                    </label>
                    {premiumQuestionCheckboxDisabled ? (
                      <button
                        type="button"
                        className="ask_premium_upsell_btn"
                        onClick={() => setVipModalOpen(true)}
                      >
                        Продлить подписку
                      </button>
                    ) : null}
                  </div>
                ) : null}
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
                    className={`s_btn ${similarFilter === tab.value ? "s_btn_active" : ""} ${tab.value === "premium" ? "premium-filter-btn" : ""}`}
                    onClick={() => handleSimilarFilterChange(index)}
                  >
                    {tab.value === "premium" ? (
                      <>
                        <PremiumFilterCrownIcon />
                        {tab.label}
                      </>
                    ) : (
                      tab.label
                    )}
                  </button>
                ))}
              </div>
            </div>
            {!titleInput.trim() ? (
              <p className="secondary_text" style={{ padding: "20px 0", textAlign: "center" }}>
                Введите тему вопроса для поиска похожих
              </p>
            ) : similarLoading && similarCurrentPage === 1 ? (
              <p className="secondary_text" style={{ padding: "20px 0", textAlign: "center" }}>
                Поиск похожих вопросов…
              </p>
            ) : similarQuestions.length === 0 ? (
              <p className="secondary_text" style={{ padding: "20px 0", textAlign: "center" }}>
                Нет похожих вопросов
              </p>
            ) : (
              <>
                <div className="questions_list">
                  {similarQuestions.map((q) => (
              <div key={q.id} className={`question_list_item ${q.is_premium ? "premium-question" : ""}`}>
                <div className="question_item_top_data">
                  <div className="question_item_top_data_left">
                    <img src={q.latest_likers[0]?.avatar_url ?? "/images/icons/avatar.svg"} alt="" />
                    <div className="question_list_item_left__user_meta">
                      <p className="main_text" title={q.title}>{q.title}</p>
                      <span title={compactCountTitle(q.likes_count)}>
                        {formatCompactNumWord(q.likes_count, ["лайк", "лайка", "лайков"])}
                      </span>
                    </div>
                  </div>
                  <div className="question_item_top_data_right">
                    <button
                      type="button"
                      className={`s_btn s_btn_icon btn-like ${isFavorited(q.id) ? "btn-like--active" : ""}`}
                      onClick={() => toggleFavorite(q.id)}
                      disabled={isPending(q.id)}
                      title="Мне нравится"
                    >
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
                    <div className="question_list_item_left__user_meta">
                      <p className="main_text" title={q.title}>{q.title}</p>
                      <span title={compactCountTitle(q.likes_count)}>
                        {formatCompactNumWord(q.likes_count, ["лайк", "лайка", "лайков"])}
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="question_list_item_right">
                  <div className="question_list_item_users">
                    {q.latest_likers.slice(0, 3).map((u) => (
                      <img key={u.id} src={u.avatar_url} alt="" />
                    ))}
                    <p className="main_text" title={compactCountTitle(q.likes_count)}>
                      {formatCompactCountPlus(q.likes_count)}
                    </p>
                  </div>
                  <div className="question_list_item_right_actions">
                    <button
                      type="button"
                      className={`s_btn s_btn_icon btn-like ${isFavorited(q.id) ? "btn-like--active" : ""}`}
                      onClick={() => toggleFavorite(q.id)}
                      disabled={isPending(q.id)}
                      title="Мне нравится"
                    >
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
                {similarCurrentPage < similarLastPage && (
                  <div className="show_more_btn_wrapper">
                    <button
                      type="button"
                      className="show_more_btn"
                      onClick={handleLoadMoreSimilar}
                      disabled={similarLoadingMore}
                    >
                      <svg width="22" height="22"><use xlinkHref="#sync"></use></svg>
                      {similarLoadingMore ? "Загрузка…" : "Загрузить еще"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        <div className="line" />

        <TopsBlock data={initialData} />

        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
        <QuestionModal isOpen={isQuestionModalOpen} onClose={() => setIsQuestionModalOpen(false)} />
        <SharePopup isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} anchorRef={shareButtonRef} title={shareData.title} url={shareData.url} />
        <VipPurchaseModal isOpen={vipModalOpen} onClose={() => setVipModalOpen(false)} planName="Премиум-вопрос" />
        <LinkInputModal
          isOpen={isLinkModalOpen}
          initialValue={linkAttachment}
          onClose={() => setIsLinkModalOpen(false)}
          onSubmit={(url) => setLinkAttachment(url)}
        />
      </div>
      <Footer />
    </>
  )
}
