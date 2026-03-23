"use client";

import { useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { mockQuestions } from "@/data/mock-questions";
import { mockUsers } from "@/data/mock-users";
import SearchResultCard from "@/components/SearchResultCard";

// Склонение
const numWord = (value: number, words: [string, string, string]): string => {
  const abs = Math.abs(value);
  const cases = [2, 0, 1, 1, 1, 2];
  const index =
    abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)];
  return `${value} ${words[index]}`;
};

// Форматирование даты в "X месяцев назад"
const formatTimeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return "сегодня";
  if (diffDays < 7)
    return numWord(diffDays, ["день", "дня", "дней"]) + " назад";
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4)
    return numWord(diffWeeks, ["неделю", "недели", "недель"]) + " назад";
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12)
    return numWord(diffMonths, ["месяц", "месяца", "месяцев"]) + " назад";
  const diffYears = Math.floor(diffDays / 365);
  return numWord(diffYears, ["год", "года", "лет"]) + " назад";
};

// Моковые ответы
interface MockAnswer {
  id: number;
  author: (typeof mockUsers)[0];
  content: string;
  rating: number;
  isBestAnswer: boolean;
  createdAt: string;
  role: string;
  isBlocked?: boolean;
  parentId?: number;
  hasMedia?: boolean;
  mediaLink?: string;
}

const mockAnswers: MockAnswer[] = [
  {
    id: 1,
    author: mockUsers[0],
    content:
      "Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает! — без лишних слов и сложных формулировок. Мы понимаем, что каждый вопрос заслуживает честного и точного ответа, и именно это мы предоставляем информацию каждый день. Наш сайт — это место, где любой может получить ответы на повседневные вопросы и научиться чему-то новому. В своём стремлении предоставлять контент, мы работаем над каждым словом и предложением, чтобы информация была доступной для каждого.",
    rating: 12,
    isBestAnswer: true,
    createdAt: "2 часа назад",
    role: "Специалист дегтярного отдела",
  },
  {
    id: 2,
    author: mockUsers[1],
    content:
      "Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает! — без лишних слов и сложных формулировок. Мы понимаем, что каждый вопрос заслуживает честного и точного ответа.",
    rating: 8,
    isBestAnswer: false,
    createdAt: "3 часа назад",
    role: "Специалист дегтярного отдела",
  },
  {
    id: 3,
    author: mockUsers[2],
    content:
      "Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает!",
    rating: 5,
    isBestAnswer: false,
    createdAt: "5 часов назад",
    role: "Специалист дегтярного отдела",
  },
  {
    id: 4,
    author: mockUsers[3],
    content:
      "Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает! — без лишних слов и сложных формулировок.",
    rating: 3,
    isBestAnswer: false,
    createdAt: "6 часов назад",
    role: "Специалист дегтярного отдела",
    isBlocked: true,
  },
  {
    id: 5,
    author: mockUsers[4],
    content:
      "Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире.",
    rating: 2,
    isBestAnswer: false,
    createdAt: "8 часов назад",
    role: "Специалист дегтярного отдела",
    parentId: 2,
  },
  {
    id: 6,
    author: mockUsers[5],
    content:
      "Мы создали этот проект для тех, кто ищет простые и понятные ответы и вот вы.",
    rating: 1,
    isBestAnswer: false,
    createdAt: "10 часов назад",
    role: "Специалист дегтярного отдела",
  },
  {
    id: 7,
    author: mockUsers[6],
    content:
      "Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает! — без лишних слов и сложных формулировок. Мы понимаем, что каждый вопрос заслуживает честного и точного ответа, и именно это мы предоставляем информацию каждый день.",
    rating: 7,
    isBestAnswer: false,
    createdAt: "12 часов назад",
    role: "Специалист дегтярного отдела",
    hasMedia: true,
    mediaLink: "www.video-source.com",
  },
];

