// Типы для проекта AskMe

/** Публичный профиль: GET /v1/users/{id} */
export interface PublicProfileUser {
  id: number
  first_name: string
  full_name: string
  /** Дата регистрации — для строки «В сервисе …» как в личном кабинете */
  created_at?: string | null
  avatar_url: string | null
  /** WebP @2x после загрузки аватара; для <img srcSet> */
  avatar_url_2x?: string | null
  balls: number
  kpd: number
  level: number
  level_name: string
  questions_count: number
  answers_count: number
  subscribed_by_me: boolean
  /** Аккаунт заблокирован — для вёрстки профиля (баннер, полупрозрачность). */
  is_blocked?: boolean
  /** Текст причины, если задана в админке. */
  block_reason?: string | null
  is_ai?: boolean
  ai_setting_id?: number | null
  ai_provider_type?: string | null
  ai_model?: string | null
  ai_label?: string | null
  ai_provider_name?: string | null
  ai_type?: string | null
  ai_model_short?: string | null
  ai_rank_label?: string | null
  is_premium?: boolean
  premium_is_permanent?: boolean
  premium_is_active?: boolean
  premium_until?: string | null
  premium_package_name?: string | null
  premium_subscription_status?: string | null
  vip_status?: boolean | number
  vip?: boolean
}

/** Пользователь из API (auth/me) */
export interface ApiUser {
  id: number
  first_name: string
  email: string
  created_at?: string | null
  email_verified_at?: string | null
  /** Email-аккаунт ещё не подтвердил почту — мутации на сайте заблокированы. */
  requires_email_verification?: boolean
  has_real_email?: boolean
  pending_email?: string | null
  gender: number
  avatar_url?: string | null
  avatar_url_2x?: string | null
  description?: string | null
  balls?: number
  level?: number
  level_name?: string
  kpd?: number
  next_level_balls?: number | null
  balls_to_next_level?: number | null
  subscriptions_count?: number
  subscribers_count?: number
  subscribed_questions_count?: number
  questions_count?: number
  answers_count?: number
  best_answers_count?: number
  settings?: Record<string, unknown>
  is_ai?: boolean
  ai_setting_id?: number | null
  ai_provider_type?: string | null
  ai_model?: string | null
  ai_label?: string | null
  ai_provider_name?: string | null
  ai_type?: string | null
  ai_model_short?: string | null
  ai_rank_label?: string | null
  is_premium?: boolean
  premium_is_permanent?: boolean
  vip_status?: boolean | number
  vip?: boolean
  premium_is_active?: boolean
  premium_until?: string | null
  premium_package_name?: string | null
  premium_subscription_status?: string | null
  premium_questions_quota_used?: number
  premium_questions_quota_total?: number | null
  premium_questions_quota_available?: number | null
  premium_questions_quota_is_unlimited?: boolean
  /** Суточные лимиты (уже с учётом премиум-множителя); null = без лимита. */
  daily_action_limits?: {
    ask_question: number | null
    answer: number | null
    answer_comment: number | null
    vote_best: number | null
    vote_question: number | null
    file: number | null
    video: number | null
  }
  /** Остаток суточной квоты за скользящие 24 ч.; null = без лимита (∞). */
  daily_action_remaining?: {
    ask_question: number | null
    answer: number | null
    answer_comment: number | null
    vote_best: number | null
    vote_question: number | null
    file: number | null
    video: number | null
  }
  /** Остаток вложений за 24 ч.; null = без лимита */
  attachment_remaining?: {
    file: number | null
    video: number | null
  }
  advertising_consent?: boolean
  legal_acceptance?: {
    accepted_at: string | null
    advertising_consent: boolean
    user_agreement: {
      version: number
      title: string
      slug: string | null
      url: string | null
      created_at: string | null
    } | null
    privacy_policy: {
      version: number
      title: string
      slug: string | null
      url: string | null
      created_at: string | null
    } | null
    cookies: {
      version: number
      title: string
      slug: string | null
      url: string | null
      created_at: string | null
    } | null
  } | null
}

export interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
  /** Соответствует avatar_url_2x из API при маппинге поиска/списков */
  avatar2x?: string | null;
  bio: string;
  rating: number;
  balance: number;
  vipStatus: boolean;
  followersCount: number,
  followingsCount: number,
  questionsCount: number;
  answersCount: number;
  createdAt: string;
  role: string;
  city?: string;
  phoneNumber?: string;
  isBanned?: boolean;
  is_premium?: boolean;
  premium_is_active?: boolean;
  premium_is_permanent?: boolean;
  premium_until?: string | null;
  premium_package_name?: string | null;
  premium_subscription_status?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  svgIcon?: string;
  color?: string;
  parent: Category | null;
  children: Category[];
  questionsCount: number;
  parentId?: number | null;
}

