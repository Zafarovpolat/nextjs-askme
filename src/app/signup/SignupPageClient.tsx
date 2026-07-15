'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { useAuthStore } from "@/store/authStore"
import SocialAuthButtons from "@/components/SocialAuthButtons"
import {
  sanitizeUserFirstNameInput,
  USER_FIRST_NAME_MAX_LENGTH,
  validateUserFirstName,
} from "@/lib/user-first-name"
import { HydrationSafeInput } from "@/components/HydrationSafeInput"

export default function SignupPageClient() {
  const router = useRouter()
  const register = useAuthStore((s) => s.register)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    const first_name = (fd.get("first_name") as string)?.trim()
    const email = (fd.get("email") as string)?.trim()
    const password = fd.get("password") as string
    const password_confirmation = fd.get("password_confirmation") as string
    const genderRaw = fd.get("gender") as string
    const gender = genderRaw === "female" ? 2 : genderRaw === "male" ? 1 : 0

    const nameError = validateUserFirstName(first_name ?? "")
    if (nameError) {
      setError(nameError)
      return
    }
    if (!email || !password) {
      setError("Заполните email и пароль.")
      return
    }
    if (password.length < 8) {
      setError("Пароль не менее 8 символов.")
      return
    }
    if (password !== password_confirmation) {
      setError("Пароли не совпадают.")
      return
    }

    setLoading(true)
    try {
      await register({ first_name, email, password, password_confirmation, gender })
      router.push("/login")
    } catch (err: unknown) {
      const e = err as Error & { errors?: Record<string, string[]> }
      const msg = e.errors?.email?.[0] ?? e.errors?.password?.[0] ?? e.errors?.first_name?.[0] ?? e.message ?? "Ошибка регистрации"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth_page_layout">
      <div className="login_container">
        <div className="auth_page">
          <svg width="457" height="353.5" className="auth_block_bg">
            <use xlinkHref="#login-bg"></use>
          </svg>

          <svg className="auth_block_rect" width="124.601562" height="42">
            <use xlinkHref="#main-rect"></use>
          </svg>

          <div className="login_block_title">
            <h2>Регистрация</h2>
          </div>

          <form method="POST" className="login_block_content signup_form" onSubmit={handleSubmit}>
            {error && <p className="login_error" style={{ color: "#c00", marginBottom: 8 }}>{error}</p>}
            <div className="auth_page_wrapper">
              <div className="auth_form">
                <div className="login_input">
                  <HydrationSafeInput
                    type="text"
                    placeholder="Имя"
                    name="first_name"
                    required
                    autoComplete="given-name"
                    maxLength={USER_FIRST_NAME_MAX_LENGTH}
                    onChange={(e) => {
                      e.currentTarget.value = sanitizeUserFirstNameInput(e.currentTarget.value)
                    }}
                  />
                </div>
                <div className="login_input">
                  <HydrationSafeInput type="email" placeholder="Ваш почтовый ящик" name="email" required autoComplete="email" />
                </div>
                <div className="select_gender">
                  <p>Ваш пол</p>
                  <div className="select_gender_items">
                    <label>
                      <HydrationSafeInput type="radio" name="gender" value="male" defaultChecked />
                      <span>Мужской</span>
                    </label>
                    <label>
                      <HydrationSafeInput type="radio" name="gender" value="female" />
                      <span>Женский</span>
                    </label>
                  </div>
                </div>
                <div className="login_input">
                  <HydrationSafeInput type="password" name="password" placeholder="Пароль (не менее 8 символов)" required minLength={8} autoComplete="new-password" />
                </div>
                <div className="login_input">
                  <HydrationSafeInput type="password" name="password_confirmation" placeholder="Подтвердить пароль" required autoComplete="new-password" />
                </div>
                <div className="ask_from_send_btn">
                  <button type="submit" className="m_btn category_btn" disabled={loading}>
                    {loading ? "Регистрация…" : "Регистрация"}
                  </button>
                  <label className="checkbox">
                    <HydrationSafeInput type="checkbox" name="terms" required />
                    <span>
                      Нажимая на кнопку, вы принимаете условия{" "}
                      <Link href="/user-agreement" target="_blank">
                        пользовательского соглашения
                      </Link>
                    </span>
                  </label>
                </div>
              </div>
              <div className="login_socials auth_socials">
                <p>Регистрация через<br /> социальные сети</p>
                <SocialAuthButtons />
                <div className="ask_from_send_btn">
                  <button type="submit" className="m_btn category_btn">
                    Регистрация
                  </button>
                  <p>
                    Нажимая на кнопку, вы принимаете условия{' '}
                    <Link href="/user-agreement" target="_blank">
                      пользовательского соглашения
                    </Link>
                  </p>
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
