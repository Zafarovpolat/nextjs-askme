export type ProfileLevelItem = {
  id: number;
  /** Однострочное имя для таблиц и подписей */
  rankName: string;
  /** Заголовок карточки (с переносами) */
  title: string;
  points: string;
  /** Подпись КПД — только у последних рангов в сетке */
  kpd?: string;
  image?: string;
};

export type ProfileLevelDailyLimitRow = {
  rank: string;
  points: string;
  ask: string;
  voteBest: string;
  voteQuestion: string;
  answer: string;
};

export type ProfileLevelPointsRow = {
  action: string;
  points: string;
  level: string;
};

/** Текст описания текущего ранга — блок под прогрессом (Figma 265:737) */
export const PROFILE_LEVEL_DESCRIPTION =
  "Категории были формальными и жёсткими рамками. Мы сделали на основе них пространства — тематические разделы, в которых люди находят единомышленников, обсуждают важные и не очень вопросы, делятся опытом и поддержкой. Каждое пространство — это полноценный подсайт, со своими героями, мемами, спорами и поддержкой.";

/** Единый список уровней для карусели и сетки — Figma 265:737 / 265:819 */
export const PROFILE_LEVELS: ProfileLevelItem[] = [
  {
    id: 0,
    rankName: "Уличный бот",
    title: "Уличный\nбот",
    points: "0",
    image: "/images/profile-levels/0-street-bot.png",
  },
  {
    id: 1,
    rankName: "Датахакер",
    title: "Датахакер",
    points: "1–249",
    image: "/images/profile-levels/1-datahacker.png",
  },
  {
    id: 2,
    rankName: "Нео-аналитик",
    title: "Нео-\nаналитик",
    points: "250–499",
    image: "/images/profile-levels/2-neo-analyst.png",
  },
  {
    id: 3,
    rankName: "Кибертактик",
    title: "Кибертактик",
    points: "500–999",
    image: "/images/profile-levels/3-cybertactic.png",
  },
  {
    id: 4,
    rankName: "Архитектор сети",
    title: "Архитектор\nсети",
    points: "1 000–2 499",
    image: "/images/profile-levels/4-architect.png",
  },
  {
    id: 5,
    rankName: "Матрица-стратег",
    title: "Матрица\nстратег",
    points: "2 500–4 999",
    image: "/images/profile-levels/5-matrix-strategist.png",
  },
  {
    id: 6,
    rankName: "Сетевой пророк",
    title: "Сетевой\nпророк",
    points: "5 000–9 999",
    image: "/images/profile-levels/6-network-prophet.png",
  },
  {
    id: 7,
    rankName: "Нейрооракул",
    title: "Нейрооракул",
    points: "10 000–19 999",
    image: "/images/profile-levels/7-neuro-oracle.png",
  },
  {
    id: 8,
    rankName: "Повелитель алгоритмов",
    title: "Повелитель\nалгоритмов",
    points: "20 000–49 999",
    image: "/images/profile-levels/8-master-algorithms.png",
  },
  {
    id: 9,
    rankName: "Квантовый хакер",
    title: "Квантовый\nхакер",
    points: "50 000–99 999",
    image: "/images/profile-levels/9-quantum-hacker.png",
  },
  {
    id: 10,
    rankName: "Цифровой сингуляр",
    title: "Цифровой\nсингуляр",
    points: "50 000–99 999",
    kpd: "(КПД > 25%)",
    image: "/images/profile-levels/10-digital-singular.png",
  },
  {
    id: 11,
    rankName: "Абсолют Матрицы",
    title: "Абсолют\nМатрицы",
    points: "100 000+",
    kpd: "(КПД > 30%)",
    image: "/images/profile-levels/11-matrix-absolute.png",
  },
];

function normalizeRankName(value: string): string {
  return value
    .toLowerCase()
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/ё/g, "е")
    .trim();
}

