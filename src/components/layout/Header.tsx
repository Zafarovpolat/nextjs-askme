"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const lastScrollY = useRef(0);

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

            <a href="/leaders">
              <button className="m_btn">
                <svg width="20" height="20">
                  <use xlinkHref="#leaders"></use>
                </svg>
                Лидеры
              </button>
            </a>

            <ThemeToggleBtn onClick={toggleDarkMode} />

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
              style={{ fill: "#fff" }}
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
        </div>
      </div>
    </>
  );
}
