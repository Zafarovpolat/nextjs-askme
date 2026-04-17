"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { mockQuestions } from "@/data/mock-questions";
import { mockUsers } from "@/data/mock-users";
import { mockAnswers, UserAnswer } from "@/data/mock-answers";
import SearchResultCard from "@/components/SearchResultCard";
import AnswerResultCard from "@/components/AnswerResultCard";
import "@/styles/profile.css";

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

const rightSidebarQuestions = mockQuestions.slice(0, 5);

const ProfileSharePopup = () => (
  <div className="profile_share_popup">
    <div className="profile_share_popup_title">Поделиться</div>
    <div className="profile_share_popup_subtitle">через</div>
    <div className="profile_share_popup_icons">
      <div className="share_icon_btn vk">
        <svg
          width="17"
          height="10"
          viewBox="0 0 17 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.9098 9.0311C16.8893 8.98536 16.8701 8.94742 16.8522 8.91702C16.5573 8.36934 15.9937 7.6971 15.1617 6.9001L15.1441 6.88185L15.1353 6.8729L15.1264 6.86373H15.1175C14.7399 6.49261 14.5007 6.24307 14.4006 6.11532C14.2174 5.87195 14.1763 5.62561 14.2765 5.37602C14.3472 5.18743 14.613 4.78918 15.0731 4.1807C15.3151 3.85823 15.5068 3.59977 15.6484 3.40506C16.6693 2.00572 17.1119 1.11153 16.9761 0.722125L16.9234 0.631127C16.8879 0.576343 16.7965 0.526225 16.6491 0.480518C16.5014 0.434907 16.3127 0.427364 16.0825 0.45776L13.5334 0.475915C13.4921 0.460829 13.4331 0.462235 13.3563 0.480518C13.2796 0.4988 13.2412 0.507974 13.2412 0.507974L13.1968 0.530827L13.1616 0.558283C13.1321 0.576438 13.0997 0.60837 13.0642 0.654013C13.029 0.699496 12.9995 0.752873 12.9759 0.813699C12.6984 1.54984 12.3829 2.23426 12.0287 2.86693C11.8104 3.24419 11.6099 3.57114 11.4267 3.84797C11.2439 4.1247 11.0904 4.32859 10.9666 4.45929C10.8426 4.59011 10.7307 4.69492 10.6302 4.77409C10.5298 4.85329 10.4532 4.88676 10.4002 4.87452C10.347 4.86228 10.297 4.85013 10.2496 4.83798C10.167 4.7832 10.1006 4.70869 10.0505 4.6144C10.0002 4.52011 9.96639 4.40144 9.94868 4.25847C9.93108 4.1154 9.92066 3.99234 9.91768 3.88888C9.91492 3.78554 9.91619 3.63938 9.92218 3.4508C9.92832 3.26212 9.93108 3.13446 9.93108 3.06753C9.93108 2.83631 9.93545 2.58537 9.94422 2.31464C9.95315 2.04392 9.96037 1.82941 9.96642 1.67139C9.97243 1.51321 9.97522 1.34585 9.97522 1.16941C9.97522 0.992979 9.96481 0.854611 9.94422 0.754184C9.92388 0.653884 9.89266 0.556526 9.85153 0.462139C9.81014 0.367849 9.74956 0.294909 9.67007 0.24313C9.59043 0.191414 9.49141 0.150373 9.37358 0.119881C9.0608 0.0469095 8.66252 0.00743533 8.17856 0.00129845C7.08107 -0.0108474 6.37588 0.0622196 6.06313 0.220404C5.93922 0.287238 5.82709 0.378556 5.72683 0.49407C5.62059 0.627962 5.60577 0.70103 5.68247 0.713048C6.03657 0.767736 6.28724 0.89856 6.43478 1.10539L6.48795 1.21499C6.5293 1.29407 6.5706 1.43407 6.61192 1.63479C6.65319 1.83552 6.67982 2.05757 6.69154 2.3008C6.72099 2.74499 6.72099 3.12522 6.69154 3.44153C6.66199 3.75796 6.63409 4.0043 6.60746 4.18073C6.58083 4.35717 6.54102 4.50014 6.48795 4.60961C6.43478 4.71911 6.39941 4.78605 6.38167 4.81034C6.36397 4.83463 6.34922 4.84994 6.3375 4.85595C6.2608 4.88625 6.18103 4.90169 6.09847 4.90169C6.01579 4.90169 5.91553 4.85905 5.79754 4.77384C5.67958 4.68862 5.55716 4.57157 5.43027 4.4225C5.30338 4.27339 5.16027 4.06503 5.0009 3.79737C4.84164 3.52971 4.6764 3.21338 4.50527 2.84836L4.36369 2.58364C4.27518 2.41334 4.15427 2.16538 4.00085 1.83996C3.84733 1.51442 3.71163 1.19952 3.59367 0.895332C3.54652 0.767576 3.47568 0.670314 3.38128 0.603383L3.33698 0.575927C3.30753 0.551635 3.26025 0.525841 3.19539 0.498353C3.13045 0.470897 3.06268 0.451208 2.99181 0.439094L0.566585 0.457249C0.318758 0.457249 0.150606 0.515133 0.0620652 0.630743L0.0266304 0.685432C0.00892846 0.715892 0 0.76454 0 0.831502C0 0.898432 0.0177019 0.980577 0.0531367 1.07784C0.407175 1.93572 0.792183 2.76308 1.20816 3.56005C1.62414 4.35701 1.98562 4.99898 2.29238 5.48539C2.5992 5.97216 2.91195 6.43156 3.23061 6.86338C3.54928 7.29535 3.76021 7.57219 3.86342 7.6938C3.96674 7.81565 4.04791 7.90674 4.1069 7.96757L4.32822 8.18654C4.46984 8.33258 4.6778 8.50748 4.95219 8.71125C5.22665 8.91514 5.5305 9.11586 5.86389 9.31375C6.19734 9.51131 6.58526 9.67253 7.02787 9.79722C7.47042 9.92203 7.90115 9.97212 8.32014 9.94795H9.33805C9.54449 9.92957 9.70089 9.86265 9.80719 9.74713L9.84241 9.70139C9.8661 9.66508 9.88826 9.60867 9.90872 9.53276C9.92943 9.45672 9.93973 9.37294 9.93973 9.28181C9.93368 9.02026 9.95299 8.78454 9.99714 8.57467C10.0413 8.36486 10.0915 8.20668 10.1478 8.10015C10.204 7.99371 10.2674 7.9039 10.338 7.83108C10.4087 7.75811 10.4592 7.71391 10.4887 7.69869C10.5181 7.68338 10.5416 7.673 10.5593 7.66676C10.7009 7.61812 10.8676 7.66523 11.0595 7.80833C11.2513 7.9513 11.4312 8.12783 11.5995 8.33763C11.7677 8.54763 11.9698 8.78323 12.2058 9.04478C12.4419 9.30643 12.6484 9.50092 12.8253 9.62887L13.0023 9.73837C13.1205 9.81144 13.2739 9.87837 13.4627 9.9392C13.6513 9.99999 13.8164 10.0152 13.9583 9.98481L16.2241 9.94837C16.4482 9.94837 16.6226 9.91011 16.7463 9.8342C16.8702 9.75816 16.9439 9.67438 16.9676 9.58326C16.9913 9.49203 16.9926 9.38854 16.9721 9.27283C16.9511 9.15742 16.9304 9.07671 16.9098 9.0311Z"
            fill="white"
          />
        </svg>
      </div>
      <div className="share_icon_btn ok">
        <svg
          width="12"
          height="18"
          viewBox="0 0 12 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.71945 0.200089C4.49064 0.19326 3.30925 0.639955 2.43515 1.44191C1.56106 2.24386 1.06586 3.33537 1.05851 4.47633C1.05115 5.61729 1.53224 6.71423 2.39593 7.52584C3.25963 8.33745 4.43518 8.79725 5.66398 8.80407C8.22377 8.81299 10.3132 6.90759 10.3249 4.55754C10.3327 3.99014 10.2195 3.42692 9.99185 2.90031C9.76423 2.37369 9.42668 1.89407 8.99862 1.48907C8.57057 1.08407 8.06047 0.761685 7.49769 0.540467C6.93491 0.319248 6.33057 0.20357 5.71945 0.200089ZM5.71305 6.60851C5.26417 6.61126 4.82452 6.49024 4.44978 6.26078C4.07505 6.03133 3.78209 5.70376 3.60802 5.31958C3.43395 4.9354 3.3866 4.51189 3.47196 4.1027C3.55733 3.69352 3.77158 3.31706 4.08756 3.02103C4.40355 2.72499 4.80705 2.5227 5.24696 2.43977C5.68687 2.35684 6.14339 2.39701 6.55869 2.55519C6.97399 2.71338 7.32938 2.98245 7.57985 3.32833C7.83032 3.67421 7.96459 4.08133 7.96565 4.49812C7.96776 4.77427 7.91109 5.04809 7.7989 5.30384C7.6867 5.5596 7.5212 5.79226 7.31188 5.98845C7.10257 6.18464 6.85357 6.3405 6.57919 6.44708C6.30482 6.55366 6.01047 6.60886 5.71305 6.6095V6.60851Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.9094 10.4945C10.342 11.026 9.65717 11.4369 8.90212 11.6988C8.18752 11.9562 7.40252 12.086 6.62605 12.1721C6.74231 12.291 6.79777 12.3494 6.87136 12.4177C7.92514 13.4011 8.98425 14.3796 10.0348 15.3669C10.3921 15.7027 10.4679 16.1206 10.2705 16.5108C10.1686 16.7185 10.0029 16.8937 9.7942 17.0144C9.58549 17.1351 9.34307 17.1959 9.09731 17.1891C8.81133 17.1629 8.54658 17.0373 8.35604 16.8376C7.56144 16.0948 6.74977 15.364 5.97011 14.6074C5.74293 14.3865 5.63414 14.4291 5.43682 14.6192C4.63689 15.3848 3.82309 16.1384 3.00609 16.8871C2.63812 17.2238 2.20189 17.2832 1.7742 17.0921C1.55638 16.9979 1.37259 16.8471 1.24503 16.658C1.11747 16.4689 1.05158 16.2496 1.05533 16.0265C1.0797 15.7508 1.21806 15.4946 1.44143 15.3115C2.48525 14.3449 3.52658 13.3764 4.56542 12.4059C4.63475 12.3415 4.69981 12.2732 4.79901 12.1731C3.37939 12.0365 2.0995 11.7116 1.00306 10.9164C0.867607 10.8174 0.726819 10.7183 0.603097 10.6114C0.123137 10.1836 0.0698087 9.69334 0.454843 9.18828C0.774815 8.75649 1.32304 8.64161 1.88939 8.89118C2.00084 8.94057 2.10784 8.99819 2.20936 9.06349C4.25079 10.3668 7.05588 10.4024 9.10477 9.12192C9.30292 8.97343 9.53154 8.86392 9.77672 8.80007C10.0029 8.73839 10.2448 8.74899 10.4637 8.83015C10.6826 8.91131 10.8659 9.05834 10.9841 9.24769C11.2849 9.70126 11.2817 10.1449 10.9116 10.4965L10.9094 10.4945Z"
            fill="white"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M5.71945 0.200089C4.49064 0.19326 3.30925 0.639955 2.43515 1.44191C1.56106 2.24386 1.06586 3.33537 1.05851 4.47633C1.05115 5.61729 1.53224 6.71423 2.39593 7.52584C3.25963 8.33745 4.43518 8.79725 5.66398 8.80407C8.22377 8.81299 10.3132 6.90759 10.3249 4.55754C10.3327 3.99014 10.2195 3.42692 9.99185 2.90031C9.76423 2.37369 9.42668 1.89407 8.99862 1.48907C8.57057 1.08407 8.06047 0.761685 7.49769 0.540467C6.93491 0.319248 6.33057 0.20357 5.71945 0.200089ZM5.71305 6.60851C5.26417 6.61126 4.82452 6.49024 4.44978 6.26078C4.07505 6.03133 3.78209 5.70376 3.60802 5.31958C3.43395 4.9354 3.3866 4.51189 3.47196 4.1027C3.55733 3.69352 3.77158 3.31706 4.08756 3.02103C4.40355 2.72499 4.80705 2.5227 5.24696 2.43977C5.68687 2.35684 6.14339 2.39701 6.55869 2.55519C6.97399 2.71338 7.32938 2.98245 7.57985 3.32833C7.83032 3.67421 7.96459 4.08133 7.96565 4.49812C7.96776 4.77427 7.91109 5.04809 7.7989 5.30384C7.6867 5.5596 7.5212 5.79226 7.31188 5.98845C7.10257 6.18464 6.85357 6.3405 6.57919 6.44708C6.30482 6.55366 6.01047 6.60886 5.71305 6.6095V6.60851Z"
            stroke="#8EA1B2"
            strokeWidth="0.4"
            strokeMiterlimit="10"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.9094 10.4945C10.342 11.026 9.65717 11.4369 8.90212 11.6988C8.18752 11.9562 7.40252 12.086 6.62605 12.1721C6.74231 12.291 6.79777 12.3494 6.87136 12.4177C7.92514 13.4011 8.98425 14.3796 10.0348 15.3669C10.3921 15.7027 10.4679 16.1206 10.2705 16.5108C10.1686 16.7185 10.0029 16.8937 9.7942 17.0144C9.58549 17.1351 9.34307 17.1959 9.09731 17.1891C8.81133 17.1629 8.54658 17.0373 8.35604 16.8376C7.56144 16.0948 6.74977 15.364 5.97011 14.6074C5.74293 14.3865 5.63414 14.4291 5.43682 14.6192C4.63689 15.3848 3.82309 16.1384 3.00609 16.8871C2.63812 17.2238 2.20189 17.2832 1.7742 17.0921C1.55638 16.9979 1.37259 16.8471 1.24503 16.658C1.11747 16.4689 1.05158 16.2496 1.05533 16.0265C1.0797 15.7508 1.21806 15.4946 1.44143 15.3115C2.48525 14.3449 3.52658 13.3764 4.56542 12.4059C4.63475 12.3415 4.69981 12.2732 4.79901 12.1731C3.37939 12.0365 2.0995 11.7116 1.00306 10.9164C0.867607 10.8174 0.726819 10.7183 0.603097 10.6114C0.123137 10.1836 0.0698087 9.69334 0.454843 9.18828C0.774815 8.75649 1.32304 8.64161 1.88939 8.89118C2.00084 8.94057 2.10784 8.99819 2.20936 9.06349C4.25079 10.3668 7.05588 10.4024 9.10477 9.12192C9.30292 8.97343 9.53154 8.86392 9.77672 8.80007C10.0029 8.73839 10.2448 8.74899 10.4637 8.83015C10.6826 8.91131 10.8659 9.05834 10.9841 9.24769C11.2849 9.70126 11.2817 10.1449 10.9116 10.4965L10.9094 10.4945Z"
            stroke="#8EA1B2"
            strokeWidth="0.4"
            strokeMiterlimit="10"
          />
        </svg>
      </div>
      <div className="share_icon_btn tg">
        <svg
          width="17"
          height="14"
          viewBox="0 0 17 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6.67066 9.22694L6.38945 13.1357C6.79179 13.1357 6.96604 12.9649 7.17501 12.7598L9.06134 10.9783L12.97 13.807C13.6869 14.2018 14.1919 13.9939 14.3853 13.1553L16.951 1.27498L16.9517 1.27428C17.179 0.227083 16.5684 -0.182415 15.87 0.0744835L0.789228 5.78015C-0.240005 6.17495 -0.224421 6.74195 0.614266 6.99885L4.46982 8.18394L13.4255 2.64627C13.847 2.37047 14.2302 2.52307 13.915 2.79887L6.67066 9.22694Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  </div>
);

