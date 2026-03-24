'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"

export default function LoginPage() {
  const router = useRouter()
  const login = useAuthStore((s) => s.login)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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
      <Header />

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
            {error && <p className="login_error" style={{ color: "#c00", marginBottom: 8 }}>{error}</p>}
            <div className="login_input">
              <input type="email" name="email" placeholder="Ваша почта" required autoComplete="email" />
            </div>
            <div className="login_input">
              <input type="password" name="password" placeholder="Пароль" required autoComplete="current-password" />
            </div>
            <div className="login_content_actions">
              <button className="m_btn category_btn" type="submit" disabled={loading}>
                {loading ? "Вход…" : "Войти в аккаунт"}
              </button>
              <p style={{ marginTop: 8 }}>
                Нет аккаунта? <Link href="/signup">Регистрация</Link>
              </p>
              <div className="login_socials">
                <p>Войти через<br />социальные сети</p>
                <div className="login_socials_list">
                  <div>
                    <svg width="22" height="12">
                      <use xlinkHref="#vk"></use>
                    </svg>
                  </div>
                  <div>
                    <svg width="20" height="20">
                      <use xlinkHref="#ok"></use>
                    </svg>
                  </div>
                  <div>
                    <svg width="23" height="18">
                      <use xlinkHref="#discord"></use>
                    </svg>
                  </div>
                  <div>
                    <svg width="17" height="16">
                      <use xlinkHref="#tg"></use>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}
