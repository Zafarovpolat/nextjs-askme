import Link from 'next/link'

export default function SidebarLeft() {
  return (
    <div className="hide-mobile hide-tablet">
      <div className="block">
        <h3 className="block__title">Навигация</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Link href="/">
            <button className="s_btn" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.25 6.75L9 1.5L15.75 6.75V15C15.75 15.3978 15.592 15.7794 15.3107 16.0607C15.0294 16.342 14.6478 16.5 14.25 16.5H3.75C3.35218 16.5 2.97064 16.342 2.68934 16.0607C2.40804 15.7794 2.25 15.3978 2.25 15V6.75Z" stroke="#626AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.75 16.5V9H11.25V16.5" stroke="#626AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Главная
            </button>
          </Link>

          <Link href="/categories">
            <button className="s_btn" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.25 2.25H7.5V7.5H2.25V2.25Z" stroke="#626AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.5 2.25H15.75V7.5H10.5V2.25Z" stroke="#626AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10.5 10.5H15.75V15.75H10.5V10.5Z" stroke="#626AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.25 10.5H7.5V15.75H2.25V10.5Z" stroke="#626AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Категории
            </button>
          </Link>

          <Link href="/leaders">
            <button className="s_btn" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11.25C11.0711 11.25 12.75 9.57107 12.75 7.5C12.75 5.42893 11.0711 3.75 9 3.75C6.92893 3.75 5.25 5.42893 5.25 7.5C5.25 9.57107 6.92893 11.25 9 11.25Z" stroke="#626AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15.4425 14.25C15.4425 12.855 12.5475 11.25 9 11.25C5.4525 11.25 2.5575 12.855 2.5575 14.25" stroke="#626AFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Лидеры
            </button>
          </Link>
        </div>
      </div>

      <div className="block margin-top">
        <h3 className="block__title">Популярные категории</h3>
        
        <div className="categories_list--simple">
          <Link href="/categories/programming">Программирование</Link>
          <Link href="/categories/javascript">JavaScript</Link>
          <Link href="/categories/react">React</Link>
          <Link href="/categories/python">Python</Link>
          <Link href="/categories/math">Математика</Link>
          <Link href="/categories/physics">Физика</Link>
          <Link href="/categories/chemistry">Химия</Link>
        </div>
      </div>
    </div>
  )
}
