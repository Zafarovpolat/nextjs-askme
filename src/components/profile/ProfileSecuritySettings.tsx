'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api-client'
import { showSystemToast } from '@/store/systemToastStore'
import { useAuthStore } from '@/store/authStore'
import { HydrationSafeInput } from '@/components/HydrationSafeInput'
import EmailStatusModal, { type EmailStatusModalVariant } from '@/components/EmailStatusModal'

/**
 * verify — подтверждение уже привязанного адреса (письмо на него же)
 * add    — привязка первого адреса (письмо на новый адрес)
 * change — смена адреса (письмо на текущий адрес)
 */
type EmailAction = 'verify' | 'add' | 'change'

const ACTION_LABELS: Record<EmailAction, string> = {
  verify: 'Подтвердить E-mail',
  add: 'Добавить E-mail',
  change: 'Сменить E-mail',
}

export const EMAIL_CONFIRMED_ERROR_KEY = 'otvetai:email_confirm_error'

export default function ProfileSecuritySettings() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((s) => s.user)
  const fetchMe = useAuthStore((s) => s.fetchMe)

  const currentEmail = user?.has_real_email ? (user.email ?? '') : ''
  const emailVerified = !!user?.email_verified_at

  const [email, setEmail] = useState(currentEmail)
  const emailTouched = useRef(false)
  const [emailSaving, setEmailSaving] = useState(false)
  /** Адрес, по которому уже отправляли письмо в этой сессии — для режима «Отправить письмо повторно» */
  const [sentFor, setSentFor] = useState<string | null>(null)

  const [modalVariant, setModalVariant] = useState<EmailStatusModalVariant | null>(null)
  const [modalEmail, setModalEmail] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)

  // Пока поле не трогали руками — держим в нём актуальную почту аккаунта
  useEffect(() => {
    if (!emailTouched.current) {
      setEmail(currentEmail)
    }
  }, [currentEmail])

  const normalizedEmail = email.trim().toLowerCase()
  const isSameAsCurrent = !!currentEmail && normalizedEmail === currentEmail.toLowerCase()

  const action: EmailAction = useMemo(() => {
    if (!currentEmail) return 'add'
    if (isSameAsCurrent) return emailVerified ? 'change' : 'verify'
    return 'change'
  }, [currentEmail, isSameAsCurrent, emailVerified])

  const isResendMode = !!sentFor && sentFor === normalizedEmail
  const emailButtonLabel = isResendMode ? 'Отправить письмо повторно' : ACTION_LABELS[action]
  const emailButtonDisabled =
    emailSaving || !normalizedEmail || (action === 'change' && isSameAsCurrent && !isResendMode)

  // Возврат по ссылке подтверждения смены почты
  useEffect(() => {
    if (searchParams.get('email_confirmed') !== '1') return

    setModalEmail(null)
    setModalVariant('bound-confirmed')
    setSentFor(null)
    emailTouched.current = false

    const params = new URLSearchParams(searchParams.toString())
    params.delete('email_confirmed')
    router.replace(`/profile?${params.toString()}`, { scroll: false })
  }, [searchParams, router])

  useEffect(() => {
    const stored = sessionStorage.getItem(EMAIL_CONFIRMED_ERROR_KEY)
    if (stored) {
      sessionStorage.removeItem(EMAIL_CONFIRMED_ERROR_KEY)
      showSystemToast(stored, 'error')
    }
  }, [])

  const submitEmail = async () => {
    if (emailSaving) return

    if (!normalizedEmail) {
      showSystemToast('Введите E-mail', 'error')
      return
    }

    setEmailSaving(true)
    try {
      if (action === 'verify') {
        await api.post('v1/auth/email/resend', {})
        setModalEmail(normalizedEmail)
        setModalVariant('sent-to-current')
      } else {
        await api.post('v1/me/email', { email: normalizedEmail })
        setModalEmail(normalizedEmail)
        setModalVariant('bound-unconfirmed')
        await fetchMe()
      }
      setSentFor(normalizedEmail)
    } catch (err: unknown) {
      const e = err as Error & { errors?: Record<string, string[]> }
      const msg = e.errors?.email?.[0] || e.message || 'Не удалось отправить письмо'
      showSystemToast(msg, 'error')
    } finally {
      setEmailSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordSaving) return

    if (!currentPassword || !password || !passwordConfirmation) {
      showSystemToast('Заполните все поля пароля', 'error')
      return
    }
    if (password.length < 8) {
      showSystemToast('Новый пароль должен быть не короче 8 символов', 'error')
      return
    }
    if (password !== passwordConfirmation) {
      showSystemToast('Новый пароль и подтверждение не совпадают', 'error')
      return
    }

    setPasswordSaving(true)
    try {
      const data = await api.post<{ message?: string }>('v1/me/password', {
        current_password: currentPassword,
        password,
        password_confirmation: passwordConfirmation,
      })
      showSystemToast(data.message || 'Пароль успешно изменён.', 'success')
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirmation('')
    } catch (err: unknown) {
      const e = err as Error & { errors?: Record<string, string[]> }
      const msg =
        e.errors?.current_password?.[0] ||
        e.errors?.password?.[0] ||
        e.message ||
        'Не удалось изменить пароль'
      showSystemToast(msg, 'error')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <>
      <div className="profile-security-section">
        <div className="blocks_title">
          <h2>Изменить E-mail</h2>
        </div>
        <div className="user_profile_page_content_wrapper profile-security-card">
          <div className="profile-security-row">
            <div className="login_input login_input_icon">
              <svg className="login_input_svg login_input_svg--accent" width="14" height="12" aria-hidden>
                <use xlinkHref="/sprites.svg#login-mail" />
              </svg>
              <HydrationSafeInput
                type="email"
                name="settings_email"
                placeholder="Введите E-mail"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  emailTouched.current = true
                  setEmail(e.target.value)
                }}
              />
            </div>
            <button
              className="m_btn category_btn profile-security-btn"
              type="button"
              onClick={submitEmail}
              disabled={emailButtonDisabled}
            >
              {emailSaving ? 'Отправка…' : emailButtonLabel}
            </button>
          </div>
        </div>
      </div>

      <div className="profile-security-section">
        <div className="blocks_title">
          <h2>Смена пароля</h2>
        </div>
        <div className="user_profile_page_content_wrapper profile-security-card">
          <form className="profile-security-row profile-security-row--password" onSubmit={handlePasswordChange}>
            <div className="login_input login_input_icon">
              <svg className="login_input_svg login_input_svg--accent" width="12" height="15" aria-hidden>
                <use xlinkHref="/sprites.svg#login-lock" />
              </svg>
              <HydrationSafeInput
                type="password"
                name="current_password"
                placeholder="Текущий пароль"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="login_input login_input_icon">
              <svg className="login_input_svg login_input_svg--accent" width="12" height="15" aria-hidden>
                <use xlinkHref="/sprites.svg#login-lock" />
              </svg>
              <HydrationSafeInput
                type="password"
                name="new_password"
                placeholder="Новый пароль"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="login_input login_input_icon">
              <svg className="login_input_svg login_input_svg--accent" width="12" height="15" aria-hidden>
                <use xlinkHref="/sprites.svg#login-lock" />
              </svg>
              <HydrationSafeInput
                type="password"
                name="password_confirmation"
                placeholder="Повторите пароль"
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
              />
            </div>
            <button
              className="m_btn category_btn profile-security-btn"
              type="submit"
              disabled={passwordSaving}
            >
              {passwordSaving ? 'Сохранение…' : 'Изменить'}
            </button>
          </form>
        </div>
      </div>

      <EmailStatusModal
        isOpen={modalVariant !== null}
        variant={modalVariant ?? 'bound-unconfirmed'}
        email={modalEmail || currentEmail}
        resending={emailSaving}
        onResend={modalVariant === 'bound-unconfirmed' ? submitEmail : undefined}
        onClose={() => setModalVariant(null)}
      />

      <ProfileLegalConsents />
    </>
  )
}

