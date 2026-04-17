"use client";

import Link from "next/link";
import { useState, useEffect, useRef, Fragment } from "react";
import styles from "./Header.module.css";

const ThemeToggleBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    className="theme-toggle-btn mode_toggler"
    onClick={onClick}
    title="Темная/светлая тема"
    aria-label="Переключить тему"
  >
    <svg
      className="svg-light"
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_3_4601"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="50"
        height="50"
      >
        <rect width="50" height="50" rx="12" fill="white" />
      </mask>
      <g mask="url(#mask0_3_4601)">
        <rect width="50" height="50" rx="12" fill="white" />
        <ellipse
          opacity="0.11"
          cx="25.5"
          cy="45.5"
          rx="41.5"
          ry="23.5"
          fill="url(#paint0_linear_3_4601)"
        />
        <path
          d="M32.8721 28.0248C32.7185 27.8268 32.4606 27.7536 32.2337 27.8388C31.5975 28.0776 30.9075 28.2 30.1809 28.2C26.7046 28.2 23.877 25.2384 23.877 21.6C23.877 19.41 24.9097 17.3712 26.6392 16.1448C26.8352 16.0056 26.9292 15.7548 26.8765 15.5136C26.8238 15.2724 26.6346 15.09 26.3997 15.054C26.1315 15.0132 25.8644 15 25.5962 15C20.8557 15 17 19.0368 17 24C17 28.9632 20.8557 33 25.5962 33C28.6049 33 31.3419 31.3992 32.9156 28.7184C33.0428 28.5012 33.0245 28.224 32.8721 28.0248Z"
          fill="#6069FF"
        />
        <path
          d="M37 6C36.7325 11.5125 36.5125 11.7325 31 12C36.5125 12.2675 36.7325 12.4875 37 18C37.2675 12.4875 37.4875 12.2675 43 12C37.4875 11.7325 37.2675 11.5125 37 6Z"
          fill="#6069FF"
        />
        <path
          d="M11.5 32C11.2994 36.1344 11.1344 36.2994 7 36.5C11.1344 36.7006 11.2994 36.8656 11.5 41C11.7006 36.8656 11.8656 36.7006 16 36.5C11.8656 36.2994 11.7006 36.1344 11.5 32Z"
          fill="#6069FF"
        />
        <path
          d="M14.5 9C14.3885 11.2969 14.2969 11.3885 12 11.5C14.2969 11.6115 14.3885 11.7031 14.5 14C14.6115 11.7031 14.7031 11.6115 17 11.5C14.7031 11.3885 14.6115 11.2969 14.5 9Z"
          fill="#6069FF"
        />
        <path
          d="M36.5 36C36.2994 40.1344 36.1344 40.2994 32 40.5C36.1344 40.7006 36.2994 40.8656 36.5 45C36.7006 40.8656 36.8656 40.7006 41 40.5C36.8656 40.2994 36.7006 40.1344 36.5 36Z"
          fill="#6069FF"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_3_4601"
          x1="25.5"
          y1="22"
          x2="25.5"
          y2="69"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9298F6" />
          <stop offset="0.45" stopColor="#555990" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
    <svg
      className="svg-dark"
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_3_4582"
        style={{ maskType: "alpha" }}
        maskUnits="userSpaceOnUse"
        x="0"
        y="0"
        width="50"
        height="50"
      >
        <rect width="50" height="50" rx="12" fill="white" />
      </mask>
      <g mask="url(#mask0_3_4582)">
        <rect width="50" height="50" rx="12" fill="#6069FF" />
        <ellipse
          opacity="0.55"
          cx="25.5"
          cy="45.5"
          rx="41.5"
          ry="23.5"
          fill="url(#paint0_linear_3_4582)"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M36.349 11.4926C36.4622 11.3235 36.623 11.1973 36.7947 11.1888C35.0226 9.96784 34.6949 8.31895 35.2404 8.13681C36.1812 9.17144 36.9431 10.3192 38.0628 11.2407C38.463 11.2871 39.03 10.5361 39.9669 9.85367C41.7083 8.89649 41.1415 8.9748 41.7738 8.33179C42.0493 8.46163 42.101 8.76441 41.7721 9.36133C41.6304 9.89899 41.2833 10.0607 40.9938 10.6139C40.4913 11.0986 39.8647 11.4399 39.4865 12.0679C39.7106 12.251 39.9481 12.395 41.0211 12.71C40.618 12.7337 40.2958 12.7946 40.1113 12.9191C39.6072 13.1147 39.1484 13.2336 38.8776 13.0331C37.9705 13.0433 37.3285 12.4758 36.8194 11.6183L36.7432 11.4577C36.6387 11.4312 36.5003 11.4644 36.349 11.4926Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M13.9405 13.3398C13.8759 13.0422 13.7293 12.788 13.5117 12.7031C16.3875 11.6442 17.6057 9.34458 16.9895 8.84567C15.2764 9.97912 13.7396 11.3551 11.8502 12.2461C11.3113 12.1462 10.9416 10.7973 10.0616 9.39395C8.2757 7.24583 8.96956 7.60023 8.46354 6.38346C8.04538 6.45943 7.83258 6.88524 7.96926 7.90616C7.89281 8.76061 8.26291 9.14586 8.36974 10.0856C8.78446 11.0136 9.42863 11.7819 9.61392 12.8696C9.23636 13.0458 8.8604 13.1587 7.3237 13.1727C7.83248 13.3774 8.21899 13.6031 8.39706 13.8647C8.95328 14.3661 9.48815 14.7352 9.93428 14.5528C11.1 14.9497 12.2023 14.3809 13.2728 13.3276L13.4486 13.1223C13.5963 13.1271 13.7588 13.2345 13.9405 13.3398Z"
          fill="white"
        />
        <path
          d="M18.3101 21.2279C18.9991 20.0106 20.0106 18.9992 21.2279 18.3101L17.8973 17.0743C17.6626 16.9872 17.3988 17.0449 17.2218 17.2218C17.0449 17.3988 16.9873 17.6626 17.0743 17.8973L18.3101 21.2279Z"
          fill="white"
        />
        <path
          d="M17.318 25C17.318 24.286 17.4163 23.5945 17.5994 22.9381L14.3733 24.4181C14.1458 24.5224 14 24.7498 14 25C14 25.2502 14.1458 25.4776 14.3733 25.5819L17.5995 27.0619C17.4164 26.4055 17.318 25.714 17.318 25Z"
          fill="white"
        />
        <path
          d="M25 17.318C25.7141 17.318 26.4055 17.4163 27.0619 17.5994L25.5819 14.3733C25.4776 14.1458 25.2502 14 25 14C24.7498 14 24.5224 14.1458 24.4181 14.3733L22.9381 17.5995C23.5945 17.4163 24.2859 17.318 25 17.318Z"
          fill="white"
        />
        <path
          d="M31.6899 21.2279L32.9257 17.8973C33.0127 17.6627 32.9551 17.3988 32.7782 17.2218C32.6012 17.0449 32.3373 16.9873 32.1027 17.0743L28.7721 18.3101C29.9894 18.9992 31.0008 20.0106 31.6899 21.2279Z"
          fill="white"
        />
        <path
          d="M25 32.682C24.2859 32.682 23.5945 32.5837 22.9381 32.4006L24.4181 35.6268C24.5224 35.8542 24.7498 36 25 36C25.2502 36 25.4776 35.8542 25.5819 35.6267L27.0619 32.4005C26.4055 32.5836 25.7141 32.682 25 32.682Z"
          fill="white"
        />
        <path
          d="M18.3101 28.7721L17.0743 32.1027C16.9873 32.3373 17.0449 32.6012 17.2218 32.7782C17.3441 32.9004 17.5078 32.9657 17.6747 32.9657C17.7494 32.9657 17.8247 32.9526 17.8973 32.9257L21.2279 31.6899C20.0106 31.0008 18.9992 29.9894 18.3101 28.7721Z"
          fill="white"
        />
        <path
          d="M35.6267 24.4181L32.4005 22.9381C32.5836 23.5945 32.6819 24.2859 32.6819 25C32.6819 25.714 32.5836 26.4055 32.4005 27.0619L35.6267 25.5819C35.8542 25.4776 36 25.2502 36 25C36 24.7498 35.8542 24.5224 35.6267 24.4181Z"
          fill="white"
        />
        <path
          d="M31.6899 28.7721C31.0009 29.9894 29.9894 31.0008 28.7721 31.6899L32.1028 32.9257C32.1754 32.9526 32.2507 32.9656 32.3254 32.9656C32.4922 32.9656 32.656 32.9004 32.7782 32.7781C32.9552 32.6012 33.0128 32.3373 32.9258 32.1027L31.6899 28.7721Z"
          fill="white"
        />
        <path
          d="M25 31.4015C21.4702 31.4015 18.5985 28.5298 18.5985 25C18.5985 21.4702 21.4702 18.5985 25 18.5985C28.5298 18.5985 31.4015 21.4702 31.4015 25C31.4015 28.5298 28.5298 31.4015 25 31.4015Z"
          fill="white"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_3_4582"
          x1="25.5"
          y1="22"
          x2="25.5"
          y2="69"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#9298F6" />
          <stop offset="0.45" stopColor="#555990" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  </button>
);

