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
    } else if (tab === "levels") {
      setActiveTab("menu_levels");
    } else if (tab === "rules") {
      setActiveTab("menu_rules");
    } else if (tab === "settings") {
      setActiveTab("menu4");
    } else if (tab === "edit") {
      setActiveTab("menu2");
    }
  }, [searchParams]);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState({ title: "", url: "" });
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const BIO_MAX_LENGTH = 250;

  // Мок-данные текущего пользователя
  const userIndex = parseInt(searchParams.get("u") || "0");
  const user = mockUsers[userIndex] || mockUsers[0];
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
            <div
              className={`user_profile_block ${user.vipStatus ? "premium-profile" : ""}`}
            >
              <img
                className="user_profile_block_bg"
                src={
                  user.vipStatus
                    ? "/images/userprofilepremium.svg"
                    : "/images/user-profile-bg.svg"
                }
                alt=""
              />
              {!user.vipStatus && (
                <img
                  className="user_profile_block_bg_dark"
                  src="/images/user-profile-bg-d.svg"
                  alt=""
                />
              )}
              <img
                className="user_profile_block_rect"
                src={
                  user.vipStatus
                    ? "/images/blues-rect-dark.svg"
                    : "/images/main-rect.svg"
                }
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
                    {user.vipStatus && (
                      <div className="premium-badge user_profile_img_badge">
                        <svg
                          width="49"
                          height="17"
                          viewBox="0 0 49 17"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M45.9141 0.5C47.6509 0.50023 48.4901 2.62786 47.2207 3.81348C47.1855 3.84635 47.1526 3.88194 47.123 3.91992L43.8467 8.12695C43.7476 8.2542 43.6934 8.411 43.6934 8.57227C43.6934 8.73353 43.7477 8.8903 43.8467 9.01758L47.1162 13.2168C47.1473 13.2567 47.1827 13.2937 47.2207 13.3271C48.4745 14.4313 47.6932 16.5 46.0225 16.5H2.9375C1.28066 16.4997 0.506513 14.4485 1.75 13.3535C1.79989 13.3096 1.84435 13.259 1.88184 13.2041L4.7373 9.02441C4.81984 8.9036 4.86422 8.76057 4.86426 8.61426C4.86426 8.43791 4.79981 8.26739 4.68359 8.13477L0.925781 3.85449L0.90918 3.83496L0.894531 3.81445C-0.0957061 2.42675 0.896675 0.5 2.60156 0.5H45.9141Z"
                            fill="white"
                            stroke="#6069FF"
                          />
                        </svg>
                        <span className="premium-badge-text">База</span>
                      </div>
                    )}
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
                    <div className="vip_plans_grid">
                      {/* VIP 10 */}
                      <div className="vip_plan_card">
                        <div className="vip_plan_icon">
                          <svg
                            width="29"
                            height="18"
                            viewBox="0 0 29 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5.356 0L0 17.524H4.108L5.356 13.026H10.374L11.726 17.524H15.99L10.556 0H5.356ZM5.928 10.061L6.968 6.343C7.254 5.329 7.514 4.003 7.774 2.963H7.826C8.086 4.003 8.398 5.303 8.71 6.343L9.802 10.061H5.928Z"
                              fill="white"
                            />
                            <path
                              d="M27.898 14.429V10.009C27.898 7.019 26.545 4.523 22.308 4.523C19.994 4.523 18.25 5.147 17.368 5.641L18.096 8.189C18.928 7.669 20.307 7.227 21.606 7.227C23.557 7.227 23.92 8.189 23.92 8.866V9.049C19.422 9.023 16.458 10.61 16.458 13.91C16.458 15.938 17.992 17.81 20.566 17.81C22.074 17.81 23.374 17.263 24.206 16.248H24.284L24.517 17.522H28.079C27.95 16.822 27.898 15.652 27.898 14.429ZM24.05 12.896C24.05 13.128 24.024 13.364 23.973 13.572C23.712 14.379 22.907 15.028 21.918 15.028C21.034 15.028 20.357 14.534 20.357 13.52C20.357 11.986 21.97 11.492 24.049 11.517L24.05 12.896Z"
                              fill="white"
                            />
                            <path
                              d="M21.663 3.607L26.08 1.803L21.663 0V1.241H15.637V2.366H21.663V3.607Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                        <h3>VIP 10 дней</h3>
                        <p className="secondary_text">
                          Базовые привилегии на 10 дней
                        </p>
                        <div className="vip_plan_price">100 ₽</div>
                        <button
                          className="m_btn vip_buy_btn_card"
                          type="button"
                        >
                          Купить
                        </button>
                      </div>

                      {/* VIP 30 */}
                      <div className="vip_plan_card active">
                        <div className="vip_plan_icon">
                          <svg
                            width="28"
                            height="24"
                            viewBox="0 0 28 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M23.7286 10.8317L20.167 11.7513C20.0912 11.7714 20.0115 11.7683 19.9374 11.7423C19.8634 11.7164 19.7982 11.6688 19.7498 11.6053L15.8454 6.55586C15.6166 6.28154 15.3334 6.06144 15.015 5.91058C14.6966 5.75971 14.3505 5.68162 14.0003 5.68162C13.6501 5.68162 13.304 5.75971 12.9856 5.91058C12.6672 6.06144 12.384 6.28154 12.1553 6.55586L8.24959 11.6066C8.19981 11.6686 8.13426 11.7151 8.06033 11.7407C7.98639 11.7662 7.90702 11.7699 7.83117 11.7513L4.27198 10.8317C3.99236 10.7593 3.6994 10.7631 3.42161 10.8426C3.14383 10.9222 2.89067 11.0747 2.68677 11.2855C2.48286 11.4962 2.33517 11.7579 2.25804 12.0452C2.18091 12.3325 2.17699 12.6356 2.24664 12.9249L4.47609 22.1476C4.60283 22.677 4.89747 23.1472 5.31293 23.483C5.72838 23.8188 6.24065 24.0008 6.76789 24H21.2321C21.7593 24.0008 22.2716 23.8188 22.6871 23.483C23.1025 23.1472 23.3972 22.677 23.5239 22.1476L25.7534 12.9249C25.823 12.6356 25.8191 12.3326 25.742 12.0454C25.6649 11.7582 25.5173 11.4964 25.3135 11.2857C25.1096 11.075 24.8566 10.9224 24.5788 10.8428C24.3011 10.7633 24.0082 10.7594 23.7286 10.8317Z"
                              fill="white"
                            />
                            <path
                              d="M1.95349 9.76735C3.03237 9.76735 3.90698 8.86259 3.90698 7.74652C3.90698 6.63045 3.03237 5.72569 1.95349 5.72569C0.874607 5.72569 0 6.63045 0 7.74652C0 8.86259 0.874607 9.76735 1.95349 9.76735Z"
                              fill="white"
                            />
                            <path
                              d="M26.0465 9.76735C27.1254 9.76735 28 8.86259 28 7.74652C28 6.63045 27.1254 5.72569 26.0465 5.72569C24.9676 5.72569 24.093 6.63045 24.093 7.74652C24.093 8.86259 24.9676 9.76735 26.0465 9.76735Z"
                              fill="white"
                            />
                            <path
                              d="M14 4.04166C15.0789 4.04166 15.9535 3.13691 15.9535 2.02083C15.9535 0.904757 15.0789 0 14 0C12.9211 0 12.0465 0.904757 12.0465 2.02083C12.0465 3.13691 12.9211 4.04166 14 4.04166Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                        <h3>VIP 30 дней</h3>
                        <p className="secondary_text">Популярный выбор</p>
                        <div className="vip_plan_price">250 ₽</div>
                        <button
                          className="m_btn vip_buy_btn_card"
                          type="button"
                        >
                          Купить
                        </button>
                      </div>

                      {/* VIP 90 */}
                      <div className="vip_plan_card">
                        <div className="vip_plan_icon">
                          <svg
                            width="30"
                            height="28"
                            viewBox="0 0 30 28"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8.78504 6.74069L5.23553 17.3803C5.21447 17.4394 5.20831 17.5025 5.21755 17.5644C5.2268 17.6262 5.2512 17.6851 5.28873 17.7361C5.32627 17.7872 5.37587 17.8289 5.43347 17.858C5.49107 17.887 5.55501 17.9025 5.62006 17.9032H6.61392C6.70263 17.9029 6.78887 17.8751 6.85977 17.8239C6.93068 17.7727 6.98244 17.7008 7.00732 17.619L7.56341 15.9139H12.4233L12.3553 15.8088L12.9646 17.619C12.9895 17.7008 13.0412 17.7727 13.1121 17.8239C13.183 17.8751 13.2693 17.9029 13.358 17.9032H14.3519C14.417 17.9035 14.4812 17.8891 14.5393 17.8609C14.5975 17.8328 14.6478 17.7917 14.6862 17.7412C14.7246 17.6907 14.75 17.6322 14.7603 17.5704C14.7705 17.5087 14.7654 17.4455 14.7453 17.386L11.1957 6.74638C11.1704 6.66481 11.1186 6.59319 11.0478 6.54204C10.977 6.49089 10.8909 6.46291 10.8023 6.4622H9.16957C9.08314 6.46389 8.99946 6.49171 8.93042 6.5417C8.86139 6.5917 8.81052 6.66133 8.78504 6.74069ZM8.155 14.2089L9.98596 8.73278L11.8317 14.2089H8.155Z"
                              fill="white"
                            />
                            <path
                              d="M18.8124 6.46504H17.8659C17.6372 6.46504 17.4518 6.64316 17.4518 6.86289V17.5025C17.4518 17.7222 17.6372 17.9003 17.8659 17.9003H18.8124C19.0411 17.9003 19.2265 17.7222 19.2265 17.5025V6.86289C19.2265 6.64316 19.0411 6.46504 18.8124 6.46504Z"
                              fill="white"
                            />
                            <path
                              d="M13.9792 22.1658H5.37159C4.73145 22.1658 4.11752 21.9215 3.66487 21.4867C3.21222 21.0518 2.95793 20.462 2.95793 19.847V5.16067C2.95793 4.54566 3.21222 3.95584 3.66487 3.52097C4.11752 3.08609 4.73145 2.84178 5.37159 2.84178H20.6581C21.2983 2.84178 21.9122 3.08609 22.3649 3.52097C22.8175 3.95584 23.0718 4.54566 23.0718 5.16067V12.5038C23.0772 12.6588 23.1462 12.8055 23.2636 12.912C23.381 13.0184 23.5375 13.076 23.6989 13.0722C24.2026 13.0707 24.6998 13.1816 25.1512 13.3961C25.245 13.4423 25.3495 13.4644 25.4548 13.4602C25.56 13.4559 25.6623 13.4256 25.7517 13.3721C25.8411 13.3185 25.9145 13.2437 25.9648 13.1547C26.0151 13.0658 26.0405 12.9659 26.0386 12.8647V5.16067C26.0386 4.48224 25.8994 3.81047 25.6289 3.1838C25.3584 2.55712 24.9619 1.98784 24.4622 1.50851C23.9624 1.02919 23.3692 0.649235 22.7165 0.390389C22.0638 0.131544 21.3643 -0.0011137 20.6581 7.04248e-06H5.37159C3.94696 7.04248e-06 2.58067 0.543718 1.5733 1.51153C0.565934 2.47934 0 3.79198 0 5.16067V19.847C0 21.2156 0.565934 22.5283 1.5733 23.4961C2.58067 24.4639 3.94696 25.0076 5.37159 25.0076H15.2215C15.3425 25.0078 15.4609 24.9734 15.5616 24.909C15.6624 24.8445 15.741 24.7528 15.7875 24.6455C15.834 24.5382 15.8464 24.42 15.823 24.3059C15.7997 24.1918 15.7417 24.0869 15.6563 24.0045C15.1961 23.5988 14.8232 23.1102 14.5589 22.5665C14.5166 22.4508 14.4383 22.3503 14.3346 22.2786C14.2309 22.207 14.1069 22.1676 13.9792 22.1658Z"
                              fill="white"
                            />
                            <path
                              d="M27.133 23.2457L29.8129 22.2312C29.8681 22.2103 29.9154 22.1738 29.9488 22.1267C29.9822 22.0796 30 22.0239 30 21.9669C30 21.9099 29.9822 21.8542 29.9488 21.8071C29.9154 21.76 29.8681 21.7236 29.8129 21.7026L27.133 20.6881C26.6587 20.5079 26.2278 20.2361 25.8671 19.8896C25.5063 19.543 25.2235 19.1291 25.0359 18.6733L23.9799 16.1157C23.958 16.0628 23.92 16.0175 23.871 15.9856C23.8219 15.9537 23.7641 15.9366 23.7048 15.9367C23.6456 15.9366 23.5877 15.9537 23.5386 15.9856C23.4896 16.0175 23.4516 16.0628 23.4297 16.1157L22.3737 18.6733C22.1866 19.1293 21.9039 19.5435 21.5431 19.8901C21.1824 20.2367 20.7512 20.5084 20.2766 20.6881L17.6144 21.7026C17.5593 21.7236 17.5119 21.76 17.4786 21.8071C17.4452 21.8542 17.4274 21.9099 17.4274 21.9669C17.4274 22.0239 17.4452 22.0796 17.4786 22.1267C17.5119 22.1738 17.5593 22.2103 17.6144 22.2312L20.2766 23.2457C20.7512 23.4255 21.1824 23.6971 21.5431 24.0437C21.9039 24.3903 22.1866 24.8045 22.3737 25.2605L23.4297 27.8181C23.4512 27.8715 23.4889 27.9175 23.538 27.9499C23.5871 27.9824 23.6452 27.9998 23.7048 28C23.7644 27.9998 23.8225 27.9824 23.8716 27.9499C23.9207 27.9175 23.9584 27.8715 23.9799 27.8181L25.0359 25.2605C25.2235 24.8048 25.5063 24.3908 25.8671 24.0443C26.2278 23.6977 26.6587 23.4259 27.133 23.2457Z"
                              fill="white"
                            />
                          </svg>
                        </div>
                        <h3>VIP 90 дней</h3>
                        <p className="secondary_text">Выгодное предложение</p>
                        <div className="vip_plan_price">600 ₽</div>
                        <button
                          className="m_btn vip_buy_btn_card"
                          type="button"
                        >
                          Купить
                        </button>
                      </div>
                    </div>
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
