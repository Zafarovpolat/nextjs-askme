import { getApiFullUrl } from "@/config/api"
import { withPageUrl } from "@/lib/page-seo"
import AskPageClient, { type AskPageInitialData } from "./AskPageClient"
import type { Metadata } from "next"

export const metadata: Metadata = withPageUrl("/ask", {
  title: "Задать вопрос",
  description:
    "Задайте вопрос на otvetai и получите ответы от сообщества. Форма создания вопроса: тема, категория и текст.",
  robots: { index: true, follow: true },
})

async function fetchAskPageData(): Promise<AskPageInitialData> {
  const url = getApiFullUrl("v1/ask")
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    throw new Error("Не удалось загрузить данные")
  }
  const data = await res.json()
  return {
    project_leaders: data.project_leaders ?? [],
    most_discussed: data.most_discussed ?? [],
    popular_topics: data.popular_topics ?? [],
    categories: data.categories ?? [],
  }
}

export default async function AskPage() {
  let initialData: AskPageInitialData
  try {
    initialData = await fetchAskPageData()
  } catch {
    initialData = {
      project_leaders: [],
      most_discussed: [],
      popular_topics: [],
      categories: [],
    }
  }
  return <AskPageClient initialData={initialData} />
}
