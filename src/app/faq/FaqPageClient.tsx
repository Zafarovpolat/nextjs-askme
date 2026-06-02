"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: FaqItem[];
}

const FAQ_DATA: FaqCategory[] = [
  {
    id: "general",
    label: "Общие вопросы",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    ),
    items: [
      { q: "Что такое Otvetai?", a: "Otvetai — это платформа для вопросов и ответов на русском языке. Здесь вы можете задавать вопросы на любые темы, получать ответы от сообщества, а также помогать другим пользователям." },
      { q: "Нужно ли регистрироваться для просмотра вопросов?", a: "Нет, просматривать вопросы и ответы можно без регистрации. Однако для того чтобы задать вопрос, ответить или оценить — необходимо создать аккаунт." },
      { q: "Это бесплатный сервис?", a: "Да, базовый функционал платформы полностью бесплатен. Существует также VIP статус с расширенными возможностями — подробнее в разделе «VIP статус»." },
      { q: "На каких языках работает платформа?", a: "Платформа работает на русском языке. Вопросы и ответы принимаются преимущественно на русском." },
    ],
  },
  {
    id: "account",
    label: "Регистрация и аккаунт",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    items: [
      { q: "Как зарегистрироваться?", a: "Нажмите кнопку «Войти» в шапке сайта, затем выберите «Создать аккаунт». Вы можете зарегистрироваться через email или через Telegram-аккаунт." },
      { q: "Как изменить имя или аватар?", a: "Зайдите в раздел «Профиль» и нажмите кнопку редактирования. Там можно обновить имя, аватар и другие данные аккаунта." },
      { q: "Я забыл пароль — что делать?", a: "На странице входа нажмите «Забыли пароль?». На вашу почту придёт письмо со ссылкой для восстановления доступа. Проверьте папку «Спам», если письмо не пришло в течение нескольких минут." },
      { q: "Можно ли удалить аккаунт?", a: "Да. Для удаления аккаунта обратитесь в службу поддержки. Все ваши данные будут удалены в соответствии с политикой конфиденциальности." },
      { q: "Как привязать Telegram к аккаунту?", a: "В настройках профиля найдите раздел «Социальные сети» и нажмите «Привязать Telegram». Следуйте инструкциям на экране." },
    ],
  },
  {
    id: "qa",
    label: "Вопросы и ответы",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    items: [
      { q: "Как задать вопрос?", a: "Нажмите кнопку «Задать вопрос» в шапке сайта или на главной странице. Введите текст вопроса, выберите категорию и нажмите «Опубликовать»." },
      { q: "Сколько вопросов я могу задать в день?", a: "Количество вопросов в день зависит от вашего уровня и статуса аккаунта. Начинающие пользователи могут задавать до 5 вопросов в сутки, VIP-пользователи — без ограничений." },
      { q: "Как пометить ответ как лучший?", a: "Только автор вопроса может выбрать лучший ответ. Нажмите на кнопку с галочкой рядом с ответом, который вы считаете наиболее полезным. Лучший ответ будет выделен и поднят наверх." },
      { q: "Можно ли редактировать вопрос после публикации?", a: "Да, вы можете редактировать свой вопрос в течение определённого времени после публикации. Нажмите кнопку редактирования в блоке вопроса." },
      { q: "Как работает система оценок?", a: "Любой авторизованный пользователь может поставить лайк или дизлайк вопросу или ответу. Рейтинг влияет на видимость контента и репутацию автора." },
    ],
  },
  {
    id: "vip",
    label: "VIP статус",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    items: [
      { q: "Что даёт VIP статус?", a: "VIP статус открывает расширенные возможности: неограниченное количество вопросов в день, приоритетное отображение ваших вопросов, уникальный значок в профиле, а также доступ к эксклюзивным функциям платформы." },
      { q: "Как получить VIP статус?", a: "VIP статус можно приобрести на странице профиля или подарить другому пользователю. Нажмите кнопку «VIP статус» для оформления." },
      { q: "На какой срок выдаётся VIP?", a: "VIP статус предоставляется на фиксированный период. Срок действия отображается в вашем профиле. По истечении срока статус можно продлить." },
      { q: "Можно ли подарить VIP другому пользователю?", a: "Да, вы можете подарить VIP статус любому пользователю платформы. Используйте кнопку «Подарить VIP» в блоке на страницах сайта." },
    ],
  },
  {
    id: "safety",
    label: "Безопасность",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    items: [
      { q: "Как пожаловаться на нарушение правил?", a: "На каждом вопросе и ответе есть кнопка «Пожаловаться». Укажите причину нарушения, и наша команда модерации рассмотрит жалобу в течение 24 часов." },
      { q: "Какой контент запрещён?", a: "Запрещены: нецензурная лексика, оскорбления, спам, рекламный контент, материалы 18+, ложная информация и нарушение авторских прав. Подробные правила — в Пользовательском соглашении." },
      { q: "Что произойдёт, если я нарушу правила?", a: "За нарушение правил предусмотрены: предупреждение, временная блокировка отдельных действий или полная блокировка аккаунта в зависимости от тяжести нарушения." },
    ],
  },
  {
    id: "technical",
    label: "Технические проблемы",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41" />
      </svg>
    ),
    items: [
      { q: "Страница не загружается — что делать?", a: "Попробуйте обновить страницу (Ctrl+R или Cmd+R). Если проблема сохраняется — очистите кэш браузера и куки. Также убедитесь, что ваше интернет-соединение работает стабильно." },
      { q: "Не могу войти в аккаунт", a: "Убедитесь, что вводите правильный email и пароль. Проверьте, не включён ли Caps Lock. Если проблема сохраняется — воспользуйтесь функцией «Забыли пароль?» или обратитесь в поддержку." },
      { q: "Изображение аватара не загружается", a: "Убедитесь, что файл в формате JPG, PNG или WEBP и размером не более 5 МБ. Если проблема сохраняется — попробуйте другой браузер или обратитесь в поддержку." },
      { q: "Нашёл баг — как сообщить?", a: "Мы будем рады вашему отчёту! Опишите проблему как можно подробнее (что произошло, в каком браузере, шаги для воспроизведения) и отправьте нам через форму поддержки." },
    ],
  },
];

