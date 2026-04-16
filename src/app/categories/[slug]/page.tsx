"use client";

import { useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { mockQuestions } from "@/data/mock-questions";
import { mockUsers } from "@/data/mock-users";
import { mockCategories } from "@/data/mock-categories";
import LoginModal from "@/components/LoginModal";
import QuestionModal from "@/components/QuestionModal";
import SharePopup from "@/components/SharePopup";

// Данные категорий (slug -> name, icon)
const categoryMap: Record<string, { name: string; svgIcon: string }> = {
  "auto-moto": { name: "Авто, Мото", svgIcon: "steering-wheel" },
  entertainment: { name: "Развлечения", svgIcon: "gaming" },
  plants: { name: "Растения", svgIcon: "gear" },
  "beauty-health": { name: "Красота и Здоровье", svgIcon: "heart" },
  "family-home": { name: "Семья, Дом", svgIcon: "family" },
  "business-finance": { name: "Бизнес, Финансы", svgIcon: "business" },
  "food-cooking": { name: "Еда, Кулинария", svgIcon: "food" },
  sport: { name: "Спорт", svgIcon: "sport" },
  homework: { name: "Домашние задания", svgIcon: "homework" },
  culture: { name: "Культура", svgIcon: "culture" },
  programming: { name: "Программирование", svgIcon: "it" },
  "society-politics": { name: "Общество, Политика", svgIcon: "society" },
  children: { name: "Дети", svgIcon: "children" },
  "science-tech": { name: "Наука, Техника", svgIcon: "science" },
  photography: { name: "Фотография", svgIcon: "camera" },
  "video-games": { name: "Видео игры", svgIcon: "gaming" },
  computers: { name: "Компьютеры, Связь", svgIcon: "computer" },
  dating: { name: "Знакомства", svgIcon: "relationships" },
  career: { name: "Работа, Карьера", svgIcon: "career" },
  horoscopes: { name: "Гороскопы, Гадания", svgIcon: "horoscope" },
};

// Подкатегории для драггабл-блока
const subcategories: Record<string, string[]> = {
  "auto-moto": [
    "Автоспорт",
    "Автострахование",
    "Выбор автомобиля, мотоцикла",
    "ГИБДД, Обучение, Права",
  ],
  entertainment: [
    "Игры без компьютера",
    "Клубы, Дискотеки",
    "Концерты, Выставки, Спектакли",
    "Охота и Рыбалка",
  ],
  plants: ["Дикая природа", "Домашние", "Комнатные растения", "Сад-Огород"],
  "beauty-health": [
    "Коронавирус",
    "Баня, Массаж, Фитнес",
    "Болезни, Лекарства",
    "Детское здоровье",
  ],
  "family-home": [
    "Беременность, Роды",
    "Воспитание детей",
    "Домашняя бухгалтерия",
    "Домоводство",
  ],
};

const tabs = ["Открытые", "На голосовании", "Лучшие", "Решения", "Премиум"];

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const category = categoryMap[slug] ?? { name: slug, svgIcon: "gear" };

  const [activeTab, setActiveTab] = useState(0);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareData, setShareData] = useState({ title: "", url: "" });
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);

  // Drag-to-scroll для блока категорий
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const hasDragged = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeft.current = el.scrollLeft;
    el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(walk) > 5) hasDragged.current = true;
    el.scrollLeft = scrollLeft.current - walk;
  }, []);

  const handleMouseUp = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    isDragging.current = false;
    el.style.cursor = "grab";
    el.style.removeProperty("user-select");
  }, []);

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      hasDragged.current = false;
    }
  }, []);

  const handleShareClick = useCallback(
    (
      e: React.MouseEvent<HTMLButtonElement>,
      title: string,
      questionSlug: string,
    ) => {
      const btn = e.currentTarget;
      shareButtonRef.current = btn;
      setShareData({ title, url: `/question/${questionSlug}` });
      setIsShareOpen(true);
    },
    [],
  );

  // Больше вопросов для страницы категории
  const categoryQuestions = [...mockQuestions, ...mockQuestions].map(
    (q, i) => ({
      ...q,
      id: i + 1,
    }),
  );

  const getFilteredQuestions = () => {
    switch (activeTab) {
      case 0: // Открытые
        return categoryQuestions.filter((q) => q.status === "opened");
      case 1: // На голосовании
        return categoryQuestions.filter((q) => q.status === "voting");
      case 2: // Лучшие
        return categoryQuestions.filter((q) => q.status === "closed");
      case 3: // Решения
        return categoryQuestions;
      case 4: // Премиум
        return categoryQuestions.filter((q) => (q as any).isPremium === true);
      default:
        return categoryQuestions;
    }
  };

  const filteredQuestions = getFilteredQuestions();

  const topUsers = mockUsers.slice(0, 4);
  const popularQuestions = mockQuestions.slice(0, 4);

  const popularTopics = [
    { id: 1, name: "Еда, Кулинария", slug: "food-cooking", svgIcon: "food" },
    { id: 2, name: "Знакомства", slug: "dating", svgIcon: "relationships" },
    { id: 3, name: "Программирование", slug: "programming", svgIcon: "it" },
    { id: 4, name: "Культура", slug: "culture", svgIcon: "culture" },
    { id: 5, name: "Фотография", slug: "photography", svgIcon: "camera" },
  ];

  return (
    <>
      <Header />
      <div className="container">
        {/* Хлебные крошки */}
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">
            Главная
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">Категории вопросов</span>
        </div>

        {/* Блок вопросов категории */}
        <div className="section populars_block">
          <div className="blocks_title">
            <svg width="24" height="24" className="category_page_icon">
              <use xlinkHref={`#${category.svgIcon}`}></use>
            </svg>
            <h2>{category.name}</h2>

            <div className="questions_filter">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  className={`s_btn ${activeTab === index ? "s_btn_active" : ""} ${index === 4 ? "premium-filter-btn" : ""}`}
                  onClick={() => setActiveTab(index)}
                >
                  {index === 4 && (
                    <svg
                      className="premium-crown-icon"
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
                  )}
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Поле "Задать свой вопрос" */}
          <div className="questions_block_search">
            <img src="/images/icons/ask.svg" alt="" />
            <input
              name="message"
              type="text"
              placeholder="Задайте свой вопрос здесь"
            />
            <textarea
              name="message-full"
              placeholder="Задайте свой вопрос здесь"
            ></textarea>
            <button
              type="button"
              className="s_btn s_btn_active"
              onClick={() => setIsLoginModalOpen(true)}
            >
              Задать вопрос
            </button>
          </div>

          {/* Список вопросов */}
          <div className="questions_list">
            {filteredQuestions.map((question) => {
              const isPremium = (question as any).isPremium === true;
              return (
                <div
                  key={question.id}
                  className={`question_list_item ${isPremium ? "premium-question" : ""}`}
                >
                  {/* Верхняя панель (мобильная) */}
                  <div className="question_item_top_data">
                    <div className="question_item_top_data_left">
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                        }}
                      >
                        <img
                          src={
                            isPremium
                              ? "/images/premium-avatar.png"
                              : question.author.avatar ||
                                "/images/icons/avatar.svg"
                          }
                          alt={question.author.displayName}
                        />
                        {isPremium && (
                          <div className="premium-badge">
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
                      <div>
                        <p className="main_text">
                          {question.author.displayName}
                        </p>
                        <span>{question.author.rating} баллов</span>
                      </div>
                    </div>
                    <div className="question_item_top_data_right">
                      <button
                        title="Мне нравится"
                        className="s_btn s_btn_icon btn-like"
                        onClick={() => setIsLoginModalOpen(true)}
                      >
                        <svg width="13.714355" height="12.000000">
                          <use xlinkHref="#like"></use>
                        </svg>
                      </button>
                      <button
                        className="s_btn s_btn_icon share-this"
                        title="Поделиться"
                        onClick={(e) =>
                          handleShareClick(e, question.title, question.slug)
                        }
                      >
                        <svg width="14" height="14.000000">
                          <use xlinkHref="#share"></use>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Основной контент */}
                  <Link href={`/question/${question.slug}`}>
                    <div className="question_list_item_left">
                      <div
                        style={{
                          position: "relative",
                          display: "inline-block",
                        }}
                      >
                        <img
                          src={
                            isPremium
                              ? "/images/premium-avatar.png"
                              : question.author.avatar ||
                                "/images/icons/avatar.svg"
                          }
                          alt={question.author.displayName}
                        />
                        {isPremium && (
                          <div className="premium-badge">
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
                      <div>
                        <p className="main_text">{question.title}</p>
                        <span>8 месяцев назад</span>
                      </div>
                    </div>
                  </Link>

                  <div className="question_list_item_right">
                    <div className="question_list_item_users">
                      <img src="/images/icons/avatar.svg" alt="" />
                      <img src="/images/icons/avatar.svg" alt="" />
                      <img src="/images/icons/avatar.svg" alt="" />
                      <p className="main_text">+5</p>
                    </div>

                    <div className="question_list_item_right_actions">
                      <button
                        title="Мне нравится"
                        className="s_btn s_btn_icon btn-like"
                        onClick={() => setIsLoginModalOpen(true)}
                      >
                        <svg width="13.714355" height="12.000000">
                          <use xlinkHref="#like"></use>
                        </svg>
                      </button>

                      <button
                        className="s_btn s_btn_icon share-this"
                        title="Поделиться"
                        onClick={(e) =>
                          handleShareClick(e, question.title, question.slug)
                        }
                      >
                        <svg width="14" height="14.000000">
                          <use xlinkHref="#share"></use>
                        </svg>
                      </button>

                      <Link
                        href={`/question/${question.slug}`}
                        className="s_btn"
                      >
                        Посмотреть
                      </Link>

                      <Link
                        href={`/question/${question.slug}#answer`}
                        className="s_btn s_btn_active"
                      >
                        Ответить
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Показать больше */}
          <div className="show_more_btn_wrapper">
            <button className="show_more_btn">
              <svg width="22" height="22">
                <use xlinkHref="#sync"></use>
              </svg>
              Показать еще
            </button>
          </div>
        </div>

        <div className="line"></div>

        {/* Блок "Популярные категории" с драгом */}
        <div className="section popular-section">
          <div className="blocks_title">
            <h2>Популярные</h2>
          </div>

          <div
            className="subjects_list_wrapper"
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClickCapture={handleClickCapture}
            style={{ cursor: "grab" }}
          >
            <div className="subjects_list">
              {mockCategories.slice(0, 5).map((cat) => (
                <div className="subject_item" key={cat.id}>
                  <div className="subject_item_icon">
                    <svg width="24" height="24" className="category_icon">
                      <use xlinkHref={`#${cat.svgIcon || "gaming"}`}></use>
                    </svg>
                  </div>

                  <Link href={`/categories/${cat.slug}`}>
                    <h3>{cat.name}</h3>
                  </Link>

                  <div className="subject_item_list">
                    {subcategories[cat.slug]
                      ?.slice(0, 4)
                      .map((subcat, index) => (
                        <Link
                          href={`/categories/${cat.slug}/${encodeURIComponent(subcat.toLowerCase())}`}
                          key={index}
                        >
                          <div className="subject_item_list_item">
                            <img
                              src="/images/icons/category-list-item.svg"
                              alt=""
                            />
                            <p>{subcat}</p>
                          </div>
                        </Link>
                      ))}
                  </div>

                  <Link href="/categories">
                    <div className="subject_item_more">
                      <p>Посмотреть все</p>
                      <img
                        src="/images/icons/more-s-icon.svg"
                        alt=""
                        className="subject_item_more_arrow"
                      />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="line"></div>

        {/* Три блока внизу */}
        <div className="tops_block">
          {/* Лидеры проекта */}
          <div className="tops_block_item">
            <div className="blocks_title">
              <h2>Лидеры проекта</h2>
            </div>

            <div className="tops_block_item_top_subjects">
              {topUsers.map((user) => (
                <div className="question_list_item" key={user.id}>
                  <Link href={`/profile/${user.username}`}>
                    <div className="question_list_item_left">
                      <img
                        src={user.avatar || "/images/icons/avatar.svg"}
                        alt={user.displayName}
                      />
                      <div>
                        <div className="main_text">{user.displayName}</div>
                        <span>{user.rating} баллов</span>
                      </div>
                    </div>
                  </Link>
                  <div className="question_list_item_users">
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <p className="main_text">+4K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Самые обсуждаемые */}
          <div className="tops_block_item">
            <div className="blocks_title">
              <h2>Самые обсуждаемые</h2>
            </div>

            <div className="tops_block_item_top_subjects">
              {popularQuestions.map((question) => (
                <div className="question_list_item" key={question.id}>
                  <Link href={`/question/${question.slug}`}>
                    <div className="question_list_item_left">
                      <img
                        src={
                          question.author.avatar || "/images/icons/avatar.svg"
                        }
                        alt={question.author.displayName}
                      />
                      <div>
                        <div className="main_text question_title_clamp">
                          {question.title}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="question_list_item_users">
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <p className="main_text">+{question.commentsCount}K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Популярные темы */}
          <div className="tops_block_item">
            <div className="blocks_title">
              <h2>Популярные темы</h2>
            </div>

            <div className="tops_block_item_top_subjects">
              {popularTopics.map((topic) => (
                <div className="question_list_item" key={topic.id}>
                  <Link href={`/categories/${topic.slug}`}>
                    <div className="question_list_item_left">
                      <svg width="24" height="24" className="topic_icon">
                        <use xlinkHref={`#${topic.svgIcon}`}></use>
                      </svg>
                      <div>
                        <div className="main_text">{topic.name}</div>
                      </div>
                    </div>
                  </Link>
                  <div className="question_list_item_users">
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <p className="main_text">+4K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />

        <QuestionModal
          isOpen={isQuestionModalOpen}
          onClose={() => setIsQuestionModalOpen(false)}
        />

        <SharePopup
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          anchorRef={shareButtonRef}
          title={shareData.title}
          url={shareData.url}
        />
      </div>
      <Footer />
    </>
  );
}
