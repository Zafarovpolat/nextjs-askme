export function questionsListHref(
  basePath: string,
  filter: string | null,
  page: number,
  defaultFilter = "open",
): string {
  const qs = new URLSearchParams();
  if (filter && filter !== defaultFilter) qs.set("filter", filter);
  if (page > 1) qs.set("page", String(page));
  const q = qs.toString();
  return q ? `${basePath}?${q}` : basePath;
}
