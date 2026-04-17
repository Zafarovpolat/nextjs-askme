import { Comment } from '@/types';
import { mockUsers } from './mock-users';

export interface UserAnswer extends Comment {
  questionTitle: string;
  questionSlug: string;
  questionAnswersCount: number;
  isBlocked?: boolean;
  parentId?: number | null;
  role?: string;
  hasMedia?: boolean;
  mediaLink?: string;
}

export const mockAnswers: UserAnswer[] = [
  {
    id: 1,
    questionId: 1,
    questionTitle: 'Здесь вы найдёте информацию, которая действительно',
    questionSlug: 'mozhno-li-igrat-v-jojo-1',
    questionAnswersCount: 5,
    author: mockUsers[0],
    content: 'Мы создали этот проект для тех, кто ищет простые и понятные ответы в быстро меняющемся мире. Здесь вы найдёте информацию, которая действительно помогает — без лишних слов',
    rating: 39,
    isBestAnswer: true,
    likesCount: 435,
    dislikesCount: 741,
    createdAt: '2026-03-22T10:00:00Z',
    updatedAt: '2026-03-22T10:00:00Z',
    role: 'Гуру',
    isBlocked: false,
    hasMedia: false,
  },
  {
    id: 2,
    questionId: 2,
    questionTitle: 'Как использовать переносной жесткий диск с телефоном?',
    questionSlug: 'igra-s-zhestkogo-diska-na-telefone-1',
    questionAnswersCount: 2,
    author: mockUsers[0],
    content: 'Для этого вам понадобится OTG-кабель и приложение для монтирования дисков.',
    rating: 15,
    isBestAnswer: false,
    likesCount: 12,
    dislikesCount: 2,
    createdAt: '2026-03-21T15:00:00Z',
    updatedAt: '2026-03-21T15:00:00Z',
    role: 'Ученик',
    isBlocked: false,
    hasMedia: false,
  },
  {
    id: 3,
    questionId: 3,
    questionTitle: 'Плюсы и минусы Явы в 2024 году',
    questionSlug: 'pro-mototsikl-java-1',
    questionAnswersCount: 8,
    author: mockUsers[0],
    content: 'Это классика, но запчасти найти все сложнее. Отличный вариант для коллекционеров.',
    rating: 50,
    isBestAnswer: true,
    likesCount: 120,
    dislikesCount: 5,
    createdAt: '2026-03-20T12:00:00Z',
    updatedAt: '2026-03-20T12:00:00Z',
    role: 'Профи',
    isBlocked: false,
    hasMedia: false,
  },
  {
    id: 4,
    questionId: 4,
    questionTitle: 'Какие преимущества дает премиум аккаунт?',
    questionSlug: 'premium-benefits',
    questionAnswersCount: 12,
    author: mockUsers[1],
    content: 'Премиум аккаунт дает доступ к эксклюзивным темам оформления, выделению ваших вопросов в списке и приоритетной поддержке.',
    rating: 85,
    isBestAnswer: true,
    likesCount: 240,
    dislikesCount: 2,
    createdAt: '2026-04-10T14:30:00Z',
    updatedAt: '2026-04-10T14:30:00Z',
    role: 'Высший разум',
    isBlocked: false,
    hasMedia: false,
  },
  {
    id: 5,
    questionId: 5,
    questionTitle: 'Как настроить темную тему в приложении?',
    questionSlug: 'dark-theme-setup',
    questionAnswersCount: 4,
    author: mockUsers[1],
    content: 'Для настройки темной темы зайдите в настройки профиля и выберите пункт "Оформление". Там вы сможете переключиться одним кликом.',
    rating: 42,
    isBestAnswer: false,
    likesCount: 56,
    dislikesCount: 1,
    createdAt: '2026-04-12T09:15:00Z',
    updatedAt: '2026-04-12T09:15:00Z',
    role: 'Высший разум',
    isBlocked: false,
    hasMedia: false,
  }
];
