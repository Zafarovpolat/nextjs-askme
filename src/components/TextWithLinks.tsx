'use client'

import type { ComponentPropsWithoutRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import '@/styles/markdown-content.css'
import { normalizeMathDelimiters } from '@/lib/normalize-math-delimiters'

interface TextWithLinksProps {
  text: string
  className?: string
}

function MarkdownLink({
  href,
  children,
  ...props
}: ComponentPropsWithoutRef<'a'>) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  )
}

/**
 * Текст вопроса/ответа/комментария: Markdown (жирный, курсив, заголовки, списки, код)
 * и формулы LaTeX ($...$, $$...$$, \\(...\\), \\[...\\]).
 * Квадратные скобки ИИ вида [ ax^2 + b = 0 ] и LaTeX \\( \\) / \\[ \\]
 * приводятся к $...$ / $$...$$ до разбора Markdown.
 * Кликабельные внешние ссылки и превью — также из полей links / files / videos (см. {@link BodyAttachments}).
 */
export default function TextWithLinks({ text, className }: TextWithLinksProps) {
  if (!text) {
    return null
  }

  const rootClassName = className
    ? `markdown-content ${className}`
    : 'markdown-content'

  const markdown = normalizeMathDelimiters(text)

  return (
    <div className={rootClassName}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a: MarkdownLink,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
