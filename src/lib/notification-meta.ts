/** Нормализация и UI-метаданные уведомлений. */

import { toPlainNotificationText } from '@/lib/plain-notification-text'

export type NotificationActor = {
  id: number
  name: string
  avatar_url: string
  avatar_url_2x?: string | null
}

export type NotificationApiItem = {
  id: number
  title?: string | null
  hint?: string | null
  url?: string | null
  text: string
  is_read: boolean
  data?: Record<string, unknown> | null
  actor?: NotificationActor | null
  created_at: string
}

export type NotificationComplaintTarget =
  | { questionId: number }
  | { answerId: number }

export type NotificationViewModel = NotificationApiItem & {
  type: string | null
  typeLabel: string
  isPointsRelated: boolean
  actorName: string
  actorAvatarUrl: string | null
  actorAvatarUrl2x: string | null
  actorProfileHref: string | null
  canReply: boolean
  replyHref: string | null
  complaint: NotificationComplaintTarget | null
  shareHref: string | null
}

function asPositiveInt(value: unknown): number | null {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? Math.trunc(n) : null
}

function parseActorNameFromHint(hint: string | null | undefined): string | null {
  const text = (hint ?? '').trim()
  if (!text) return null
  for (const marker of [' ответил', ' прокомментировал', ' оценил', ' лайкнул']) {
    const idx = text.indexOf(marker)
    if (idx > 0) return text.slice(0, idx).trim()
  }
  return null
}

export function isPointsNotification(
  type: string | null,
  data: Record<string, unknown> | null
): boolean {
  if (type === 'level_up') return true
  if (data && 'delta_balls' in data) return true
  if (type && (type.includes('bonus') || type.includes('reward') || type.includes('balls'))) {
    return true
  }
  return false
}

export function notificationTypeLabel(type: string | null, data: Record<string, unknown> | null): string {
  if (type === 'answer_created') return 'Ответы'
  if (type === 'answer_comment_created') return 'Новый комментарий'
  if (type && (type.includes('like') || type === 'question_liked_author_bonus')) return 'Лайки'
  if (isPointsNotification(type, data)) return 'Баллы'
  return 'Системные'
}

export function buildNotificationViewModel(item: NotificationApiItem): NotificationViewModel {
  const data = item.data && typeof item.data === 'object' ? item.data : null
  const type = data && typeof data.type === 'string' ? data.type : null
  const questionId = asPositiveInt(data?.question_id)
  const answerId = asPositiveInt(data?.answer_id)
  const parentAnswerId = asPositiveInt(data?.parent_answer_id)
  const rootAnswerId = asPositiveInt(data?.root_answer_id) ?? parentAnswerId

  const actorFromApi = item.actor && typeof item.actor === 'object' ? item.actor : null
  const actorId =
    asPositiveInt(actorFromApi?.id) ??
    asPositiveInt(data?.actor_id)

  const actorName =
    (actorFromApi?.name && String(actorFromApi.name).trim()) ||
    (typeof data?.actor_name === 'string' && data.actor_name.trim()) ||
    parseActorNameFromHint(item.hint) ||
    (type === 'answer_created' || type === 'answer_comment_created' ? 'Пользователь' : 'Системные')

  const actorAvatarUrl = actorFromApi?.avatar_url?.trim() || null
  const actorAvatarUrl2x = actorFromApi?.avatar_url_2x?.trim() || null
  const actorProfileHref = actorId != null ? `/profile/${actorId}` : null

  const canReply =
    (type === 'answer_created' || type === 'answer_comment_created') && questionId != null

  let replyHref: string | null = null
  if (canReply && questionId != null) {
    if (type === 'answer_comment_created' && answerId != null) {
      const root = rootAnswerId ?? answerId
      const hash =
        root !== answerId
          ? `#answer-${root}-coment-${answerId}`
          : `#answer-${answerId}`
      replyHref = `/question/${questionId}?reply_to=${answerId}&reply_name=${encodeURIComponent(actorName)}${hash}`
    } else {
      replyHref = `/question/${questionId}?reply=1#answer`
    }
  }

  let complaint: NotificationComplaintTarget | null = null
  if (answerId != null) complaint = { answerId }
  else if (questionId != null) complaint = { questionId }

  const shareHref =
    item.url?.trim() ||
    (questionId != null ? `/question/${questionId}` : null)

  return {
    ...item,
    url: item.url?.trim() || shareHref,
    text: toPlainNotificationText(item.text, 160),
    type,
    typeLabel: notificationTypeLabel(type, data),
    isPointsRelated: isPointsNotification(type, data),
    actorName,
    actorAvatarUrl,
    actorAvatarUrl2x,
    actorProfileHref,
    canReply,
    replyHref,
    complaint,
    shareHref,
  }
}
