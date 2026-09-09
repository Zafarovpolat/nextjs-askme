'use client'

import { createElement, type ComponentPropsWithoutRef, type JSX } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import '@/styles/markdown-content.css'
import { normalizeMathDelimiters } from '@/lib/normalize-math-delimiters'
import { ugcExternalAnchorProps } from '@/lib/external-link'
import { useExternalLink } from '@/components/ExternalLinkProvider'

interface TextWithLinksProps {
  text: string
  className?: string
}

type WithMarkdownNode<P> = P & { node?: unknown }

function omitMarkdownNode<P extends object>({ node: _node, ...props }: WithMarkdownNode<P>) {
  return props
}

function mdTag<T extends keyof JSX.IntrinsicElements>(tag: T) {
  return function MarkdownTag(props: WithMarkdownNode<JSX.IntrinsicElements[T]>) {
    return createElement(tag, omitMarkdownNode(props))
  }
}

const MARKDOWN_TAGS = [
  'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'em', 'strong', 'hr', 'br', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'del', 'sup', 'sub', 'span', 'div',
] as const

function MarkdownLink({
  href,
  children,
  onClick,
  node: _node,
  ...props
}: WithMarkdownNode<ComponentPropsWithoutRef<'a'>>) {
  const { onNavigateClick } = useExternalLink()
  return (
    <a
      {...props}
      href={href}
      {...ugcExternalAnchorProps(href)}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented && href) {
          onNavigateClick(e, href)
        }
      }}
    >
      {children}
    </a>
  )
}

const markdownComponents: Components = {
  ...(Object.fromEntries(MARKDOWN_TAGS.map((tag) => [tag, mdTag(tag)])) as Components),
  a: MarkdownLink,
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
        rehypePlugins={[[rehypeKatex, { strict: 'ignore' }]]}
        components={markdownComponents}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
