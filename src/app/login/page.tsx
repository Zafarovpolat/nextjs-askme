'use client'

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"

export default function LoginPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
            <div className="login_input">
              <input type="text" name="login" placeholder="Ваша почта" required />
            </div>
            <div className="login_input">
              <input type="password" name="password" placeholder="Пароль" required />
            </div>
            <div className="login_content_actions">
              <button className="m_btn category_btn" type="submit">
                Войти в аккаунт
              </button>
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
