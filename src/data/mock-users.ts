import { User } from '@/types';

export const mockUsers: User[] = [
  {
    id: 1,
    username: 'admin',
    displayName: 'Администратор',
    email: 'admin@askme.com',
    avatar: '/images/icons/avatar.svg',
    bio: 'Главный администратор платформы AskMe',
    rating: 1250,
    balance: 0,
    vipStatus: true,
    questionsCount: 45,
    answersCount: 320,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    username: 'john_doe',
    displayName: 'Джон Доу',
    email: 'john@example.com',
    avatar: '/images/icons/avatar.svg',
    bio: 'Люблю программирование и математику',
    rating: 850,
    balance: 100,
    vipStatus: false,
    questionsCount: 23,
    answersCount: 145,
    createdAt: '2024-02-10T12:30:00Z',
  },
  {
    id: 3,
    username: 'jane_smith',
    displayName: 'Джейн Смит',
    email: 'jane@example.com',
    avatar: '/images/icons/avatar.svg',
    bio: 'Преподаватель физики, помогаю студентам',
    rating: 620,
    balance: 50,
    vipStatus: false,
    questionsCount: 12,
    answersCount: 98,
    createdAt: '2024-03-05T14:20:00Z',
  },
];

export const getCurrentUser = (): User | null => {
  // В реальном проекте здесь будет проверка аутентификации
  return null;
};
