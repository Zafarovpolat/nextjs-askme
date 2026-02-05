# 🚀 AskMe - Next.js Version

Q&A Platform построенная на Next.js 14 с TypeScript

## 📦 Установка

```bash
npm install
# или
yarn install
```

## 🎨 Копирование CSS файлов

**ВАЖНО!** Скопируйте все CSS файлы из WordPress темы:

**Из:**
```
C:\Users\x\Desktop\otvetai\_live.mis507nz.test3.quadvector.ru.1files.3056032.tar\_live.mis507nz.test3.quadvector.ru.1files.3056032\test3.quadvector.ru\public_html\wp-content\themes\askme\assets\css\
```

**В:**
```
C:\Users\x\Desktop\otvetai\nextjs-askme\src\styles\
```

**Список файлов для копирования:**
- style.css
- main.css
- modal.css
- categories.css
- questions.css
- profile.css
- leaders.css
- ask.css
- login-auth.css
- 404.css
- admin.css

После копирования раскомментируйте импорты в `src/app/globals.css`

## 🖼️ Копирование изображений и шрифтов

**Изображения:**
```
Из: wp-content/themes/askme/assets/img/
В: public/images/
```

**Шрифты:**
```
Из: wp-content/themes/askme/assets/fonts/
В: public/fonts/
```

## 🚀 Запуск

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

## 📁 Структура проекта

```
nextjs-askme/
├── src/
│   ├── app/              # App Router (Next.js 14)
│   │   ├── layout.tsx    # Главный layout
│   │   ├── page.tsx      # Главная страница
│   │   └── globals.css   # Глобальные стили
│   │
│   ├── components/       # React компоненты
│   │   ├── layout/       # Layout компоненты
│   │   └── ui/           # UI компоненты
│   │
│   └── styles/           # CSS файлы (скопировать из WP)
│
├── public/               # Статические файлы
│   ├── fonts/           # Шрифты (скопировать из WP)
│   └── images/          # Изображения (скопировать из WP)
│
├── package.json
├── tsconfig.json
└── next.config.js
```

## ✅ Чек-лист переноса

- [ ] Скопировать CSS файлы в src/styles/
- [ ] Скопировать шрифты в public/fonts/
- [ ] Скопировать изображения в public/images/
- [ ] Раскомментировать импорты в globals.css
- [ ] Запустить npm install
- [ ] Запустить npm run dev
- [ ] Проверить что стили загружаются

## 📚 Документация

Полная документация проекта находится в корне WordPress проекта:
- PROJECT_DOCUMENTATION.md
- DATABASE_SCHEMA.md
- README.md
