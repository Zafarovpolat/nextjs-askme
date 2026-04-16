"use client";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SharePopup from "@/components/SharePopup";
import Link from "next/link";
import { useState, useRef, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import "@/styles/profile.css";
import "@/styles/profile-public.css";
import { CheckIcon } from "@/components/AboutIcons";
import { mockUsers } from "@/data/mock-users";
import { mockQuestions } from "@/data/mock-questions";
import { mockAnswers, UserAnswer } from "@/data/mock-answers";
import SearchResultCard from "@/components/SearchResultCard";
import AnswerResultCard from "@/components/AnswerResultCard";

function ProfilePageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("menu1");

  // Обработка query параметра tab
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "vip") {
      setActiveTab("menu_vip");
    }
  }, [searchParams]);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState({ title: "", url: "" });
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const BIO_MAX_LENGTH = 250;

  // Мок-данные текущего пользователя
  const user = mockUsers[0];
  const isMyProfile = true;
  const [bioText, setBioText] = useState(user.bio ?? "");
  const [emailText, setEmailText] = useState(user.email ?? "");
  const [cityText, setCityText] = useState(user.city ?? "");
  const [phoneText, setPhoneText] = useState(user.phoneNumber ?? "");

  // Функция для маски телефона РФ (+7 (XXX) XXX-XX-XX)
  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, "");
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength <= 1) return `+7`;
    if (phoneNumberLength < 5) {
      return `+7 (${phoneNumber.slice(1, 4)}`;
    }
    if (phoneNumberLength < 8) {
      return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}`;
    }
    if (phoneNumberLength < 10) {
      return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}`;
    }
    return `+7 (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 9)}-${phoneNumber.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setPhoneText(formattedValue);
  };

  // Вопросы и ответы пользователя
  const userQuestions = mockQuestions.filter((q) => q.author.id === user.id);
  const userAnswers = mockAnswers.filter((a) => a.author.id === user.id);
  const [questionsFilter, setQuestionsFilter] = useState<
    "all" | "opened" | "voting" | "closed"
  >("all");
  const [answersFilter, setAnswersFilter] = useState<"all" | "best">("all");
  const [followFilter, setFollowFilter] = useState<"all" | "online" | "vip">(
    "all",
  );
  const [subscriberFilter, setSubscriberFilter] = useState<
    "all" | "online" | "vip"
  >("all");

  // Подписки и подписчики (мок-данные)
  const userSubscriptions = mockUsers.slice(1, 8);
  const userSubscribers = mockUsers.slice(5, 12);

  const filteredSubscriptions = userSubscriptions.filter((u, index) => {
    if (followFilter === "all") return true;
    if (followFilter === "online") return index % 2 === 0; // Mock online status
    if (followFilter === "vip") return u.vipStatus;
    return true;
  });

  const filteredSubscribers = userSubscribers.filter((u, index) => {
    if (subscriberFilter === "all") return true;
    if (subscriberFilter === "online") return index % 3 === 0; // Mock online status
    if (subscriberFilter === "vip") return u.vipStatus;
    return true;
  });

  const filteredQuestions =
    questionsFilter === "all"
      ? userQuestions
      : userQuestions.filter((q) => q.status === questionsFilter);
  const filteredAnswers =
    answersFilter === "all"
      ? userAnswers
      : userAnswers.filter((a) => a.isBestAnswer);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  const renderUserFollowCard = (u: any, isSubscriberView: boolean) => (
    <div className="user-follow-card" key={u.id}>
      <div className="user-follow-left">
        <Link href={`/profile/${u.username}`}>
          <img
            src={u.avatar || "/images/icons/avatar.svg"}
            alt={u.displayName}
            className="user-follow-avatar"
          />
        </Link>
        <div className="user-follow-info">
          <Link href={`/profile/${u.username}`} className="user-follow-name">
            {u.displayName || "Login 4000"}
          </Link>
          <span className="user-follow-time">В сервисе 2 года</span>
        </div>
      </div>

      <div className="user-follow-separator"></div>

      <div className="user-follow-stat">
        <svg
          width="22"
          height="21"
          viewBox="0 0 22 21"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.7322 3.71726L15.3443 2.57747L12.8215 2.16178L11.6277 0H10.3723L9.17847 2.16178L6.65577 2.57747L6.26777 3.71722L8.05273 5.469L7.68732 7.88775L8.70306 8.59211L11 7.51298L13.297 8.59211L14.3126 7.8877L13.9473 5.469L15.7322 3.71726Z"
            fill="#5E68FF"
          />
          <path
            d="M20.668 19.7695V15.1626H15.082V19.7695H13.793V11.8813H8.20703V19.7695H6.91797V14.1372H1.33203V19.7695H0V21H22V19.7695H20.668Z"
            fill="#5E68FF"
          />
        </svg>
        <div style={{ display: "flex", gap: "4px" }}>
          <span className="user-follow-stat-bold">11 831 балл</span>
        </div>
      </div>
      <div className="user-follow-separator"></div>
      <div className="user-follow-stat">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.8182 0H3.18182C2.33826 0.00101045 1.52954 0.336559 0.933049 0.933043C0.336561 1.52953 0.00101045 2.33824 0 3.1818V8.27267C0.000925606 9.00589 0.254603 9.71637 0.718275 10.2844C1.18195 10.8524 1.82726 11.2431 2.54545 11.3908V13.3635C2.54544 13.4788 2.5767 13.5918 2.6359 13.6906C2.6951 13.7895 2.78002 13.8704 2.8816 13.9247C2.98319 13.9791 3.09762 14.0048 3.21269 13.9993C3.32777 13.9937 3.43916 13.9569 3.535 13.893L7.19091 11.4545H10.8182C11.6617 11.4535 12.4705 11.1179 13.067 10.5214C13.6634 9.92494 13.999 9.11623 14 8.27267V3.1818C13.999 2.33824 13.6634 1.52953 13.067 0.933043C12.4705 0.336559 11.6617 0.00101045 10.8182 0ZM9.54545 7.63631H4.45455C4.28577 7.63631 4.12391 7.56927 4.00457 7.44993C3.88523 7.33059 3.81818 7.16873 3.81818 6.99995C3.81818 6.83118 3.88523 6.66932 4.00457 6.54998C4.12391 6.43064 4.28577 6.36359 4.45455 6.36359H9.54545C9.71423 6.36359 9.87609 6.43064 9.99543 6.54998C10.1148 6.66932 10.1818 6.83118 10.1818 6.99995C10.1818 7.16873 10.1148 7.33059 9.99543 7.44993C9.87609 7.56927 9.71423 7.63631 9.54545 7.63631ZM10.8182 5.09087H3.18182C3.01304 5.09087 2.85118 5.02383 2.73184 4.90449C2.6125 4.78515 2.54545 4.62329 2.54545 4.45452C2.54545 4.28574 2.6125 4.12388 2.73184 4.00454C2.85118 3.8852 3.01304 3.81816 3.18182 3.81816H10.8182C10.987 3.81816 11.1488 3.8852 11.2682 4.00454C11.3875 4.12388 11.4545 4.28574 11.4545 4.45452C11.4545 4.62329 11.3875 4.78515 11.2682 4.90449C11.1488 5.02383 10.987 5.09087 10.8182 5.09087Z"
            fill="#6069FF"
          />
        </svg>
        <div style={{ display: "flex", gap: "4px" }}>
          <span className="user-follow-stat-gray">5 359</span>
          <span className="user-follow-stat-gray">вопросов</span>
        </div>
      </div>
      <div className="user-follow-separator"></div>
      <div className="user-follow-stat">
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.8182 0H3.18182C2.33826 0.00101045 1.52954 0.336559 0.933049 0.933043C0.336561 1.52953 0.00101045 2.33824 0 3.1818V8.27267C0.000925606 9.00589 0.254603 9.71637 0.718275 10.2844C1.18195 10.8524 1.82726 11.2431 2.54545 11.3908V13.3635C2.54544 13.4788 2.5767 13.5918 2.6359 13.6906C2.6951 13.7895 2.78002 13.8704 2.8816 13.9247C2.98319 13.9791 3.09762 14.0048 3.21269 13.9993C3.32777 13.9937 3.43916 13.9569 3.535 13.893L7.19091 11.4545H10.8182C11.6617 11.4535 12.4705 11.1179 13.067 10.5214C13.6634 9.92494 13.999 9.11623 14 8.27267V3.1818C13.999 2.33824 13.6634 1.52953 13.067 0.933043C12.4705 0.336559 11.6617 0.00101045 10.8182 0ZM9.54545 7.63631H4.45455C4.28577 7.63631 4.12391 7.56927 4.00457 7.44993C3.88523 7.33059 3.81818 7.16873 3.81818 6.99995C3.81818 6.83118 3.88523 6.66932 4.00457 6.54998C4.12391 6.43064 4.28577 6.36359 4.45455 6.36359H9.54545C9.71423 6.36359 9.87609 6.43064 9.99543 6.54998C10.1148 6.66932 10.1818 6.83118 10.1818 6.99995C10.1818 7.16873 10.1148 7.33059 9.99543 7.44993C9.87609 7.56927 9.71423 7.63631 9.54545 7.63631ZM10.8182 5.09087H3.18182C3.01304 5.09087 2.85118 5.02383 2.73184 4.90449C2.6125 4.78515 2.54545 4.62329 2.54545 4.45452C2.54545 4.28574 2.6125 4.12388 2.73184 4.00454C2.85118 3.8852 3.01304 3.81816 3.18182 3.81816H10.8182C10.987 3.81816 11.1488 3.8852 11.2682 4.00454C11.3875 4.12388 11.4545 4.28574 11.4545 4.45452C11.4545 4.62329 11.3875 4.78515 11.2682 4.90449C11.1488 5.02383 10.987 5.09087 10.8182 5.09087Z"
            fill="#6069FF"
          />
        </svg>
        <div style={{ display: "flex", gap: "4px" }}>
          <span className="user-follow-stat-gray">1 235</span>
          <span className="user-follow-stat-gray">ответов</span>
        </div>
      </div>

      <div className="user-follow-right">
        {isSubscriberView ? (
          <button
            className="user-follow-btn subscribe-btn"
            style={{ minWidth: "140px" }}
          >
            Подписаться
          </button>
        ) : (
          <button
            className="user-follow-btn subscribed-btn"
            style={{ minWidth: "140px" }}
          >
            Вы подписаны
          </button>
        )}
      </div>
    </div>
  );

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Обработчик клика по кнопке "Поделиться"
  const handleShareClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, title: string, slug: string) => {
      const btn = e.currentTarget;
      if (shareButtonRef.current === btn && isShareOpen) {
        setIsShareOpen(false);
        return;
      }
      shareButtonRef.current = btn;
      setShareData({
        title,
        url: `${typeof window !== "undefined" ? window.location.origin : ""}/question/${slug}`,
      });
      setIsShareOpen(true);
    },
    [isShareOpen],
  );

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
                    className={`profile_menu_item menu_item profile-edit-btn ${activeTab === "menu2" ? "active_menu" : ""}`}
                    data-id="menu2"
                    onClick={() => handleTabClick("menu2")}
                  >
                    <svg width="15.714844" height="20.000000">
                      <use xlinkHref="#profile"></use>
                    </svg>
                    <p className="main_text">Редактировать профиль</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === "menu_levels" ? "active_menu" : ""}`}
                    data-id="menu_levels"
                    onClick={() => handleTabClick("menu_levels")}
                  >
                    <svg width="13" height="20">
                      <use xlinkHref="#levels"></use>
                    </svg>
                    <p className="main_text">Уровни</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === "menu_rules" ? "active_menu" : ""}`}
                    data-id="menu_rules"
                    onClick={() => handleTabClick("menu_rules")}
                  >
                    <svg width="20" height="17">
                      <use xlinkHref="#rules"></use>
                    </svg>
                    <p className="main_text">Ограничения</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === "menu_vip" ? "active_menu" : ""}`}
                    data-id="menu_vip"
                    onClick={() => handleTabClick("menu_vip")}
                  >
                    <svg width="16" height="20">
                      <use xlinkHref="#vip"></use>
                    </svg>
                    <p className="main_text">VIP - статус</p>
                  </div>
                  <div
                    className={`profile_menu_item menu_item ${activeTab === "menu4" ? "active_menu" : ""}`}
                    data-id="menu4"
                    onClick={() => handleTabClick("menu4")}
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
                    <button
                      className="user_profile_img_action"
                      title="Редактировать аватар"
                    >
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
                <div className="user_public_stats">
                  <div className="stat_item">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <svg
                        width="30"
                        height="29"
                        viewBox="0 0 30 29"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M21.453 5.13336L20.9241 3.55937L17.4839 2.98531L15.856 0H14.144L12.5161 2.98531L9.07605 3.55937L8.54695 5.1333L10.981 7.55243L10.4827 10.8926L11.8678 11.8653L15 10.3751L18.1322 11.8653L19.5172 10.8925L19.019 7.55243L21.453 5.13336Z"
                          fill="#5E68FF"
                        />
                        <path
                          d="M28.1836 27.3008V20.9388H20.5664V27.3008H18.8086V16.4075H11.1914V27.3008H9.43359V19.5227H1.81641V27.3008H0V29H30V27.3008H28.1836Z"
                          fill="#5E68FF"
                        />
                      </svg>
                      <div className="stat_info">
                        <div className="stat_value">1&nbsp;250</div>
                        <div className="stat_label">Балл</div>
                      </div>
                    </div>
                  </div>
                  <div className="stats_divider"></div>
                  <div className="stat_item">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "15px",
                      }}
                    >
                      <svg
                        width="30"
                        height="19"
                        viewBox="0 0 30 19"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.09074 3.68822L10.0901 8.61204C11.2249 7.71796 12.6031 7.13689 14.1211 6.96867V0C10.6641 0.199499 7.5252 1.55531 5.09074 3.68822Z"
                          fill="#5E68FF"
                        />
                        <path
                          d="M3.84791 4.91228C1.49906 7.51274 0 10.9256 0 14.6719C0 15.1503 0.393105 15.5375 0.878906 15.5375H6.21094C6.69674 15.5375 7.08984 15.1503 7.08984 14.6719C7.08984 12.836 7.76467 11.169 8.84725 9.8361L3.84791 4.91228Z"
                          fill="#5E68FF"
                        />
                        <path
                          d="M21.7909 7.90326C21.4948 7.64882 21.0656 7.61587 20.7386 7.82466L13.1109 12.6168C12.0921 13.2576 11.4844 14.3489 11.4844 15.5375C11.4844 17.4471 13.0611 19 15 19C16.363 19 17.6144 18.2138 18.1877 16.9974L22.008 8.91934C22.1729 8.57106 22.0845 8.15683 21.7909 7.90326Z"
                          fill="#5E68FF"
                        />
                        <path
                          d="M26.1521 4.91228L23.5688 7.45654C23.8941 8.14044 23.9369 8.94103 23.6011 9.6505L22.4454 12.0942C22.7429 12.8992 22.9102 13.7644 22.9102 14.6719C22.9102 15.1503 23.3033 15.5375 23.7891 15.5375H29.1211C29.6069 15.5375 30 15.1503 30 14.6719C30 10.9256 28.5009 7.51274 26.1521 4.91228Z"
                          fill="#5E68FF"
                        />
                        <path
                          d="M15.8789 0V6.96867C16.6189 7.05067 17.3239 7.23413 17.9855 7.50068L19.7937 6.36463C20.5181 5.90227 21.4033 5.80307 22.3252 6.23323L24.9093 3.68822C22.4748 1.55531 19.3359 0.199499 15.8789 0Z"
                          fill="#5E68FF"
                        />
                      </svg>
                      <div className="stat_info">
                        <div className="stat_value">78%</div>
                        <div className="stat_label">
                          КПД
                          <div className="kpd_tooltip_icon">?</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Мобильное меню табов */}
              <div className="profile_menu_list_mob tabs_list_m">
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === "menu2" ? "active_menu" : ""}`}
                  data-id="menu2"
                  onClick={() => handleTabClick("menu2")}
                >
                  <svg width="15.714844" height="20.000000">
                    <use xlinkHref="#profile"></use>
                  </svg>
                </div>
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === "menu_levels" ? "active_menu" : ""}`}
                  data-id="menu_levels"
                  onClick={() => handleTabClick("menu_levels")}
                >
                  <svg width="13" height="20">
                    <use xlinkHref="#levels"></use>
                  </svg>
                </div>
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === "menu_rules" ? "active_menu" : ""}`}
                  data-id="menu_rules"
                  onClick={() => handleTabClick("menu_rules")}
                >
                  <svg width="20" height="17">
                    <use xlinkHref="#rules"></use>
                  </svg>
                </div>
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === "menu_vip" ? "active_menu" : ""}`}
                  data-id="menu_vip"
                  onClick={() => handleTabClick("menu_vip")}
                >
                  <svg width="16" height="20">
                    <use xlinkHref="#vip"></use>
                  </svg>
                </div>
                <div
                  className={`profile_menu_item menu_item_m ${activeTab === "menu4" ? "active_menu" : ""}`}
                  data-id="menu4"
                  onClick={() => handleTabClick("menu4")}
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
                className={`menu_item_content menu_item_content_m user_profile_pages_1 ${activeTab === "menu1" ? "active_menu" : ""}`}
                id="menu1"
              >
                <div className="user_profile_page_content">
                  <div className="questions_filter">
                    <button
                      className={`s_btn ${questionsFilter === "all" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setQuestionsFilter("all")}
                    >
                      Все
                    </button>
                    <button
                      className={`s_btn ${questionsFilter === "opened" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setQuestionsFilter("opened")}
                    >
                      Открытые
                    </button>
                    <button
                      className={`s_btn ${questionsFilter === "voting" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setQuestionsFilter("voting")}
                    >
                      На голосовании
                    </button>
                    <button
                      className={`s_btn ${questionsFilter === "closed" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setQuestionsFilter("closed")}
                    >
                      Решенные
                    </button>
                  </div>

                  {filteredQuestions.length > 0 ? (
                    <div
                      className="questions_list_profile"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                      }}
                    >
                      {filteredQuestions.map((question) => (
                        <SearchResultCard
                          key={question.id}
                          question={question}
                          isProfilePage={true}
                          status={question.status as any}
                          votesCount={154}
                          isOwnProfile={true}
                        />
                      ))}
                      <div
                        className="show_more_btn_wrapper"
                        style={{ display: "flex", justifyContent: "center" }}
                      >
                        <button className="show_more_btn" type="button">
                          <svg width="22" height="22">
                            <use xlinkHref="#sync"></use>
                          </svg>
                          <span>Загрузить еще</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className="secondary_text"
                      style={{ textAlign: "center", padding: "40px 0" }}
                    >
                      Вопросов пока нет
                    </p>
                  )}
                </div>
              </div>

              {/* Таб: Ответы пользователя */}
              <div
                className={`menu_item_content menu_item_content_m user_profile_pages_answers ${activeTab === "menu_answers" ? "active_menu" : ""}`}
                id="menu_answers"
              >
                <div className="user_profile_page_content">
                  <div
                    className="questions_filter"
                    style={{ marginBottom: "12px" }}
                  >
                    <button
                      className={`s_btn ${answersFilter === "all" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setAnswersFilter("all")}
                    >
                      Все
                    </button>
                    <button
                      className={`s_btn ${answersFilter === "best" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setAnswersFilter("best")}
                    >
                      Лучшие
                    </button>
                  </div>

                  {filteredAnswers.length > 0 ? (
                    <div
                      className="answers_list_profile"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                      }}
                    >
                      {filteredAnswers.map((answer) => (
                        <AnswerResultCard
                          key={answer.id}
                          answer={answer}
                          isBestView={answer.isBestAnswer}
                          isOwnProfile={true}
                        />
                      ))}
                      <div
                        className="show_more_btn_wrapper"
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          marginTop: "20px",
                        }}
                      >
                        <button className="show_more_btn" type="button">
                          <svg width="22" height="22">
                            <use xlinkHref="#sync"></use>
                          </svg>
                          <span>Загрузить еще</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className="secondary_text"
                      style={{ textAlign: "center", padding: "40px 0" }}
                    >
                      Ответов пока нет
                    </p>
                  )}
                </div>
              </div>

              {/* Таб: Подписки пользователя */}
              <div
                className={`menu_item_content menu_item_content_m user_profile_pages_answers ${activeTab === "menu_subscriptions" ? "active_menu" : ""}`}
                id="menu_subscriptions"
              >
                <div className="user_profile_page_content">
                  <div className="questions_filter">
                    <button
                      className={`s_btn ${followFilter === "all" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setFollowFilter("all")}
                    >
                      Все
                    </button>
                    <button
                      className={`s_btn ${followFilter === "online" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setFollowFilter("online")}
                    >
                      В сети
                    </button>
                    <button
                      className={`s_btn ${followFilter === "vip" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setFollowFilter("vip")}
                    >
                      VIP
                    </button>
                  </div>
                  <div
                    className="answers_list_profile"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    {filteredSubscriptions.length > 0 ? (
                      <>
                        {filteredSubscriptions.map((u) =>
                          renderUserFollowCard(u, false),
                        )}
                        <div
                          className="show_more_btn_wrapper"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "20px",
                          }}
                        >
                          <button className="show_more_btn" type="button">
                            <svg width="22" height="22">
                              <use xlinkHref="#sync"></use>
                            </svg>
                            <span>Показать еще</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <p
                        className="secondary_text"
                        style={{ textAlign: "center", padding: "40px 0" }}
                      >
                        Список пуст
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Таб: Подписчики пользователя */}
              <div
                className={`menu_item_content menu_item_content_m user_profile_pages_answers ${activeTab === "menu_subscribers" ? "active_menu" : ""}`}
                id="menu_subscribers"
              >
                <div className="user_profile_page_content">
                  <div className="questions_filter">
                    <button
                      className={`s_btn ${subscriberFilter === "all" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setSubscriberFilter("all")}
                    >
                      Все
                    </button>
                    <button
                      className={`s_btn ${subscriberFilter === "online" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setSubscriberFilter("online")}
                    >
                      В сети
                    </button>
                    <button
                      className={`s_btn ${subscriberFilter === "vip" ? "s_btn_active questions_filter_active" : ""}`}
                      onClick={() => setSubscriberFilter("vip")}
                    >
                      VIP
                    </button>
                  </div>
                  <div
                    className="answers_list_profile"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    {filteredSubscribers.length > 0 ? (
                      <>
                        {filteredSubscribers.map((u) =>
                          renderUserFollowCard(u, true),
                        )}
                        <div
                          className="show_more_btn_wrapper"
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            marginTop: "20px",
                          }}
                        >
                          <button className="show_more_btn" type="button">
                            <svg width="22" height="22">
                              <use xlinkHref="#sync"></use>
                            </svg>
                            <span>Показать еще</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <p
                        className="secondary_text"
                        style={{ textAlign: "center", padding: "40px 0" }}
                      >
                        Список пуст
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Таб 2: Редактировать профиль */}
              <div
                className={`menu_item_content profile-edit-tab menu_item_content_m ${activeTab === "menu2" ? "active_menu" : ""}`}
                id="menu2"
              >
                <div className="user_profile_page_content">
                  <div className="blocks_title">
                    <h2>Редактировать профиль</h2>
                  </div>
                  <div className="user_profile_page_content_wrapper">
                    <form
                      method="post"
                      className="form"
                      id="edit_profile_form"
                      onSubmit={handleEditSubmit}
                    >
                      <div className="profile_input">
                        <p className="main_text">Ваше имя</p>
                        <input
                          type="text"
                          placeholder="Ваше имя"
                          defaultValue={user.displayName}
                          name="name"
                        />
                      </div>

                      <div className="profile_input">
                        <p className="main_text">Ваша почта</p>
                        <input
                          type="email"
                          placeholder="Ваша почта"
                          value={emailText}
                          onChange={(e) => setEmailText(e.target.value)}
                          name="email"
                        />
                      </div>

                      <div className="profile_input">
                        <p className="main_text">Ваш город</p>
                        <input
                          type="text"
                          placeholder="Ваш город"
                          value={cityText}
                          onChange={(e) => setCityText(e.target.value)}
                          name="city"
                        />
                      </div>

                      <div className="profile_input">
                        <p className="main_text">Ваш номер телефона</p>
                        <input
                          type="text"
                          placeholder="+7 (___) ___-__-__"
                          value={phoneText}
                          onChange={handlePhoneChange}
                          name="phone"
                        />
                      </div>
                      <div className="profile_input">
                        <p className="main_text">
                          В чем вы лучше всего разбираетесь?
                        </p>
                        <div className="textarea_wrapper">
                          <textarea
                            placeholder="Опишите как можно подробнее"
                            name="description"
                            value={bioText}
                            maxLength={BIO_MAX_LENGTH}
                            onChange={(e) => setBioText(e.target.value)}
                          />
                          <span className="textarea_char_counter">
                            {BIO_MAX_LENGTH - bioText.length}
                          </span>
                        </div>
                      </div>
                      <p className="secondary_text">
                        Например, &quot;Люблю фотографировать и могу
                        порекомендовать, какую технику выбрать&quot;
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

              {/* Таб: Уровни */}
              <div
                className={`menu_item_content menu_item_content_m ${activeTab === "menu_levels" ? "active_menu" : ""}`}
                id="menu_levels"
              >
                <div className="user_profile_page_content profile-levels">
                  <div className="blocks_title">
                    <h2>Уровни</h2>
                  </div>
                  <div className="user_profile_page_content_wrapper">
                    <p className="secondary_text current_level_label">
                      Текущий уровень
                    </p>
                    <div className="levels_card">
                      <div className="levels_card_left">
                        <svg
                          width="64"
                          height="66"
                          viewBox="10 12 68 66"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M60.2579 15.4515C60.2586 15.4503 60.2602 15.4499 60.2614 15.4506C62.3954 16.6832 64.1738 18.4609 65.4051 20.5917L75.1294 37.4353C77.6339 41.7686 77.6337 47.1531 75.1306 51.4885L65.4083 68.3281C62.9053 72.6635 58.2422 75.356 53.2372 75.3537L33.7856 75.3584C31.3237 75.3574 28.8941 74.7056 26.7592 73.473C24.6242 72.2404 22.845 70.4622 21.6132 68.3307L11.889 51.4871C9.38449 47.1538 9.3847 41.7692 11.8877 37.4338L21.6101 20.5943C24.1131 16.2589 28.7762 13.5664 33.7812 13.5687L53.2303 13.5683C55.6913 13.5693 58.12 14.2206 60.2545 15.4524C60.2557 15.4531 60.2572 15.4527 60.2579 15.4515Z"
                            fill="url(#paint0_linear_3_4845)"
                          />
                          <path
                            d="M22.4899 21.0964L12.7676 37.9359C10.4384 41.9701 10.4382 46.9413 12.7682 50.9818L22.4925 67.8254C24.8251 71.8616 29.1299 74.347 33.7873 74.3464L53.2364 74.3461C57.8937 74.3456 62.2032 71.8623 64.5348 67.8238L74.2571 50.9842C76.5863 46.9501 76.5865 41.9788 74.2564 37.9383L64.5322 21.0947C62.1996 17.0586 57.8947 14.5732 53.2374 14.5737L33.7883 14.574C29.1266 14.572 24.8215 17.0579 22.4899 21.0964Z"
                            fill="url(#paint1_linear_3_4845)"
                          />
                          <path
                            d="M22.4899 21.0964L12.7676 37.9359C10.4384 41.9701 10.4382 46.9413 12.7682 50.9818L22.4925 67.8254C24.8251 71.8616 29.1299 74.347 33.7873 74.3464L53.2364 74.3461C57.8937 74.3456 62.2032 71.8623 64.5348 67.8238L74.2571 50.9842C76.5863 46.9501 76.5865 41.9788 74.2564 37.9383L64.5322 21.0947C62.1996 17.0586 57.8947 14.5732 53.2374 14.5737L33.7883 14.574C29.1266 14.572 24.8215 17.0579 22.4899 21.0964Z"
                            fill="url(#paint2_linear_3_4845)"
                          />
                          <path
                            d="M58.2425 18.942C59.7619 19.8192 61.0319 21.088 61.9118 22.6089L71.6361 39.4525C73.4201 42.5432 73.4224 46.3808 71.6377 49.4719L61.9154 66.3114C60.1308 69.4025 56.8062 71.3193 53.2375 71.3197L33.7884 71.32C32.0313 71.3184 30.3019 70.8555 28.7782 69.9758C27.2544 69.0961 25.9888 67.8298 25.1089 66.3089L15.3846 49.4653C13.6006 46.3745 13.5983 42.537 15.3829 39.4459L25.1053 22.6063C26.8899 19.5152 30.2145 17.5985 33.7831 17.5981L53.2323 17.5978C54.9894 17.5993 56.7188 18.0623 58.2425 18.942Z"
                            fill="url(#paint3_linear_3_4845)"
                          />
                          <path
                            d="M58.0939 19.1997C59.5696 20.0517 60.8035 21.2821 61.6524 22.756L71.3767 39.5996C73.1073 42.6013 73.1051 46.3257 71.3759 49.3207L61.6536 66.1603C59.9219 69.1597 56.6932 71.0212 53.2353 71.0215L33.7861 71.0218C32.0809 71.0211 30.4027 70.5703 28.927 69.7183C27.4513 68.8663 26.2174 67.6358 25.3686 66.1619L15.6443 49.3183C13.9136 46.3166 13.9137 42.5923 15.645 39.5972L25.3673 22.7577C27.0991 19.7583 30.3277 17.8967 33.7857 17.8965L53.2348 17.8961C54.94 17.8969 56.6182 18.3477 58.0939 19.1997Z"
                            fill="url(#paint4_linear_3_4845)"
                          />
                          <path
                            d="M57.7382 19.8151C59.1048 20.6041 60.2447 21.7454 61.039 23.1121L70.7633 39.9557C72.3673 42.733 72.3701 46.1866 70.7644 48.9677L61.0421 65.8072C59.4389 68.584 56.4485 70.3153 53.2369 70.3123L33.7878 70.3126C32.2088 70.3149 30.6531 69.894 29.2821 69.1025C27.9112 68.311 26.7757 67.1723 25.9814 65.8056L16.2571 48.962C14.6531 46.1847 14.6503 42.7311 16.256 39.95L25.9783 23.1104C27.5815 20.3337 30.5719 18.6024 33.7835 18.6054L53.2326 18.6051C54.8115 18.6028 56.3673 19.0236 57.7382 19.8151Z"
                            fill="url(#paint5_linear_3_4845)"
                          />
                          <path
                            d="M56.478 21.9982C57.4647 22.5679 58.2827 23.3895 58.8561 24.3725L68.5804 41.2161C69.7365 43.2166 69.7385 45.7035 68.5815 47.7075L58.8592 64.547C57.7048 66.5466 55.5475 67.7927 53.237 67.7917L33.7879 67.7921C32.6517 67.7939 31.5293 67.4894 30.5426 66.9197C29.5559 66.35 28.7379 65.5285 28.1645 64.5454L18.4402 47.7018C17.2842 45.7013 17.2821 43.2144 18.4391 41.2104L28.1614 24.3709C29.3159 22.3713 31.4731 21.1253 33.7837 21.1262L53.2328 21.1259C54.369 21.124 55.4913 21.4286 56.478 21.9982Z"
                            fill="url(#paint6_linear_3_4845)"
                          />
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M35.0569 33.0507C32.7779 33.4517 31.134 35.049 31.0081 36.9849C30.8133 39.9814 34.1446 42.219 37.5592 41.3852C38.0321 41.2698 38.2083 41.3554 39.4259 42.2923C39.763 42.5517 40.0621 42.764 40.0903 42.764C40.1936 42.764 40.1382 42.4012 39.8788 41.3776L39.6137 40.3312L39.8279 40.0658C40.7671 38.902 40.981 38.3616 40.971 37.1768C40.9608 35.9774 40.7128 35.365 39.9092 34.5564C39.2727 33.9158 38.3078 33.362 37.4838 33.1644C36.8218 33.0055 35.6306 32.9498 35.0569 33.0507ZM36.9796 35.1899C37.9546 35.7307 37.9127 36.9302 36.8967 37.5632C36.65 37.717 36.4994 37.884 36.4994 38.004C36.4994 38.1709 36.4327 38.1971 36.0072 38.1971L35.515 38.1971L35.515 37.7242C35.515 37.2809 35.5394 37.2352 35.9045 36.9968C36.4186 36.6609 36.534 36.4429 36.3415 36.1716C36.1632 35.9203 35.7343 35.8954 35.3104 36.1118C35.0425 36.2487 34.9922 36.2468 34.7247 36.0908C34.3487 35.8716 34.3414 35.5534 34.7065 35.2968C35.3346 34.8552 36.295 34.8101 36.9796 35.1899ZM43.6693 35.2682C42.9367 35.5073 42.5195 35.77 42.0151 36.3102C41.6877 36.6607 41.6132 36.8037 41.6605 36.9898C41.7688 37.4157 41.5221 38.5131 41.1506 39.2577C40.7525 40.0557 40.7387 40.2519 40.9923 41.5008C41.1832 42.4403 41.6895 43.4797 42.2631 44.1093C43.4598 45.4233 45.6774 45.6797 47.2577 44.6869C48.566 43.865 49.412 41.8785 49.4215 39.606C49.4299 37.5809 48.7016 36.2578 47.1663 35.5088C46.4672 35.1677 46.3677 35.1466 45.327 35.1173C44.4537 35.0927 44.1119 35.1238 43.6693 35.2682ZM36.4009 38.7801C36.5092 38.887 36.5978 39.0619 36.5978 39.1688C36.5978 39.5721 35.9897 39.8995 35.6528 39.6775C35.4726 39.5586 35.3045 39.1726 35.3778 39.0453C35.661 38.5531 36.065 38.4485 36.4009 38.7801ZM42.2368 45.3794C42.1168 45.4784 41.2751 45.8715 40.3665 46.2533C38.1733 47.1745 37.539 47.6748 37.102 48.8277C36.9286 49.2853 36.2034 54.4876 36.2044 55.2669C36.205 55.7086 36.5314 56.1325 37.0078 56.3102C37.5453 56.5107 38.9505 56.7536 39.0113 56.6564C39.0364 56.6163 39.1014 55.4771 39.1557 54.1248C39.2099 52.7725 39.2959 51.625 39.3468 51.5747C39.3977 51.5245 39.5133 51.5115 39.6037 51.5458C39.7544 51.6028 39.7621 51.8324 39.6964 54.2634L39.6245 56.9188L42.6148 56.9739C45.7215 57.0313 50.2279 56.9884 50.4684 56.8993C50.5843 56.8564 50.5974 56.4402 50.5493 54.3244C50.4989 52.1099 50.5108 51.782 50.6464 51.648C50.9838 51.315 51.0421 51.6392 51.1099 54.2258C51.1455 55.5863 51.1845 56.7091 51.1964 56.7208C51.2468 56.7706 52.7785 56.4685 53.2359 56.3185C53.9038 56.0995 54.0584 55.8535 53.9822 55.1309C53.7682 53.1025 53.4018 50.0275 53.3285 49.6441C52.9983 47.9191 52.2122 47.2401 49.0755 45.9701C48.6562 45.8003 48.1558 45.5561 47.9637 45.4273C47.7715 45.2986 47.5884 45.1933 47.5568 45.1933C47.5253 45.1933 47.2071 45.3353 46.8496 45.5091C46.2305 45.81 46.1462 45.8249 45.0656 45.8249C43.9903 45.8249 43.8965 45.8085 43.256 45.5091C42.8844 45.3353 42.5522 45.1947 42.5177 45.1965C42.4832 45.1983 42.3568 45.2806 42.2368 45.3794Z"
                            fill="#FCFCFD"
                          />
                          <defs>
                            <linearGradient
                              id="paint0_linear_3_4845"
                              x1="44.2268"
                              y1="10.7918"
                              x2="47.0321"
                              y2="81.6178"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#5E68FF" />
                              <stop offset="1" stop-color="#4D57F6" />
                            </linearGradient>
                            <linearGradient
                              id="paint1_linear_3_4845"
                              x1="25.3952"
                              y1="75.8348"
                              x2="59.6439"
                              y2="16.5144"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#FFE1FB" />
                              <stop offset="0.39" stop-color="#FE10DA" />
                              <stop offset="1" stop-color="#7509E7" />
                            </linearGradient>
                            <linearGradient
                              id="paint2_linear_3_4845"
                              x1="18.4724"
                              y1="60.3907"
                              x2="102.097"
                              y2="-23.6887"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#3943DB" />
                              <stop offset="1" stop-color="#515CFF" />
                            </linearGradient>
                            <linearGradient
                              id="paint3_linear_3_4845"
                              x1="44.2828"
                              y1="14.9271"
                              x2="47.0652"
                              y2="77.0017"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#5E68FF" />
                              <stop offset="1" stop-color="#4D57F6" />
                            </linearGradient>
                            <linearGradient
                              id="paint4_linear_3_4845"
                              x1="21.1387"
                              y1="58.8207"
                              x2="96.3441"
                              y2="-16.4188"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#3943DB" />
                              <stop offset="1" stop-color="#515CFF" />
                            </linearGradient>
                            <linearGradient
                              id="paint5_linear_3_4845"
                              x1="44.2966"
                              y1="15.961"
                              x2="47.0745"
                              y2="75.8473"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#5E68FF" />
                              <stop offset="1" stop-color="#4D57F6" />
                            </linearGradient>
                            <linearGradient
                              id="paint6_linear_3_4845"
                              x1="23.7299"
                              y1="57.2945"
                              x2="90.7507"
                              y2="-9.35137"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#3943DB" />
                              <stop offset="1" stop-color="#515CFF" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="levels_card_center">
                        <div className="levels_progress_wrapper">
                          <div className="levels_progress_labels mobile">
                            <span>До следующего уровня осталось</span>
                          </div>
                          <div className="levels_progress_bar">
                            <div
                              className="levels_progress_value"
                              style={{ width: "25%" }}
                            ></div>
                            <div
                              className="levels_progress_thumb"
                              style={{ left: "25%" }}
                            ></div>
                          </div>
                          <div className="levels_progress_labels">
                            <span>До следующего уровня осталось</span>
                            <span>100 ответов</span>
                          </div>
                        </div>
                      </div>
                      <div className="levels_card_right">
                        <svg
                          width="64"
                          height="66"
                          viewBox="10 12 68 66"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M60.2579 15.4515C60.2586 15.4503 60.2602 15.4499 60.2614 15.4506C62.3954 16.6832 64.1738 18.4609 65.4051 20.5917L75.1294 37.4353C77.6339 41.7686 77.6337 47.1531 75.1306 51.4885L65.4083 68.3281C62.9053 72.6635 58.2422 75.356 53.2372 75.3537L33.7856 75.3584C31.3237 75.3574 28.8942 74.7056 26.7592 73.473C24.6242 72.2404 22.845 70.4622 21.6133 68.3307L11.889 51.4871C9.3845 47.1538 9.38472 41.7692 11.8878 37.4338L21.6101 20.5943C24.1131 16.2589 28.7762 13.5664 33.7812 13.5687L53.2303 13.5683C55.6913 13.5693 58.1201 14.2206 60.2545 15.4524C60.2557 15.4531 60.2572 15.4527 60.2579 15.4515Z"
                            fill="url(#paint0_linear_3_4874)"
                          />
                          <path
                            d="M22.4899 21.0964L12.7676 37.9359C10.4385 41.9701 10.4382 46.9413 12.7683 50.9818L22.4926 67.8254C24.8252 71.8616 29.13 74.347 33.7873 74.3464L53.2364 74.3461C57.8938 74.3456 62.2032 71.8623 64.5349 67.8238L74.2572 50.9842C76.5863 46.9501 76.5866 41.9788 74.2565 37.9383L64.5322 21.0947C62.1996 17.0586 57.8948 14.5732 53.2375 14.5737L33.7883 14.574C29.1266 14.572 24.8216 17.0579 22.4899 21.0964Z"
                            fill="url(#paint1_linear_3_4874)"
                          />
                          <path
                            d="M22.4899 21.0964L12.7676 37.9359C10.4385 41.9701 10.4382 46.9413 12.7683 50.9818L22.4926 67.8254C24.8252 71.8616 29.13 74.347 33.7873 74.3464L53.2364 74.3461C57.8938 74.3456 62.2032 71.8623 64.5349 67.8238L74.2572 50.9842C76.5863 46.9501 76.5866 41.9788 74.2565 37.9383L64.5322 21.0947C62.1996 17.0586 57.8948 14.5732 53.2375 14.5737L33.7883 14.574C29.1266 14.572 24.8216 17.0579 22.4899 21.0964Z"
                            fill="url(#paint2_linear_3_4874)"
                          />
                          <path
                            d="M58.2425 18.942C59.7619 19.8192 61.0319 21.088 61.9118 22.6089L71.6361 39.4525C73.4201 42.5432 73.4224 46.3808 71.6377 49.4719L61.9154 66.3114C60.1308 69.4025 56.8062 71.3193 53.2375 71.3197L33.7884 71.32C32.0313 71.3184 30.3019 70.8555 28.7782 69.9758C27.2544 69.0961 25.9888 67.8298 25.1089 66.3089L15.3846 49.4653C13.6006 46.3745 13.5983 42.537 15.3829 39.4459L25.1053 22.6063C26.8899 19.5152 30.2145 17.5985 33.7831 17.5981L53.2323 17.5978C54.9894 17.5993 56.7188 18.0623 58.2425 18.942Z"
                            fill="url(#paint3_linear_3_4874)"
                          />
                          <path
                            d="M58.0939 19.1997C59.5696 20.0517 60.8035 21.2821 61.6524 22.756L71.3767 39.5996C73.1073 42.6013 73.1051 46.3257 71.3759 49.3207L61.6536 66.1603C59.9219 69.1597 56.6932 71.0212 53.2353 71.0215L33.7861 71.0218C32.0809 71.0211 30.4027 70.5703 28.927 69.7183C27.4513 68.8663 26.2174 67.6358 25.3686 66.1619L15.6443 49.3183C13.9137 46.3166 13.9159 42.5923 15.645 39.5972L25.3674 22.7577C27.0991 19.7583 30.3277 17.8967 33.7857 17.8965L53.2348 17.8961C54.94 17.8969 56.6183 18.3477 58.0939 19.1997Z"
                            fill="url(#paint4_linear_3_4874)"
                          />
                          <path
                            d="M57.7382 19.8151C59.1048 20.6041 60.2447 21.7454 61.039 23.1121L70.7633 39.9557C72.3673 42.733 72.3701 46.1866 70.7644 48.9677L61.0421 65.8072C59.4389 68.584 56.4485 70.3153 53.2369 70.3123L33.7878 70.3126C32.2088 70.3149 30.6531 69.894 29.2821 69.1025C27.9112 68.311 26.7757 67.1723 25.9814 65.8056L16.2571 48.962C14.6531 46.1847 14.6503 42.7311 16.256 39.95L25.9783 23.1104C27.5815 20.3337 30.5719 18.6024 33.7835 18.6054L53.2326 18.6051C54.8115 18.6028 56.3673 19.0236 57.7382 19.8151Z"
                            fill="url(#paint5_linear_3_4874)"
                          />
                          <path
                            d="M56.4781 21.9982C57.4648 22.5679 58.2828 23.3895 58.8562 24.3725L68.5805 41.2161C69.7365 43.2166 69.7386 45.7035 68.5816 47.7075L58.8593 64.547C57.7048 66.5466 55.5475 67.7927 53.237 67.7917L33.7879 67.7921C32.6517 67.7939 31.5294 67.4894 30.5426 66.9197C29.5559 66.35 28.7379 65.5285 28.1645 64.5454L18.4402 47.7018C17.2842 45.7013 17.2821 43.2144 18.4391 41.2104L28.1614 24.3709C29.3159 22.3713 31.4732 21.1253 33.7837 21.1262L53.2328 21.1259C54.369 21.124 55.4913 21.4286 56.4781 21.9982Z"
                            fill="url(#paint6_linear_3_4874)"
                          />
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M43.0318 31.0658C40.7899 31.4556 39.5154 33.2562 39.6627 35.8253C39.7691 37.6789 40.2843 38.9766 41.2752 39.8866C42.1266 40.6683 42.8815 40.9261 44.1547 40.8697C45.3052 40.8187 45.9534 40.5477 46.7051 39.8032C47.6763 38.8413 48.143 37.4727 48.1619 35.5304C48.1791 33.7749 47.6762 32.6095 46.5513 31.7983C45.6593 31.1551 44.2296 30.8575 43.0318 31.0658ZM41.6822 41.3343C41.5009 41.7609 41.0918 42.0063 40.0281 42.3269C39.5607 42.4677 38.8633 42.7412 38.4784 42.9344L37.7785 43.2859L38.2284 43.3571C38.4759 43.3963 38.8624 43.4316 39.0873 43.4356C40.2856 43.4569 42.2859 44.2563 43.3392 45.1347L43.9819 45.6708L44.5795 45.19C45.3725 44.5521 46.2086 44.0989 47.1454 43.7993C47.9642 43.5373 49.4481 43.3368 50.0262 43.41C50.3624 43.4525 50.3683 43.448 50.1762 43.2948C49.8296 43.0183 48.6045 42.4798 47.8674 42.2801C46.9261 42.025 46.5578 41.8265 46.3229 41.4477C46.2155 41.2747 46.1163 41.0999 46.1023 41.0594C46.0883 41.0189 45.8295 41.083 45.5271 41.2017C44.7547 41.5051 43.2265 41.5084 42.401 41.2087L41.8245 40.9993L41.6822 41.3343ZM37.1109 43.8012C36.8154 43.8526 36.6868 43.9739 36.5864 44.2963C36.5256 44.4911 36.5633 44.5162 36.999 44.5716C38.3798 44.7468 41.4876 45.6281 42.9437 46.2573C43.3651 46.4393 43.8063 46.5882 43.9243 46.5882C44.0421 46.5882 44.5088 46.4375 44.9613 46.2534C46.7278 45.5345 49.5363 44.7336 50.8609 44.5709C51.4063 44.5039 51.4222 44.4935 51.363 44.2426C51.2511 43.7675 51.0798 43.7132 49.8762 43.7713C49.2714 43.8004 48.4165 43.915 47.9766 44.0258C46.8802 44.302 45.506 44.9927 44.7458 45.6495C44.3987 45.9496 44.0752 46.1951 44.027 46.1951C43.9789 46.1951 43.733 46.0193 43.4805 45.8045C42.524 44.9906 41.1064 44.3127 39.6818 43.9879C38.9755 43.8268 37.5562 43.7238 37.1109 43.8012ZM35.7362 45.1543C35.5911 45.3262 35.5881 45.38 35.6106 47.3816L35.6289 49.0106L36.3357 49.1182C37.2631 49.2593 38.0815 49.6534 38.2941 50.0611C38.3835 50.2323 38.5626 50.4975 38.6924 50.6503C39.0035 51.0167 38.9984 51.5226 38.6771 52.1564C38.415 52.6736 38.2881 52.7617 37.3379 53.087C36.7047 53.3038 36.5282 53.3174 36.5299 53.1492C36.5306 53.0817 36.8462 52.901 37.2311 52.7478C37.616 52.5947 37.9979 52.4035 38.0796 52.3231C38.3998 52.0083 38.2555 51.9646 37.1286 52.0347C36.4617 52.0762 36.0288 52.0669 36.0288 52.011C36.0288 51.8896 36.383 51.8009 36.8787 51.7982C38.2489 51.7906 38.7176 51.5558 38.3784 51.0467C38.217 50.8047 38.1944 50.8008 37.0524 50.825C35.6056 50.8556 35.3665 50.6687 36.7608 50.5971C37.8268 50.5422 37.9739 50.492 37.8319 50.2313C37.7038 49.9961 37.0185 49.6869 36.3026 49.5414C35.6656 49.4119 35.2149 49.4998 34.7018 49.8538C33.8159 50.4649 33.7551 52.3478 34.5971 53.0963C34.8862 53.3534 35.4796 53.567 35.9047 53.567C36.115 53.567 36.9151 53.7912 37.6826 54.0652C38.9138 54.5048 41.7903 55.3942 42.5526 55.571L42.8276 55.6348L42.8276 51.2666L42.8276 46.8983L42.5026 46.7945C41.5609 46.4936 36.1847 45.0156 36.0319 45.0156C35.9337 45.0156 35.8006 45.0781 35.7362 45.1543ZM51.176 45.1635C50.956 45.2363 50.2137 45.4517 49.5263 45.642C48.8389 45.8324 47.6017 46.1803 46.7768 46.4152L45.2771 46.8424L45.2511 51.1876C45.2303 54.6485 45.2509 55.5328 45.352 55.5328C45.4219 55.5328 46.041 55.38 46.7278 55.1935C47.8863 54.8787 48.4964 54.684 50.8699 53.8725C51.3613 53.7045 51.9139 53.567 52.0978 53.567C52.9218 53.567 53.6513 53.0125 53.8902 52.2047C54.3318 50.7113 53.3864 49.3108 52.0425 49.4678C51.0908 49.579 50.1262 50.0082 50.1262 50.3207C50.1262 50.4581 50.2477 50.5044 50.7408 50.5551C51.0787 50.5898 51.5511 50.6182 51.7906 50.6182C52.0299 50.6182 52.2258 50.6624 52.2258 50.7165C52.2258 50.7766 51.7492 50.8148 50.996 50.8148C49.6997 50.8148 49.5263 50.8679 49.5263 51.2648C49.5263 51.5848 49.7013 51.6678 50.5261 51.739C51.6359 51.8349 52.1422 51.9126 52.0768 51.977C52.0076 52.0449 50.4958 52.0126 50.1012 51.9346C49.8724 51.8895 49.8263 51.9144 49.8263 52.0828C49.8263 52.3084 50.2348 52.5456 51.1061 52.8258C51.4101 52.9236 51.6185 53.0446 51.595 53.1096C51.5421 53.2554 51.2396 53.2208 50.3972 52.9726C49.6653 52.7569 49.5017 52.5918 49.1642 51.7282C48.983 51.2648 49.0337 50.9059 49.3199 50.6245C49.4236 50.5226 49.5846 50.2814 49.6777 50.0886C49.8873 49.6542 50.6208 49.2759 51.5596 49.1178C52.3412 48.9862 52.3001 49.1036 52.345 46.8737C52.3787 45.1964 52.3274 45.0089 51.8387 45.0233C51.6941 45.0276 51.396 45.0907 51.176 45.1635ZM43.164 47.2271C43.1427 47.2812 43.137 49.2255 43.1514 51.5479L43.1775 55.7704L43.5524 55.9106C43.8865 56.0357 43.9765 56.0325 44.3773 55.882L44.8272 55.7132L44.8272 51.4162L44.8272 47.1194L44.0149 47.1241C43.5682 47.1267 43.1853 47.1731 43.164 47.2271Z"
                            fill="#FCFCFD"
                          />
                          <defs>
                            <linearGradient
                              id="paint0_linear_3_4874"
                              x1="44.2268"
                              y1="10.7918"
                              x2="47.0321"
                              y2="81.6178"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#5E68FF" />
                              <stop offset="1" stop-color="#4D57F6" />
                            </linearGradient>
                            <linearGradient
                              id="paint1_linear_3_4874"
                              x1="25.3953"
                              y1="75.8348"
                              x2="59.6439"
                              y2="16.5144"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#FFE1FB" />
                              <stop offset="0.39" stop-color="#FE10DA" />
                              <stop offset="1" stop-color="#7509E7" />
                            </linearGradient>
                            <linearGradient
                              id="paint2_linear_3_4874"
                              x1="18.4724"
                              y1="60.3907"
                              x2="102.098"
                              y2="-23.6887"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#3943DB" />
                              <stop offset="1" stop-color="#515CFF" />
                            </linearGradient>
                            <linearGradient
                              id="paint3_linear_3_4874"
                              x1="44.2828"
                              y1="14.9271"
                              x2="47.0652"
                              y2="77.0017"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#5E68FF" />
                              <stop offset="1" stop-color="#4D57F6" />
                            </linearGradient>
                            <linearGradient
                              id="paint4_linear_3_4874"
                              x1="21.1387"
                              y1="58.8207"
                              x2="96.3441"
                              y2="-16.4188"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#3943DB" />
                              <stop offset="1" stop-color="#515CFF" />
                            </linearGradient>
                            <linearGradient
                              id="paint5_linear_3_4874"
                              x1="44.2966"
                              y1="15.961"
                              x2="47.0745"
                              y2="75.8473"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#5E68FF" />
                              <stop offset="1" stop-color="#4D57F6" />
                            </linearGradient>
                            <linearGradient
                              id="paint6_linear_3_4874"
                              x1="23.7299"
                              y1="57.2945"
                              x2="90.7507"
                              y2="-9.35137"
                              gradientUnits="userSpaceOnUse"
                            >
                              <stop stop-color="#3943DB" />
                              <stop offset="1" stop-color="#515CFF" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>

                    <div className="levels_info_text">
                      <h3 className="levels_info_title">Уровень новичек</h3>
                      <p className="secondary_text">
                        Категории были формальными и жесткими рамками. Мы
                        сделали на основе них пространства — тематические
                        разделы, в которых люди находят единомышленников,
                        обсуждают важные и не очень вопросы, делятся опытом и
                        поддержкой. Каждое пространство — это полноценный
                        подсайт, со своими героями, мемами, спорами и
                        поддержкой.
                      </p>
                    </div>

                    <div className="levels_actions">
                      <button className="m_btn vip_buy_btn_new" type="button">
                        Купить VIP
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Таб: Ограничения */}
              <div
                className={`menu_item_content menu_item_content_m ${activeTab === "menu_rules" ? "active_menu" : ""}`}
                id="menu_rules"
              >
                <div className="user_profile_page_content profile-rules">
                  <div className="blocks_title">
                    <h2>Ограничения</h2>
                  </div>
                  <div className="user_profile_page_content_wrapper">
                    <section className="profile_rules_section">
                      <h3 className="rules_subtitle">Правила</h3>
                      <p className="rules_text_bold rules_text_bold_new">
                        Основные принципы:
                      </p>
                      <ul className="profile_rules_list">
                        <li>
                          <CheckIcon />
                          <span>
                            Не публикуйте спам и рекламу: материалы рекламного
                            характера или не имеющие ценности для пользователей
                            Ответов будут удаляться.
                          </span>
                        </li>
                        <li>
                          <CheckIcon />
                          <span>
                            Не вводите в заблуждение и не обманывайте других.
                          </span>
                        </li>
                        <li>
                          <CheckIcon />
                          <span>
                            Не собирайте деньги и не продвигайте схемы заработка
                            любых цветов (белые, серые, черные) Соблюдайте
                            законы РФ.
                          </span>
                        </li>
                        <li>
                          <CheckIcon />
                          <span>
                            Соблюдайте авторские права: указывайте источники при
                            использовании материалов, созданных другими людьми.
                          </span>
                        </li>
                        <li>
                          <CheckIcon />
                          <span>
                            Оставайтесь в рамках темы пространства: публикации
                            должны соответствовать тематике пространства, в
                            котором они размещаются.
                          </span>
                        </li>
                        <li>
                          <CheckIcon />
                          <span>Уважайте собеседников и будьте вежливы.</span>
                        </li>
                      </ul>
                    </section>

                    <section className="profile_rules_section">
                      <h3 className="rules_subtitle rules_text_bold_new">
                        Модерация и безопасность
                      </h3>
                      <ul className="profile_rules_list">
                        <li>
                          <CheckIcon />
                          <span>
                            Алгоритмы находят спам и запрещённый контент
                            автоматически.
                          </span>
                        </li>
                        <li>
                          <CheckIcon />
                          <span>
                            Команда модерации внимательно следит за жалобами и
                            нарушениями.
                          </span>
                        </li>
                        <li>
                          <CheckIcon />
                          <span>
                            Любой пользователь может пожаловаться на нарушение.
                            Решение будет принято как можно быстрее. При
                            удалении поста пользователь получает уведомление и
                            (в большинстве случаев) может обжаловать решение.
                            Чтобы обжаловать решение, перейдите по этой ссылке.
                          </span>
                        </li>
                      </ul>
                    </section>

                    <section className="profile_rules_section">
                      <h3 className="rules_subtitle rules_text_bold_new">
                        Как сервис работает
                      </h3>
                      <ul className="profile_rules_list">
                        <li>
                          <CheckIcon />
                          <span>
                            Зарегистрируйтесь или войдите. Можно выбрать любой
                            ник и аватар.
                          </span>
                        </li>
                        <li>
                          <CheckIcon />
                          <span>
                            Создайте пост и выберите его тип: Знания, Мнения или
                            Истории.
                          </span>
                        </li>
                        <li>
                          <CheckIcon />
                          <span>
                            Получайте ответы и вступайте в продвинутые
                            обсуждения в ветках.
                          </span>
                        </li>
                        <li>
                          <CheckIcon />
                          <span>
                            Повышайте карму за полезные, смешные и интересные
                            ответы. В каждом типе постов — своя система оценки и
                            изменения Кармы.
                          </span>
                        </li>
                      </ul>
                    </section>
                  </div>
                </div>
              </div>

              {/* Таб: VIP-статус */}
              <div
                className={`menu_item_content menu_item_content_m ${activeTab === "menu_vip" ? "active_menu" : ""}`}
                id="menu_vip"
              >
                <div className="user_profile_page_content profile-vip">
                  <div className="blocks_title">
                    <h2>Активировать VIP-статус</h2>
                  </div>
                  <div className="user_profile_page_content_wrapper">
                    <p className="secondary_text">
                      VIP — это особые знаки отличия на проекте, выделение
                      ответов и вопросов в общих списках, в два раза больше
                      баллов за каждый ответ и увеличение ежедневного лимита
                      вопросов до 100, возможность скрыть списки вопросов и
                      ответов в своем личном кабинете, а также отключение
                      рекламы!
                    </p>
                    <form method="post" className="vip_form">
                      {/* Карточки услуг */}
                      <div className="vip_status_card">
                        <div>
                          <img src="/images/icons/vip.svg" alt="VIP" />
                          <h3>100 ₽</h3>
                          <div className="secondary_text">
                            Продление VIP статуса на 10 дней
                          </div>
                        </div>
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 15 15"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13.6619 1.9725C12.59 0.75 10.2886 0 7.5 0C4.71139 0 2.41005 0.75 1.33808 1.9725C-0.446027 4.0425 -0.446027 10.9725 1.33808 13.0275C2.41005 14.25 4.71139 15 7.5 15C10.2886 15 12.59 14.25 13.6619 13.0275C15.446 10.9575 15.446 4.0425 13.6619 1.9725ZM7.5 3.5625C7.68533 3.5625 7.86649 3.61748 8.02059 3.7205C8.17468 3.82351 8.29478 3.96993 8.3657 4.14123C8.43663 4.31254 8.45518 4.50104 8.41903 4.6829C8.38287 4.86475 8.29363 5.0318 8.16258 5.16291C8.03154 5.29402 7.86457 5.38331 7.68281 5.41949C7.50104 5.45566 7.31263 5.43709 7.14141 5.36614C6.97019 5.29518 6.82385 5.17502 6.72089 5.02085C6.61793 4.86668 6.56297 4.68542 6.56297 4.5C6.56297 4.25136 6.66169 4.0129 6.83742 3.83709C7.01315 3.66127 7.25148 3.5625 7.5 3.5625ZM8.24963 11.625H6.75038C6.55156 11.625 6.36089 11.546 6.22031 11.4053C6.07973 11.2647 6.00075 11.0739 6.00075 10.875C6.00075 10.6761 6.07973 10.4853 6.22031 10.3447C6.36089 10.204 6.55156 10.125 6.75038 10.125V7.875C6.55156 7.875 6.36089 7.79598 6.22031 7.65533C6.07973 7.51468 6.00075 7.32391 6.00075 7.125C6.00075 6.92609 6.07973 6.73532 6.22031 6.59467C6.36089 6.45402 6.55156 6.375 6.75038 6.375H7.5C7.69881 6.375 7.88948 6.45402 8.03007 6.59467C8.17065 6.73532 8.24963 6.92609 8.24963 7.125V10.125C8.44844 10.125 8.63911 10.204 8.77969 10.3447C8.92027 10.4853 8.99925 10.6761 8.99925 10.875C8.99925 11.0739 8.92027 11.2647 8.77969 11.4053C8.63911 11.546 8.44844 11.625 8.24963 11.625Z"
                            fill="#636BFF"
                          />
                        </svg>
                      </div>

                      <div className="mini-title">Выберите способ платежа</div>

                      {/* Блок AskPay: инпут ФИО + кнопка выйти */}
                      <div className="payment_askpay_block">
                        <input
                          type="text"
                          placeholder="Введите ФИО"
                          className="payment_fio_input"
                        />
                        <button type="button" className="payment_logout_btn">
                          <span>Выйти</span>
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10.5303 8.28597C10.3834 8.27356 10.2378 8.32149 10.1253 8.41926C10.0128 8.51703 9.94258 8.65666 9.93012 8.80751C9.88091 9.40399 9.81999 9.92282 9.76668 10.1955V10.1988C9.60939 11.0324 8.84081 11.8564 8.05261 12.0376C7.98436 12.052 7.91582 12.0659 7.84757 12.0791C7.90615 11.3048 7.9498 10.3147 7.94394 9.55115C7.95273 8.38468 7.84406 6.58864 7.74769 5.87389C7.57459 4.55786 6.78697 3.09827 5.91558 2.47802L5.9103 2.4744C5.30444 2.05386 4.65512 1.70353 3.97421 1.42982C3.85275 1.38147 3.73276 1.33633 3.61423 1.2944C4.26061 1.19172 4.91384 1.1414 5.5679 1.14392C6.45833 1.14392 7.27114 1.22728 8.05261 1.39401C8.84081 1.57458 9.60939 2.39917 9.76668 3.23279V3.2361C9.8197 3.50695 9.88062 4.02578 9.92983 4.62045C9.94234 4.77158 10.0128 4.91142 10.1256 5.0092C10.2385 5.10698 10.3845 5.15469 10.5316 5.14184C10.6787 5.12899 10.8148 5.05663 10.91 4.94068C11.0051 4.82472 11.0516 4.67468 11.0391 4.52355C10.9857 3.87982 10.9201 3.32939 10.8586 3.0128C10.6158 1.73047 9.51127 0.554068 8.28927 0.275994L8.28224 0.274489C7.42345 0.0915136 6.53595 0.00183172 5.56585 2.60448e-05C4.59575 -0.00177963 3.71177 0.0903099 2.85297 0.27479L2.84565 0.276295C2.30026 0.400585 1.7786 0.703939 1.34627 1.11533C1.22943 1.20585 1.1273 1.31485 1.0437 1.43825C0.661754 1.89629 0.384374 2.44431 0.276585 3.0128C0.141556 3.70828 -0.0110467 5.51185 0.000669454 6.71564C-0.00577444 7.36147 0.0349392 8.18004 0.0952775 8.90743C0.127497 9.37389 0.16411 9.78017 0.199259 10.0408C0.372365 11.3568 1.15998 12.8164 2.03167 13.4367L2.03665 13.4403C2.64266 13.8608 3.29207 14.2111 3.97304 14.4849C4.66253 14.7599 5.29521 14.9267 5.90767 14.9947H5.91294C6.736 15.0702 7.48408 14.3362 7.71049 13.263C7.90205 13.2317 8.09195 13.1961 8.28019 13.1562L8.28722 13.1547C9.50951 12.8766 10.6138 11.7002 10.8566 10.4179C10.9181 10.1007 10.984 9.54905 11.0373 8.90382C11.0497 8.75283 11.0033 8.60295 10.9082 8.4871C10.8132 8.37125 10.6772 8.29891 10.5303 8.28597Z"
                              fill="#5D67FF"
                            />
                            <path
                              d="M15 6.71474C15 6.69578 15 6.67682 14.9971 6.65786C14.9972 6.65666 14.9972 6.65544 14.9971 6.65424C14.9953 6.63646 14.9927 6.61878 14.9892 6.60128V6.59737C14.9672 6.48869 14.9148 6.389 14.8383 6.31056L12.8466 4.26233C12.7422 4.15505 12.6006 4.09477 12.453 4.09474C12.3054 4.09472 12.1638 4.15494 12.0594 4.26218C11.955 4.36941 11.8963 4.51486 11.8963 4.66654C11.8963 4.81822 11.9549 4.9637 12.0592 5.07097L13.104 6.14414H9.26201C9.11441 6.14414 8.97286 6.20438 8.86849 6.31162C8.76412 6.41885 8.70549 6.56429 8.70549 6.71594C8.70549 6.86759 8.76412 7.01303 8.86849 7.12026C8.97286 7.22749 9.11441 7.28774 9.26201 7.28774H13.0991L12.0551 8.36031C11.9511 8.46762 11.8928 8.61294 11.893 8.76438C11.8931 8.91583 11.9517 9.06103 12.056 9.16811C12.1602 9.2752 12.3015 9.33543 12.4489 9.33559C12.5963 9.33575 12.7377 9.27582 12.8422 9.16895L14.8248 7.13185C14.8967 7.06265 14.9493 6.97495 14.9772 6.87785C14.9822 6.86054 14.9863 6.84295 14.9895 6.82518C14.9896 6.82268 14.9896 6.82016 14.9895 6.81766C14.9921 6.80231 14.9947 6.78756 14.9962 6.77131C14.9977 6.75506 14.9962 6.74784 14.9962 6.7364C14.9962 6.72978 14.9962 6.72316 14.9962 6.71654L15 6.71474Z"
                              fill="#5D67FF"
                            />
                          </svg>
                        </button>
                      </div>

                      <div className="payment_methods">
                        {/* Банковская карта */}
                        <label className="payment_method_label">
                          <input
                            type="radio"
                            name="payment_method"
                            value="card"
                            defaultChecked
                            className="payment_radio"
                          />
                          <div className="payment_method">
                            <div className="payment_method_type">
                              <img src="/images/icons/payment/1.svg" alt="" />
                              <div>
                                <p className="main_text">Банковская карта</p>
                                <p className="secondary_text">
                                  Мир, UnionPay, Visa, Mastercard и другие
                                </p>
                              </div>
                            </div>
                            <span className="payment_custom_check"></span>
                          </div>
                        </label>

                        {/* Мобильный платёж */}
                        <label className="payment_method_label">
                          <input
                            type="radio"
                            name="payment_method"
                            value="mobile"
                            className="payment_radio"
                          />
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
                          <input
                            type="radio"
                            name="payment_method"
                            value="askpay"
                            className="payment_radio"
                          />
                          <div className="payment_method">
                            <div className="payment_method_type">
                              <svg
                                width="27"
                                height="24"
                                viewBox="0 0 27 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M26.9676 13.3539L24.9261 1.74586C24.7458 0.721037 23.8569 0 22.8537 0C22.7322 0 4.97533 3.12783 4.97533 3.12783C3.82941 3.33042 3.06424 4.42599 3.26632 5.57485L3.46312 6.69394H19.4888C21.5219 6.69394 23.1759 8.3522 23.1759 10.3905V16.169L25.2586 15.8009C26.4045 15.5983 27.1697 14.5027 26.9676 13.3539Z"
                                  fill="#5D67FF"
                                />
                                <path
                                  d="M21.5957 17.0495H0V21.8877C0 23.0543 0.943313 24 2.1069 24H19.4888C20.6524 24 21.5957 23.0543 21.5957 21.8877V17.0495ZM6.2726 22.0969H2.68824C2.25192 22.0969 1.89817 21.7423 1.89817 21.3048C1.89817 20.8674 2.25192 20.5127 2.68824 20.5127H6.2726C6.70892 20.5127 7.06267 20.8674 7.06267 21.3048C7.06267 21.7423 6.70898 22.0969 6.2726 22.0969Z"
                                  fill="#5D67FF"
                                />
                                <path
                                  d="M0.00258399 10.2875H21.5931C21.5395 9.16877 20.6179 8.27824 19.4887 8.27824H2.1069C0.977749 8.27824 0.0561621 9.16877 0.00258399 10.2875Z"
                                  fill="#5D67FF"
                                />
                                <path
                                  d="M0 11.8717H21.5957V15.4653H0V11.8717Z"
                                  fill="#5D67FF"
                                />
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
                          <input
                            type="radio"
                            name="payment_method"
                            value="other"
                            className="payment_radio"
                          />
                          <div className="payment_method">
                            <div className="payment_method_type">
                              <img src="/images/icons/payment/4.svg" alt="" />
                              <div>
                                <p className="main_text">Другие способы</p>
                                <p className="secondary_text">
                                  SberPay, Юmoney
                                </p>
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
                className={`menu_item_content menu_item_content_m ${activeTab === "menu4" ? "active_menu" : ""}`}
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
                      <label className="chechbox_item">
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </label>
                      <label className="chechbox_item">
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">
                        Новый ответ на мой вопрос
                      </p>
                      <label className="chechbox_item">
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </label>
                      <label className="chechbox_item">
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">
                        Мой вопрос или ответ понравился
                      </p>
                      <label className="chechbox_item">
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </label>
                      <label className="chechbox_item">
                        <input type="checkbox" />
                        <span></span>
                      </label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">
                        Мне оставили новый комментарий
                      </p>
                      <label className="chechbox_item">
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </label>
                      <label className="chechbox_item">
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </label>
                    </div>
                    <div className="user_seting_item">
                      <p className="secondary_text">Новый голос в опросе</p>
                      <label className="chechbox_item">
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </label>
                      <label className="chechbox_item">
                        <input type="checkbox" />
                        <span></span>
                      </label>
                    </div>

                    <div className="line"></div>

                    {/* Включить звук для уведомлений */}
                    <div className="user_seting_item">
                      <p className="profile_settings_title">
                        Включить звук для уведомлений
                      </p>
                      <label className="chechbox_item">
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </label>
                    </div>
                    <div className="user_seting_item user_seting_item_sound">
                      <button
                        className="play_sound_btn"
                        type="button"
                        title="Прослушать звук"
                      >
                        <svg width="11" height="14">
                          <use xlinkHref="#play-sound"></use>
                        </svg>
                      </button>
                      <p className="secondary_text">Прослушать звук</p>
                    </div>

                    <div className="line"></div>

                    {/* Получать новости проекта */}
                    <div className="user_seting_item">
                      <p className="profile_settings_title">
                        Получать новости проекта
                      </p>
                      <label className="chechbox_item">
                        <input type="checkbox" defaultChecked />
                        <span></span>
                      </label>
                    </div>

                    <div className="line"></div>

                    {/* Настройка дизайна уведомлений */}
                    <div className="user_seting_item">
                      <p className="profile_settings_title">
                        Настройка дизайна уведомлений
                      </p>
                      <label className="chechbox_item">
                        <input type="checkbox" />
                        <span></span>
                      </label>
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
                          <input
                            type="radio"
                            value="auto"
                            name="theme"
                            defaultChecked
                          />
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
                      Если выбран режим авто, мы включим тёмную тему с 21:00 до
                      06:00 по системному времени
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
              <div
                className={`profile_stats_item ${activeTab === "menu1" ? "active" : ""}`}
                onClick={() => handleTabClick("menu1")}
                style={{ cursor: "pointer" }}
              >
                <p className="main_text">Вопросы</p>
                <div className="stats_badge">
                  <p className="main_text">{user.questionsCount}</p>
                </div>
              </div>
              <div
                className={`profile_stats_item ${activeTab === "menu_answers" ? "active" : ""}`}
                onClick={() => handleTabClick("menu_answers")}
                style={{ cursor: "pointer" }}
              >
                <p className="main_text">Ответы</p>
                <div className="stats_badge">
                  <p className="main_text">{user.answersCount}</p>
                </div>
              </div>
              <div
                className={`profile_stats_item ${activeTab === "menu_subscriptions" ? "active" : ""}`}
                onClick={() => handleTabClick("menu_subscriptions")}
                style={{ cursor: "pointer" }}
              >
                <p className="main_text">Подписки</p>
                <div className="stats_badge">
                  <p className="main_text">{userSubscriptions.length}</p>
                </div>
              </div>
              <div
                className={`profile_stats_item ${activeTab === "menu_subscribers" ? "active" : ""}`}
                onClick={() => handleTabClick("menu_subscribers")}
                style={{ cursor: "pointer" }}
              >
                <p className="main_text">Подписчики</p>
                <div className="stats_badge">
                  <p className="main_text">{userSubscribers.length}</p>
                </div>
              </div>
            </div>

            <>
              <div className="blocks_title" style={{ marginTop: "24px" }}>
                <h2>Ограничения на день</h2>
              </div>
              <div className="profile_stats_list profile_stats_limits_list">
                {[
                  { value: 10, label: "Вопросы" },
                  { value: 0, label: "Прямых вопросов" },
                  { value: 30, label: "Ответов" },
                  { value: 30, label: "Комментариев" },
                  { value: 100, label: "Голосов за ответ" },
                  { value: 100, label: "Голоссов в опрос" },
                  { value: 60, label: "Оценок вопросов" },
                  { value: 60, label: "Оценок ответов" },
                  { value: 10, label: "Фото" },
                  { value: 0, label: "Видео" },
                  { value: 0, label: "Рекомендации" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="profile_stats_item limits_stat_item"
                  >
                    <div className="stats_badge limits_badge">
                      <p className="main_text">{value}</p>
                    </div>
                    <p className="main_text">{label}</p>
                  </div>
                ))}
                <div className="limits_help">
                  <Link href="#" className="limits_help_link">
                    Нужна помощь?
                  </Link>
                </div>
              </div>
            </>
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
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div
          className="container"
          style={{ padding: "50px 0", textAlign: "center" }}
        >
          Загрузка...
        </div>
      }
    >
      <ProfilePageContent />
    </Suspense>
  );
}
