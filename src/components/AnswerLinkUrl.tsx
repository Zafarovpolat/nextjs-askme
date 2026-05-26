'use client'

import Link from 'next/link'
import { isExternalHref, displayUrlLabel } from '@/lib/external-link'
import { useExternalLink } from '@/components/ExternalLinkProvider'

const linkIcon = (
  <svg width="13" height="13" aria-hidden>
    <use xlinkHref="#answer-link" />
  </svg>
)

interface AnswerLinkUrlProps {
  href: string
  /** Если не задан — из href (хост + короткий путь) */
  label?: string
}

export default function AnswerLinkUrl({ href, label }: AnswerLinkUrlProps) {
  const { onNavigateClick } = useExternalLink()
  const text = label ?? displayUrlLabel(href)

  if (isExternalHref(href)) {
    return (
      <a href={href} className="answer_link_url" onClick={(e) => onNavigateClick(e, href)}>
        {linkIcon}
        {text}
      </a>
    )
  }
  if (href.startsWith('/') && !href.startsWith('//')) {
    return (
      <Link href={href} className="answer_link_url">
        {linkIcon}
        {text}
      </Link>
    )
  }
  return (
    <a href={href} className="answer_link_url">
      {linkIcon}
      {text}
    </a>
  )
}