export default function ProfilePage() {
  const params = useParams();
  const username = params.username as string;

  const user = mockUsers.find((u) => u.username === username) ?? mockUsers[0];
  const question = mockQuestions[0];
  const bestAnswer = mockAnswers.find((a) => a.isBestAnswer);
  const regularAnswers = mockAnswers.filter((a) => !a.isBestAnswer);

  const userQuestions = mockQuestions.filter((q) => q.author.id === user.id);

  const [profileFilter, setProfileFilter] = useState<
    "all" | "opened" | "voting" | "closed" | "premium"
  >("all");
  const [similarFilter, setSimilarFilter] = useState<
    "opened" | "voting" | "best" | "premium"
  >("opened");

  const [activeMainTab, setActiveMainTab] = useState<"questions" | "answers">(
    "questions",
  );
  const [answersFilter, setAnswersFilter] = useState<"all" | "best">("all");
  const [isProfileShareOpen, setIsProfileShareOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isProfileShareOpen &&
        !target.closest(".profile_share_popup") &&
        !target.closest(".profile_stats_action")
      ) {
        setIsProfileShareOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileShareOpen]);

  const filteredQuestions =
    profileFilter === "all"
      ? userQuestions
      : profileFilter === "premium"
        ? userQuestions.filter((q) => (q as any).isPremium === true)
        : userQuestions.filter((q) => q.status === profileFilter);

  const filteredAnswers = mockAnswers.filter((a) => {
    if (a.author.username !== username) return false;
    if (answersFilter === "best") return a.isBestAnswer;
    return true;
  });

  const answerRef = useRef<HTMLTextAreaElement>(null);

  const scrollToAnswer = useCallback(() => {
    answerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => answerRef.current?.focus(), 400);
  }, []);

  // Рендер блока ответа
  const renderAnswer = (
    answer: UserAnswer,
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
          paddingBottom: "20px",
          borderBottom: "1px solid #E0E2EF",
        }}
      >
        {/* Левый сайдбар */}
        <div className="question_left_list">
          <div
            className="profile_stats profile_stats_desktop"
            style={{ width: "100%", marginBottom: "14px" }}
          >
            <div
              className={`profile_stats_list ${user.isBanned ? "banned_opacity" : ""}`}
            >
              <div
                className={`profile_stats_item ${activeMainTab === "questions" ? "active" : ""}`}
                onClick={() => setActiveMainTab("questions")}
                style={{ cursor: "pointer" }}
              >
                <p className="main_text">Вопросы</p>
                <div className="stats_badge">
                  <p className="main_text">{user.questionsCount}</p>
                </div>
              </div>
              <div
                className={`profile_stats_item ${activeMainTab === "answers" ? "active" : ""}`}
                onClick={() => setActiveMainTab("answers")}
                style={{ cursor: "pointer" }}
              >
                <p className="main_text">Ответы</p>
                <div className="stats_badge">
                  <p className="main_text">{user.answersCount}</p>
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
              <div
                className="profile_stats_item profile_stats_action"
                style={{ position: "relative", cursor: "pointer" }}
                onClick={(e) => {
                  if ((e.target as Element).closest(".profile_share_popup"))
                    return;
                  setIsProfileShareOpen(!isProfileShareOpen);
                }}
              >
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
                {isProfileShareOpen && <ProfileSharePopup />}
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
        <div
          className={`questions_page_list ${user.isBanned ? "banned_relative banned_opacity" : ""}`}
          style={{ width: "63%", position: "relative" }}
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
            className={`main_question_block main_question_block_item profile_question_block ${user.vipStatus ? "premium-profile premium-user" : ""}`}
            style={{ marginTop: 0, marginBottom: "8px" }}
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
            <div
              className="user_profile_block_content"
              style={{ justifyContent: "space-between", padding: 0 }}
            >
              <div className="user_profile_block_content_profile">
                <div
                  className="user_profile_img"
                  style={{ position: "relative" }}
                >
                  <img
                    className="user_profile_image"
                    src={
                      user.vipStatus
                        ? "/images/premium-avatar.png"
                        : user.avatar || "/images/icons/avatar.svg"
                    }
                    alt=""
                  />
                  {user.vipStatus && (
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
            className="profile_stats profile_stats_mobile"
            style={{ width: "100%", marginBottom: "14px" }}
          >
            <div
              className={`profile_stats_list ${user.isBanned ? "banned_opacity" : ""}`}
            >
              <div
                className={`profile_stats_item ${activeMainTab === "questions" ? "active" : ""}`}
                onClick={() => setActiveMainTab("questions")}
                style={{ cursor: "pointer" }}
              >
                <p className="main_text">Вопросы</p>
                <div className="stats_badge">
                  <p className="main_text">{user.questionsCount}</p>
                </div>
              </div>
              <div
                className={`profile_stats_item ${activeMainTab === "answers" ? "active" : ""}`}
                onClick={() => setActiveMainTab("answers")}
                style={{ cursor: "pointer" }}
              >
                <p className="main_text">Ответы</p>
                <div className="stats_badge">
                  <p className="main_text">{user.answersCount}</p>
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
              <div
                className="profile_stats_item profile_stats_action"
                style={{ position: "relative", cursor: "pointer" }}
                onClick={(e) => {
                  if ((e.target as Element).closest(".profile_share_popup"))
                    return;
                  setIsProfileShareOpen(!isProfileShareOpen);
                }}
              >
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
                {isProfileShareOpen && <ProfileSharePopup />}
              </div>
            </div>
          </div>

          <div className="questions_page_inner">
            {activeMainTab === "questions" ? (
              <div
                className="questions_filter"
                style={{ marginTop: "24px", marginBottom: "14px" }}
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
            ) : (
              <div
                className="questions_filter"
                style={{ marginTop: "20px", marginBottom: "14px" }}
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
            )}

            <div
              className="search-results-list"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "5px",
              }}
            >
              {activeMainTab === "questions" ? (
                filteredQuestions.length > 0 ? (
                  filteredQuestions.map((q) => (
                    <SearchResultCard
                      key={q.id}
                      question={q}
                      isProfilePage={true}
                      status={q.status}
                      isOwnProfile={true}
                      userIsPremium={user.vipStatus}
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
                )
              ) : filteredAnswers.length > 0 ? (
                filteredAnswers.map((a) => (
                  <AnswerResultCard
                    key={a.id}
                    answer={a}
                    isBestView={answersFilter === "best"}
                    isPremiumUser={user.vipStatus}
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
                  У этого пользователя пока нет ответов
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
            <button
              className={`s_btn premium-filter-btn ${similarFilter === "premium" ? "s_btn_active questions_filter_active" : ""}`}
              onClick={() => setSimilarFilter("premium")}
            >
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
              Премиум
            </button>
          </div>
        </div>

        {mockQuestions
          .filter((q) => {
            if (similarFilter === "premium") {
              return (q as any).isPremium === true;
            }
            return true;
          })
          .map((q) => {
            const isPremium = (q as any).isPremium === true;
            return (
              <div className={`question_list_item ${isPremium ? "premium-question" : ""}`} key={q.id}>
                <div className="question_item_top_data">
                  <div className="question_item_top_data_left">
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <img
                        src={q.author.avatar || "/images/icons/avatar.svg"}
                        alt={q.author.displayName}
                      />
                      {isPremium && (
                        <div className="premium-badge" style={{ position: "absolute", bottom: "-3px", left: "50%", transform: "translateX(-50%)" }}>
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
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <img
                        src={q.author.avatar || "/images/icons/avatar.svg"}
                        alt={q.author.displayName}
                      />
                      {isPremium && (
                        <div className="premium-badge" style={{ position: "absolute", bottom: "-3px", left: "50%", transform: "translateX(-50%)" }}>
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
            );
          })}

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
