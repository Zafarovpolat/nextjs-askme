// Типы для проекта AskMe

/** Пользователь из API (auth/me) */
export interface ApiUser {
  id: number
  first_name: string
  email: string
  email_verified_at?: string | null
  gender: number
  avatar_url?: string | null
  description?: string | null
  balls?: number
  level?: number
  level_name?: string
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
  status: 'opened' | 'closed';
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

/** Вопрос с API для страницы /question/[id] */
export interface QuestionPageData {
  id: number
  title: string
  description: string
  created_at: string
  author: {
    id: number
    first_name?: string
    last_name?: string
    full_name: string
    avatar_url?: string | null
    level?: number
    level_name?: string
  }
  answers_count?: number
  best_answer?: { best_answer_set_at: string } | null
}
