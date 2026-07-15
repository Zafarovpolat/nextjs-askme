import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Footer from "@/components/layout/Footer"
import { getApiFullUrl } from "@/config/api"
import { metadataForCategorySlug } from "@/lib/category-page-metadata"
import CategoryPageClient from "../_components/CategoryPageClient"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  return metadataForCategorySlug(slug)
}

async function fetchJson(url: string) {
  const res = await fetch(url, { headers: { Accept: "application/json" }, next: { revalidate: 60 } })
  if (res.status === 404) notFound()
  if (!res.ok) throw new Error("Не удалось загрузить данные")
  return res.json()
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [data, questions] = await Promise.all([
    fetchJson(getApiFullUrl(`v1/category-pages/${slug}`)),
    fetchJson(getApiFullUrl(`v1/category-pages/${slug}/questions?filter=open&page=1&per_page=10`)),
  ])

  return (
    <>
      <CategoryPageClient
        category={data.category}
        subcategory={null}
        shared={{
          popular_categories: data.popular_categories ?? [],
          project_leaders: data.project_leaders ?? [],
          most_discussed: data.most_discussed ?? [],
          popular_topics: data.popular_topics ?? [],
        }}
        initialQuestions={questions}
        questionsEndpoint={`v1/category-pages/${slug}/questions`}
      />
      <Footer />
    </>
  )
}

