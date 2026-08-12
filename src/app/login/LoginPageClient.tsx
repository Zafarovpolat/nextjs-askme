'use client'

import { Suspense, useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"
import SocialAuthButtons from "@/components/SocialAuthButtons"
import LoginOAuthError from "@/components/LoginOAuthError"
import ForgotPasswordModal from "@/components/ForgotPasswordModal"
import PasswordChangedNoticeGate from "@/components/PasswordChangedNoticeGate"
import LoginPasswordActivate, {
  LOGIN_ACTIVATE_ERROR_KEY,
} from "@/components/LoginPasswordActivate"
import { HydrationSafeInput } from "@/components/HydrationSafeInput"

export default function LoginPageClient() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(LOGIN_ACTIVATE_ERROR_KEY)
      if (saved) {
        setError(saved)
        sessionStorage.removeItem(LOGIN_ACTIVATE_ERROR_KEY)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const handleActivateError = useCallback((message: string | null) => {
    setError(message)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    const email = (fd.get("email") as string)?.trim()
    const password = fd.get("password") as string

    if (!email || !password) {
      setError("Введите email и пароль.")
      return
    }

    setLoading(true)
    try {
      await login(email, password)
      router.push("/")
    } catch (err: unknown) {
      const e = err as Error & { errors?: Record<string, string[]> }
      const msg = e.errors?.email?.[0] ?? e.message ?? "Ошибка входа"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth_page_layout">
      <div className="login_container">
        <div className="login_block">
          <svg width="457" height="353.5" className="login_block_bg">
            <use xlinkHref="#login-bg"></use>
          </svg>

          <svg className="login_block_rect" width="124.601562" height="42">
            <use xlinkHref="#main-rect"></use>
          </svg>

          <div className="login_block_title">
            <h2><span className="login_title_full">Вход в аккаунт</span><span className="login_title_short">Вход</span></h2>
          </div>

          <form method="POST" className="login_block_content login_form" onSubmit={handleSubmit}>
            <Suspense fallback={null}>
              <LoginPasswordActivate onError={handleActivateError} />
              <PasswordChangedNoticeGate />
              <LoginOAuthError />
            </Suspense>
            {error && <p className="login_error" style={{ color: "#c00", marginBottom: 8 }}>{error}</p>}
            <div className="login_input login_input_icon">
              <svg className="login_input_svg login_input_svg--accent" width="14" height="12" aria-hidden>
                <use xlinkHref="#login-mail" />
              </svg>
              <HydrationSafeInput type="email" name="email" placeholder="Ваша почта" required autoComplete="email" />
            </div>
            <div className="login_input login_input_icon login_input_password">
              <svg className="login_input_svg login_input_svg--accent" width="12" height="15" aria-hidden>
                <use xlinkHref="#login-lock" />
              </svg>
              <HydrationSafeInput
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Пароль"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login_password_toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                <svg width="20" height="14" aria-hidden>
                  <use xlinkHref={showPassword ? "#login-eye" : "#login-eye-off"} />
                </svg>
              </button>
            </div>
            <button
              type="button"
              className="login_forgot_link"
              onClick={() => setForgotPasswordOpen(true)}
            >
              Забыли пароль?
            </button>
            <div className="login_content_actions">
              <div className="login_content_actions_btns">
                <button className="m_btn category_btn" type="submit" disabled={loading}>
                  {loading ? "Вход…" : "Войти в аккаунт"}
                </button>
                <Link href="/signup" className="m_btn category_btn">
                  Регистрация
                </Link>
              </div>
              <div className="login_socials">
                <p>Войти через<br />социальные сети</p>
                <SocialAuthButtons />
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />

      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </div>
  )
}
