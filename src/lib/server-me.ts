import { cookies } from 'next/headers'
import { cache } from 'react'
import { getApiFullUrl } from '@/config/api'
import { AUTH_TOKEN_COOKIE_KEY } from '@/lib/auth-constants'
import type { ApiUser } from '@/types'

/** Ответ GET /v1/me (фрагмент, достаточный для гидрации и профиля) */
export type MeApiResponse = {
  user: ApiUser
  favorite_question_ids?: number[]
  favorite_answer_ids?: number[]
  subscribed_user_ids?: number[]
  subscribed_question_ids?: number[]
  my_questions?: unknown[]
  notifications?: unknown[]
}

export async function fetchMeOnServer(): Promise<MeApiResponse | null> {
  const token = cookies().get(AUTH_TOKEN_COOKIE_KEY)?.value
  if (!token) {
    return null
  }
  const url = getApiFullUrl('v1/me')
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    /** Кэш между SSR-запросами; внутри одного запроса страницы дедуп через `cache()`. */
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    return null
  }
  return (await res.json()) as MeApiResponse
}

/** Один запрос к /me на серверный рендер (общий для `generateMetadata` и страницы). */
export const fetchMeOnServerCached = cache(fetchMeOnServer)
