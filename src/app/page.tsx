import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { mockQuestions } from '@/data/mock-questions'
import { mockCategories } from '@/data/mock-categories'
import { mockUsers } from '@/data/mock-users'
import Link from 'next/link'

export default function Home() {
  // Топ 4 пользователя для блока "Лидеры"
  const topUsers = mockUsers.slice(0, 4)

  // Популярные вопросы (для блока "Самые обсуждаемые")
  const popularQuestions = mockQuestions.slice(0, 4)

  // Моковые подкатегории для каждой категории
  const subcategories: Record<string, string[]> = {
    'programming': ['JavaScript', 'Python', 'React', 'Node.js'],
    'javascript': ['ES6+', 'TypeScript', 'Async/Await', 'Promises'],
    'react': ['Hooks', 'Context API', 'Redux', 'Next.js'],
    'python': ['Django', 'Flask', 'NumPy', 'Pandas'],
    'math': ['Алгебра', 'Геометрия', 'Математический анализ', 'Статистика'],
    'physics': ['Механика', 'Оптика', 'Термодинамика', 'Электричество'],
  }

  return (
    <>
      <Header />

      <div className="container">
        {/* Блок "Популярные категории" */}
        <div className="section">
          <div className="blocks_title">
            <h2>Популярные</h2>
          </div>

          <div className="subjects_list_wrapper">
            <div className="subjects_list">
              {mockCategories.slice(0, 6).map((category) => (
                <div className="subject_item" key={category.id}>
                  <div className="subject_item_icon">
                    <svg width="24.000000" height="17.5">
                      <use xlinkHref={`#${category.svgIcon || 'gaming'}`}></use>
                    </svg>
                  </div>

                  <Link href={`/categories/${category.slug}`}>
                    <h3>{category.name}</h3>
                  </Link>

                  {/* Список подкатегорий */}
                  <div className="subject_item_list">
                    {subcategories[category.slug]?.slice(0, 4).map((subcat, index) => (
                      <Link href={`/categories/${category.slug}/${subcat.toLowerCase()}`} key={index}>
                        <div className="subject_item_list_item">
                          <img src="/images/icons/category-list-item.svg" alt="" />
                          <p>{subcat}</p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Посмотреть все */}
                  <Link href="/categories">
                    <div className="subject_item_more">
                      <p>Посмотреть все</p>
                      <img src="/images/icons/more-s-icon.svg" alt="" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="line"></div>

        {/* Блок "Вопросы участников" */}
        <div className="section populars_block">
          <div className="blocks_title">
            <h2>Вопросы участников</h2>

            <div className="questions_filter">
              <button className="s_btn s_btn_active">Открытые</button>
              <button className="s_btn">На голосовании</button>
              <button className="s_btn">Лучшие</button>
            </div>
          </div>

          {/* Поле "Задать свой вопрос" */}
          <div className="questions_block_search">
            <img src="/images/icons/ask.svg" alt="" />
            <input name="message" type="text" placeholder="Задайте свой вопрос здесь" />
            <textarea name="message-full" placeholder="Задайте свой вопрос здесь"></textarea>
            <button type="submit" className="s_btn s_btn_active">Задать вопрос</button>
          </div>

          {/* Список вопросов */}
          <div className="questions_list">
            {mockQuestions.map((question) => (
              <div key={question.id} className="question_list_item">
                {/* Верхняя панель (мобильная) */}
                <div className="question_item_top_data">
                  <div className="question_item_top_data_left">
                    <img src={question.author.avatar || '/images/icons/avatar.svg'} alt={question.author.displayName} />
                    <div>
                      <p className="main_text">{question.author.displayName}</p>
                      <span>{question.author.rating} баллов</span>
                    </div>
                  </div>
                  <div className="question_item_top_data_right">
                    <button title="Мне нравится" className="s_btn s_btn_icon btn-like">
                      <svg width="13.714355" height="12.000000">
                        <use xlinkHref="#like"></use>
                      </svg>
                    </button>
                    <button className="s_btn s_btn_icon share-this" title="Поделиться">
                      <svg width="14" height="14.000000">
                        <use xlinkHref="#share"></use>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Основной контент */}
                <Link href={`/question/${question.slug}`}>
                  <div className="question_list_item_left">
                    <img src={question.author.avatar || '/images/icons/avatar.svg'} alt={question.author.displayName} />
                    <div>
                      <p className="main_text">{question.title}</p>
                      <span>8 месяцев назад</span>
                    </div>
                  </div>
                </Link>

                <div className="question_list_item_right">
                  {/* Аватары пользователей */}
                  <div className="question_list_item_users">
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <p className="main_text">+5</p>
                  </div>

                  <div className="question_list_item_right_actions">
                    {/* Кнопка лайка */}
                    <button title="Мне нравится" className="s_btn s_btn_icon btn-like">
                      <svg width="13.714355" height="12.000000">
                        <use xlinkHref="#like"></use>
                      </svg>
                    </button>

                    {/* Кнопка поделиться */}
                    <button className="s_btn s_btn_icon share-this" title="Поделиться">
                      <svg width="14" height="14.000000">
                        <use xlinkHref="#share"></use>
                      </svg>
                    </button>

                    {/* Кнопка "Посмотреть" */}
                    <Link href={`/question/${question.slug}`} className="s_btn">
                      Посмотреть
                    </Link>

                    {/* Кнопка "Комментировать" */}
                    <Link href={`/question/${question.slug}#answer`} className="s_btn s_btn_active">
                      Комментировать
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Показать больше */}
          <div className="show_more_btn_wrapper">
            <button className="show_more_btn">
              <img src="/images/icons/Sync.svg" alt="" />
              Показать еще
            </button>
          </div>
        </div>

        <div className="line"></div>

        {/* Три блока внизу */}
        <div className="tops_block">
          {/* Лидеры проекта */}
          <div className="tops_block_item">
            <div className="blocks_title">
              <h2>Лидеры проекта</h2>
            </div>

            <div className="tops_block_item_top_subjects">
              {topUsers.map((user) => (
                <div className="question_list_item" key={user.id}>
                  <Link href={`/profile/${user.username}`}>
                    <div className="question_list_item_left">
                      <img src={user.avatar || '/images/icons/avatar.svg'} alt={user.displayName} />
                      <div>
                        <div className="main_text">{user.displayName}</div>
                        <span>{user.rating} баллов</span>
                      </div>
                    </div>
                  </Link>
                  <div className="question_list_item_users">
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <p className="main_text">+4K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Самые обсуждаемые */}
          <div className="tops_block_item">
            <div className="blocks_title">
              <h2>Самые обсуждаемые</h2>
            </div>

            <div className="tops_block_item_top_subjects">
              {popularQuestions.map((question) => (
                <div className="question_list_item" key={question.id}>
                  <Link href={`/question/${question.slug}`}>
                    <div className="question_list_item_left">
                      <img src={question.author.avatar || '/images/icons/avatar.svg'} alt={question.author.displayName} />
                      <div>
<div className="main_text question_title_clamp">
  {question.title}
</div>
                      </div>
                    </div>
                  </Link>
                  <div className="question_list_item_users">
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <p className="main_text">+{question.commentsCount}K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Популярные темы */}
          <div className="tops_block_item">
            <div className="blocks_title">
              <h2>Популярные темы</h2>
            </div>

            <div className="tops_block_item_top_subjects">
              {mockCategories.slice(0, 4).map((category) => (
                <div className="question_list_item" key={category.id}>
                  <Link href={`/categories/${category.slug}`}>
                    <div className="question_list_item_left">
                      <svg width="24" height="24">
                        <use xlinkHref={`#${category.svgIcon || 'gaming'}`}></use>
                      </svg>
                      <div>
                        <div className="main_text">{category.name}</div>
                      </div>
                    </div>
                  </Link>
                  <div className="question_list_item_users">
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <img src="/images/icons/avatar.svg" alt="" />
                    <p className="main_text">+4K</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
