import { getApiFullUrl } from "@/config/api"
import AskPageClient, { type AskPageInitialData } from "./AskPageClient"

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
