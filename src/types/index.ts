// Типы для проекта AskMe

/** Пользователь из API (auth/me) */
export interface ApiUser {
  id: number
  first_name: string
  email: string
  created_at?: string | null
  email_verified_at?: string | null
  gender: number
  avatar_url?: string | null
  description?: string | null
  balls?: number
  level?: number
  level_name?: string
  kpd?: number
  next_level_balls?: number | null
  balls_to_next_level?: number | null
  subscriptions_count?: number
  subscribed_questions_count?: number
  questions_count?: number
  answers_count?: number
  best_answers_count?: number
  settings?: Record<string, unknown>
}

export interface User {
  id: number;
  username: string;
  displayName: string;
  email: string;
  avatar: string;
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
  isBanned?: boolean;
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
  level?: number
  level_name?: string
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
  allow_answer_comments?: boolean
  category?: { slug: string; name: string }
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
}

/** GET /v1/questions/{id}/similar — элемент списка «похожие вопросы» на странице вопроса */
export interface SimilarQuestionItem {
  id: number
  title: string
  created_at: string
  answers_count: number
  likes_count: number
  author: QuestionPageUser & { balls?: number }
  latest_likers: { id: number; avatar_url: string | null }[]
}

export interface SimilarQuestionsPage {
  questions: SimilarQuestionItem[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
