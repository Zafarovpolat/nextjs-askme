import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Footer from "@/components/layout/Footer"
import { getApiFullUrl } from "@/config/api"
import { metadataForSubcategorySlug } from "@/lib/category-page-metadata"
import {
  fetchCategoryQuestionsTabs,
  parseCategoryQuestionFilter,
  parseCategoryQuestionPage,
} from "@/lib/category-questions-tabs"
import CategoryPageClient from "../../_components/CategoryPageClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; sub: string }>
}): Promise<Metadata> {
  const { slug, sub } = await params
  return metadataForSubcategorySlug(slug, sub)
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 60 } })
  if (res.status === 404) notFound()
  if (!res.ok) throw new Error("Не удалось загрузить данные")
  return res.json()
}

export default async function SubCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; sub: string }>
  searchParams: Promise<{ filter?: string; page?: string }>
}) {
  const { slug, sub } = await params
  const query = await searchParams
  const initialFilter = parseCategoryQuestionFilter(query.filter)
  const initialPage = parseCategoryQuestionPage(query.page)
  const questionsEndpoint = `v1/category-pages/${slug}/${sub}/questions-tabs`
  const listPath = `/categories/${slug}/${sub}`

  const [data, initialByFilter] = await Promise.all([
    fetchJson(getApiFullUrl(`v1/category-pages/${slug}/${sub}`)),
    fetchCategoryQuestionsTabs(questionsEndpoint, initialFilter, initialPage),
  ])

  return (
    <>
      <CategoryPageClient
        key={`${listPath}-${initialFilter}-${initialPage}`}
        category={data.category}
        subcategory={data.subcategory}
        shared={{
          popular_categories: data.popular_categories ?? [],
          project_leaders: data.project_leaders ?? [],
          most_discussed: data.most_discussed ?? [],
          popular_topics: data.popular_topics ?? [],
        }}
        initialByFilter={initialByFilter}
        initialFilter={initialFilter}
        listPath={listPath}
      />
      <Footer />
    </>
  )
}
