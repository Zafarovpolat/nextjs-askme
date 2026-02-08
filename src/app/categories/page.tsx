'use client'

import { useRef, useCallback } from 'react'
import { mockCategories } from "@/data/mock-categories"
import Link from "next/link"

// Подкатегории для каждой категории
const subcategories: Record<string, string[]> = {
  "auto-moto": ["Автоспорт", "Автострахование", "Выбор автомобиля, мотоцикла", "ГИБДД, Обучение, Права"],
  entertainment: ["Игры без компьютера", "Клубы, Дискотеки", "Концерты, Выставки, Спектакли", "Охота и Рыбалка"],
  plants: ["Дикая природа", "Домашние", "Комнатные растения", "Сад-Огород"],
  "beauty-health": ["Коронавирус", "Баня, Массаж, Фитнес", "Болезни, Лекарства", "Детское здоровье"],
  "family-home": ["Беременность, Роды", "Воспитание детей", "Домашняя бухгалтерия", "Домоводство"],
}

export default function CategoriesPage() {

  // Drag-to-scroll для списка категорий
  const scrollRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)
  const hasDragged = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = scrollRef.current
    if (!el) return
    isDragging.current = true
    hasDragged.current = false
    startX.current = e.pageX - el.offsetLeft
    scrollLeft.current = el.scrollLeft
    el.style.cursor = 'grabbing'
    el.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    const el = scrollRef.current
    if (!el) return
    e.preventDefault()
    const x = e.pageX - el.offsetLeft
    const walk = (x - startX.current) * 1.5
    if (Math.abs(walk) > 5) hasDragged.current = true
    el.scrollLeft = scrollLeft.current - walk
  }, [])

  const handleMouseUp = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    isDragging.current = false
    el.style.cursor = 'grab'
    el.style.removeProperty('user-select')
  }, [])

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (hasDragged.current) {
      e.preventDefault()
      e.stopPropagation()
      hasDragged.current = false
    }
  }, [])

  return (
    <div className="container">
      {/* Блок "Популярные категории" */}
      <div className="section popular-section">
        <div className="blocks_title">
          <h2>Категории</h2>
        </div>

        <div
          className="subjects_list_wrapper"
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClickCapture={handleClickCapture}
          style={{ cursor: 'grab' }}
        >
          <div className="subjects_list">
            {mockCategories.slice(0, 5).map((category) => (
              <div className="subject_item" key={category.id}>
                <div className="subject_item_icon">
                  <svg width="24" height="24" className="category_icon">
                    <use xlinkHref={`#${category.svgIcon || "gaming"}`}></use>
                  </svg>
                </div>

                <Link href={`/categories/${category.slug}`}>
                  <h3>{category.name}</h3>
                </Link>

                {/* Список подкатегорий */}
                <div className="subject_item_list">
                  {subcategories[category.slug]
                    ?.slice(0, 4)
                    .map((subcat, index) => (
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

      <div className="line"></div>

    </div>
  )
}
