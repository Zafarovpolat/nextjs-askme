import { SITE_NAME } from "@/lib/page-seo";

export const HOME_LOGO_LABEL = `${SITE_NAME} — на главную`;

export function profileLinkLabel(name?: string | null): string {
  const n = (name ?? "").trim();
  return n ? `Профиль: ${n}` : "Профиль пользователя";
}

export function favoriteActionLabel(isFavorited: boolean): string {
  return isFavorited ? "Убрать из избранного" : "Добавить в избранное";
}
