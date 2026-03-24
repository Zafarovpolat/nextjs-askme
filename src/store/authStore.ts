'use client'

import { create } from 'zustand'
import { api } from '@/lib/api-client'
import { getToken, removeToken, setToken } from '@/lib/cookies'
import type { ApiUser } from '@/types'

type AuthState = {
  user: ApiUser | null
  isAuthorized: 0 | 1
  isLoading: boolean
  fetchMe: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  register: (data: { first_name: string; email: string; password: string; password_confirmation: string; gender?: number }) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthorized: 0,
  isLoading: true,

  fetchMe: async () => {
    const token = getToken()
    if (!token) {
      set({ user: null, isAuthorized: 0, isLoading: false })
      return
    }
    try {
      const data = await api.get<{ user: ApiUser }>('v1/me')
      set({ user: data.user, isAuthorized: 1, isLoading: false })
    } catch {
      removeToken()
      set({ user: null, isAuthorized: 0, isLoading: false })
    }
  },

  login: async (email: string, password: string) => {
    const data = await api.post<{ user: ApiUser; token: string }>('v1/auth/login', { email, password })
    setToken(data.token)
    set({ user: data.user, isAuthorized: 1 })
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
    const token = getToken()
    if (token) {
      api.post('v1/auth/logout').catch(() => {})
    }
    removeToken()
    set({ user: null, isAuthorized: 0 })
  },
}))
