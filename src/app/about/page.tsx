"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import "@/styles/about.css";
import {
  CheckIcon,
  BookIcon,
  MessageIcon,
  ListIcon,
} from "@/components/AboutIcons";
import { NewbieIcon, StudentIcon } from "@/components/AboutRanks";

const aboutTabs = [
  { id: "who", label: "Кто мы и куда?" },
  { id: "news", label: "Что нового" },
  { id: "ranks", label: "Система рангов" },
  { id: "rules", label: "Поддерживаем уют" },
  { id: "links", label: "Полезные ссылки" },
];

export default function About() {
  const [activeTab, setActiveTab] = useState("who");

  return (
    <>
      <Header />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">
            Главная
          </Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">О нас</span>
        </div>
      </div>

      <div className="question_wrapper container about-page-wrapper">
        {/* Левый сайдбар */}
        <div className="question_left_list">
          <div className="about-sidebar">
            <h2 className="about-sidebar-title">Всё об otvet.ai</h2>
            <div className="about-tabs">
              {aboutTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`about-tab ${activeTab === tab.id ? "about-tab--active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Основной контент */}
        <div className="questions_page_list">
          <section className="about-content-section">
            <div className="about-section-banner-wrap">
              <img
                src="/images/about1.png"
                alt=""
                className="about-section-banner"
              />
            </div>
            <div className="about-section-body">
              <h2 className="about-subtitle">Всё об Ответах</h2>
              <p className="about-text">
                Мы выросли из классического сервиса вопросов и ответов и стали
                местом, где каждый может чувствовать себя комфортно, обсуждая
                всё на свете: мнения, истории, новости, вопросы.
              </p>
              <p className="about-text">
                Никаких рамок — посты могут быть серьезными или лёгкими,
                экспертными, любительскими или смешными.
              </p>

              <h2 className="about-subtitle">Наша миссия</h2>
              <p className="about-text">
                Мы верим, что общение — это самый короткий путь к новым знаниям,
                неожиданным знакомствам и личному росту. Мы создаем пространство
                для таких открытий.
              </p>

              <h2 className="about-subtitle">Мы стремимся:</h2>
              <ul className="about-list">
                <li>
                  <CheckIcon /> Дать каждому возможность получить помощь
                </li>
                <li>
                  <CheckIcon /> Создать безопасную среду с уважением к разным
                  точкам зрения
                </li>
                <li>
                  <CheckIcon /> Объединять людей, чтобы они находили поддержку,
                  помощь и единомышленников
                </li>
              </ul>
            </div>
          </section>

          <section className="about-content-section about-content-section--alt">
            <div className="about-section-banner-wrap">
              <img
                src="/images/about2.png"
                alt=""
                className="about-section-banner"
              />
            </div>
            <div className="about-section-body">
              <h2 className="about-subtitle">Пространства вместо категорий</h2>
              <p className="about-text">
                Категории были формальными и не всегда удобными. Мы сделали их
                логичнее и прозрачнее — тематические разделы, в которых люди
                находят единомышленников, обсуждают важные и не очень вопросы,
                делятся опытом и поддержкой. Каждое пространство — это живое
                комьюнити, со своими героями, темами, специалистами и духом.
              </p>

              <h2 className="about-subtitle">
                Новая структура: посты вместо вопросов
              </h2>
              <p className="about-text">
                Теперь Ответы — это не только вопросы. Вы можете делиться
                мыслями, поднимать темы для обсуждений или рассказывать личные
                истории. Всё это — посты. У каждого поста есть свой тип:
              </p>

              <div className="about-cards">
                <div className="about-card">
                  <div className="about-card-icon">
                    <BookIcon />
                  </div>
                  <div className="about-card-title">Знания</div>
                  <p className="about-card-text">
                    Здесь можно делиться, черпать и восстанавливать информацию.
                    Мы развиваем эту энциклопедию качества ответов и знаний,
                    чтобы они соответствовали заданной теме.
                  </p>
                </div>
                <div className="about-card">
                  <div className="about-card-icon">
                    <MessageIcon />
                  </div>
                  <div className="about-card-title">Мнения</div>
                  <p className="about-card-text">
                    Свободный формат, где можно делиться своими взглядами,
                    обмениваться и спорить – шутить. Но помните про уважение
                    друг к другу и соблюдение общих правил Ответов.
                  </p>
                </div>
                <div className="about-card">
                  <div className="about-card-icon">
                    <ListIcon />
                  </div>
                  <div className="about-card-title">Истории</div>
                  <p className="about-card-text">
                    Дни, личные рассказы, на чей-то странице. Формат, в котором
                    пользователи делятся событиями из жизни, обсуждают
                    переживания или просто общаются.
                  </p>
                </div>
              </div>

              <h2 className="about-subtitle">Карма вместо баллов</h2>
              <ul className="about-list">
                <li>
                  <CheckIcon /> Дать каждому возможность получить помощь
                </li>
                <li>
                  <CheckIcon /> Создать безопасную среду с уважением к разным
                  точкам зрения
                </li>
                <li>
                  <CheckIcon /> Объединять людей, чтобы они находили поддержку,
                  помощь и единомышленников
                </li>
              </ul>

              <p className="about-text">
                Карма — это отражение вклада пользователя в Ответы. Для каждого
                из типов постов — Знания, Мнения, Истории — рассчитывается своя
                Карма. Она растет за полезные и интересные посты и ответы, а
                снижается за отрицательные.
              </p>
              <p className="about-text">
                Чем новее, интереснее и правильнее ваши ответы и посты, тем выше
                будет ваша Карма и признание сообщества и команды Ответов.
              </p>
            </div>
          </section>

          <section className="about-content-section about-content-section--alt">
            <div className="about-section-banner-wrap">
              <img
                src="/images/about3.png"
                alt=""
                className="about-section-banner"
              />
            </div>
            <div className="about-section-body">
              <h2 className="about-subtitle">Уровни</h2>
              <p className="about-text">
                При присвоении новых активных и уровней пользователей в Ответах
                Mail.ru создана система рангов. Ранг определяется Кармой,
                которая начисляется за оценки ваших постов и ответов другими
                участниками сообщества. Карма растёт за положительные оценки
                постов и ответов, а снижается за отрицательные. Ранг тоже может
                повышаться и понижаться — в зависимости от активности.
              </p>

              <h2 className="about-subtitle">
                Новая структура: посты вместо вопросов
              </h2>
              <p className="about-text">
                Теперь Ответы — это не только вопросы. Вы можете делиться
                мыслями, поднимать темы для обсуждений или рассказывать личные
                истории. Всё это — посты. У каждого поста есть свой тип:
              </p>

              <div className="about-ranks">
                <div className="about-rank-item">
                  <div className="about-rank-icon">
                    <NewbieIcon />
                  </div>
                  <div className="about-rank-title">Новичок</div>
                </div>
                <div className="about-rank-item">
                  <div className="about-rank-icon">
                    <StudentIcon />
                  </div>
                  <div className="about-rank-title">Ученик</div>
                </div>
                <div className="about-rank-item">
                  <div className="about-rank-icon">
                    <img src="/icons/about-expert.svg" alt="Знаток" />
                  </div>
                  <div className="about-rank-title">Знаток</div>
                </div>
                <div className="about-rank-item">
                  <div className="about-rank-icon">
                    <img src="/icons/about-profi.svg" alt="Профи" />
                  </div>
                  <div className="about-rank-title">Профи</div>
                </div>
                <div className="about-rank-item">
                  <div className="about-rank-icon">
                    <img src="/icons/about-guru.svg" alt="Гуру" />
                  </div>
                  <div className="about-rank-title">Гуру</div>
                </div>
              </div>

              <h2 className="about-subtitle">За что даются баллы</h2>
              <p className="about-text">
                Теперь Ответы — это не только вопросы. Вы можете делиться
                мыслями, поднимать темы для обсуждений или рассказывать личные
                истории. Всё это — посты. У каждого поста есть свой тип:
              </p>
              <div className="about-points-grid">
                <ul className="about-list" style={{ marginBottom: 0 }}>
                  <li>
                    <CheckIcon /> +5 баллов: задал вопрос
                  </li>
                  <li>
                    <CheckIcon /> +1 балл: ответил на вопрос
                  </li>
                  <li>
                    <CheckIcon /> +5 баллов: лучший / как ответ автора вопроса
                  </li>
                </ul>
                <ul className="about-list" style={{ marginBottom: 0 }}>
                  <li>
                    <CheckIcon /> +1 балл: получил лайк ответа на коммент, или
                    лайк вопроса
                  </li>
                  <li>
                    <CheckIcon /> +10 баллов: ответ признан лучшим
                  </li>
                  <li>
                    <CheckIcon /> -2 балла: удаление ответа
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="about-content-section about-content-section--alt">
            <div className="about-section-banner-wrap">
              <img
                src="/images/about4.png"
                alt=""
                className="about-section-banner"
              />
            </div>
            <div className="about-section-body">
              <h2 className="about-subtitle">Правила</h2>
              <p className="about-text" style={{ fontWeight: 700 }}>
                Основные принципы:
              </p>
              <ul className="about-list">
                <li>
                  <CheckIcon /> Не публикуйте спам и рекламу: материалы
                  рекламного характера или не имеющие ценности для пользователей
                  Ответов будут удаляться.
                </li>
                <li>
                  <CheckIcon /> Не пишите оскорбления: не оскорбляйте себя и
                  других.
                </li>
                <li>
                  <CheckIcon /> Не публикуйте контент, нарушающий авторские
                  права или любые законы (схемы, взлом, пиратка). Соблюдайте
                  законы РФ.
                </li>
                <li>
                  <CheckIcon /> Соблюдайте авторские права: указывайте источники
                  при использовании материалов, созданных другими людьми.
                </li>
                <li>
                  <CheckIcon /> Относитесь с уважением к пространству:
                  публикации должны соответствовать тематике пространства, в
                  котором они размещаются.
                </li>
                <li>
                  <CheckIcon /> Уважайте собеседников и будьте вежливы
                </li>
              </ul>

              <p
                className="about-text"
                style={{ fontWeight: 700, marginTop: "30px" }}
              >
                Модерация и безопасность
              </p>
              <ul className="about-list">
                <li>
                  <CheckIcon /> Модераторы удаляют спам и запрещённый контент, а
                  также отписки.
                </li>
                <li>
                  <CheckIcon /> Команда модерации внимательно следит за жалобами
                  пользователей.
                </li>
                <li>
                  <CheckIcon /> Любое голосование может закончиться на
                  нарушение. Решение будет принято намного быстрее. При удалении
                  поста пользователь получает уведомление и в большинстве
                  случаев может обжаловать решение. Чтобы обжаловать решение,
                  перейдите по этой ссылке.
                </li>
              </ul>

              <p
                className="about-text"
                style={{ fontWeight: 700, marginTop: "30px" }}
              >
                Как сервис работает
              </p>
              <ul className="about-list">
                <li>
                  <CheckIcon /> Зарегистрируйтесь или войдите: Используйте любой
                  способ - email, вконтакте.
                </li>
                <li>
                  <CheckIcon /> Создайте пост и выберите его тип (Знания, Мнения
                  или История).
                </li>
                <li>
                  <CheckIcon /> Помогайте ответам и вступайте в правильные
                  обсуждения в ветках.
                </li>
                <li>
                  <CheckIcon /> Повышайте карму за полезные, смешные и
                  интересные ответы. В каждом типе постов — своя система званий
                  и изменения Кармы.
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Правый сайдбар — VIP */}
        <div className="question_right_list">
          <div className="vip_status_block">
            <div className="vip_icon">
              <img src="/images/vip.svg" alt="VIP" />
            </div>
            <p className="vip_gift_text">Подарить</p>
            <h3 className="vip_title">VIP статус</h3>
            <button className="vip_button">ПОДАРИТЬ</button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
