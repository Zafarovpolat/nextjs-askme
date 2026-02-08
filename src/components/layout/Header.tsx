'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleDarkMode = () => {
    document.body.classList.toggle('dark_mode')
  }

  return (
    <>
      <nav>
        <div className="nav_wrapper container">
          <Link href="/" className="header__logo">
            <img
              src="/images/logo.svg"
              className="light_logo"
              alt="AskMe"
              width="321"
              height="96"
            />
            <img
              src="/images/logo_dark.svg"
              className="dark_logo"
              alt="AskMe"
              width="321"
              height="96"
            />
          </Link>

          <div className="nav_list">
            <Link href="/categories">
              <button className="m_btn category_btn">
                <img src="/images/icons/category-icon.svg" alt="" width="18" height="18" />
                <span>Категории</span>
              </button>
            </Link>

            <form method="POST" action="/" className="search_input">
              <img src="/images/icons/search.svg" alt="" width="18" height="18" />
              <input type="text" name="s" placeholder="Найти категорию" />
            </form>

            <a href="/ask">
              <button className="m_btn">
                <svg width="20" height="20">
                  <use xlinkHref="#ask"></use>
                </svg>
                Спросить
              </button>
            </a>

            <a href="/leaders">
              <button className="m_btn">
                <svg width="20" height="20">
                  <use xlinkHref="#leaders"></use>
                </svg>
                Лидеры
              </button>
            </a>

            <button className="m_btn m_btn_icon mode_toggler" onClick={toggleDarkMode} title="Темная/светлая тема">
              <svg width="16" height="18">
                <use xlinkHref="#light-mode"></use>
              </svg>
            </button>

            <Link href="/profile">
              <button className="m_btn m_btn_icon category_btn" title="Личный кабинет">
                <img src="/images/icons/user.svg" alt="" width="16" height="20" />
              </button>
            </Link>

            <Link href="/logout" className="logout-btn logged_in_show">
              <button className="m_btn m_btn_icon category_btn" title="Выход">
                <img src="/images/icons/logout.svg" alt="" width="16" height="20" />
              </button>
            </Link>

            <button
              className="m_btn m_btn_icon category_btn desc_mob_btn"
              onClick={toggleMenu}
            >
              <img src="/images/icons/mob-menu.svg" alt="" />
            </button>
          </div>
        </div>
      </nav>

      {/* Мобильное меню */}
      <div className={`nav_mob_wrapper ${isMenuOpen ? 'nav_mob_wrapper_visible' : ''}`}>
        <div className="nav_mob_wrapper_nav">
          <Link href="/">
            <img src="/images/icons/mob-nav-logo.svg" alt="" />
          </Link>
          <div>
            <button className="m_btn m_btn_icon mode_toggler" onClick={toggleDarkMode}>
              <img src="/images/icons/light-mode.svg" alt="" width="16" height="18" />
            </button>
            <Link href="/profile">
              <button className="m_btn">
                <img src="/images/icons/user.svg" alt="" />
              </button>
            </Link>
            <Link href="/logout" className="logout-btn logged_in_show">
              <button className="m_btn m_btn_icon category_btn" title="Выход">
                <img src="/images/icons/logout.svg" alt="" width="16" height="20" />
              </button>
            </Link>
            <button className="m_btn" onClick={toggleMenu}>
              <img src="/images/icons/exit-menu.svg" alt="" />
            </button>
          </div>
        </div>

        <div className="nav_mob_wrapper_list">
          <Link href="/categories">
            <button className="m_btn mob_category_btn">
              <img src="/images/icons/mob-category.svg" alt="" width="18" height="18" />
              Все категории
            </button>
          </Link>

          <form method="POST" action="/" className="search_input search_input_mob">
            <img src="/images/icons/mob-search.svg" alt="" width="18" height="18" style={{ fill: '#fff' }} />
            <input type="text" placeholder="Найти категорию" />
          </form>

          <Link href="/ask" className="mob_sec_item">
            <button className="m_btn">
              <img src="/images/icons/ask.svg" alt="" width="20" height="20" />
              Спросить
            </button>
          </Link>

          <Link href="/leaders" className="mob_sec_item">
            <button className="m_btn">
              <img src="/images/icons/leaders.svg" alt="" width="20" height="20" />
              Лидеры
            </button>
          </Link>
        </div>
      </div>
    </>
  )
}
