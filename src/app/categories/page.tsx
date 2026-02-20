import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"

// Все категории со скриншота с полными списками подкатегорий
const allCategories = [
  {
    name: "Авто, Мото",
    slug: "auto-moto",
    svgIcon: "steering-wheel",
    subcategories: [
      "Автоспорт",
      "Автострахование",
      "Выбор автомобиля, мотоцикла",
      "ГИБДД, Обучение, Права",
      "ПДД, Вождение",
      "Оформление авто-мото сделок",
      "Сервис, Обслуживание, Тюнинг",
      "Прочие Авто-темы",
    ],
  },
  {
    name: "Развлечения",
    slug: "entertainment",
    svgIcon: "gaming",
    subcategories: [
      "Игры без компьютера",
      "Клубы, Дискотеки",
      "Концерты, Выставки, Спектакли",
      "Охота и Рыбалка",
      "Рестораны, Кафе, Бары",
      "Советы, Идеи",
      "Восьмое марта",
      "Новый Год",
    ],
  },
  {
    name: "Растения",
    slug: "plants",
    svgIcon: "gear",
    subcategories: [
      "Дикая природа",
      "Домашние",
      "Комнатные растения",
      "Сад-Огород",
      "Прочее",
    ],
  },
  {
    name: "Красота и Здоровье",
    slug: "beauty-health",
    svgIcon: "heart",
    subcategories: [
      "Коронавирус",
      "Баня, Массаж, Фитнес",
      "Болезни, Лекарства",
      "Врачи, Клиники, Страхование",
      "Здоровый образ жизни",
      "Коррекция веса",
      "Уход за волосами",
      "Прочее о здоровье и красоте",
    ],
  },
  {
    name: "Семья, Дом",
    slug: "family-home",
    svgIcon: "family",
    subcategories: [
      "Беременность, Роды",
      "Воспитание детей",
      "Домашняя бухгалтерия",
      "Домоводство",
      "Загородная жизнь",
      "Мебель, Интерьер",
      "Организация быта",
      "Прочие дела домашние",
    ],
  },
  {
    name: "Бизнес, Финансы",
    slug: "business-finance",
    svgIcon: "business",
    subcategories: [
      "Банки и Кредиты",
      "Долги, Коллекторы",
      "Бухгалтерия, Аудит, Налоги",
      "Макроэкономика",
      "Недвижимость, Ипотека",
      "Производственные предприятия",
      "Собственный бизнес",
      "Остальные сферы бизнеса",
    ],
  },
  {
    name: "Еда, Кулинария",
    slug: "food-cooking",
    svgIcon: "food",
    subcategories: [
      "Вторые блюда",
      "Готовим в ...",
      "Готовим детям",
      "Десерты, Сладости, Выпечка",
      "Закуски и Салаты",
      "Консервирование",
      "На скорую руку",
      "Прочее кулинарное",
    ],
  },
  {
    name: "Спорт",
    slug: "sport",
    svgIcon: "sport",
    subcategories: [
      "Теннис",
      "Футбол",
      "Хоккей",
      "Зимние виды спорта",
      "Экстрим",
      "Другие виды спорта",
      "Занятия спортом",
      "События, результаты",
    ],
  },
  {
    name: "Домашние задания",
    slug: "homework",
    svgIcon: "homework",
    subcategories: [
      "Математика",
      "Алгебра",
      "Геометрия",
      "Иностранные языки",
      "Химия",
      "Физика",
      "Биология",
      "Другие предметы",
    ],
  },
  {
    name: "Культура",
    slug: "culture",
    svgIcon: "culture",
    subcategories: [
      "Архитектура, Скульптура",
      "Живопись, Графика",
      "Кино, Театр",
      "Литература",
      "Музыка",
      "Прочие искусства",
    ],
  },
  {
    name: "Программирование",
    slug: "programming",
    svgIcon: "it",
    subcategories: [
      "Android",
      "C/C++",
      "C#",
      "iOS",
      "Python",
      "Веб-дизайн",
      "Верстка, CSS, HTML, SVG",
      "Другие языки и технологии",
    ],
  },
  {
    name: "Общество, Политика",
    slug: "society-politics",
    svgIcon: "society",
    subcategories: [
      "Общество",
      "Политика",
      "Средства массовой информации",
      "Прочие социальные темы",
    ],
  },
  {
    name: "Дети",
    slug: "children",
    svgIcon: "children",
    subcategories: [
      "Беременность, Роды",
      "Воспитание детей",
      "Домоводство",
      "Загородная жизнь",
      "Организация быта",
      "Свадьба, Венчание, Брак",
      "Строительство и Ремонт",
      "Прочие дела домашние",
    ],
  },
  {
    name: "Наука, Техника",
    slug: "science-tech",
    svgIcon: "science",
    subcategories: [
      "Гуманитарные науки",
      "Естественные науки",
      "Лингвистика",
      "Техника",
      "Прочие",
    ],
  },
  {
    name: "Фотография",
    slug: "photography",
    svgIcon: "camera",
    subcategories: [
      "Выбор, покупка аппаратуры",
      "Обработка видеозаписей",
      "Обработка и печать фото",
      "Уход за аппаратурой",
      "Техника, темы, жанры съемки",
      "Прочее фото-видео",
    ],
  },
  {
    name: "Видео игры",
    slug: "video-games",
    svgIcon: "gaming",
    subcategories: [
      "Браузерные",
      "Клиентские",
      "Консольные",
      "Мобильные",
      "Прочие",
    ],
  },
  {
    name: "Компьютеры, Связь",
    slug: "computers",
    svgIcon: "computer",
    subcategories: [
      "Железо",
      "Интернет",
      "Мобильная связь",
      "Мобильные устройства",
      "Офисная техника",
      "Программное обеспечение",
      "Прочее компьютерное",
    ],
  },
  {
    name: "Знакомства",
    slug: "dating",
    svgIcon: "relationships",
    subcategories: [
      "Дружба",
      "Знакомства",
      "Любовь",
      "Отношения",
      "Расставания",
      "Прочие взаимоотношения",
    ],
  },
  {
    name: "Работа, Карьера",
    slug: "career",
    svgIcon: "career",
    subcategories: [
      "Кадровые агентства",
      "Написание резюме",
      "Обстановка на работе",
      "Отдел кадров, HR",
      "Подработка, временная работа",
      "Профессиональный рост",
      "Смена и поиск места работы",
      "Прочие карьерные вопросы",
    ],
  },
  {
    name: "Гороскопы, Гадания",
    slug: "horoscopes",
    svgIcon: "horoscope",
    subcategories: [
      "Гадания",
      "Гороскопы",
      "Магия",
      "Сны",
      "Прочие предсказания",
    ],
  },
];

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <div className="container">
        <div className="section">
          <div className="blocks_title">
            <h2>Категории</h2>
          </div>

          <div className="categories_list">
            {allCategories.map((category) => (
              <div className="subject_item" key={category.slug}>
                <div className="subject_item_icon">
                  <svg width="24" height="24" className="category_icon">
                    <use xlinkHref={`#${category.svgIcon}`}></use>
                  </svg>
                </div>

                <Link href={`/categories/${category.slug}`}>
                  <h3>{category.name}</h3>
                </Link>

                <div className="subject_item_list">
                  {category.subcategories.map((subcat, index) => (
                    <Link
                      href={`/categories/${category.slug}/${encodeURIComponent(subcat.toLowerCase())}`}
                      key={index}
                    >
                      <div className="subject_item_list_item">
                        <img
                          src="/images/icons/category-list-item.svg"
                          alt=""
                        />
                        <p>{subcat}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </>
  )
}
