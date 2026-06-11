import type { Metadata } from "next"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { getApiFullUrl } from "@/config/api"
import CategoryItemBg from "@/components/CategoryItemBg"
import { metadataForCategoriesIndex } from "@/lib/category-page-metadata"

export const metadata: Metadata = metadataForCategoriesIndex()

type Subcategory = { id: number; name: string; slug: string; icon_key: string | null }
type CategoryItem = { id: number; name: string; slug: string; icon_key: string | null; subcategories: Subcategory[] }

async function fetchCategories(): Promise<CategoryItem[]> {
  const url = getApiFullUrl("v1/categories")
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    throw new Error("Не удалось загрузить категории")
  }
  return res.json()
}

export default async function CategoriesPage() {
  let categories: CategoryItem[] = []
  let error: string | null = null

  try {
    categories = await fetchCategories()
  } catch (e) {
    error = e instanceof Error ? e.message : "Не удалось загрузить категории"
  }

  return (
    <>
      <Header />
      <div className="container">
        <div className="breadcrumbs">
          <Link href="/" className="breadcrumbs__link">Главная</Link>
          <span className="breadcrumbs__sep">•</span>
          <span className="breadcrumbs__current">Категории вопросов</span>
        </div>

        <div className="section">
          <div className="blocks_title">
            <h2>Категории</h2>
          </div>

          {error && <p className="secondary_text" style={{ color: "#c00" }}>{error}</p>}

          <div className="categories_list">
            {categories.map((category) => (
              <CategoryItemBg key={category.id}>
                <div className="subject_item_icon">
                  {category.icon_key ? (
                    <svg width="24" height="24" className="category_icon">
                      <use xlinkHref={`#${category.icon_key}`}></use>
                    </svg>
                  ) : (
                    <span className="category_icon_placeholder" aria-hidden />
                  )}
                </div>

                {/* п.14 — title для длинных названий */}
                <Link href={`/categories/${category.slug}`} title={category.name}>
                  <h3>{category.name}</h3>
                </Link>

                <div className="subject_item_list">
                  {category.subcategories.map((sub) => (
                    <Link
                      href={`/categories/${category.slug}/${sub.slug}`}
                      key={sub.id}
                    >
                      <span className="subject_item_list_item">
                        <img
                          src="/images/icons/category-list-item.svg"
                          alt=""
                        />
                        <span title={sub.name}>{sub.name}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </CategoryItemBg>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