export default function FaqPageClient() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return activeCategory
        ? FAQ_DATA.filter((c) => c.id === activeCategory)
        : FAQ_DATA;
    }
    return FAQ_DATA.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (item) =>
          item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0);
  }, [search, activeCategory]);

  const toggleItem = (key: string) => {
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="question_wrapper container faq-page-wrapper">
      {/* Левая колонка — навигация по разделам */}
      <div className="question_left_list">
        <div className="faq-sidebar">
          <p className="faq-sidebar-title">Разделы</p>
          <div className="faq-categories">
            <button
              type="button"
              className={`faq-category-btn${activeCategory === null && !search ? " faq-category-btn--active" : ""}`}
              onClick={() => { setActiveCategory(null); setSearch(""); }}
            >
              <span className="faq-category-btn__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </span>
              Все разделы
            </button>
            {FAQ_DATA.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`faq-category-btn${activeCategory === cat.id && !search ? " faq-category-btn--active" : ""}`}
                onClick={() => { setActiveCategory(cat.id); setSearch(""); }}
              >
                <span className="faq-category-btn__icon">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Центральная колонка — аккордеон */}
      <div className="questions_page_list">
        {/* Поиск */}
        <div className="faq-search-wrap">
          <div className="faq-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="faq-search-input"
              type="text"
              placeholder="Поиск по вопросам..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
            />
          </div>
        </div>

        <div className="faq-content">
          {filteredData.length === 0 ? (
            <div className="faq-no-results">
              По вашему запросу ничего не найдено
            </div>
          ) : (
            filteredData.map((cat) => (
              <div key={cat.id} className="faq-section" id={`faq-${cat.id}`}>
                <div className="faq-section-header">
                  <div className="faq-section-icon">{cat.icon}</div>
                  <h2 className="faq-section-title">{cat.label}</h2>
                  <span className="faq-section-count">{cat.items.length} вопр.</span>
                </div>
                <div className="faq-items">
                  {cat.items.map((item, idx) => {
                    const key = `${cat.id}-${idx}`;
                    const isOpen = !!openItems[key];
                    return (
                      <div key={key} className={`faq-item${isOpen ? " faq-item--open" : ""}`}>
                        <button
                          type="button"
                          className="faq-item-btn"
                          onClick={() => toggleItem(key)}
                          aria-expanded={isOpen}
                        >
                          <span className="faq-item-question">{item.q}</span>
                          <svg className="faq-item-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                        <div className="faq-item-answer">
                          <div className="faq-item-answer-inner">
                            <p>{item.a}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Правая колонка */}
      <div className="question_right_list">
        <div className="vip_status_block">
          <div className="vip_icon">
            <img src="/images/vip.svg" alt="VIP" />
          </div>
          <p className="vip_gift_text">Подарить</p>
          <h3 className="vip_title">VIP статус</h3>
          <button type="button" className="vip_button">ПОДАРИТЬ</button>
        </div>

        <div className="faq-contact-block">
          <div className="faq-contact-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="faq-contact-title">Нужна помощь?</p>
          <p className="faq-contact-text">Не нашли ответ на свой вопрос? Наша команда поддержки готова помочь.</p>
          <Link href="/support" className="faq-contact-btn">Написать в поддержку</Link>
        </div>
      </div>
    </div>
  );
}
