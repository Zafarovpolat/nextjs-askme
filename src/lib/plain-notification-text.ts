/**
 * Превью уведомлений: markdown/LaTeX → читаемый plain text.
 */

function latexToPlain(latex: string): string {
  let s = latex

  s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$1/$2')
  s = s.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
  s = s.replace(/\\times\b/g, '×')
  s = s.replace(/\\cdot\b/g, '·')
  s = s.replace(/\\div\b/g, '÷')
  s = s.replace(/\\pm\b/g, '±')
  s = s.replace(/\\mp\b/g, '∓')
  s = s.replace(/\\leq\b/g, '≤')
  s = s.replace(/\\geq\b/g, '≥')
  s = s.replace(/\\neq\b/g, '≠')
  s = s.replace(/\\approx\b/g, '≈')
  s = s.replace(/\\infty\b/g, '∞')
  s = s.replace(/\\pi\b/g, 'π')
  s = s.replace(/\\alpha\b/g, 'α')
  s = s.replace(/\\beta\b/g, 'β')
  s = s.replace(/\\gamma\b/g, 'γ')
  s = s.replace(/\\to\b/g, '→')
  s = s.replace(/\\rightarrow\b/g, '→')
  s = s.replace(/\\left\b/g, '')
  s = s.replace(/\\right\b/g, '')
  s = s.replace(/\\,/g, ' ')
  s = s.replace(/\\;/g, ' ')
  s = s.replace(/\\!/g, '')
  s = s.replace(/\\[a-zA-Z]+\*?/g, '')
  s = s.replace(/[{}]/g, '')
  s = s.replace(/~/g, ' ')

  return s
}

export function toPlainNotificationText(input: string, limit = 140): string {
  let s = String(input ?? '')

  // HTML на всякий случай
  s = s.replace(/<[^>]+>/g, ' ')

  // code fences / inline code
  s = s.replace(/```[\s\S]*?```/g, ' ')
  s = s.replace(/`([^`]+)`/g, '$1')

  // math blocks / inline
  s = s.replace(/\$\$([\s\S]+?)\$\$/g, (_, expr: string) => ` ${latexToPlain(expr)} `)
  s = s.replace(/\\\[([\s\S]+?)\\\]/g, (_, expr: string) => ` ${latexToPlain(expr)} `)
  s = s.replace(/\\\(([\s\S]+?)\\\)/g, (_, expr: string) => latexToPlain(expr))
  s = s.replace(/\$([^$\n]+?)\$/g, (_, expr: string) => latexToPlain(expr))

  // markdown images / links
  s = s.replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
  s = s.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')

  // headings
  s = s.replace(/^#{1,6}\s+/gm, '')

  // bold / italic / strike
  s = s.replace(/(\*\*\*|___)(.*?)\1/g, '$2')
  s = s.replace(/(\*\*|__)(.*?)\1/g, '$2')
  s = s.replace(/(~~)(.*?)\1/g, '$2')
  s = s.replace(/(\*|_)(.*?)\1/g, '$2')

  // blockquotes / lists markers
  s = s.replace(/^\s{0,3}>\s?/gm, '')
  s = s.replace(/^\s*[-*+]\s+/gm, '')
  s = s.replace(/^\s*\d+\.\s+/gm, '')

  // remaining markdown noise / leftover latex
  s = s.replace(/[*_~`#]{1,6}/g, '')
  s = latexToPlain(s)

  s = s.replace(/\s+/g, ' ').trim()

  if (limit > 0 && s.length > limit) {
    return `${s.slice(0, Math.max(0, limit - 1)).trimEnd()}…`
  }

  return s
}