// Выпадающее меню профиля
const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    {
      label: "Редактировать профиль",
      href: "/profile?tab=edit",
      icon: "profile",
    },
    {
      label: "Уровни",
      href: "/profile?tab=levels",
      icon: "levels",
    },
    {
      label: "Ограничения",
      href: "/profile?tab=rules",
      icon: "rules",
    },
    {
      label: "VIP - статус",
      href: "/profile?tab=vip",
      icon: "vip",
    },
    {
      label: "Настройки",
      href: "/profile?tab=settings",
      icon: "settings",
    },
    {
      label: "Выйти",
      href: "/logout",
      icon: "logout",
      className: styles.logoutItem,
    },
  ];

  return (
    <div ref={wrapperRef} className={styles.notificationWrapper}>
      <button
        className="m_btn m_btn_icon category_btn"
        title="Личный кабинет"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundColor: isOpen ? "#6069FF" : "white",
          transition: "background-color 0.3s",
        }}
      >
        <img
          src="/images/icons/user.svg"
          alt=""
          width="16"
          height="20"
          style={{ filter: isOpen ? "brightness(0) invert(1)" : "none" }}
        />
      </button>

      {isOpen && (
        <div className={styles.profileDropdown}>
          <div className={styles.profileHeader}>
            <div className={styles.profileAvatarWrapper}>
              <img
                src="/images/prof.png"
                alt="Avatar"
                className={styles.profileAvatar}
              />
              <div className={styles.profilePremiumBadge}>
                <svg
                  width="84"
                  height="18"
                  viewBox="0 0 67 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.448004 2.52418C-0.497898 1.60395 0.153589 0 1.47327 0H65.4579C66.7532 0 67.2524 1.68695 66.1656 2.3918C66.0307 2.47929 65.9132 2.59104 65.8191 2.72138L62.8648 6.81082C62.7047 7.03251 62.6185 7.29904 62.6185 7.57253C62.6185 7.84602 62.7047 8.11256 62.8648 8.33425L65.8186 12.423C65.9129 12.5536 66.0323 12.6642 66.1698 12.7482C67.2167 13.3882 66.7631 15 65.536 15H2.11323C0.902503 15 0.454925 13.4097 1.48793 12.7782C1.65688 12.6749 1.79761 12.5314 1.89757 12.3605L4.27245 8.29905C4.38955 8.09878 4.45127 7.87096 4.45127 7.63897C4.45127 7.32476 4.33814 7.02106 4.13257 6.78343L0.448004 2.52418Z"
                    fill="#6069FF"
                  />
                </svg>
                <span className={styles.profilePremiumText}>Премиум</span>
              </div>
            </div>
            <div className={styles.profileUserDetail}>
              <div className={styles.profileName}>Victor_314</div>
              <div className={styles.roleBadge}>Гуру</div>
            </div>
          </div>

          <div className={styles.profileMenuList}>
            {menuItems.map((item, index) => (
              <Fragment key={index}>
                <Link
                  href={item.href}
                  className={`${styles.profileMenuItem} ${item.className || ""}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className={styles.profileMenuIcon}>
                    <svg width="24" height="24">
                      <use xlinkHref={`#${item.icon}`}></use>
                    </svg>
                  </div>
                  {item.label}
                </Link>
                {index < menuItems.length - 1 && (
                  <div className={styles.menuDivider}></div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Кнопка уведомлений (колокольчик)
const NotificationBtn = () => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Закрытие при клике вне области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Моковые данные для уведомлений
  const mockNotifications = [
    {
      id: 1,
      type: "new",
      avatar: "/images/icons/avatar.svg",
      title: "Специалист отдела",
      time: "2 дня назад",
      text: "Тебе с ними детей крестить, или жить всю дальнейшую жизнь?)",
    },
    {
      id: 2,
      type: "new",
      avatar: "/images/icons/avatar.svg",
      title: "Специалист отдела",
      time: "2 дня назад",
      text: "Тебе с ними детей крестить, или жить всю дальнейшую жизнь?)",
    },
    {
      id: 3,
      type: "old",
      avatar: "/images/icons/avatar.svg",
      title: "Специалист отдела",
      username: "Non_non",
      fullName: "Сталин",
      time: "2 дня назад",
      text: "Тебе с ними детей крестить, или жить всю дальнейшую жизнь?)",
    },
  ];

  return (
    <div
      ref={wrapperRef}
      className={`notification-dropdown-wrapper ${styles.notificationWrapper}`}
    >
      <button
        className="theme-toggle-btn mode_toggler"
        title="Уведомления"
        aria-label="Уведомления"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg
          width="50"
          height="50"
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="50" height="50" rx="12" fill="white" />
          <g transform="translate(16.5, 15)">
            <path
              d="M16.6426 13.8085C16.5692 13.7192 16.4971 13.6299 16.4263 13.5438C15.4532 12.3558 14.8644 11.6388 14.8644 8.27589C14.8644 6.53482 14.4517 5.10625 13.6383 4.03482C13.0385 3.2433 12.2277 2.64286 11.159 2.19911C11.1318 2.18385 11.1182 2.15359 11.109 2.12382C10.7137 0.849869 9.67259 0 8.50011 0C7.32737 0 6.28646 0.850251 5.89143 2.12339C5.88239 2.15253 5.86869 2.18189 5.84212 2.19688C3.34823 3.23304 2.13623 5.22098 2.13623 8.27455C2.13623 11.6388 1.54837 12.3558 0.574347 13.5424C0.503574 13.6286 0.431473 13.7161 0.358045 13.8071C0.168372 14.038 0.0481989 14.3189 0.0117471 14.6165C-0.0247047 14.9141 0.024091 15.2161 0.152359 15.4866C0.42528 16.067 1.00695 16.4272 1.6709 16.4272H15.3342C15.995 16.4272 16.5727 16.0674 16.8465 15.4897C16.9754 15.2191 17.0246 14.917 16.9885 14.619C16.9523 14.321 16.8323 14.0397 16.6426 13.8085Z"
              fill="#6069FF"
            />
            <path
              d="M8.50011 20C9.1393 19.9995 9.76643 19.8244 10.315 19.4932C10.8636 19.1621 11.3131 18.6873 11.6159 18.1192C11.6302 18.092 11.6372 18.0615 11.6364 18.0307C11.6355 17.9999 11.6268 17.9699 11.611 17.9435C11.5953 17.9171 11.573 17.8953 11.5464 17.8802C11.5199 17.865 11.4898 17.8571 11.4593 17.8571H5.54177C5.51122 17.857 5.48116 17.8649 5.45452 17.88C5.42787 17.8951 5.40556 17.9169 5.38975 17.9433C5.37394 17.9697 5.36517 17.9998 5.36429 18.0306C5.36341 18.0614 5.37046 18.0919 5.38474 18.1192C5.68754 18.6872 6.137 19.162 6.68548 19.4931C7.23395 19.8242 7.86099 19.9994 8.50011 20Z"
              fill="#6069FF"
            />
          </g>
        </svg>
      </button>

      {/* Дропдаун уведомлений */}
      {isOpen && (
        <div className={styles.notificationDropdown}>
          {/* Заголовок */}
          <h3 className={styles.notificationTitle}>Уведомления</h3>

          {/* Всплывающие оповещения с переключателем */}
          <div className={styles.notificationToggle}>
            <div className={styles.toggleLabel}>Всплывающие оповещения</div>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
              />
              <span
                className={`${styles.slider} ${notificationsEnabled ? styles.active : ""}`}
              >
                <span
                  className={`${styles.sliderButton} ${notificationsEnabled ? styles.active : ""}`}
                />
              </span>
            </label>
          </div>

          {/* Новые */}
          <div className={styles.newNotificationsSection}>
            <h4 className={styles.sectionTitle}>Новые</h4>
            {mockNotifications
              .filter((n) => n.type === "new")
              .map((notification) => (
                <div key={notification.id} className={styles.notificationItem}>
                  <div className={styles.notificationHeader}>
                    <img
                      src={notification.avatar}
                      alt=""
                      className={styles.notificationAvatar}
                    />
                    <div className={styles.notificationInfo}>
                      <div className={styles.notificationName}>
                        {notification.title}
                      </div>
                      <div className={styles.notificationTime}>
                        {notification.time}
                      </div>
                    </div>
                  </div>
                  <div className={styles.notificationText}>
                    {notification.text}
                  </div>
                </div>
              ))}
          </div>

          {/* За последние 30 дней */}
          <div>
            <h4 className={styles.sectionTitle}>За последние 30 дней</h4>
            {mockNotifications
              .filter((n) => n.type === "old")
              .map((notification) => (
                <div
                  key={notification.id}
                  className={styles.notificationItemOld}
                >
                  <div className={styles.notificationItemOldCard}>
                    <div className={styles.notificationHeader}>
                      <img
                        src={notification.avatar}
                        alt=""
                        className={styles.notificationAvatar}
                      />
                      <div className={styles.notificationInfo}>
                        <div className={styles.notificationName}>
                          {notification.title}
                        </div>
                        <div className={styles.notificationTime}>
                          {notification.time}
                        </div>
                      </div>
                    </div>
                    <div className={styles.notificationText}>
                      {notification.text}
                    </div>
                  </div>

                  {/* Expanded dropdown при hover */}
                  <div className={styles.expandedDropdown}>
                    <div className={styles.expandedHeader}>
                      <img
                        src={notification.avatar}
                        alt=""
                        className={styles.expandedAvatar}
                      />
                      <div className={styles.expandedInfo}>
                        <div className={styles.expandedName}>
                          {notification.fullName || notification.title}
                        </div>
                        <div className={styles.expandedUsername}>
                          {notification.username} ответил вам:
                        </div>
                      </div>
                    </div>
                    <div className={styles.expandedText}>
                      {notification.text}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const lastScrollY = useRef(0);

  // Моковые данные - проверка авторизации
  const isLoggedIn = true; // Измените на true для проверки залогиненного состояния

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY > lastScrollY.current && currentY > 80) {
        setIsNavHidden(true);
      } else if (currentY < lastScrollY.current) {
        setIsNavHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDarkMode = () => {
    document.body.classList.toggle("dark_mode");
  };

  return (
    <>
      <nav className={isNavHidden || isMenuOpen ? "nav--hidden" : ""}>
        <div className="nav_wrapper container">
          <Link href="/" className="header__logo">
            <div className="logo-container light_logo">
              <svg
                width="44"
                height="50"
                viewBox="0 0 44 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.8621 0C33.5553 0 44 9.4959 44 21.2097C44 29.661 39.9808 38.1356 21.931 50V42.2812C34.6207 29.2373 34.6207 26.1072 34.6207 19.6207C34.6207 13.1342 28.4061 7.87591 21.931 7.87591C15.456 7.87591 9.51724 13.1342 9.51724 19.6207C9.51724 26.061 15.3816 32.1379 21.7931 32.212V42.4188C10.1316 42.3816 0 32.9005 0 21.2097C0 9.4959 10.1689 0 21.8621 0Z"
                  fill="#616AFF"
                />
              </svg>
              <svg
                width="81"
                height="27"
                viewBox="0 0 81 27"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.1278 10.186V21.0868C16.1278 25.0182 14.2812 26.9839 10.5881 26.9839H5.53974C1.84658 26.9839 0 25.0182 0 21.0868V10.186C0 6.25455 1.84658 4.28883 5.53974 4.28883H10.5881C14.2812 4.28883 16.1278 6.25455 16.1278 10.186ZM10.1413 22.3377V8.8904C10.1413 8.65213 10.052 8.44364 9.87325 8.26494C9.72433 8.08624 9.53074 7.99689 9.29247 7.99689H6.83533C6.59706 7.99689 6.38858 8.08624 6.20987 8.26494C6.06096 8.44364 5.9865 8.65213 5.9865 8.8904V22.3377C5.9865 22.5759 6.06096 22.7844 6.20987 22.9631C6.38858 23.1418 6.59706 23.2312 6.83533 23.2312H9.29247C9.53074 23.2312 9.72433 23.1418 9.87325 22.9631C10.052 22.7844 10.1413 22.5759 10.1413 22.3377Z"
                  fill="#384B67"
                />
                <path
                  d="M28.1521 23.0972H29.9391V26.9839H25.7396C22.0465 26.9839 20.1999 25.0182 20.1999 21.0868V0H26.1864V4.73559H29.9391V9.0691H26.1864V20.9527C26.1864 21.7867 26.3502 22.3526 26.6778 22.6504C27.0054 22.9482 27.4969 23.0972 28.1521 23.0972Z"
                  fill="#384B67"
                />
                <path
                  d="M43.1222 4.73559H48.93L44.1497 26.5372H36.2422L31.4619 4.73559H37.2697L40.2183 21.6675L43.1222 4.73559Z"
                  fill="#384B67"
                />
                <path
                  d="M62.1131 4.28883C65.8062 4.28883 67.6528 6.25455 67.6528 10.186V17.2447H57.5115V21.8016C57.5115 22.0398 57.5859 22.2483 57.7349 22.427C57.9136 22.6057 58.1221 22.6951 58.3603 22.6951H60.8175C61.0557 22.6951 61.2493 22.6057 61.3982 22.427C61.577 22.2483 61.6663 22.0398 61.6663 21.8016V19.3891H67.6528V21.0868C67.6528 25.0182 65.8062 26.9839 62.1131 26.9839H57.0647C53.3716 26.9839 51.525 25.0182 51.525 21.0868V10.186C51.525 6.25455 53.3716 4.28883 57.0647 4.28883H62.1131ZM57.5115 13.3133H61.6663V9.29247C61.6663 9.05421 61.577 8.84572 61.3982 8.66702C61.2493 8.48832 61.0557 8.39897 60.8175 8.39897H58.3603C58.1221 8.39897 57.9136 8.48832 57.7349 8.66702C57.5859 8.84572 57.5115 9.05421 57.5115 9.29247V13.3133Z"
                  fill="#384B67"
                />
                <path
                  d="M78.8918 23.0972H80.6788V26.9839H76.4793C72.7862 26.9839 70.9396 25.0182 70.9396 21.0868V0H76.9261V4.73559H80.6788V9.0691H76.9261V20.9527C76.9261 21.7867 77.0899 22.3526 77.4175 22.6504C77.7451 22.9482 78.2365 23.0972 78.8918 23.0972Z"
                  fill="#384B67"
                />
              </svg>
              <svg
                width="28"
                height="31"
                viewBox="0 0 28 31"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="logo-ai"
              >
                <path
                  d="M11.0795 8.35429H16.1278V30.1559H11.0795V28.5476C10.1562 29.9176 8.62234 30.6026 6.47793 30.6026H5.53974C1.84658 30.6026 0 28.6369 0 24.7055V13.8047C0 9.87325 1.84658 7.90754 5.53974 7.90754H6.47793C8.62234 7.90754 10.1562 8.59256 11.0795 9.9626V8.35429ZM10.1413 25.4203V13.0899C10.1413 12.8516 10.052 12.6431 9.87325 12.4644C9.72433 12.2857 9.53074 12.1964 9.29247 12.1964H6.83533C6.59706 12.1964 6.38858 12.2857 6.20987 12.4644C6.06096 12.6431 5.9865 12.8516 5.9865 13.0899V25.4203C5.9865 25.6585 6.06096 25.867 6.20987 26.0457C6.38858 26.2244 6.59706 26.3138 6.83533 26.3138H9.29247C9.53074 26.3138 9.72433 26.2244 9.87325 26.0457C10.052 25.867 10.1413 25.6585 10.1413 25.4203Z"
                  fill="#616AFF"
                />
                <path
                  d="M26.2757 5.62909C25.6503 6.25455 24.8908 6.56728 23.9973 6.56728C23.1038 6.56728 22.3294 6.25455 21.6742 5.62909C21.0189 4.97386 20.6913 4.19948 20.6913 3.30598C20.6913 2.38268 21.0189 1.60831 21.6742 0.982856C22.3294 0.327619 23.1038 0 23.9973 0C24.8908 0 25.6503 0.327619 26.2757 0.982856C26.931 1.60831 27.2586 2.38268 27.2586 3.30598C27.2586 4.22927 26.931 5.00364 26.2757 5.62909ZM21.004 30.1559V8.35429H26.9905V30.1559H21.004Z"
                  fill="#616AFF"
                />
              </svg>
            </div>
            <div className="logo-container dark_logo">
              <svg
                width="44"
                height="50"
                viewBox="0 0 44 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21.8621 0C33.5553 0 44 9.4959 44 21.2097C44 29.661 39.9808 38.1356 21.931 50V42.2812C34.6207 29.2373 34.6207 26.1072 34.6207 19.6207C34.6207 13.1342 28.4061 7.87591 21.931 7.87591C15.456 7.87591 9.51724 13.1342 9.51724 19.6207C9.51724 26.061 15.3816 32.1379 21.7931 32.212V42.4188C10.1316 42.3816 0 32.9005 0 21.2097C0 9.4959 10.1689 0 21.8621 0Z"
                  fill="#616AFF"
                />
              </svg>
              <svg
                width="81"
                height="27"
                viewBox="0 0 81 27"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.1278 10.186V21.0868C16.1278 25.0182 14.2812 26.9839 10.5881 26.9839H5.53974C1.84658 26.9839 0 25.0182 0 21.0868V10.186C0 6.25455 1.84658 4.28883 5.53974 4.28883H10.5881C14.2812 4.28883 16.1278 6.25455 16.1278 10.186ZM10.1413 22.3377V8.8904C10.1413 8.65213 10.052 8.44364 9.87325 8.26494C9.72433 8.08624 9.53074 7.99689 9.29247 7.99689H6.83533C6.59706 7.99689 6.38858 8.08624 6.20987 8.26494C6.06096 8.44364 5.9865 8.65213 5.9865 8.8904V22.3377C5.9865 22.5759 6.06096 22.7844 6.20987 22.9631C6.38858 23.1418 6.59706 23.2312 6.83533 23.2312H9.29247C9.53074 23.2312 9.72433 23.1418 9.87325 22.9631C10.052 22.7844 10.1413 22.5759 10.1413 22.3377Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M28.1521 23.0972H29.9391V26.9839H25.7396C22.0465 26.9839 20.1999 25.0182 20.1999 21.0868V0H26.1864V4.73559H29.9391V9.0691H26.1864V20.9527C26.1864 21.7867 26.3502 22.3526 26.6778 22.6504C27.0054 22.9482 27.4969 23.0972 28.1521 23.0972Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M43.1222 4.73559H48.93L44.1497 26.5372H36.2422L31.4619 4.73559H37.2697L40.2183 21.6675L43.1222 4.73559Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M62.1131 4.28883C65.8062 4.28883 67.6528 6.25455 67.6528 10.186V17.2447H57.5115V21.8016C57.5115 22.0398 57.5859 22.2483 57.7349 22.427C57.9136 22.6057 58.1221 22.6951 58.3603 22.6951H60.8175C61.0557 22.6951 61.2493 22.6057 61.3982 22.427C61.577 22.2483 61.6663 22.0398 61.6663 21.8016V19.3891H67.6528V21.0868C67.6528 25.0182 65.8062 26.9839 62.1131 26.9839H57.0647C53.3716 26.9839 51.525 25.0182 51.525 21.0868V10.186C51.525 6.25455 53.3716 4.28883 57.0647 4.28883H62.1131ZM57.5115 13.3133H61.6663V9.29247C61.6663 9.05421 61.577 8.84572 61.3982 8.66702C61.2493 8.48832 61.0557 8.39897 60.8175 8.39897H58.3603C58.1221 8.39897 57.9136 8.48832 57.7349 8.66702C57.5859 8.84572 57.5115 9.05421 57.5115 9.29247V13.3133Z"
                  fill="#FFFFFF"
                />
                <path
                  d="M78.8918 23.0972H80.6788V26.9839H76.4793C72.7862 26.9839 70.9396 25.0182 70.9396 21.0868V0H76.9261V4.73559H80.6788V9.0691H76.9261V20.9527C76.9261 21.7867 77.0899 22.3526 77.4175 22.6504C77.7451 22.9482 78.2365 23.0972 78.8918 23.0972Z"
                  fill="#FFFFFF"
                />
              </svg>
              <svg
                width="28"
                height="31"
                viewBox="0 0 28 31"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="logo-ai"
              >
                <path
                  d="M11.0795 8.35429H16.1278V30.1559H11.0795V28.5476C10.1562 29.9176 8.62234 30.6026 6.47793 30.6026H5.53974C1.84658 30.6026 0 28.6369 0 24.7055V13.8047C0 9.87325 1.84658 7.90754 5.53974 7.90754H6.47793C8.62234 7.90754 10.1562 8.59256 11.0795 9.9626V8.35429ZM10.1413 25.4203V13.0899C10.1413 12.8516 10.052 12.6431 9.87325 12.4644C9.72433 12.2857 9.53074 12.1964 9.29247 12.1964H6.83533C6.59706 12.1964 6.38858 12.2857 6.20987 12.4644C6.06096 12.6431 5.9865 12.8516 5.9865 13.0899V25.4203C5.9865 25.6585 6.06096 25.867 6.20987 26.0457C6.38858 26.2244 6.59706 26.3138 6.83533 26.3138H9.29247C9.53074 26.3138 9.72433 26.2244 9.87325 26.0457C10.052 25.867 10.1413 25.6585 10.1413 25.4203Z"
                  fill="#616AFF"
                />
                <path
                  d="M26.2757 5.62909C25.6503 6.25455 24.8908 6.56728 23.9973 6.56728C23.1038 6.56728 22.3294 6.25455 21.6742 5.62909C21.0189 4.97386 20.6913 4.19948 20.6913 3.30598C20.6913 2.38268 21.0189 1.60831 21.6742 0.982856C22.3294 0.327619 23.1038 0 23.9973 0C24.8908 0 25.6503 0.327619 26.2757 0.982856C26.931 1.60831 27.2586 2.38268 27.2586 3.30598C27.2586 4.22927 26.931 5.00364 26.2757 5.62909ZM21.004 30.1559V8.35429H26.9905V30.1559H21.004Z"
                  fill="#616AFF"
                />
              </svg>
            </div>
          </Link>

          <div className="nav_list">
            <Link href="/categories">
              <button className="m_btn category_btn">
                <img
                  src="/images/icons/category-icon.svg"
                  alt=""
                  width="18"
                  height="18"
                />
                <span>Категории</span>
              </button>
            </Link>

            <form method="POST" action="/" className="search_input">
              <img
                src="/images/icons/search.svg"
                alt=""
                width="18"
                height="18"
              />
              <input type="text" name="s" placeholder="Найти вопрос" />
            </form>

            <a href="/ask">
              <button className="m_btn">
                <svg width="20" height="20">
                  <use xlinkHref="#ask"></use>
                </svg>
                Спросить
              </button>
            </a>

            <Link href={isLoggedIn ? "/profile?tab=vip" : "/login"}>
              <button className="m_btn m_btn_icon category_btn">
                <svg
                  width="20"
                  height="17"
                  viewBox="0 0 20 17"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16.949 7.47907L14.405 8.11407C14.3509 8.12793 14.2939 8.12578 14.241 8.10788C14.1881 8.08997 14.1416 8.05709 14.107 8.01323L11.3181 4.52671C11.1548 4.33729 10.9525 4.18532 10.725 4.08115C10.4976 3.97698 10.2504 3.92306 10.0002 3.92306C9.75009 3.92306 9.50288 3.97698 9.27545 4.08115C9.04802 4.18532 8.84572 4.33729 8.68233 4.52671L5.89257 8.01415C5.85701 8.057 5.81018 8.08906 5.75738 8.10672C5.70457 8.12438 5.64787 8.12693 5.59369 8.11408L3.05141 7.47907C2.85168 7.42913 2.64243 7.43175 2.44401 7.48666C2.24559 7.54157 2.06476 7.6469 1.91912 7.79241C1.77347 7.93792 1.66798 8.11865 1.61289 8.31702C1.5578 8.51539 1.55499 8.72464 1.60474 8.92442L3.19721 15.2925C3.28774 15.6581 3.4982 15.9827 3.79495 16.2146C4.0917 16.4464 4.45761 16.5721 4.8342 16.5716H15.1658C15.5424 16.5721 15.9083 16.4464 16.205 16.2146C16.5018 15.9827 16.7123 15.6581 16.8028 15.2925L18.3953 8.92442C18.445 8.72468 18.4422 8.51547 18.3872 8.31714C18.3321 8.1188 18.2267 7.93809 18.0811 7.79258C17.9355 7.64708 17.7547 7.54173 17.5563 7.48679C17.3579 7.43186 17.1487 7.42919 16.949 7.47907Z"
                    fill="white"
                  />
                  <path
                    d="M1.39535 6.74419C2.16598 6.74419 2.7907 6.11947 2.7907 5.34884C2.7907 4.57821 2.16598 3.95349 1.39535 3.95349C0.624719 3.95349 0 4.57821 0 5.34884C0 6.11947 0.624719 6.74419 1.39535 6.74419Z"
                    fill="white"
                  />
                  <path
                    d="M18.6047 6.74419C19.3753 6.74419 20 6.11947 20 5.34884C20 4.57821 19.3753 3.95349 18.6047 3.95349C17.834 3.95349 17.2093 4.57821 17.2093 5.34884C17.2093 6.11947 17.834 6.74419 18.6047 6.74419Z"
                    fill="white"
                  />
                  <path
                    d="M10 2.7907C10.7706 2.7907 11.3953 2.16598 11.3953 1.39535C11.3953 0.624719 10.7706 0 10 0C9.22937 0 8.60465 0.624719 8.60465 1.39535C8.60465 2.16598 9.22937 2.7907 10 2.7907Z"
                    fill="white"
                  />
                </svg>
                <span className={styles.premiumText}>Премиум</span>
              </button>
            </Link>

            <a href="/leaders">
              <button className="m_btn">
                <svg width="20" height="20">
                  <use xlinkHref="#leaders"></use>
                </svg>
                Лидеры
              </button>
            </a>

            <ThemeToggleBtn onClick={toggleDarkMode} />

            <NotificationBtn />

            {isLoggedIn ? (
              <>
                {/* Десктоп — дропдаун профиля */}
                <div className="profile-dropdown-desktop">
                  <ProfileDropdown />
                </div>
                {/* Мобиль — прямая ссылка на профиль */}
                <Link href="/profile" className="profile-link-mobile">
                  <button
                    className="m_btn m_btn_icon category_btn"
                    title="Личный кабинет"
                  >
                    <img
                      src="/images/icons/user.svg"
                      alt=""
                      width="16"
                      height="20"
                    />
                  </button>
                </Link>
              </>
            ) : (
              <Link href="/login">
                <button
                  className="m_btn m_btn_icon category_btn"
                  title="Личный кабинет"
                >
                  <img
                    src="/images/icons/user.svg"
                    alt=""
                    width="16"
                    height="20"
                  />
                </button>
              </Link>
            )}

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
      <div
        className={`nav_mob_wrapper ${isMenuOpen ? "nav_mob_wrapper_visible" : ""}`}
      >
        <div className="nav_mob_wrapper_nav">
          <Link href="/">
            <img src="/images/icons/mob-nav-logo.svg" alt="" />
          </Link>
          <div>
            <ThemeToggleBtn onClick={toggleDarkMode} />
            <Link href="/login">
              <button className="m_btn">
                <img src="/images/icons/user.svg" alt="" />
              </button>
            </Link>
            <Link href="/logout" className="logout-btn logged_in_show">
              <button className="m_btn m_btn_icon category_btn" title="Выход">
                <img
                  src="/images/icons/logout.svg"
                  alt=""
                  width="16"
                  height="20"
                />
              </button>
            </Link>
            <button className="m_btn" onClick={toggleMenu}>
              <img src="/images/icons/exit-menu.svg" alt="" />
            </button>
          </div>
        </div>

        <div className="nav_mob_wrapper_list">
          <Link href="/categories" onClick={() => setIsMenuOpen(false)}>
            <button className="m_btn mob_category_btn">
              <svg width="18" height="18">
                <use xlinkHref="#all-categories"></use>
              </svg>
              Все категории
            </button>
          </Link>

          <form
            method="POST"
            action="/"
            className="search_input search_input_mob"
          >
            <img
              src="/images/icons/mob-search.svg"
              alt=""
              width="18"
              height="18"
            />
            <input type="text" placeholder="Найти вопрос" />
          </form>

          <Link href="/ask" className="mob_sec_item">
            <button className="m_btn">
              <svg width="20" height="20">
                <use xlinkHref="#ask"></use>
              </svg>
              Спросить
            </button>
          </Link>

          <Link href="/leaders" className="mob_sec_item">
            <button className="m_btn">
              <svg width="20" height="20">
                <use xlinkHref="#leaders"></use>
              </svg>
              Лидеры
            </button>
          </Link>

          <Link href="/notifications" className="mob_sec_item">
            <button className="m_btn notification-btn-mob">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 0C8.89543 0 8 0.89543 8 2V2.29C5.16229 3.02104 3 5.60626 3 8.66667V12.5L1.29289 14.2071C0.902369 14.5976 0.902369 15.2308 1.29289 15.6213C1.68342 16.0118 2.31658 16.0118 2.70711 15.6213L3 15.3284V16C3 17.1046 3.89543 18 5 18H7.17071C7.58254 19.1652 8.69378 20 10 20C11.3062 20 12.4175 19.1652 12.8293 18H15C16.1046 18 17 17.1046 17 16V15.3284L17.2929 15.6213C17.6834 16.0118 18.3166 16.0118 18.7071 15.6213C19.0976 15.2308 19.0976 14.5976 18.7071 14.2071L17 12.5V8.66667C17 5.60626 14.8377 3.02104 12 2.29V2C12 0.89543 11.1046 0 10 0ZM10 2C10.5523 2 11 2.44772 11 3V3.04938C10.6711 3.01659 10.3375 3 10 3C9.6625 3 9.32887 3.01659 9 3.04938V3C9 2.44772 9.44772 2 10 2ZM10 18C9.44772 18 9 17.5523 9 17H11C11 17.5523 10.5523 18 10 18Z"
                  fill="currentColor"
                />
              </svg>
              Уведомления
            </button>
          </Link>

          <Link href="/profile" className="mob_sec_item">
            <button className="m_btn premium-btn-mob">
              <svg
                width="20"
                height="17"
                viewBox="0 0 20 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.949 7.47907L14.405 8.11407C14.3509 8.12793 14.2939 8.12578 14.241 8.10788C14.1881 8.08997 14.1416 8.05709 14.107 8.01323L11.3181 4.52671C11.1548 4.33729 10.9525 4.18532 10.725 4.08115C10.4976 3.97698 10.2504 3.92306 10.0002 3.92306C9.75009 3.92306 9.50288 3.97698 9.27545 4.08115C9.04802 4.18532 8.84572 4.33729 8.68233 4.52671L5.89257 8.01415C5.85701 8.057 5.81018 8.08906 5.75738 8.10672C5.70457 8.12438 5.64787 8.12693 5.59369 8.11408L3.05141 7.47907C2.85168 7.42913 2.64243 7.43175 2.44401 7.48666C2.24559 7.54157 2.06476 7.6469 1.91912 7.79241C1.77347 7.93792 1.66798 8.11865 1.61289 8.31702C1.5578 8.51539 1.55499 8.72464 1.60474 8.92442L3.19721 15.2925C3.28774 15.6581 3.4982 15.9827 3.79495 16.2146C4.0917 16.4464 4.45761 16.5721 4.8342 16.5716H15.1658C15.5424 16.5721 15.9083 16.4464 16.205 16.2146C16.5018 15.9827 16.7123 15.6581 16.8028 15.2925L18.3953 8.92442C18.445 8.72468 18.4422 8.51547 18.3872 8.31714C18.3321 8.1188 18.2267 7.93809 18.0811 7.79258C17.9355 7.64708 17.7547 7.54173 17.5563 7.48679C17.3579 7.43186 17.1487 7.42919 16.949 7.47907Z"
                  fill="currentColor"
                />
                <path
                  d="M1.39535 6.74419C2.16598 6.74419 2.7907 6.11947 2.7907 5.34884C2.7907 4.57821 2.16598 3.95349 1.39535 3.95349C0.624719 3.95349 0 4.57821 0 5.34884C0 6.11947 0.624719 6.74419 1.39535 6.74419Z"
                  fill="currentColor"
                />
                <path
                  d="M18.6047 6.74419C19.3753 6.74419 20 6.11947 20 5.34884C20 4.57821 19.3753 3.95349 18.6047 3.95349C17.834 3.95349 17.2093 4.57821 17.2093 5.34884C17.2093 6.11947 17.834 6.74419 18.6047 6.74419Z"
                  fill="currentColor"
                />
                <path
                  d="M10 2.7907C10.7706 2.7907 11.3953 2.16598 11.3953 1.39535C11.3953 0.624719 10.7706 0 10 0C9.22937 0 8.60465 0.624719 8.60465 1.39535C8.60465 2.16598 9.22937 2.7907 10 2.7907Z"
                  fill="currentColor"
                />
              </svg>
              Премиум
            </button>
          </Link>
        </div>
      </div>
    </>
  );
}
