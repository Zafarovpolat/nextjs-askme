'use client'

import { create } from 'zustand'
import { api } from '@/lib/api-client'
import { clearOAuthCallbackGuard } from '@/lib/auth-constants'
import { getToken, removeToken, setToken } from '@/lib/cookies'
import type { ApiUser } from '@/types'
import { useFavoritesStore } from './favoritesStore'

export type AuthNotification = {
  id: number
  title?: string | null
  hint?: string | null
  url?: string | null
  text: string
  is_read: boolean
  data?: Record<string, unknown> | null
  created_at: string
}

type MeHydratePayload = {
  user: ApiUser
  favorite_question_ids: number[]
  favorite_answer_ids: number[]
  subscribed_user_ids: number[]
  subscribed_question_ids: number[]
  notifications?: AuthNotification[]
}

type AuthState = {
  user: ApiUser | null
  isAuthorized: 0 | 1
  isLoading: boolean
  notifications: AuthNotification[]
  patchUser: (patch: Partial<ApiUser>) => void
  /** Синхронизировать с БД после mark-read (сид из /me иначе остаётся со старым is_read). */
  markNotificationsRead: (ids: number[]) => void
  /** Все уведомления в сторе — прочитаны (после mark-all-read). */
  markAllNotificationsRead: () => void
  /** Заполнить стор из ответа /me без сети (например после SSR профиля). */
  hydrateFromMe: (data: MeHydratePayload) => void
  fetchMe: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithToken: (token: string) => Promise<void>
  register: (data: { first_name: string; email: string; password: string; password_confirmation: string; gender?: number }) => Promise<void>
  logout: () => void
}

/** Один параллельный /me на клиенте (React Strict Mode и двойные эффекты). */
let fetchMeInFlight: Promise<void> | null = null
/** Смена epoch при logout/loginWithToken — игнорируем ответы устаревших запросов /me. */
let authEpoch = 0

function bumpAuthEpoch(): void {
  authEpoch += 1
  fetchMeInFlight = null
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthorized: 0,
  isLoading: true,
  notifications: [],
  patchUser: (patch) => set((state) => ({
    user: state.user ? { ...state.user, ...patch } : state.user,
  })),

  markNotificationsRead: (ids) => {
    if (ids.length === 0) {
      return
    }
    const idSet = new Set(ids)
    set((state) => ({
      notifications: state.notifications.map((n) =>
        idSet.has(n.id) ? { ...n, is_read: true } : n,
      ),
    }))
  },

  markAllNotificationsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.is_read ? n : { ...n, is_read: true },
      ),
    }))
  },

  hydrateFromMe: (data) => {
    set({ user: data.user, isAuthorized: 1, isLoading: false, notifications: data.notifications ?? [] })
    useFavoritesStore.getState().setFromMe({
      favorite_question_ids: data.favorite_question_ids ?? [],
      favorite_answer_ids: data.favorite_answer_ids ?? [],
      subscribed_user_ids: data.subscribed_user_ids ?? [],
      subscribed_question_ids: data.subscribed_question_ids ?? [],
    })
  },

  fetchMe: async () => {
    const epoch = authEpoch

    if (fetchMeInFlight) {
      await fetchMeInFlight
      if (epoch !== authEpoch) {
        return get().fetchMe()
      }
      // Параллельный /me мог завершиться без записи в стор (смена authEpoch).
      if (getToken() && get().isAuthorized === 0) {
        return get().fetchMe()
      }
      return
    }

    fetchMeInFlight = (async () => {
      const token = getToken()
      if (!token) {
        if (epoch !== authEpoch) return
        set({ user: null, isAuthorized: 0, isLoading: false, notifications: [] })
        useFavoritesStore.getState().clear()
        return
      }
      try {
        const data = await api.get<{
          user: ApiUser
          favorite_question_ids: number[]
          favorite_answer_ids: number[]
          subscribed_user_ids: number[]
          subscribed_question_ids: number[]
          notifications?: AuthNotification[]
        }>('v1/me')
        if (epoch !== authEpoch) return
        set({ user: data.user, isAuthorized: 1, isLoading: false, notifications: data.notifications ?? [] })
        useFavoritesStore.getState().setFromMe({
          favorite_question_ids: data.favorite_question_ids ?? [],
          favorite_answer_ids: data.favorite_answer_ids ?? [],
          subscribed_user_ids: data.subscribed_user_ids ?? [],
          subscribed_question_ids: data.subscribed_question_ids ?? [],
        })
      } catch {
        if (epoch !== authEpoch) return
        removeToken()
        set({ user: null, isAuthorized: 0, isLoading: false, notifications: [] })
        useFavoritesStore.getState().clear()
      }
    })()
    try {
      await fetchMeInFlight
    } finally {
      fetchMeInFlight = null
    }
  },

  login: async (email: string, password: string) => {
    const data = await api.post<{ user: ApiUser; token: string }>('v1/auth/login', { email, password })
    setToken(data.token)
    set({ user: data.user, isAuthorized: 1 })
    await get().fetchMe()
  },

  loginWithToken: async (token: string) => {
    bumpAuthEpoch()
    setToken(token)
    set({ isLoading: true })
    useFavoritesStore.getState().clear()
    await get().fetchMe()
  },

  register: async (payload) => {
    await api.post<{ message: string }>('v1/auth/register', {
      first_name: payload.first_name,
      email: payload.email,
      password: payload.password,
      password_confirmation: payload.password_confirmation,
      gender: payload.gender ?? 0,
    })
    // После регистрации не логиним — редирект на страницу входа
  },

  logout: () => {
    bumpAuthEpoch()
    clearOAuthCallbackGuard()
    const token = getToken()
    if (token) {
      api.post('v1/auth/logout').catch(() => {})
    }
    removeToken()
    useFavoritesStore.getState().clear()
    set({ user: null, isAuthorized: 0, isLoading: false, notifications: [] })
  },
}))