/** Индекс слайда карусели по текущему рангу пользователя */
export function getProfileLevelCarouselIndex(levelName: string, level = 0): number {
  const normalized = normalizeRankName(levelName);
  const byName = PROFILE_LEVELS.findIndex((item) => normalizeRankName(item.rankName) === normalized);
  if (byName >= 0) {
    return byName;
  }

  return Math.max(0, Math.min(level, PROFILE_LEVELS.length - 1));
}

/** @deprecated используйте PROFILE_LEVELS */
export type ProfileLevelRankCard = ProfileLevelItem;

/** @deprecated используйте PROFILE_LEVELS */
export const PROFILE_LEVEL_RANK_CARDS = PROFILE_LEVELS;

/** Таблица лимитов — тексты из Figma node 265:819 */
export const PROFILE_LEVEL_DAILY_LIMITS: ProfileLevelDailyLimitRow[] = [
  { rank: "Уличный бот", points: "0", ask: "0", voteBest: "1", voteQuestion: "0", answer: "1" },
  { rank: "Датахакер", points: "1–249", ask: "5", voteBest: "20", voteQuestion: "0", answer: "30" },
  { rank: "Нео-аналитик", points: "250–499", ask: "8", voteBest: "30", voteQuestion: "35", answer: "40" },
  { rank: "Кибертактик", points: "500–999", ask: "10", voteBest: "40", voteQuestion: "40", answer: "50" },
  { rank: "Архитектор сети", points: "1000–2499", ask: "15", voteBest: "50", voteQuestion: "50", answer: "70" },
  { rank: "Матрица-стратег", points: "2500–4999", ask: "20", voteBest: "70", voteQuestion: "70", answer: "100" },
  { rank: "Сетевой пророк", points: "5000–9999", ask: "35", voteBest: "100", voteQuestion: "100", answer: "200" },
  { rank: "Нейрооракул", points: "10000–19999", ask: "35", voteBest: "100", voteQuestion: "100", answer: "200" },
  { rank: "Повелитель алгоритмов", points: "20000–49999", ask: "40", voteBest: "200", voteQuestion: "200", answer: "400" },
  { rank: "Квантовый хакер", points: "50000–99999", ask: "50", voteBest: "400", voteQuestion: "400", answer: "400" },
  { rank: "Цифровой сингуляр", points: "50000–99999 (КПД > 25%)", ask: "100", voteBest: "500", voteQuestion: "∞", answer: "500" },
  { rank: "Абсолют Матрицы", points: "100000+ (КПД > 30%)", ask: "∞", voteBest: "∞", voteQuestion: "∞", answer: "∞" },
];

/** Таблица системы баллов — тексты из Figma node 265:819 */
export const PROFILE_LEVEL_POINTS_SYSTEM: ProfileLevelPointsRow[] = [
  { action: "Регистрация", points: "+ 100", level: "Датахакер" },
  { action: "Зайти на проект", points: "+ 1 *", level: "Все" },
  { action: "Задать вопрос", points: "- 5", level: "Все" },
  { action: "Выбрать лучший ответ на свой вопрос", points: "+ 3", level: "Все" },
  { action: "Проголосовать за лучший ответ", points: "+ 1 **", level: "Все" },
  { action: "Проголосовать за интересный/неинтересный вопрос", points: "+ 1", level: "Нео-аналитик и выше" },
  { action: "Ваш вопрос признан интересным", points: "+ 1 (за 1 голос)", level: "Все" },
  { action: "Ответить", points: "+ 2", level: "Датахакер" },
  { action: "Ответить", points: "от 0 до 5 ***", level: "Нео-аналитик и выше" },
  { action: "Ваш ответ признан лучшим", points: "+ 10", level: "Все" },
  { action: "На ваш вопрос не смогли ответить", points: "+ 5 (возврат)", level: "Все" },
  { action: "Нарушение правил", points: "до -10000 ****", level: "Все" },
];
