import Link from 'next/link'
import { mockUsers } from '@/data/mock-users'
import { mockCategories } from '@/data/mock-categories'

export default function SidebarRight() {
  // Топ 3 пользователя
  const topUsers = mockUsers.slice(0, 3)
  
  // Топ 3 категории
  const topCategories = mockCategories.slice(0, 3)

  return (
    <div className="hide-mobile hide-tablet">
      {/* Топ пользователей */}
      <div className="block">
        <h3 className="block__title">Топ пользователей</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {topUsers.map((user) => (
            <Link href={`/profile/${user.username}`} key={user.id}>
              <div className="question_list_item">
                <div className="question_list_item_left">
                  <img src={user.avatar || '/images/avatar.png'} alt={user.displayName} />
                  <div>
                    <div className="main_text">{user.displayName}</div>
                    <span>{user.rating} баллов</span>
                  </div>
                </div>
                <div className="question_list_item_right">
                  <button className="s_btn s_btn_icon">
                    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 1L6.5 6L1.5 11" stroke="#626AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/leaders">
          <div className="show_more_btn_wrapper">
            <button className="show_more_btn">
              Все лидеры
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="#626AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </Link>
      </div>

      {/* Топ категорий */}
      <div className="block margin-top">
        <h3 className="block__title">Топ категории</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {topCategories.map((category) => (
            <Link href={`/categories/${category.slug}`} key={category.id}>
              <div className="question_list_item">
                <div className="question_list_item_left">
                  <div style={{ fontSize: '24px', width: '40px', textAlign: 'center' }}>
                    {category.icon}
                  </div>
                  <div>
                    <div className="main_text">{category.name}</div>
                    <span>{category.questionsCount} вопросов</span>
                  </div>
                </div>
                <div className="question_list_item_right">
                  <button className="s_btn s_btn_icon">
                    <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1.5 1L6.5 6L1.5 11" stroke="#626AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/categories">
          <div className="show_more_btn_wrapper">
            <button className="show_more_btn">
              Все категории
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 1L5 5L9 1" stroke="#626AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </Link>
      </div>
    </div>
  )
}