const rightSidebarQuestions = mockQuestions.slice(0, 5);

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const user = mockUsers.find((u) => u.username === username) ?? mockUsers[0];
  const question = mockQuestions[0];
  const bestAnswer = mockAnswers.find((a) => a.isBestAnswer);
  const regularAnswers = mockAnswers.filter((a) => !a.isBestAnswer);

  const userQuestions = mockQuestions.filter((q) => q.author.id === user.id);

  const [profileFilter, setProfileFilter] = useState<
    "all" | "opened" | "voting" | "closed"
  >("all");
  const [similarFilter, setSimilarFilter] = useState<
    "opened" | "voting" | "best"
  >("opened");

  const filteredQuestions =
    profileFilter === "all"
      ? userQuestions
      : userQuestions.filter((q) => q.status === profileFilter);

  const answerRef = useRef<HTMLTextAreaElement>(null);

  const scrollToAnswer = useCallback(() => {
    answerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => answerRef.current?.focus(), 400);
  }, []);

  // Рендер блока ответа
  const renderAnswer = (
    answer: MockAnswer,
    isBest = false,
    isNested = false,
  ) => (
    <div
      className={`main_question_block ${isBest ? "best_answer_block" : ""} ${answer.isBlocked ? "blocked_question_block" : ""} ${isNested ? "secondary_question_block" : ""}`}
      key={answer.id}
      style={
        isNested
          ? { width: "calc(100% - 40px)", marginLeft: "40px" }
          : undefined
      }
    >
      <div className="question_list_item-info">
        <div className="question_list_item_left">
          <Link href={`/profile/${answer.author.username}`}>
            <img
              src={answer.author.avatar || "/images/icons/avatar.svg"}
              alt=""
            />
          </Link>
          <div className="answer_author_container">
            <div className="answer_author_info">
              <Link
                href={`/profile/${answer.author.username}`}
                className="main_text"
              >
                {answer.author.displayName}
              </Link>
              {answer.parentId && (
                <>
                  <span className="reply_text">в ответ</span>
                  <Link
                    href={`/profile/${mockAnswers.find((a) => a.id === answer.parentId)?.author.username || ""}`}
                    className="reply_to_text"
                  >
                    {mockAnswers.find((a) => a.id === answer.parentId)?.author
                      .displayName || "Пользователь"}
                  </Link>
                </>
              )}
            </div>
            <div className="quest_user_title">
              <p>{answer.role}</p>
            </div>
            <span>{answer.createdAt}</span>
          </div>
          <div className="quest_user_title">
            <p>{answer.role}</p>
          </div>
        </div>
        <div className="question_list_item_right">
          <button
            className={`s_btn s_btn_icon ${isBest ? "btn_star_answer_active" : "btn_star_answer"} btn_star_tooltip`}
          >
            <svg width="15" height="15">
              <use xlinkHref="#star-best"></use>
            </svg>
            <span className="star_tooltip_text">Выбрать как лучший ответ</span>
          </button>
        </div>
      </div>

      {isBest && (
        <div className="main_question_block_title mobile_only_title">
          <h1>{question.title}</h1>
        </div>
      )}

      <div className="main_question_block_text">
        <p>
          {isNested && (
            <span style={{ color: "#6069ff", marginRight: "5px" }}>
              {answer.author.displayName},
            </span>
          )}
          {answer.content}
        </p>
        {answer.hasMedia && (
          <>
            <a href="#" className="answer_link_url">
              <svg width="13" height="13">
                <use xlinkHref="#answer-link"></use>
              </svg>
              {answer.mediaLink}
            </a>
            <div className="answer_media" style={{ marginTop: "15px" }}>
              <div className="answer_media_item">
                <div className="answer_media_play">
                  <svg
                    width="60"
                    height="60"
                    viewBox="0 0 60 60"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="30" cy="30" r="30" fill="#ffffff" />
                    <path d="M42 30L24 40.5V19.5L42 30Z" fill="#646BFF" />
                  </svg>
                </div>
              </div>
              <div className="answer_media_item">
                <div className="answer_media_play">
                  <svg
                    width="62"
                    height="56"
                    viewBox="0 0 62 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.9251 44.5365C11.8456 44.5365 8.21682 41.9279 6.89914 38.0444L6.81002 37.7517C6.49926 36.7233 6.36908 35.8584 6.36908 34.993V17.6414L0.187084 38.2503C-0.608003 41.2816 1.20381 44.4242 4.24371 45.2616L43.6477 55.8004C44.1395 55.9277 44.6313 55.9887 45.1156 55.9887C47.6535 55.9887 49.9725 54.3065 50.6224 51.8274L52.9181 44.5365H15.9251Z"
                      fill="white"
                    />
                    <path
                      d="M22.9329 17.8148C25.7437 17.8148 28.0292 15.5319 28.0292 12.7248C28.0292 9.91766 25.7437 7.63478 22.9329 7.63478C20.1221 7.63478 17.8363 9.91766 17.8363 12.7248C17.8363 15.5319 20.1221 17.8148 22.9329 17.8148Z"
                      fill="white"
                    />
                    <path
                      d="M54.7859 0H16.562C13.0508 0 10.1915 2.85559 10.1915 6.36263V34.3565C10.1915 37.8635 13.0508 40.7191 16.562 40.7191H54.7859C58.2976 40.7191 61.1569 37.8635 61.1569 34.3565V6.36263C61.1569 2.85559 58.2976 0 54.7859 0ZM16.562 5.09001H54.7859C55.4896 5.09001 56.0602 5.65991 56.0602 6.36263V24.4291L48.0104 15.0482C47.1565 14.0482 45.9205 13.5137 44.593 13.4834C43.273 13.4909 42.0346 14.0762 41.1887 15.0892L31.7242 26.4342L28.6409 23.3624C26.8981 21.6219 24.0616 21.6219 22.3212 23.3624L15.2882 30.3839V6.36263C15.2882 5.65991 15.8588 5.09001 16.562 5.09001Z"
                      fill="white"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="main_question_block_actions">
        <div className="main_question_block_actions_left">
          <button
            className="s_btn s_btn_active s_btn--answer"
            onClick={scrollToAnswer}
          >
            Ответить
          </button>
          <div className="question_vote_container">
            <button className="vote_btn like_btn" title="Мне нравится">
              <svg width="18" height="18">
                <use xlinkHref="#thumb-up"></use>
              </svg>
              <span className="vote_count">{answer.rating}</span>
            </button>
            <button className="vote_btn dislike_btn" title="Мне не нравится">
              <svg width="18" height="18">
                <use xlinkHref="#thumb-down"></use>
              </svg>
              <span className="vote_count">0</span>
            </button>
          </div>
        </div>
        <div className="main_question_block_actions_right">
          <button
            className="s_btn s_btn_icon btn_action_outline"
            title="Пожаловаться"
          >
            Пожаловаться
          </button>
          <button
            className="s_btn s_btn_icon btn_action_outline"
            title="Мне нравится"
          >
            <svg width="14" height="12">
              <use xlinkHref="#like"></use>
            </svg>
          </button>
          <button
            className="s_btn s_btn_icon btn_action_outline"
            title="Поделиться"
          >
            <svg width="14" height="14">
              <use xlinkHref="#share"></use>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Header />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">
            Главная
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <Link href="/categories" className="breadcrumbs__link">
            Категории вопросов
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <Link
            href={`/categories/${question.category.slug}`}
            className="breadcrumbs__link"
          >
            {question.category.name}
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">{question.title}</span>
        </div>
      </div>

      <div
        className="question_wrapper container"
        style={{
          paddingBottom: "14px",
          borderBottom: "1px solid #E0E2EF",
        }}
      >
        {/* Левый сайдбар */}
        <div className="question_left_list">
          <div
            className="profile_stats"
            style={{ width: "100%", marginBottom: "14px" }}
          >
            <div
              className={`profile_stats_list ${user.isBanned ? "banned_opacity" : ""}`}
            >
              <div className="profile_stats_item active">
                <p className="main_text">Вопросы</p>
                <div className="stats_badge">
                  <p className="main_text">45</p>
                </div>
              </div>
              <div className="profile_stats_item">
                <p className="main_text">Ответы</p>
                <div className="stats_badge">
                  <p className="main_text">320</p>
                </div>
              </div>
              <div className="profile_stats_item profile_stats_action">
                <div className="profile_stats_action_inner">
                  <svg
                    width="17"
                    height="15"
                    viewBox="0 0 17 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15.223 1.27533C13.4346 -0.425109 10.537 -0.425109 8.74859 1.27533L8.5 1.51167L8.25141 1.27533C6.46301 -0.425109 3.56541 -0.425109 1.77701 1.27533C-0.126569 3.08502 -0.126569 6.01498 1.77701 7.82467L8.5 14.2147L15.223 7.82467C17.1266 6.01498 17.1266 3.08502 15.223 1.27533Z"
                      fill="currentColor"
                    />
                  </svg>
                  <p className="main_text">Подписаться</p>
                </div>
              </div>
              <div className="profile_stats_item profile_stats_action">
                <div className="profile_stats_action_inner">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 17 17"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M16.42 5.7115L12.5718 1.86329C12.2543 1.54577 11.9322 1.38477 11.6146 1.38477C11.1785 1.38477 10.6693 1.71646 10.6693 2.65133V3.96143C7.87342 4.08328 5.2625 5.22989 3.27111 7.22118C1.16191 9.33024 0.000199219 12.1344 0 15.1172C0 15.3315 0.137062 15.5218 0.340332 15.5896C0.392229 15.6069 0.445354 15.6153 0.49798 15.6153C0.651611 15.6153 0.800328 15.544 0.896219 15.4163C3.24763 12.2864 6.78775 10.4367 10.6693 10.2907V11.5806C10.6693 12.5154 11.1785 12.8472 11.6146 12.8472H11.6147C11.9323 12.8472 12.2543 12.6862 12.5718 12.3687L16.42 8.52042C16.794 8.14652 17 7.64774 17 7.11596C17 6.58428 16.794 6.08546 16.42 5.7115Z"
                      fill="currentColor"
                    />
                  </svg>
                  <p className="main_text">Поделиться</p>
                </div>
              </div>
            </div>
          </div>

          {/* Лидеры проекта */}
          <div className="question_leaders">
            <div className="blocks_title">
              <h2>Лидеры проекта</h2>
            </div>
            {mockUsers.slice(0, 5).map((u) => (
              <Link href={`/profile/${u.username}`} key={u.id}>
                <div className="question_list_item">
                  <div className="question_list_item_left">
                    <img src={u.avatar || "/images/icons/avatar.svg"} alt="" />
                    <div>
                      <p className="main_text">{u.displayName}</p>
                      <span>
                        Legen {numWord(u.rating, ["балл", "балла", "баллов"])}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Самые активные авторы */}
          <div className="question_leaders">
            <div className="blocks_title">
              <h2>Самые активные авторы</h2>
            </div>
            {mockUsers.slice(3, 8).map((u) => (
              <Link href={`/profile/${u.username}`} key={u.id}>
                <div className="question_list_item">
                  <div className="question_list_item_left">
                    <img src={u.avatar || "/images/icons/avatar.svg"} alt="" />
                    <div>
                      <p className="main_text">{u.displayName}</p>
                      <span>
                        Legen {numWord(u.rating, ["балл", "балла", "баллов"])}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Основной контент */}
        <div className="questions_page_list">
          <div
            className="main_question_block main_question_block_item profile_question_block"
            style={{ marginTop: 0 }}
          >
            <div className="main_question_bg_wrapper">
              <div className="main_question_block_top_bg">
                <img
                  src="/images/top-leader-bg.svg"
                  className="top_bg_light"
                  alt=""
                />
                <img
                  src="/images/top-leader-bg-d-2.svg"
                  className="top_bg_dark"
                  alt=""
                />
                <img
                  src="/images/blues-rect.svg"
                  className="top_bg_rect top_bg_rect_light"
                  alt=""
                />
                <img
                  src="/images/blues-rect-dark.svg"
                  className="top_bg_rect top_bg_rect_dark"
                  alt=""
                />
              </div>
            </div>
            <div className="user_profile_block_content">
              <div className="user_profile_block_content_profile">
                <div className="user_profile_img">
                  <img
                    className="user_profile_image"
                    src={user.avatar || "/images/icons/avatar.svg"}
                    alt=""
                  />
                </div>
                <div className="user_profile_block_content_profile_desc">
                  <h4>{user.displayName}</h4>
                  <div className="user_role_badge">Гуру</div>
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
                      <div className="stat_value">
                        {user.rating.toLocaleString()}
                      </div>
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
          </div>

          <div
            className={`user_profile_page_content ${user.isBanned ? "banned_relative" : ""}`}
          >
            {user.isBanned && (
              <div className="banned_banner">
                <svg
                  width="44"
                  height="44"
                  viewBox="0 0 44 44"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20.9767 22.5053C27.1932 22.5053 32.2326 17.4674 32.2326 11.2527C32.2326 5.03799 27.1932 0 20.9767 0C14.7603 0 9.72093 5.03799 9.72093 11.2527C9.72093 17.4674 14.7603 22.5053 20.9767 22.5053Z"
                    fill="white"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M38.6832 25.6643L25.6592 38.6846C25.0595 39.2821 25.0595 40.2559 25.6592 40.8533C26.2567 41.4528 27.2309 41.4528 27.8285 40.8533L40.8525 27.833C41.4521 27.2356 41.4521 26.2617 40.8525 25.6643C40.2549 25.0648 39.2807 25.0648 38.6832 25.6643Z"
                    fill="white"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M33.2558 22.5176C27.325 22.5176 22.5116 27.3297 22.5116 33.2588C22.5116 39.1879 27.325 44 33.2558 44C39.1866 44 44 39.1879 44 33.2588C44 27.3297 39.1866 22.5176 33.2558 22.5176ZM33.2558 25.5865C37.4921 25.5865 40.9302 29.0237 40.9302 33.2588C40.9302 37.4939 37.4921 40.9311 33.2558 40.9311C29.0195 40.9311 25.5814 37.4939 25.5814 33.2588C25.5814 29.0237 29.0195 25.5865 33.2558 25.5865Z"
                    fill="white"
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M23.893 41.9663C21.7667 39.6831 20.4651 36.6223 20.4651 33.2588C20.4651 29.8155 21.8301 26.6872 24.0486 24.3876C23.0458 24.3099 22.0205 24.2689 20.9767 24.2689C14.1782 24.2689 8.15944 25.9691 4.42251 28.5163C1.57172 30.46 0 32.9294 0 35.5216V38.4882C0 39.411 0.366326 40.2968 1.01916 40.9475C1.672 41.6001 2.55609 41.9663 3.47907 41.9663H23.893Z"
                    fill="white"
                  />
                </svg>
                <div className="banned_banner_content">
                  Пользователь заблокирован за нарушение правил использования
                  сервиса otvet.ai. О наших принципах модерации читайте{" "}
                  <a href="#">здесь</a>
                </div>
              </div>
            )}
            <div
              className={`questions_page_inner ${user.isBanned ? "banned_opacity" : ""}`}
            >
              <div
                className="questions_filter"
                style={{ marginTop: "20px", marginBottom: "14px" }}
              >
                <button
                  className={`s_btn ${profileFilter === "all" ? "s_btn_active questions_filter_active" : ""}`}
                  onClick={() => setProfileFilter("all")}
                >
                  Все
                </button>
                <button
                  className={`s_btn ${profileFilter === "opened" ? "s_btn_active questions_filter_active" : ""}`}
                  onClick={() => setProfileFilter("opened")}
                >
                  Открытые
                </button>
                <button
                  className={`s_btn ${profileFilter === "voting" ? "s_btn_active questions_filter_active" : ""}`}
                  onClick={() => setProfileFilter("voting")}
                >
                  На голосовании
                </button>
                <button
                  className={`s_btn ${profileFilter === "closed" ? "s_btn_active questions_filter_active" : ""}`}
                  onClick={() => setProfileFilter("closed")}
                >
                  Решенные
                </button>
              </div>

              <div
                className="search-results-list"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "5px",
                }}
              >
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((q) => (
                    <SearchResultCard
                      key={q.id}
                      question={q}
                      isProfilePage={true}
                      status={q.status}
                    />
                  ))
                ) : (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#899AB5",
                    }}
                  >
                    У этого пользователя пока нет вопросов
                  </div>
                )}
              </div>
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
          </div>
        </div>

        {/* Правый сайдбар */}
        <div className="question_right_list">
          <div className="vip_status_block">
            <div className="vip_icon">
              <img src="/images/vip.svg" alt="VIP" />
            </div>
            <p className="vip_gift_text">Подарить</p>
            <h3 className="vip_title">VIP статус</h3>
            <button className="vip_button">ПОДАРИТЬ</button>
          </div>
        </div>
      </div>

      {/* Не нашли то, что искали? */}
      <div className="container">
        <div className="ask_question">
          <p>Не нашли то, что искали?</p>
          <Link href="/ask" className="ask_question__button">
            Задайте свой вопрос
          </Link>
        </div>
      </div>

      {/* Похожие вопросы участников */}
      <div className="similar_questions_block container">
        <div className="blocks_title">
          <h2>Похожие вопросы участников</h2>
          <div className="questions_filter">
            <button
              className={`s_btn ${similarFilter === "opened" ? "s_btn_active" : ""}`}
              onClick={() => setSimilarFilter("opened")}
            >
              Открытые
            </button>
            <button
              className={`s_btn ${similarFilter === "voting" ? "s_btn_active" : ""}`}
              onClick={() => setSimilarFilter("voting")}
            >
              На голосовании
            </button>
            <button
              className={`s_btn ${similarFilter === "best" ? "s_btn_active" : ""}`}
              onClick={() => setSimilarFilter("best")}
            >
              Лучшие
            </button>
          </div>
        </div>

        {mockQuestions.map((q) => (
          <div className="question_list_item" key={q.id}>
            <div className="question_item_top_data">
              <div className="question_item_top_data_left">
                <img
                  src={q.author.avatar || "/images/icons/avatar.svg"}
                  alt={q.author.displayName}
                />
                <div>
                  <p className="main_text">{q.author.displayName}</p>
                  <span>
                    {numWord(q.author.rating, ["балл", "балла", "баллов"])}
                  </span>
                </div>
              </div>
              <div className="question_item_top_data_right">
                <button
                  title="Мне нравится"
                  className="s_btn s_btn_icon btn-like"
                >
                  <svg width="13.71" height="12">
                    <use xlinkHref="#like"></use>
                  </svg>
                </button>
                <button
                  className="s_btn s_btn_icon share-this"
                  title="Поделиться"
                >
                  <svg width="14" height="14">
                    <use xlinkHref="#share"></use>
                  </svg>
                </button>
              </div>
            </div>
            <Link href={`/question/${q.id}`}>
              <div className="question_list_item_left">
                <img
                  src={q.author.avatar || "/images/icons/avatar.svg"}
                  alt={q.author.displayName}
                />
                <div>
                  <p className="main_text">{q.title}</p>
                  <span>{formatTimeAgo(q.createdAt)}</span>
                </div>
              </div>
            </Link>
            <div className="question_list_item_right">
              <div className="question_list_item_users">
                <img src="/images/icons/avatar.svg" alt="" />
                <img src="/images/icons/avatar.svg" alt="" />
                <img src="/images/icons/avatar.svg" alt="" />
                <p className="main_text">+{q.commentsCount}</p>
              </div>
              <div className="question_list_item_right_actions">
                <button
                  title="Мне нравится"
                  className="s_btn s_btn_icon btn-like"
                >
                  <svg width="13.71" height="12">
                    <use xlinkHref="#like"></use>
                  </svg>
                </button>
                <button
                  className="s_btn s_btn_icon share-this"
                  title="Поделиться"
                >
                  <svg width="14" height="14">
                    <use xlinkHref="#share"></use>
                  </svg>
                </button>
                <Link className="s_btn" href={`/question/${q.id}`}>
                  Посмотреть
                </Link>
                <Link
                  className="s_btn s_btn_active"
                  href={`/question/${q.id}#answer`}
                >
                  Ответить
                </Link>
              </div>
            </div>
          </div>
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

      <Footer />
    </>
  );
}
