# Отчёт: перенос вёрстки (итерация 2026-04-11)

## Сделано

1. **Стили** — файлы [`about.css`](../src/styles/about.css), [`leaders.css`](../src/styles/leaders.css), [`login-auth.css`](../src/styles/login-auth.css) заменены целиком копией из `dont-toch-test/src/styles/`, чтобы визуал about / leaders / auth совпадал с референсом.

2. **Реестр статики** — добавлен [`static-mocks-registry.md`](static-mocks-registry.md) для поочерёдной замены моков на динамику в следующих итерациях.

3. **Footer** — разметка уже совпадала с референсом; в `front` сохранены `legalFooterHref` / `LEGAL_FOOTER_SLUGS` вместо жёстких путей (динамика важнее макета-строк).

4. **LoginModal** — структура совпадает с референсом; OAuth остаётся через [`SocialAuthButtons`](../src/components/SocialAuthButtons.tsx) (уже оборачивает в `login_socials_list` под стили).

5. **Header** — блок уведомлений и остальная вёрстка уже были синхронизированы с референсом ранее; сохранены поиск через `router`, `useAuthStore`, `setTheme`, мобильное меню с условным выходом. Уточнено: **разделители** в выпадающем меню профиля — как в макете (между пунктами, без лишней линии перед «Выйти»). Комментарий у `mockNotifications` отсылает к реестру.

## Остаётся статикой (следующие итерации)

- Список уведомлений в `Header.tsx` до появления API.
- Прочие строки из [`static-mocks-registry.md`](static-mocks-registry.md).

## Дополнение (полный проход плана)

- **Профиль (`ProfilePageClient`)** — шапка карточки как в референсе: класс `premium-profile`, фоны `userprofilepremium.svg` / `blues-rect-dark.svg`, бейдж «База» при флаге VIP из API (`readVipVisualFlag`: `is_vip`, `vip`, `vip_status`, `subscription.active`).
- **Типы / вопрос** — в `QuestionPageData` и `SimilarQuestionItem` добавлено опциональное `is_premium`; `QuestionPageContent` и `QuestionLeadersSidebar` рисуют премиум-оформление как в макете, если API отдаёт флаг.
- **Категории, лидеры, about, login, signup, поиск** — разметка уже на API или совпадает с референсом по обёрткам (`auth_page_layout`, `question_wrapper`, и т.д.); отличия только там, где в `front` осознанно другая логика (юридические ссылки, OAuth, RSC).
- **Три CSS** — повторно синхронизированы с `dont-toch-test`.

## Не трогали отдельно

Полный построчный diff всех страниц с референсом не делался: приоритет — сохранённая динамика и совпадение ключевых блоков/классов.
