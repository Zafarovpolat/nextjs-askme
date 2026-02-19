import { Question } from '@/types';
import { mockUsers } from './mock-users';
import { mockCategories } from './mock-categories';

export const mockQuestions: Question[] = [
  {
    id: 1,
    title: 'Можно ли играть в JoJo eyes of heaven с другом на одной консоли?',
    content: 'Можно ли играть в JoJo eyes of heaven с другом на одной консоли?',
    slug: 'mozhno-li-igrat-v-jojo-1',
    author: mockUsers[0],
    category: mockCategories[0],
    rating: 39,
    status: 'opened',
    commentsCount: 0,
    createdAt: '2026-02-18T17:41:00Z', // 19 минут назад
    updatedAt: '2026-02-18T17:41:00Z',
  },
  {
    id: 2,
    title: 'Можно ли скачать на переносной жёсткий диск игру и играть в неё с телефона ?',
    content: 'Можно ли скачать на переносной жёсткий диск игру и играть в неё с телефона ?',
    slug: 'igra-s-zhestkogo-diska-na-telefone-1',
    author: mockUsers[1],
    category: mockCategories[1],
    rating: 39,
    status: 'opened',
    commentsCount: 0,
    createdAt: '2026-02-18T17:00:00Z', // 1 час назад
    updatedAt: '2026-02-18T17:00:00Z',
  },
  {
    id: 3,
    title: 'Если у вас была Ява, расскажите её минусы и плюсы, хороший ли это мотоцикл в 2024????',
    content: 'Если у вас была Ява, расскажите её минусы и плюсы, хороший ли это мотоцикл в 2024????',
    slug: 'pro-mototsikl-java-1',
    author: mockUsers[2],
    category: mockCategories[2],
    rating: 39,
    status: 'opened',
    commentsCount: 0,
    createdAt: '2026-02-18T16:00:00Z', // 2 часа назад
    updatedAt: '2026-02-18T16:00:00Z',
  },
  {
    id: 4,
    title: 'Какие татуировки и с какой целью себе набивали классические и современные писатели?',
    content: 'Какие татуировки и с какой целью себе набивали классические и современные писатели?',
    slug: 'tatuirovki-pisateley',
    author: mockUsers[0],
    category: mockCategories[3],
    rating: 39,
    status: 'opened',
    commentsCount: 0,
    createdAt: '2026-02-17T12:00:00Z', // Вчера
    updatedAt: '2026-02-17T12:00:00Z',
  },
  {
    id: 5,
    title: 'Можно ли скачать на переносной жёсткий диск игру и играть в неё с телефона ?',
    content: 'Повтор вопроса для соответствия фото',
    slug: 'igra-s-zhestkogo-diska-na-telefone-2',
    author: mockUsers[1],
    category: mockCategories[1],
    rating: 39,
    status: 'opened',
    commentsCount: 0,
    createdAt: '2026-01-18T12:00:00Z', // 1 месяц назад
    updatedAt: '2026-01-18T12:00:00Z',
  },
  {
    id: 6,
    title: 'Можно ли играть в JoJo eyes of heaven с другом на одной консоли?',
    content: 'Повтор вопроса для соответствия фото',
    slug: 'mozhno-li-igrat-v-jojo-2',
    author: mockUsers[0],
    category: mockCategories[0],
    rating: 39,
    status: 'opened',
    commentsCount: 0,
    createdAt: '2026-01-18T12:00:00Z', // 1 месяц назад
    updatedAt: '2026-01-18T12:00:00Z',
  },
  {
    id: 7,
    title: 'Если у вас была Ява, расскажите её минусы и плюсы, хороший ли это мотоцикл в 2024????',
    content: 'Повтор вопроса для соответствия фото',
    slug: 'pro-mototsikl-java-2',
    author: mockUsers[2],
    category: mockCategories[2],
    rating: 39,
    status: 'opened',
    commentsCount: 0,
    createdAt: '2026-01-18T12:00:00Z', // 1 месяц назад
    updatedAt: '2026-01-18T12:00:00Z',
  },
  {
    id: 8,
    title: 'Почему в популярной фантастике с высокоразвитыми технологиями часто роботы работают на машинном масле?',
    content: 'Почему в популярной фантастике с высокоразвитыми технологиями часто роботы работают на машинном масле?',
    slug: 'roboty-na-masle',
    author: mockUsers[1],
    category: mockCategories[4],
    rating: 39,
    status: 'opened',
    commentsCount: 0,
    createdAt: '2025-12-18T12:00:00Z', // 2 месяца назад
    updatedAt: '2025-12-18T12:00:00Z',
  },
  {
    id: 9,
    title: 'Правда ли, что делать что-то с закрытыми глазами улучшает мозг, и что именно развивается, развивается ли интеллект?',
    content: 'Правда ли, что делать что-то с закрытыми глазами улучшает мозг...',
    slug: 'zakrytye-glaza-i-mozg',
    author: mockUsers[2],
    category: mockCategories[5],
    rating: 39,
    status: 'opened',
    commentsCount: 0,
    createdAt: '2025-11-18T12:00:00Z', // 3 месяца назад
    updatedAt: '2025-11-18T12:00:00Z',
  },
];