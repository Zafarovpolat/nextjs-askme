# Реестр статики и моков (front)

Накопительный список блоков с захардкоженными или демо-данными. Цель следующих итераций: подключить API/динамику и убрать опору на моки **точечно**, не удаляя UI.

| Дата | Файл / зона | Блок | Комментарий |
|------|-------------|------|-------------|
| 2026-04-11 | `src/styles/about.css`, `leaders.css`, `login-auth.css` | целиком с референса | Только CSS, не мок-данные |
| 2026-04-22 | `src/components/layout/Header.tsx`, `src/components/layout/NotificationBtnRealtime.tsx` | уведомления подключены к API/WebSocket | Старый `mockNotifications` заменён на real-time список, пагинацию и popups |
| 2026-04-11 | `src/app/sitemap.ts` | `mockCategories` | SEO: заменить на данные с бэка |
| 2026-04-11 | `src/data/mock-users.ts`, `mock-answers.ts`, … | демо-данные | Используются в профиле/карточках/сайдбаре — см. grep по проекту |
| 2026-04-11 | `src/app/profile/ProfilePageClient.tsx` | `mockUsers[0]` как fallback для полей без API | Заменить на дефолты/null когда API всегда полный |
| 2026-04-11 | `src/app/profile/ProfilePageClient.tsx` | VIP-визуал шапки | Включается при `is_vip` / `vip` / `vip_status` / `subscription.active` в JSON пользователя |
| 2026-04-11 | `src/types` + `QuestionPageContent` / `QuestionLeadersSidebar` | `is_premium` на вопросе и в похожих | До появления полей в API остаётся false / undefined |
| 2026-04-11 | `src/components/layout/SidebarLeft.tsx`, `SidebarRight.tsx` | не подключены к layout | Моки внутри Right; подключение к layout — отдельная задача |
| 2026-04-11 | `src/app/about/page.tsx` | блок `vip_status_block` в правой колонке | Статик «Подарить VIP» до API/ссылки |

После каждой фазы переноса вёрстки дополняйте строки таблицы.
