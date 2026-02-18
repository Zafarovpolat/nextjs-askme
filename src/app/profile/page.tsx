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

              {/* Таб: VIP-статус */}
              <div
                className={`menu_item_content menu_item_content_m ${activeTab === 'menu_vip' ? 'active_menu' : ''}`}
                id="menu_vip"
              >
                <div className="user_profile_page_content profile-vip">
                  <div className="blocks_title">
                    <h2>Активировать VIP-статус</h2>
                  </div>
                  <div className="user_profile_page_content_wrapper">
                    <p className="secondary_text">
                      VIP — это особые знаки отличия на проекте, выделение ответов и вопросов в общих списках, в два раза больше баллов за каждый ответ и увеличение ежедневного лимита вопросов до 100, возможность скрыть списки вопросов и ответов в своем личном кабинете, а также отключение рекламы!
                    </p>
                    <form method="post" className="vip_form">

                      {/* Карточки услуг */}
                      <div className="vip_status_card">
                        <div>
                          <img src="/images/icons/vip.svg" alt="VIP" />
                          <h3>
                            100 ₽
                          </h3>
                            <div className="secondary_text">Продление VIP статуса на 10 дней</div>
                        </div>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13.6619 1.9725C12.59 0.75 10.2886 0 7.5 0C4.71139 0 2.41005 0.75 1.33808 1.9725C-0.446027 4.0425 -0.446027 10.9725 1.33808 13.0275C2.41005 14.25 4.71139 15 7.5 15C10.2886 15 12.59 14.25 13.6619 13.0275C15.446 10.9575 15.446 4.0425 13.6619 1.9725ZM7.5 3.5625C7.68533 3.5625 7.86649 3.61748 8.02059 3.7205C8.17468 3.82351 8.29478 3.96993 8.3657 4.14123C8.43663 4.31254 8.45518 4.50104 8.41903 4.6829C8.38287 4.86475 8.29363 5.0318 8.16258 5.16291C8.03154 5.29402 7.86457 5.38331 7.68281 5.41949C7.50104 5.45566 7.31263 5.43709 7.14141 5.36614C6.97019 5.29518 6.82385 5.17502 6.72089 5.02085C6.61793 4.86668 6.56297 4.68542 6.56297 4.5C6.56297 4.25136 6.66169 4.0129 6.83742 3.83709C7.01315 3.66127 7.25148 3.5625 7.5 3.5625ZM8.24963 11.625H6.75038C6.55156 11.625 6.36089 11.546 6.22031 11.4053C6.07973 11.2647 6.00075 11.0739 6.00075 10.875C6.00075 10.6761 6.07973 10.4853 6.22031 10.3447C6.36089 10.204 6.55156 10.125 6.75038 10.125V7.875C6.55156 7.875 6.36089 7.79598 6.22031 7.65533C6.07973 7.51468 6.00075 7.32391 6.00075 7.125C6.00075 6.92609 6.07973 6.73532 6.22031 6.59467C6.36089 6.45402 6.55156 6.375 6.75038 6.375H7.5C7.69881 6.375 7.88948 6.45402 8.03007 6.59467C8.17065 6.73532 8.24963 6.92609 8.24963 7.125V10.125C8.44844 10.125 8.63911 10.204 8.77969 10.3447C8.92027 10.4853 8.99925 10.6761 8.99925 10.875C8.99925 11.0739 8.92027 11.2647 8.77969 11.4053C8.63911 11.546 8.44844 11.625 8.24963 11.625Z" fill="#636BFF"/>
                        </svg>
                      </div>

                      <div className="mini-title">Выберите способ платежа</div>

                      {/* Блок AskPay: инпут ФИО + кнопка выйти */}
                      <div className="payment_askpay_block">
                        <input type="text" placeholder="Введите ФИО" className="payment_fio_input" />
                        <button type="button" className="payment_logout_btn">
                          <span>Выйти</span>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.5303 8.28597C10.3834 8.27356 10.2378 8.32149 10.1253 8.41926C10.0128 8.51703 9.94258 8.65666 9.93012 8.80751C9.88091 9.40399 9.81999 9.92282 9.76668 10.1955V10.1988C9.60939 11.0324 8.84081 11.8564 8.05261 12.0376C7.98436 12.052 7.91582 12.0659 7.84757 12.0791C7.90615 11.3048 7.9498 10.3147 7.94394 9.55115C7.95273 8.38468 7.84406 6.58864 7.74769 5.87389C7.57459 4.55786 6.78697 3.09827 5.91558 2.47802L5.9103 2.4744C5.30444 2.05386 4.65512 1.70353 3.97421 1.42982C3.85275 1.38147 3.73276 1.33633 3.61423 1.2944C4.26061 1.19172 4.91384 1.1414 5.5679 1.14392C6.45833 1.14392 7.27114 1.22728 8.05261 1.39401C8.84081 1.57458 9.60939 2.39917 9.76668 3.23279V3.2361C9.8197 3.50695 9.88062 4.02578 9.92983 4.62045C9.94234 4.77158 10.0128 4.91142 10.1256 5.0092C10.2385 5.10698 10.3845 5.15469 10.5316 5.14184C10.6787 5.12899 10.8148 5.05663 10.91 4.94068C11.0051 4.82472 11.0516 4.67468 11.0391 4.52355C10.9857 3.87982 10.9201 3.32939 10.8586 3.0128C10.6158 1.73047 9.51127 0.554068 8.28927 0.275994L8.28224 0.274489C7.42345 0.0915136 6.53595 0.00183172 5.56585 2.60448e-05C4.59575 -0.00177963 3.71177 0.0903099 2.85297 0.27479L2.84565 0.276295C2.30026 0.400585 1.7786 0.703939 1.34627 1.11533C1.22943 1.20585 1.1273 1.31485 1.0437 1.43825C0.661754 1.89629 0.384374 2.44431 0.276585 3.0128C0.141556 3.70828 -0.0110467 5.51185 0.000669454 6.71564C-0.00577444 7.36147 0.0349392 8.18004 0.0952775 8.90743C0.127497 9.37389 0.16411 9.78017 0.199259 10.0408C0.372365 11.3568 1.15998 12.8164 2.03167 13.4367L2.03665 13.4403C2.64266 13.8608 3.29207 14.2111 3.97304 14.4849C4.66253 14.7599 5.29521 14.9267 5.90767 14.9947H5.91294C6.736 15.0702 7.48408 14.3362 7.71049 13.263C7.90205 13.2317 8.09195 13.1961 8.28019 13.1562L8.28722 13.1547C9.50951 12.8766 10.6138 11.7002 10.8566 10.4179C10.9181 10.1007 10.984 9.54905 11.0373 8.90382C11.0497 8.75283 11.0033 8.60295 10.9082 8.4871C10.8132 8.37125 10.6772 8.29891 10.5303 8.28597Z" fill="#5D67FF"/>
                            <path d="M15 6.71474C15 6.69578 15 6.67682 14.9971 6.65786C14.9972 6.65666 14.9972 6.65544 14.9971 6.65424C14.9953 6.63646 14.9927 6.61878 14.9892 6.60128V6.59737C14.9672 6.48869 14.9148 6.389 14.8383 6.31056L12.8466 4.26233C12.7422 4.15505 12.6006 4.09477 12.453 4.09474C12.3054 4.09472 12.1638 4.15494 12.0594 4.26218C11.955 4.36941 11.8963 4.51486 11.8963 4.66654C11.8963 4.81822 11.9549 4.9637 12.0592 5.07097L13.104 6.14414H9.26201C9.11441 6.14414 8.97286 6.20438 8.86849 6.31162C8.76412 6.41885 8.70549 6.56429 8.70549 6.71594C8.70549 6.86759 8.76412 7.01303 8.86849 7.12026C8.97286 7.22749 9.11441 7.28774 9.26201 7.28774H13.0991L12.0551 8.36031C11.9511 8.46762 11.8928 8.61294 11.893 8.76438C11.8931 8.91583 11.9517 9.06103 12.056 9.16811C12.1602 9.2752 12.3015 9.33543 12.4489 9.33559C12.5963 9.33575 12.7377 9.27582 12.8422 9.16895L14.8248 7.13185C14.8967 7.06265 14.9493 6.97495 14.9772 6.87785C14.9822 6.86054 14.9863 6.84295 14.9895 6.82518C14.9896 6.82268 14.9896 6.82016 14.9895 6.81766C14.9921 6.80231 14.9947 6.78756 14.9962 6.77131C14.9977 6.75506 14.9962 6.74784 14.9962 6.7364C14.9962 6.72978 14.9962 6.72316 14.9962 6.71654L15 6.71474Z" fill="#5D67FF"/>
                          </svg>
                        </button>
                      </div>

                      <div className="payment_methods">
                        {/* Банковская карта */}
                        <label className="payment_method_label">
                          <input type="radio" name="payment_method" value="card" defaultChecked className="payment_radio" />
                          <div className="payment_method">
                            <div className="payment_method_type">
                              <img src="/images/icons/payment/1.svg" alt="" />
                              <div>
                                <p className="main_text">Банковская карта</p>
                                <p className="secondary_text">Мир, UnionPay, Visa, Mastercard и другие</p>
                              </div>
                            </div>
                            <span className="payment_custom_check"></span>
                          </div>
                        </label>

                        {/* Мобильный платёж */}
                        <label className="payment_method_label">
                          <input type="radio" name="payment_method" value="mobile" className="payment_radio" />
                          <div className="payment_method">
                            <div className="payment_method_type">
                              <img src="/images/icons/payment/3.svg" alt="" />
                              <div>
                                <p className="main_text">Мобильный платёж</p>
                              </div>
                            </div>
                            <span className="payment_custom_check"></span>
                          </div>
                        </label>

                        {/* AskPay */}
                        <label className="payment_method_label">
                          <input type="radio" name="payment_method" value="askpay" className="payment_radio" />
                          <div className="payment_method">
                            <div className="payment_method_type">
                              <svg width="27" height="24" viewBox="0 0 27 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M26.9676 13.3539L24.9261 1.74586C24.7458 0.721037 23.8569 0 22.8537 0C22.7322 0 4.97533 3.12783 4.97533 3.12783C3.82941 3.33042 3.06424 4.42599 3.26632 5.57485L3.46312 6.69394H19.4888C21.5219 6.69394 23.1759 8.3522 23.1759 10.3905V16.169L25.2586 15.8009C26.4045 15.5983 27.1697 14.5027 26.9676 13.3539Z" fill="#5D67FF"/>
                                <path d="M21.5957 17.0495H0V21.8877C0 23.0543 0.943313 24 2.1069 24H19.4888C20.6524 24 21.5957 23.0543 21.5957 21.8877V17.0495ZM6.2726 22.0969H2.68824C2.25192 22.0969 1.89817 21.7423 1.89817 21.3048C1.89817 20.8674 2.25192 20.5127 2.68824 20.5127H6.2726C6.70892 20.5127 7.06267 20.8674 7.06267 21.3048C7.06267 21.7423 6.70898 22.0969 6.2726 22.0969Z" fill="#5D67FF"/>
                                <path d="M0.00258399 10.2875H21.5931C21.5395 9.16877 20.6179 8.27824 19.4887 8.27824H2.1069C0.977749 8.27824 0.0561621 9.16877 0.00258399 10.2875Z" fill="#5D67FF"/>
                                <path d="M0 11.8717H21.5957V15.4653H0V11.8717Z" fill="#5D67FF"/>
                              </svg>
                              <div>
                                <p className="main_text">Баланс AskPay</p>
                                <p className="secondary_text">100 ₽</p>
                              </div>
                            </div>
                            <span className="payment_custom_check"></span>
                          </div>
                        </label>

                        {/* Другие способы */}
                        <label className="payment_method_label">
                          <input type="radio" name="payment_method" value="other" className="payment_radio" />
                          <div className="payment_method">
                            <div className="payment_method_type">
                              <img src="/images/icons/payment/4.svg" alt="" />
                              <div>
                                <p className="main_text">Другие способы</p>
                                <p className="secondary_text">SberPay, Юmoney</p>
                              </div>
                            </div>
                            <span className="payment_custom_check"></span>
                          </div>
                        </label>
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
