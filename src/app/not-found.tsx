'use client'

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="not_found_wrapper">
      <Header />
      <div className="container">
        <div className="not_found_page">
          <img src="/images/404.png" alt="404" />
          <h2>Ой! Мы не нашли эту страницу :(</h2>
          <p>Попробуйте вернуться обратно или перейти
на главную страницу проекта</p>
          <Link href="/">
            <button className="m_btn category_btn">Вернуться на главную</button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}
