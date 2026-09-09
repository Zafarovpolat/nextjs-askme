import Link from "next/link";

export function questionsListHref(
  basePath: string,
  filter: string,
  page: number,
  defaultFilter = "open",
): string {
  const qs = new URLSearchParams();
  if (filter !== defaultFilter) qs.set("filter", filter);
  if (page > 1) qs.set("page", String(page));
  const q = qs.toString();
  return q ? `${basePath}?${q}` : basePath;
}

function paginationItems(current: number, last: number): Array<number | "ellipsis"> {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }
  const wanted = new Set([1, last, current, current - 1, current + 1]);
  const nums = [...wanted].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
  const items: Array<number | "ellipsis"> = [];
  for (const n of nums) {
    const prev = items[items.length - 1];
    if (typeof prev === "number" && n - prev > 1) items.push("ellipsis");
    items.push(n);
  }
  return items;
}

export default function QuestionsTabPagination({
  basePath,
  filter,
  current,
  last,
  defaultFilter = "open",
}: {
  basePath: string;
  filter: string;
  current: number;
  last: number;
  defaultFilter?: string;
}) {
  if (last <= 1) return null;
  const safeCurrent = Math.min(Math.max(current, 1), last);
  return (
    <nav className="pagination" aria-label="Страницы вопросов" style={{ display: "none" }}>
      {safeCurrent > 1 ? (
        <Link
          href={questionsListHref(basePath, filter, safeCurrent - 1, defaultFilter)}
          className="page-numbers"
          rel="prev"
        >
          Назад
        </Link>
      ) : null}
      {paginationItems(safeCurrent, last).map((item, index) =>
        item === "ellipsis" ? (
          <span key={`e-${index}`} className="page-numbers" aria-hidden="true">
            …
          </span>
        ) : item === safeCurrent ? (
          <span key={item} className="page-numbers" aria-current="page">
            {item}
          </span>
        ) : (
          <Link
            key={item}
            href={questionsListHref(basePath, filter, item, defaultFilter)}
            className="page-numbers"
          >
            {item}
          </Link>
        ),
      )}
      {safeCurrent < last ? (
        <Link
          href={questionsListHref(basePath, filter, safeCurrent + 1, defaultFilter)}
          className="page-numbers"
          rel="next"
        >
          Вперёд
        </Link>
      ) : null}
    </nav>
  );
}
