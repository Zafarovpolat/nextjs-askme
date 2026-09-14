import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Footer from "@/components/layout/Footer"
import { getApiFullUrl } from "@/config/api"
import { metadataForSubcategorySlug } from "@/lib/category-page-metadata"
import {
  fetchCategoryQuestionsTabs,
  parseCategoryQuestionFilter,
  parseCategoryQuestionPage,
  parseExplicitCategoryFilter,
} from "@/lib/category-questions-tabs"
import CategoryPageClient from "../../_components/CategoryPageClient"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; sub: string }>
  searchParams: Promise<{ filter?: string; page?: string }>
}): Promise<Metadata> {
  const { slug, sub } = await params
  const query = await searchParams
  return metadataForSubcategorySlug(slug, sub, {
    filter: parseExplicitCategoryFilter(query.filter),
    page: parseCategoryQuestionPage(query.page),
  })
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
  const explicitFilter = parseExplicitCategoryFilter(query.filter)
  const initialFilter = parseCategoryQuestionFilter(query.filter)
  const initialPage = parseCategoryQuestionPage(query.page)
  const questionsEndpoint = `v1/category-pages/${slug}/${sub}/questions-tabs`
  const listPath = `/categories/${slug}/${sub}`

  const [data, initialByFilter] = await Promise.all([
    fetchJson(getApiFullUrl(`v1/category-pages/${slug}/${sub}`)),
    fetchCategoryQuestionsTabs(questionsEndpoint, explicitFilter, initialPage),
  ])

  if (data?.category?.slug !== slug || data?.subcategory?.slug !== sub) {
    notFound()
  }

  return (
    <>
      <CategoryPageClient
        key={`${listPath}-${explicitFilter ?? "all"}-${initialPage}`}
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
        explicitFilter={explicitFilter}
        initialPage={initialPage}
        listPath={listPath}
      />
      <Footer />
    </>
  )
}
