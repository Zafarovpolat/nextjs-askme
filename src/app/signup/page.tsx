'use client'

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"

export default function SignupPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="auth_page_layout">
      <Header />

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
            <div className="auth_page_wrapper">
              <div className="auth_form">
                <div className="login_input">
                  <input type="text" placeholder="Имя" name="first_name" required />
                </div>
                <div className="login_input">
                  <input type="text" placeholder="Фамилия" name="last_name" required />
                </div>
                <div className="login_input">
                  <input type="text" placeholder="Ваш почтовый яшик" name="email" required />
                </div>
                <div className="login_input">
                  <input type="tel" placeholder="Номер телефона" name="phone" required />
                </div>
                <div className="select_gender">
                  <p>Ваш пол</p>
                  <div className="select_gender_items">
                    <label>
                      <input type="radio" name="gender" value="male" defaultChecked required />
                      <span>Мужской</span>
                    </label>
                    <label>
                      <input type="radio" name="gender" value="female" required />
                      <span>Женский</span>
                    </label>
                  </div>
                </div>
                <div className="login_input">
                  <input type="password" name="password" placeholder="Ваш пароль" />
                </div>
                <div className="login_input">
                  <input type="password" name="password_repeat" placeholder="Подтвердить пароль" />
                </div>
                <div className="ask_from_send_btn">
                  <button type="submit" className="m_btn category_btn">Регистрация</button>
                  <label className="checkbox">
                    <input type="checkbox" name="terms" required hidden />
                    <span>
                     Нажимая на кнопку, вы принимаете условия {' '}
                      <Link href="/user-agreement" target="_blank">
                        пользовательского соглашения
                      </Link>
                    </span>
                  </label>
                </div>
              </div>
              <div className="login_socials auth_socials">
                <p>Регистрация через<br /> социальные сети</p>
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
