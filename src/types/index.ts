// Типы для проекта AskMe

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
