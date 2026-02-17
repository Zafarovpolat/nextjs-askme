'use client'

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import SharePopup from "@/components/SharePopup"
import Link from "next/link"
import { useState, useRef, useCallback } from "react"
import { mockUsers } from "@/data/mock-users"
import { mockQuestions } from "@/data/mock-questions"

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('menu1')
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareData, setShareData] = useState({ title: '', url: '' })
  const shareButtonRef = useRef<HTMLButtonElement | null>(null)

  // Мок-данные текущего пользователя
  const user = mockUsers[0]
  const isMyProfile = true

  // Вопросы пользователя
  const userQuestions = mockQuestions.filter(q => q.author.id === user.id)

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
  }

  // Обработчик клика по кнопке "Поделиться"
  const handleShareClick = useCallback((e: React.MouseEvent<HTMLButtonElement>, title: string, slug: string) => {
    const btn = e.currentTarget
    if (shareButtonRef.current === btn && isShareOpen) {
      setIsShareOpen(false)
      return
    }
    shareButtonRef.current = btn
    setShareData({ title, url: `${typeof window !== 'undefined' ? window.location.origin : ''}/question/${slug}` })
    setIsShareOpen(true)
  }, [isShareOpen])

  return (
    <div className="profile_page_layout">
      <Header />

      <div className="container">
        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <span className="breadcrumbs__current">Профиль</span>
        </div>

        {/* profile page */}
        <div className="profile_page">
          <div className="profile_menu">
            <div className="blocks_title">
              <h2>Ваш профиль</h2>
            </div>
            <div className="profile_menu_list tabs_list">
              {isMyProfile && (
                <>
                  <div
                    className={`profile_menu_item menu_item profile-edit-btn ${activeTab === 'menu2' ? 'active_menu' : ''}`}
                    data-id="menu2"
                    onClick={() => handleTabClick('menu2')}
                  >
                    <svg width="15.714844" height="20.000000">
                      <use xlinkHref="#profile"></use>
                    </svg>
                    <p className="main_text">Редактировать профиль</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === 'menu_levels' ? 'active_menu' : ''}`}
                    data-id="menu_levels"
                    onClick={() => handleTabClick('menu_levels')}
                  >
                    <svg width="13" height="20">
                      <use xlinkHref="#levels"></use>
                    </svg>
                    <p className="main_text">Уровни</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === 'menu_rules' ? 'active_menu' : ''}`}
                    data-id="menu_rules"
                    onClick={() => handleTabClick('menu_rules')}
                  >
                    <svg width="20" height="17">
                      <use xlinkHref="#rules"></use>
                    </svg>
                    <p className="main_text">Ограничения</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === 'menu_vip' ? 'active_menu' : ''}`}
                    data-id="menu_vip"
                    onClick={() => handleTabClick('menu_vip')}
                  >
                    <svg width="16" height="20">
                      <use xlinkHref="#vip"></use>
                    </svg>
                    <p className="main_text">VIP - статус</p>
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
                    <button className="user_profile_img_action" title="Редактировать аватар">
                      <svg width="11" height="11">
                        <use xlinkHref="#pencil-edit"></use>
                      </svg>
                    </button>
                  </div>
                  <div className="user_profile_block_content_profile_desc">
                    <h4>{user.displayName}</h4>
                    <p>В сервисе 1 год</p>
                  </div>
                </div>
                <div className="user_grades">
                  <div>
                    <p>Баллы: <span>{user.rating}/1000</span></p>
                    <div className="user_grade_line">
                      <div className="user_grade_line_value" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div className="user_kpd">
                    <p>КПД: <span>78%</span></p>
                    <svg width="16" height="16">
                      <use xlinkHref="#kpd-icon"></use>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Мобильное меню табов */}
              <div className="profile_menu_list_mob tabs_list_m">
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === 'menu2' ? 'active_menu' : ''}`}
                  data-id="menu2"
                  onClick={() => handleTabClick('menu2')}
                >
                  <svg width="15.714844" height="20.000000">
                    <use xlinkHref="#profile"></use>
                  </svg>
                </div>
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === 'menu_levels' ? 'active_menu' : ''}`}
                  data-id="menu_levels"
                  onClick={() => handleTabClick('menu_levels')}
                >
                  <svg width="13" height="20">
                    <use xlinkHref="#levels"></use>
                  </svg>
                </div>
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === 'menu_rules' ? 'active_menu' : ''}`}
                  data-id="menu_rules"
                  onClick={() => handleTabClick('menu_rules')}
                >
                  <svg width="20" height="17">
                    <use xlinkHref="#rules"></use>
                  </svg>
                </div>
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === 'menu_vip' ? 'active_menu' : ''}`}
                  data-id="menu_vip"
                  onClick={() => handleTabClick('menu_vip')}
                >
                  <svg width="16" height="20">
                    <use xlinkHref="#vip"></use>
                  </svg>
                </div>
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === 'menu4' ? 'active_menu' : ''}`}
                  data-id="menu4"
                  onClick={() => handleTabClick('menu4')}
                >
                  <svg width="20" height="20">
                    <use xlinkHref="#settings"></use>
                  </svg>
                </div>
              </div>
            </div>

            <div className="user_profile_pages">
              {/* Таб 1: Вопросы пользователя */}
              <div
                className={`menu_item_content menu_item_content_m user_profile_pages_1 ${activeTab === 'menu1' ? 'active_menu' : ''}`}
                id="menu1"
              >
                <div className="user_profile_page_content">
                  <div className="questions_filter">
                    <button className="s_btn s_btn_active questions_filter_active">Все</button>
                    <button className="s_btn">Открытые</button>
                    <button className="s_btn">На голосовании</button>
                    <button className="s_btn">Лучшие</button>
                  </div>

                  {userQuestions.length > 0 ? (
                    <>
                      {userQuestions.map(question => (
                        <div className="question_list_item" key={question.id}>
                          <div className="question_item_top_data">
                            <div className="question_item_top_data_left">
                              <img src={question.author.avatar} alt={question.author.displayName} />
                              <div>
                                <p className="main_text">{question.author.displayName}</p>
                                <span>{question.author.rating} баллов</span>
                              </div>
                            </div>
                            <div className="question_item_top_data_right">
                              <button
                                className="s_btn s_btn_icon share-this"
                                title="Поделиться"
                                onClick={(e) => handleShareClick(e, question.title, question.slug)}
                              >
                                <svg width="14" height="14">
                                  <use xlinkHref="#share"></use>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <Link href={`/question/${question.slug}`}>
                            <div className="question_list_item_left">
                              <img src={question.author.avatar} alt={question.author.displayName} />
                              <div>
                                <p className="main_text">{question.title}</p>
                                <span>8 месяцев назад</span>
                              </div>
                            </div>
                          </Link>
                          <div className="question_list_item_right">
                            <div className="question_list_item_right_actions">
                              <button
                                className="s_btn s_btn_icon share-this"
                                title="Поделиться"
                                onClick={(e) => handleShareClick(e, question.title, question.slug)}
                              >
                                <svg width="14" height="14">
                                  <use xlinkHref="#share"></use>
                                </svg>
                              </button>
                              <Link className="s_btn" href={`/question/${question.slug}`}>
                                Посмотреть
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="show_more_btn_wrapper" style={{ display: 'flex', justifyContent: 'center' }}>
                        <button className="show_more_btn" type="button">
                          <svg width="22" height="22">
                            <use xlinkHref="#sync"></use>
                          </svg>
                          <span>Загрузить еще</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="secondary_text" style={{ textAlign: 'center', padding: '40px 0' }}>
                      Вопросов пока нет
                    </p>
                  )}
                </div>
              </div>

              {/* Таб 2: Редактировать профиль */}
              <div
                className={`menu_item_content profile-edit-tab menu_item_content_m ${activeTab === 'menu2' ? 'active_menu' : ''}`}
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
                          Вы можете изменить имя в общих настройках 
                        </p>
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
                        <button className="m_btn cancel_btn" type="button">
                          Отмена
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Таб: Настройки */}
              <div
                className={`menu_item_content menu_item_content_m ${activeTab === 'menu4' ? 'active_menu' : ''}`}
                id="menu4"
              >
                <div className="user_profile_page_content profile-settings">
                  <div className="blocks_title">
                    <h2>Настройки</h2>
                  </div>
                  <div className="user_profile_page_content_wrapper">
                    {/* Уведомления */}
                    <div className="profile_settings_top_titles">
                      <p className="profile_settings_title">Уведомления</p>
                      <p className="secondary_text">Сайт</p>
                      <p className="secondary_text">Почта</p>
                    </div>

                    <div className="user_seting_item">
                      <p className="secondary_text">Получать все уведомления</p>
                      <label className="chechbox_item"><input type="checkbox" defaultChecked /><span></span></label>
                      <label className="chechbox_item"><input type="checkbox" defaultChecked /><span></span></label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">Новый ответ на мой вопрос</p>
                      <label className="chechbox_item"><input type="checkbox" defaultChecked /><span></span></label>
                      <label className="chechbox_item"><input type="checkbox" defaultChecked /><span></span></label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">Мой вопрос или ответ понравился</p>
                      <label className="chechbox_item"><input type="checkbox" defaultChecked /><span></span></label>
                      <label className="chechbox_item"><input type="checkbox" /><span></span></label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">Мне оставили новый комментарий</p>
                      <label className="chechbox_item"><input type="checkbox" defaultChecked /><span></span></label>
                      <label className="chechbox_item"><input type="checkbox" defaultChecked /><span></span></label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">Новый голос в опросе</p>
                      <label className="chechbox_item"><input type="checkbox" defaultChecked /><span></span></label>
                      <label className="chechbox_item"><input type="checkbox" /><span></span></label>
                    </div>

                    <div className="line"></div>

                    {/* Включить звук для уведомлений */}
                    <div className="user_seting_item">
                      <p className="profile_settings_title">Включить звук для уведомлений</p>
                      <label className="chechbox_item"><input type="checkbox" defaultChecked /><span></span></label>
                    </div>
                    <div className="user_seting_item user_seting_item_sound">
                      <button className="play_sound_btn" type="button" title="Прослушать звук">
                        <svg width="11" height="14">
                          <use xlinkHref="#play-sound"></use>
                        </svg>
                      </button>
                      <p className="secondary_text">Прослушать звук</p>
                    </div>

                    <div className="line"></div>

                    {/* Получать новости проекта */}
                    <div className="user_seting_item">
                      <p className="profile_settings_title">Получать новости проекта</p>
                      <label className="chechbox_item"><input type="checkbox" defaultChecked /><span></span></label>
                    </div>

                    <div className="line"></div>

                    {/* Настройка дизайна уведомлений */}
                    <div className="user_seting_item">
                      <p className="profile_settings_title">Настройка дизайна уведомлений</p>
                      <label className="chechbox_item"><input type="checkbox" /><span></span></label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">Компактный вид</p>
                    </div>

                    <div className="line"></div>

                    {/* Общие настройки */}
                    <div className="user_seting_item">
                      <p className="profile_settings_title">Общие настройки</p>
                    </div>
                    <div className="user_seting_item user_seting_item_sec">
                      <p className="secondary_text">Цветовая тема сайта</p>
                      <div className="select_themes">
                        <label className="chechbox_item">
                          <input type="radio" value="auto" name="theme" defaultChecked />
                          <span>Авто</span>
                        </label>
                        <label className="chechbox_item">
                          <input type="radio" value="dark" name="theme" />
                          <span>Темная</span>
                        </label>
                        <label className="chechbox_item">
                          <input type="radio" value="light" name="theme" />
                          <span>Светлая</span>
                        </label>
                      </div>
                    </div>
                    <p className="secondary_text settings_hint">
                      Если выбран режим авто, мы включим тёмную тему с 21:00 до 06:00 по системному времени
                    </p>

                    <div className="line"></div>

                    <div className="profile_action_btns">
                      <button className="m_btn cancel_btn" type="button">
                        Закрыть
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="line"></div>

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
              <div className="profile_stats_item">
                <p className="main_text">Подписки</p>
                <div>
                  <p className="main_text">{user.followingsCount}</p>
                </div>
              </div>
              <div className="profile_stats_item">
                <p className="main_text">Подписчики</p>
                <div>
                  <p className="main_text">{user.followersCount}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SharePopup
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        anchorRef={shareButtonRef}
        title={shareData.title}
        url={shareData.url}
      />

      <Footer />
    </div>
  )
}
