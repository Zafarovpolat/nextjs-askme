import type { Metadata } from "next"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { getApiFullUrl } from "@/config/api"
import CategoryItemBg from "@/components/CategoryItemBg"
import CategorySubjectIcon from "@/components/CategorySubjectIcon"
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
                <CategorySubjectIcon
                  name={category.name}
                  slug={category.slug}
                  iconKey={category.icon_key}
                />

                {/* п.14 — title для длинных названий */}
                <Link href={`/categories/${category.slug}`} title={category.name}>
                  <h3>{category.name}</h3>
                </Link>

                <div className="subject_item_list">
                  {category.subcategories.map((sub) => (
                    <Link
                      href={`/categories/${category.slug}/${sub.slug}`}
                      key={sub.id}
                      title={sub.name}
                    >
                      <span className="subject_item_list_item">
                        <img
                          src="/images/icons/category-list-item.svg"
                          alt=""
                          title={sub.name}
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