function ProfileLegalConsents() {
  const user = useAuthStore((s) => s.user)
  const patchUser = useAuthStore((s) => s.patchUser)
  const legal = user?.legal_acceptance
  const [ads, setAds] = useState(Boolean(user?.advertising_consent))
  const [savingAds, setSavingAds] = useState(false)

  useEffect(() => {
    setAds(Boolean(user?.advertising_consent))
  }, [user?.advertising_consent])

  const saveAds = async (next: boolean) => {
    setAds(next)
    setSavingAds(true)
    try {
      await api.put<{ advertising_consent: boolean }>('v1/me/advertising-consent', {
        advertising_consent: next,
      })
      patchUser({ advertising_consent: next })
      showSystemToast(next ? 'Согласие на рекламу включено' : 'Согласие на рекламу отключено')
    } catch {
      setAds(!next)
      showSystemToast('Не удалось сохранить согласие')
    } finally {
      setSavingAds(false)
    }
  }

  const rows = [
    { key: 'ua', label: 'Пользовательское соглашение', item: legal?.user_agreement },
    { key: 'pp', label: 'Политика конфиденциальности', item: legal?.privacy_policy },
    { key: 'ck', label: 'Политика cookies', item: legal?.cookies },
  ] as const

  return (
    <div className="profile_settings_block" style={{ marginTop: 28 }}>
      <p className="profile_settings_title">Согласия</p>
      <p className="secondary_text" style={{ marginBottom: 12 }}>
        Редакции документов, принятые при регистрации
        {legal?.accepted_at
          ? ` (${new Date(legal.accepted_at).toLocaleString('ru-RU')})`
          : ''}
        .
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
        {rows.map(({ key, label, item }) => (
          <li key={key} style={{ marginBottom: 8 }}>
            <strong>{label}:</strong>{' '}
            {item ? (
              <a href={item.url || '#'} target="_blank" rel="noreferrer">
                редакция v{item.version}
              </a>
            ) : (
              <span className="secondary_text">нет данных</span>
            )}
          </li>
        ))}
      </ul>
      <label className="checkbox" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <HydrationSafeInput
          type="checkbox"
          checked={ads}
          disabled={savingAds}
          onChange={(e) => {
            void saveAds(e.currentTarget.checked)
          }}
        />
        <span>Согласие на получение рекламных и информационных сообщений</span>
      </label>
    </div>
  )
}
