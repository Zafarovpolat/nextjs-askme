'use client'

import { useEffect, useState } from "react"
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
import { LEGAL_FOOTER_SLUGS, legalFooterHref } from "@/lib/legal-footer-slugs"
import { api } from "@/lib/api-client"

type LegalDocMeta = {
  id: number
  slug: string
  version: number
  title: string
  url: string
} | null

type LegalMeta = {
  user_agreement: LegalDocMeta
  privacy_policy: LegalDocMeta
}

export default function SignupPageClient() {
  const router = useRouter()
  const register = useAuthStore((s) => s.register)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [legalMeta, setLegalMeta] = useState<LegalMeta | null>(null)
  const [legalMetaError, setLegalMetaError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await api.get<LegalMeta>("v1/custom-pages/legal-meta")
        if (cancelled) return
        if (!data.user_agreement?.version || !data.privacy_policy?.version) {
          setLegalMetaError("Не удалось загрузить актуальные редакции документов.")
          setLegalMeta(null)
          return
        }
        setLegalMeta(data)
        setLegalMetaError(null)
      } catch {
        if (!cancelled) {
          setLegalMeta(null)
          setLegalMetaError("Не удалось загрузить актуальные редакции документов. Обновите страницу.")
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const agreementHref = legalFooterHref(LEGAL_FOOTER_SLUGS.userAgreement)
  const privacyHref = legalFooterHref(LEGAL_FOOTER_SLUGS.privacyPolicy)

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
    const acceptLegal = fd.get("accept_legal") === "on"
    const advertisingConsent = fd.get("advertising_consent") === "on"

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
    if (!legalMeta?.user_agreement || !legalMeta?.privacy_policy) {
      setError(legalMetaError || "Недоступны актуальные редакции политик. Обновите страницу.")
      return
    }
    if (!acceptLegal) {
      setError("Необходимо принять пользовательское соглашение и политику конфиденциальности.")
      return
    }

    setLoading(true)
    try {
      await register({
        first_name,
        email,
        password,
        password_confirmation,
        gender,
        accept_legal: true,
        advertising_consent: advertisingConsent,
      })
      router.push("/login")
    } catch (err: unknown) {
      const e = err as Error & { errors?: Record<string, string[]> }
      const msg =
        e.errors?.accept_legal?.[0] ??
        e.errors?.email?.[0] ??
        e.errors?.password?.[0] ??
        e.errors?.first_name?.[0] ??
        e.message ??
        "Ошибка регистрации"
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const canSubmit = Boolean(legalMeta?.user_agreement && legalMeta?.privacy_policy) && !loading

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
            {legalMetaError && (
              <p className="login_error" style={{ color: "#c00", marginBottom: 8 }}>{legalMetaError}</p>
            )}
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
                <div className="signup_checkboxes">
                  <label className="chechbox_item signup_checkbox_item">
                    <HydrationSafeInput type="checkbox" name="accept_legal" required disabled={!canSubmit && !loading} />
                    <span>
                      Принимаю{" "}
                      <Link href={agreementHref} target="_blank">
                        пользовательское соглашение
                      </Link>
                      {" "}и{" "}
                      <Link href={privacyHref} target="_blank">
                        политику конфиденциальности
                      </Link>
                    </span>
                  </label>
                  <label className="chechbox_item signup_checkbox_item">
                    <HydrationSafeInput type="checkbox" name="advertising_consent" />
                    <span>Согласен на получение рекламных и информационных сообщений</span>
                  </label>
                </div>
                <div className="signup_submit_block">
                  <button type="submit" className="m_btn category_btn" disabled={!canSubmit}>
                    {loading ? "Регистрация…" : "Регистрация"}
                  </button>
                </div>
              </div>
              <div className="login_socials auth_socials">
                <p>Регистрация через<br /> социальные сети</p>
                <SocialAuthButtons />
                <div className="ask_from_send_btn">
                  <button type="submit" className="m_btn category_btn" disabled={!canSubmit}>
                    Регистрация
                  </button>
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
