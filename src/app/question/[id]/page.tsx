import { notFound } from 'next/navigation'
import { getApiFullUrl } from '@/config/api'
import type { QuestionPageData } from '@/types'
import QuestionPageContent from './QuestionPageContent'

export default async function QuestionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const url = getApiFullUrl(`v1/questions/${id}`)
  const res = await fetch(url, { next: { revalidate: 60 } })
  if (!res.ok) {
    if (res.status === 404) notFound()
    notFound()
  }
  const data: QuestionPageData = await res.json()
  return <QuestionPageContent initialQuestion={data} />
}
