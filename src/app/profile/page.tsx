'use client'

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { useState } from "react"
import { mockUsers } from "@/data/mock-users"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('menu1')
  const [activeTabMob, setActiveTabMob] = useState('menu1')

  // Мок-данные текущего пользователя
  const user = mockUsers[0]
  const isMyProfile = true

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
    setActiveTabMob(tabId)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <>
      <Header />

      <div className="container">

        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <span className="breadcrumbs__current">Личный кабинет</span>
        </div>

      {/* profile page */}
      <div className="profile_page container">
        <div className="profile_menu">
          <div className="blocks_title">
            <h2>Ваш профиль</h2>
          </div>
          <div className="profile_menu_list tabs_list">
            <div
              className={`profile_menu_item menu_item ${activeTab === 'menu1' ? 'active_menu' : ''}`}
              data-id="menu1"
              onClick={() => handleTabClick('menu1')}
            >
              <svg width="15.714844" height="20.000000">
                <use xlinkHref="#profile"></use>
              </svg>
              <p className="main_text">Ваш профиль</p>
            </div>
            {isMyProfile && (
              <>
                <div
                  className={`profile_menu_item menu_item ${activeTab === 'menu2' ? 'active_menu' : ''}`}
                  data-id="menu2"
                  onClick={() => handleTabClick('menu2')}
                >
                  <svg width="15.714844" height="20.000000">
                    <use xlinkHref="#profile"></use>
                  </svg>
                  <p className="main_text">Редактировать профиль</p>
                </div>
                <div
                  className={`profile_menu_item menu_item ${activeTab === 'menu4' ? 'active_menu' : ''}`}
                  data-id="menu4"
                  onClick={() => handleTabClick('menu4')}
                >
                  <svg width="20.000000" height="20.000000">
                    <use xlinkHref="#settings"></use>
                  </svg>
                  <p className="main_text">Настройки</p>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="profile_page_content">
          <div className="user_profile_block">
            <img
              className="user_profile_block_bg"
              src="/images/user-profile-bg.svg"
              alt=""
            />
            <img
              className="user_profile_block_bg_dark"
              src="/images/user-profile-bg-d.svg"
              alt=""
            />
            <img
              className="user_profile_block_rect"
              src="/images/main-rect.svg"
              alt=""
            />
            <div className="user_profile_block_content">
              <div className="user_profile_block_content_profile">
                <div className="user_profile_img">
                  <img
                    className="user_profile_image"
                    src={user.avatar}
                    alt=""
                  />
                  {user.vipStatus && (
                    <span className="user_profile__vip-badge">VIP</span>
                  )}
                </div>
                <div className="user_profile_block_content_profile_desc">
                  <h4>{user.displayName}</h4>
                  <p>В сервисе 1 год</p>
                </div>
              </div>
            </div>

            {/* Мобильное меню табов */}
            <div className="profile_menu_list_mob tabs_list_m">
              <div
                className={`profile_menu_item menu_item_m ${activeTabMob === 'menu1' ? 'active_menu' : ''}`}
                data-id="menu1"
                onClick={() => handleTabClick('menu1')}
              >
                <svg width="15.714844" height="20.000000">
                  <use xlinkHref="#profile"></use>
                </svg>
              </div>
              <div
                className={`profile_menu_item menu_item_m ${activeTabMob === 'menu2' ? 'active_menu' : ''}`}
                data-id="menu2"
                onClick={() => handleTabClick('menu2')}
              >
                <svg width="15.714844" height="20.000000">
                  <use xlinkHref="#profile"></use>
                </svg>
              </div>
              <div
                className={`profile_menu_item menu_item_m ${activeTabMob === 'menu3' ? 'active_menu' : ''}`}
                data-id="menu3"
                onClick={() => handleTabClick('menu3')}
              >
                <svg width="15.238281" height="20.000000">
                  <use xlinkHref="#vip"></use>
                </svg>
              </div>
              <div
                className={`profile_menu_item menu_item_m ${activeTabMob === 'menu4' ? 'active_menu' : ''}`}
                data-id="menu4"
                onClick={() => handleTabClick('menu4')}
              >
                <svg width="20.000000" height="20.000000">
                  <use xlinkHref="#settings"></use>
                </svg>
              </div>
            </div>
          </div>

          <div className="user_profile_pages">
            {/* Таб 1: Ваш профиль — вопросы */}
            <div
              className={`menu_item_content menu_item_content_m user_profile_pages_1 ${activeTab === 'menu1' ? 'active_menu' : ''}`}
              id="menu1"
            >
              <div className="user_profile_page_content">
                <div className="questions_filter">
                  <button className="m_btn questions_filter_active">Все</button>
                  <button className="m_btn">Открытые</button>
                  <button className="m_btn">На голосовании</button>
                  <button className="m_btn">Лучшие</button>
                </div>
                <p className="secondary_text" style={{ textAlign: 'center', padding: '40px 0' }}>
                  Вопросов пока нет
                </p>
              </div>
            </div>

            {/* Таб 2: Редактировать профиль */}
            <div
              className={`menu_item_content menu_item_content_m ${activeTab === 'menu2' ? 'active_menu' : ''}`}
              id="menu2"
            >
              <div className="user_profile_page_content">
                <div className="blocks_title">
                  <h2>Редактировать профиль</h2>
                </div>
                <div className="user_profile_page_content_wrapper">
                  <form method="post" className="form" id="edit_profile_form" onSubmit={handleEditSubmit}>
                    <div className="profile_input">
                      <p className="main_text">Ваше имя</p>
                      <input
                        type="text"
                        defaultValue={user.displayName}
                        name="name"
                      />
                    </div>
                    <div className="profile_warning">
                      <img src="/images/icons/info.svg" alt="" />
                      <p className="secondary_text">
                        Укажите имя и фамилию в два слова через пробел
                      </p>
                    </div>
                    <div className="profile_input">
                      <p className="main_text">Ваш пол</p>
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
                    <div className="profile_input">
                      <p className="main_text">В чем вы лучше всего разбираетесь?</p>
                      <textarea
                        placeholder="Опишите как можно подробнее"
                        name="description"
                        defaultValue={user.bio}
                      />
                    </div>
                    <p className="secondary_text">
                      Например, &quot;Люблю фотографировать и могу порекомендовать, какую технику выбрать&quot;
                    </p>
                    <div className="profile_action_btns">
                      <button className="m_btn category_btn" type="submit">
                        Сохранить профиль
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Таб 4: Настройки */}
            <div
              className={`menu_item_content menu_item_content_m ${activeTab === 'menu4' ? 'active_menu' : ''}`}
              id="menu4"
            >
              <div className="user_profile_page_content">
                <div className="blocks_title">
                  <h2>Настройки</h2>
                </div>
                <div className="user_profile_page_content_wrapper">
                  <div className="user_seting_item user_seting_item_sec">
                    <p className="secondary_text">Цветовая тема сайта</p>
                    <div className="select_themes">
                      <div className="user_theme_btn">
                        <input type="radio" value="light" id="theme_light" name="theme" defaultChecked />
                        <label htmlFor="theme_light" className="secondary_text">
                          Светлая
                        </label>
                      </div>
                      <div className="user_theme_btn">
                        <input type="radio" value="dark" id="theme_dark" name="theme" />
                        <label htmlFor="theme_dark" className="secondary_text">
                          Темная
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile_stats">
          <div className="blocks_title">
            <h2>Статистика</h2>
          </div>
          <div className="profile_stats_list">
            <div className="profile_stats_item">
              <p className="main_text">Вопросы</p>
              <div>
                <p className="main_text">{user.questionsCount}</p>
              </div>
            </div>
            <div className="profile_stats_item">
              <p className="main_text">Ответы</p>
              <div>
                <p className="main_text">{user.answersCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div>

      <Footer />
    </>
  )
}
