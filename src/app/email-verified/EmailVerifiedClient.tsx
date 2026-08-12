'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function EmailVerifiedClient() {
  const searchParams = useSearchParams()
  const failed = searchParams.get('status') === '0'

  return (
    <div className="email_verified_page">
      <img
        className="email_verified_page__illust"
        src="/images/email-verified-robot.png"
        alt=""
        width={451}
        height={381}
      />
      <h1>{failed ? 'Ссылка недействительна' : 'E-mail подтвержден'}</h1>
      <p>
        {failed ? (
          <>
            Ссылка подтверждения устарела
            <br />
            или уже была использована
          </>
        ) : (
          <>
            Вы успешно подтвердили
            <br />
            ваш e-mail
          </>
        )}
      </p>
      <Link href="/">
        <button className="m_btn category_btn email_verified_page__btn" type="button">
          Вернуться на главную
        </button>
      </Link>
    </div>
  )
}
