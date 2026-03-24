import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { getApiFullUrl } from "@/config/api"

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
        <div className="section">
          <div className="blocks_title">
            <h2>Категории</h2>
          </div>

          {error && <p className="secondary_text" style={{ color: "#c00" }}>{error}</p>}

          <div className="categories_list">
            {categories.map((category) => (
              <div className="subject_item" key={category.id}>
                <div className="subject_item_icon">
                  {category.icon_key ? (
                    <svg width="24" height="24" className="category_icon">
                      <use xlinkHref={`#${category.icon_key}`}></use>
                    </svg>
                  ) : (
                    <span className="category_icon_placeholder" aria-hidden />
                  )}
                </div>

                <Link href={`/categories/${category.slug}`}>
                  <h3>{category.name}</h3>
                </Link>

                <div className="subject_item_list">
                  {category.subcategories.map((sub) => (
                    <Link
                      href={`/categories/${category.slug}/${sub.slug}`}
                      key={sub.id}
                    >
                      <div className="subject_item_list_item">
                        <img
                          src="/images/icons/category-list-item.svg"
                          alt=""
                        />
                        <p>{sub.name}</p>
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
