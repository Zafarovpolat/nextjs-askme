import { Comment } from '@/types';
import { mockUsers } from './mock-users';

export interface UserAnswer extends Comment {
  questionTitle: string;
  questionSlug: string;
  questionAnswersCount: number;
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
  }
];
