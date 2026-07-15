import Footer from "@/components/layout/Footer";
import HomeContent from "@/components/HomeContent";
import { getApiFullUrl } from "@/config/api";

async function fetchMainData() {
  const res = await fetch(getApiFullUrl("v1/main"), {
    headers: { Accept: "application/json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    return {
      categories: [],
      project_leaders: [],
      most_discussed: [],
      popular_topics: [],
    };
  }
  return res.json();
}

async function fetchMainQuestions() {
  const res = await fetch(getApiFullUrl("v1/main/questions?filter=open&page=1&per_page=10"), {
    headers: { Accept: "application/json" },
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    return {
      questions: [],
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    };
  }
  return res.json();
}

export default async function Home() {
  const [mainData, mainQuestions] = await Promise.all([
    fetchMainData(),
    fetchMainQuestions(),
  ]);

  return (
    <>
      <HomeContent initialData={mainData} initialQuestions={mainQuestions} />
      <Footer />
    </>
  );
}
