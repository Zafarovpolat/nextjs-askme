import { Question } from '@/types';
import { mockUsers } from './mock-users';
import { mockCategories } from './mock-categories';

export const mockQuestions: Question[] = [
  {
    id: 1,
    title: 'Как правильно использовать useEffect в React?',
    content: 'Не могу разобраться с хуком useEffect. Когда нужно использовать зависимости, а когда нет? И как правильно очищать эффекты?',
    slug: 'kak-pravilno-ispolzovat-useeffect-v-react',
    author: mockUsers[1],
    category: mockCategories[2], // React
    rating: 15,
    status: 'opened',
    commentsCount: 8,
    createdAt: '2026-01-28T10:30:00Z',
    updatedAt: '2026-01-28T15:45:00Z',
  },
  {
    id: 2,
    title: 'Разница между let, const и var в JavaScript?',
    content: 'Объясните пожалуйста в чём разница между этими ключевыми словами для объявления переменных. Когда какое использовать?',
    slug: 'raznitsa-mezhdu-let-const-var-javascript',
    author: mockUsers[2],
    category: mockCategories[1], // JavaScript
    rating: 23,
    status: 'closed',
    commentsCount: 12,
    createdAt: '2026-01-27T14:20:00Z',
    updatedAt: '2026-01-27T18:30:00Z',
  },
  {
    id: 3,
    title: 'Как решить квадратное уравнение?',
    content: 'Нужно решить уравнение x² + 5x + 6 = 0. Какая формула используется?',
    slug: 'kak-reshit-kvadratnoe-uravnenie',
    author: mockUsers[1],
    category: mockCategories[4], // Математика
    rating: 8,
    status: 'opened',
    commentsCount: 5,
    createdAt: '2026-01-26T09:15:00Z',
    updatedAt: '2026-01-26T11:20:00Z',
  },
  {
    id: 4,
    title: 'Next.js vs React: что выбрать для нового проекта?',
    content: 'Начинаю новый проект и не могу определиться - использовать чистый React или Next.js? Какие преимущества и недостатки каждого?',
    slug: 'nextjs-vs-react-chto-vybrat',
    author: mockUsers[0],
    category: mockCategories[2], // React
    rating: 31,
    status: 'opened',
    commentsCount: 15,
    createdAt: '2026-01-25T16:40:00Z',
    updatedAt: '2026-01-25T20:15:00Z',
  },
  {
    id: 5,
    title: 'Что такое замыкания в JavaScript?',
    content: 'Слышал про замыкания (closures) но не до конца понимаю как они работают. Можете объяснить простыми словами с примерами?',
    slug: 'chto-takoe-zamykaniya-v-javascript',
    author: mockUsers[2],
    category: mockCategories[1], // JavaScript
    rating: 19,
    status: 'opened',
    commentsCount: 9,
    createdAt: '2026-01-24T12:10:00Z',
    updatedAt: '2026-01-24T16:30:00Z',
  },
];
