import { getApiFullUrl } from "@/config/api"
import AskPageClient, { type AskPageInitialData } from "./AskPageClient"

async function fetchAskPageData(): Promise<AskPageInitialData> {
  const url = getApiFullUrl("v1/questions?page=1&per_page=15&include=categories")
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  })
  if (!res.ok) {
    throw new Error("Не удалось загрузить данные")
  }
  const data = await res.json()
  return {
    questions: data.questions ?? [],
    project_leaders: data.project_leaders ?? [],
    most_discussed: data.most_discussed ?? [],
    popular_topics: data.popular_topics ?? [],
    categories: data.categories ?? [],
    current_page: data.current_page ?? 1,
    last_page: data.last_page ?? 1,
    per_page: data.per_page ?? 15,
    total: data.total ?? 0,
  }
}

export default async function AskPage() {
  let initialData: AskPageInitialData
  try {
    initialData = await fetchAskPageData()
  } catch {
    initialData = {
      questions: [],
      project_leaders: [],
      most_discussed: [],
      popular_topics: [],
      categories: [],
      current_page: 1,
      last_page: 1,
      per_page: 15,
      total: 0,
    }
  }
  return <AskPageClient initialData={initialData} />
}