export interface Question {
  id: number;
  title: string;
  content: string;
  slug: string;
  author: User;
  category: Category;
  rating: number;
  status: 'opened' | 'closed' | 'voting';
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
  is_premium?: boolean;
}

export interface SubscriptionPackage {
  id: number;
  name: string;
  monthly_price: number;
  is_recommended: boolean;
  icon_key?: string | null;
  premium_questions_per_month: number | null;
  premium_answers_per_question: number;
  limit_multiplier: number;
}

export interface PremiumBillingCheckoutResponse {
  message: string;
  payment: {
    id: number;
    invoice_id: string | null;
    status: string;
    provider_status: string | null;
    confirmation_url?: string | null;
    amount: number;
    currency: string;
  };
}

export interface Comment {
  id: number;
  questionId: number;
  author: User;
  content: string;
  rating: number;
  isBestAnswer: boolean;
  likesCount?: number;
  dislikesCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  id: number;
  userId: number;
  postId?: number;
  commentId?: number;
  likeType: 'like' | 'dislike';
  createdAt: string;
}

/** Пользователь из API ответа/вопроса */
export interface QuestionPageUser {
  id: number
  first_name?: string
  last_name?: string
  full_name: string
  avatar_url?: string | null
  avatar_url_2x?: string | null
  level?: number
  level_name?: string
  is_premium?: boolean
  premium_is_active?: boolean
  premium_is_permanent?: boolean
  premium_until?: string | null
  premium_package_name?: string | null
  premium_subscription_status?: string | null
  is_ai?: boolean
  ai_setting_id?: number | null
  ai_provider_type?: string | null
  ai_model?: string | null
  ai_label?: string | null
  ai_provider_name?: string | null
  ai_type?: string | null
  ai_model_short?: string | null
  ai_rank_label?: string | null
}

/** Ответ с API (вложенная структура) */
export interface QuestionPageAnswer {
  id: number
  user: QuestionPageUser
  created_at: string
  text: string
  files?: string[]
  videos?: string[]
  links?: string[]
  likes_count: number
  dislikes_count: number
  votes_score: number
  answers_count?: number
  answers?: QuestionPageAnswer[]
  parent_user?: QuestionPageUser
}

/** Вопрос с API для страницы /question/[id] */
export interface QuestionPageData {
  id: number
  title: string
  description: string
  created_at: string
  author: QuestionPageUser
  /** Если API отдаёт — включается премиум-вёрстка карточки вопроса */
  is_premium?: boolean
  allow_answer_comments?: boolean
  category?: { slug: string; name: string }
  subcategory?: { slug: string; name: string }
  files?: string[]
  videos?: string[]
  links?: string[]
  answers_count?: number
  likes_count?: number
  dislikes_count?: number
  votes_score?: number
  best_answer?: QuestionPageAnswer & { best_answer_set_at?: string } | null
  answers?: QuestionPageAnswer[]
  auth_extra?: {
    is_author?: boolean
    user_vote?: 1 | -1 | null
    answer_votes?: Record<number, 1 | -1>
  }
  anchor_meta?: AnswerAnchorMeta
  answers_loaded_page?: number
  /** SSR: «Премиум вопросы» в правом сайдбаре (из кэша, без текущего вопроса, до 5) */
  premium_sidebar_questions?: SimilarQuestionItem[]
  /**
   * SSR: блок «Похожие вопросы участников».
   * null — блока нет (во всех вкладках пусто). filter — активная вкладка с ≥1 вопросом.
   */
  similar_questions_block?: SimilarQuestionsBlockPayload | null
}

export type SimilarQuestionsBlockFilter = "open" | "voting" | "solved"

export interface SimilarQuestionsTabPage {
  questions: SimilarQuestionItem[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface SimilarQuestionsBlockPayload {
  /** Активная вкладка при SSR (первая непустая) */
  filter: SimilarQuestionsBlockFilter
  /** Первые страницы всех вкладок — без доп. запросов при переключении */
  tabs: Partial<Record<SimilarQuestionsBlockFilter, SimilarQuestionsTabPage>>
}

export interface AnswerAnchorMeta {
  answer_id: number
  root_answer_id: number
  direct_answers_page: number
  ancestor_ids: number[]
  comment_steps: AnswerAnchorCommentStep[]
  is_best_answer: boolean
  is_direct: boolean
}

export interface AnswerAnchorCommentStep {
  parent_id: number
  child_id: number
  page: number
}

/** GET /v1/questions/{id}/similar — элемент списка «похожие вопросы» на странице вопроса */
export interface SimilarQuestionItem {
  id: number
  title: string
  created_at: string
  answers_count: number
  likes_count: number
  is_premium?: boolean
  author: QuestionPageUser & { balls?: number }
  latest_likers: { id: number; avatar_url: string | null; avatar_url_2x?: string | null }[]
}

export interface SimilarQuestionsPage {
  questions: SimilarQuestionItem[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
