import Link from "next/link";
import { UserAnswer } from "@/data/mock-answers";

interface AnswerResultCardProps {
  answer: UserAnswer;
  isBestView?: boolean;
}

// Склонение ответов
const numWord = (value: number, words: [string, string, string]): string => {
  const abs = Math.abs(value);
  const cases = [2, 0, 1, 1, 1, 2];
  const index =
    abs % 100 > 4 && abs % 100 < 20 ? 2 : cases[Math.min(abs % 10, 5)];
  return `${value} ${words[index]}`;
};

// Форматирование даты
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

export default function AnswerResultCard({
  answer,
  isBestView,
}: AnswerResultCardProps) {
  return (
    <div className="answer-result-card">
      <Link
        href={`/profile/${answer.author.username}`}
        className="answer-result-avatar-link"
      >
        <img
          src={answer.author.avatar || "/images/icons/avatar.svg"}
          alt={answer.author.displayName}
          className="answer-result-avatar"
        />
      </Link>
      <div className="answer-result-content">
        <Link
          href={`/question/${answer.questionSlug}`}
          className="answer-result-title"
        >
          {answer.questionTitle}
        </Link>
        <p className="answer-result-subtext">{answer.content}</p>

        <div className="answer-result-meta">
          <button className="like-badge" type="button">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.875004 11.8667H2.12501C2.60751 11.8667 3.00001 11.448 3.00001 10.9333V4.8C3.00001 4.28533 2.60751 3.86667 2.12501 3.86667H0.875004C0.392502 3.86667 0 4.28533 0 4.8V10.9333C0 11.448 0.392502 11.8667 0.875004 11.8667Z"
                fill="white"
              />
              <path
                d="M6.39053 0C5.89053 0 5.64053 0.266667 5.64053 1.6C5.64053 2.8672 4.49002 3.88693 3.75002 4.41227V11.0192C4.55052 11.4144 6.15303 12 8.64054 12H9.44054C10.4155 12 11.2456 11.2533 11.4106 10.2293L11.9706 6.76267C12.1806 5.456 11.2406 4.26667 10.0005 4.26667H7.64054C7.64054 4.26667 8.01554 3.46667 8.01554 2.13333C8.01554 0.533333 6.89053 0 6.39053 0Z"
                fill="white"
              />
            </svg>
            <span>{answer.likesCount || 0}</span>
          </button>

          <button className="dislike-badge" type="button">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11.125 0.133332L9.87499 0.133332C9.39249 0.133332 8.99999 0.552 8.99999 1.06667L8.99999 7.2C8.99999 7.71467 9.39249 8.13333 9.87499 8.13333L11.125 8.13333C11.6075 8.13333 12 7.71467 12 7.2L12 1.06667C12 0.552 11.6075 0.133332 11.125 0.133332Z"
                fill="#5D67FF"
              />
              <path
                d="M5.60947 12C6.10947 12 6.35947 11.7333 6.35947 10.4C6.35947 9.1328 7.50998 8.11307 8.24998 7.58773L8.24998 0.980799C7.44948 0.5856 5.84697 -5.37915e-07 3.35946 -7.5538e-07L2.55946 -8.25319e-07C1.58445 -9.10556e-07 0.754449 0.746665 0.589448 1.77067L0.0294434 5.23733C-0.180558 6.544 0.759447 7.73333 1.99945 7.73333L4.35946 7.73333C4.35946 7.73333 3.98446 8.53333 3.98446 9.86667C3.98446 11.4667 5.10947 12 5.60947 12Z"
                fill="#5D67FF"
              />
            </svg>
            <span>{answer.dislikesCount || 0}</span>
          </button>

          <div className="search-result-date">
            {formatTimeAgo(answer.createdAt)}
          </div>

          <div className="search-result-separator"></div>

          <div className="search-result-answers">
            {isBestView ? (
              <>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 0C3.58045 0 0 3.58045 0 8C0 12.4195 3.58045 16 8 16C12.4195 16 16 12.4195 16 8C16 3.58045 12.4195 0 8 0ZM13.0205 7.09335L10.528 9.44357L11.2889 12.1707C11.4418 12.7218 11.1716 12.9316 10.6773 12.6365L8 11.0222L5.31912 12.6329C4.82844 12.928 4.54047 12.7182 4.67911 12.16L5.41511 9.19468L3.00088 7.06491C2.57067 6.68446 2.68798 6.37867 3.26044 6.37867H6.19377L7.58754 3.13602C7.8151 2.60978 8.17776 2.60978 8.39821 3.13956L9.75997 6.37867H12.7324C13.3084 6.38224 13.4365 6.70222 13.0205 7.09335Z"
                    fill="#6069FF"
                  />
                </svg>
                <span>4 943 комментариев</span>
              </>
            ) : (
              <>
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
                {numWord(answer.questionAnswersCount, [
                  "ответ",
                  "ответа",
                  "ответов",
                ])}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
