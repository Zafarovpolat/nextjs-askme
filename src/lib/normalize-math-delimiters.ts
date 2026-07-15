/**
 * Подготовка LaTeX перед react-markdown + remark-math.
 *
 * remark-math понимает только $...$ / $$...$$, а ИИ часто отдаёт \( \), \[ \],
 * «голые» скобки, теги [/math], вложенные $, кириллицу в индексах и цены ($5).
 */

const PROTECT = '\uE000'
const CYRILLIC_RE = /[\u0400-\u04FF]/

const LATEX_INLINE_DELIMITER = /\\{1,2}\(([^\n]+?)\\{1,2}\)/g
/** Не трогаем \[4pt] — перенос строки в align/gather */
const LATEX_DISPLAY_DELIMITER = /\\{1,2}\[(?!\\d+pt\])([\s\S]+?)\\{1,2}\]/g

const CUSTOM_MATH_TAGS: Array<{ pattern: RegExp; display: boolean }> = [
  { pattern: /\[\/math\]([\s\S]*?)\[\/math\]/gi, display: true },
  { pattern: /\[\/inline\]([\s\S]*?)\[\/inline\]/gi, display: false },
  { pattern: /\[math\]([\s\S]*?)\[\/math\]/gi, display: true },
  { pattern: /\[inline\]([\s\S]*?)\[\/inline\]/gi, display: false },
  { pattern: /<<math>>([\s\S]*?)<<\/math>>/gi, display: true },
  { pattern: /<<inline>>([\s\S]*?)<<\/inline>>/gi, display: false },
]

const LATEX_ENV_BLOCK =
  /(\\begin\{(equation\*?|align\*?|gather\*?|multline\*?|cases|matrix|pmatrix|bmatrix|vmatrix)\}[\s\S]*?\\end\{\1\})/g

const CURRENCY_DOLLAR = /(^|[^\\$])((?:\\\\)*)\$(?=\d)/g

function protectVerbatimRegions(text: string): { text: string; slots: Map<string, string> } {
  const slots = new Map<string, string>()
  let counter = 0

  const out = text.replace(/```[\s\S]*?```|`[^`\n]+`/g, (match) => {
    const key = `${PROTECT}${counter++}${PROTECT}`
    slots.set(key, match)
    return key
  })

  return { text: out, slots }
}

function restoreVerbatimRegions(text: string, slots: Map<string, string>): string {
  let result = text
  for (const [key, value] of slots) {
    result = result.split(key).join(value)
  }
  return result
}

function hasLatexMathSignals(inner: string): boolean {
  const trimmed = inner.trim()
  if (!trimmed) {
    return false
  }

  if (/\\(?:begin|end|frac|sqrt|sum|int|prod|lim|left|right|mathbf|mathrm|text|cdot|times|leq|geq|neq|approx|alpha|beta|gamma|delta|pi|infty|nabla|partial|hbar)/i.test(trimmed)) {
    return true
  }
  if (/\\[a-zA-Z]+/.test(trimmed)) {
    return true
  }
  if (/[\^_]/.test(trimmed)) {
    return true
  }
  if (/[=<>≤≥≠≈]/.test(trimmed) && /[a-zA-Z0-9\\]/.test(trimmed)) {
    return true
  }
  if (/\d/.test(trimmed) && /[+\-*/=^]/.test(trimmed)) {
    return true
  }

  return false
}

/** Русский текст между ложными $...$ без LaTeX — не формула */
function isCyrillicProseWithoutMath(inner: string): boolean {
  const trimmed = inner.trim()
  if (!trimmed || !CYRILLIC_RE.test(trimmed)) {
    return false
  }

  if (hasLatexMathSignals(trimmed)) {
    return false
  }

  const cyrillicCount = (trimmed.match(/[\u0400-\u04FF]/gu) ?? []).length
  const latinCount = (trimmed.match(/[a-zA-Z]/g) ?? []).length

  return cyrillicCount > 0 && cyrillicCount >= latinCount
}

function looksLikeMath(inner: string): boolean {
  const trimmed = inner.trim()
  if (!trimmed) {
    return false
  }

  if (isCyrillicProseWithoutMath(trimmed)) {
    return false
  }

  if (/\\(?:begin|end|frac|sqrt|sum|int|prod|lim|left|right|mathbf|mathrm|text|cdot|times|leq|geq|neq|approx|alpha|beta|gamma|delta|pi|infty|nabla|partial|hbar)/i.test(trimmed)) {
    return true
  }
  if (/\\[a-zA-Z]+/.test(trimmed)) {
    return true
  }
  if (/[\^_]/.test(trimmed)) {
    return true
  }
  if (/[=<>≤≥≠≈]/.test(trimmed) && /[a-zA-Z0-9\\]/.test(trimmed)) {
    return true
  }
  if (/\\frac|\\sqrt|\\cdot|\\times|\\leq|\\geq|\\pi|\\lim/.test(trimmed)) {
    return true
  }
  if (
    /=/.test(trimmed) &&
    /[a-zA-Z]/.test(trimmed) &&
    /^[\s.a-zA-Z0-9+\-*/=(){}|,π'!?^\\]+$/.test(trimmed)
  ) {
    return true
  }

  return false
}

/** ИИ вставляет $...$ вокруг LaTeX-команд вместо скобок: \Psi$\mathbf{r}, t$ */
function fixAiInnerDollarFragments(text: string): string {
  let result = text
  let prev = ''
  while (result !== prev) {
    prev = result
    result = result.replace(/\$\\[a-zA-Z]+[^$\n]*?\$/g, (match) => `(${match.slice(1, -1)})`)
    result = result.replace(/\\left\$(.+?)\$\s*\\right/g, (_match, inner: string) => `\\left(${inner})\\right`)
  }
  return result
}

function stripOrphanTrailingDisplayDollars(text: string): string {
  const opens = (text.match(/\$\$/g) ?? []).length
  if (opens % 2 === 0) {
    return text
  }
  return text.replace(/\$\$[\s]*$/g, '')
}

function lineHasExistingMathDelimiters(line: string): boolean {
  if (/\\\([\s\S]*?\\\)/.test(line)) {
    return true
  }
  if (/\\\[[\s\S]*?\\\]/.test(line)) {
    return true
  }
  if (/\$\$[\s\S]+?\$\$/.test(line)) {
    return true
  }
  if (/(?<!\$)\$(?!\$)([^$\n]|\\.)+?\$(?!\$)/.test(line)) {
    return true
  }
  return false
}

function countSingleDollars(line: string): number {
  let count = 0
  for (let i = 0; i < line.length; i += 1) {
    if (line[i] !== '$') {
      continue
    }
    if (i > 0 && line[i - 1] === '\\') {
      continue
    }
    if (line[i + 1] === '$') {
      i += 1
      continue
    }
    if (i > 0 && line[i - 1] === '$') {
      continue
    }
    count += 1
  }
  return count
}

function findLatexStartInLine(line: string): number {
  const match = line.match(
    /\\(?:frac|sum|int|sqrt|nabla|Psi|hat|left|mathbf|partial|hbar|zeta|xi|chi)|(?<![A-Za-z0-9$])[A-Za-z]\s*=\s*(?:\\|[A-Za-z0-9])/,
  )
  return match?.index ?? -1
}

/** ИИ: одна $ в конце (F=G\frac{}{r^2}$) или в начале без закрытия */
function fixUnbalancedSingleDollarsPerLine(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const count = countSingleDollars(line)
      if (count === 0 || count % 2 === 0) {
        return line
      }

      const firstDollar = line.indexOf('$')
      const lastDollar = line.lastIndexOf('$')

      if (count === 1 && lastDollar > firstDollar && line.endsWith('$')) {
        const latexStart = findLatexStartInLine(line.slice(0, lastDollar))
        if (latexStart >= 0 && latexStart < lastDollar) {
          return `${line.slice(0, latexStart)}$${line.slice(latexStart, lastDollar)}$${line.slice(lastDollar + 1)}`
        }
      }

      if (count === 1 && firstDollar >= 0) {
        const afterOpen = line.slice(firstDollar + 1)
        const proseTail = afterOpen.match(/(\s*\([^)]*[\u0400-\u04FF][^)]*\)\s*)$/)
        if (proseTail && proseTail.index != null && proseTail.index > 0) {
          const mathPart = afterOpen.slice(0, proseTail.index).trimEnd()
          if (hasLatexMathSignals(mathPart)) {
            return `${line.slice(0, firstDollar + 1)}${mathPart}$${proseTail[1]}`
          }
        }
        if (!line.trimEnd().endsWith('$')) {
          return `${line}$`
        }
      }

      return line
    })
    .join('\n')
}

/** \frac{\n\sum T}{n} → \frac{\sum T}{n} */
function collapseBrokenMathNewlines(text: string): string {
  let result = text
  result = result.replace(/\\frac\{\s*\n+\s*/g, '\\frac{')
  result = result.replace(/\}\s*\n+\s*\{/g, '}{')
  return result
}

/** Строки с LaTeX без внешних $...$ / $$...$$ (типично после fixAiInnerDollarFragments) */
function wrapBareLatexEquationLines(text: string): string {
  return text
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('$') || /^#{1,6}\s/.test(trimmed)) {
        return line
      }

      if (lineHasExistingMathDelimiters(trimmed)) {
        return line
      }

      const withoutOrphanDollars = stripOrphanTrailingDisplayDollars(trimmed)
      if (!hasLatexMathSignals(withoutOrphanDollars)) {
        return line
      }

      if (isCyrillicProseWithoutMath(withoutOrphanDollars)) {
        return line
      }

      const displayStart = withoutOrphanDollars.search(/\\(?:int|oint|sum|prod|begin)(?![a-zA-Z])/)
      if (displayStart > 0 && CYRILLIC_RE.test(withoutOrphanDollars.slice(0, displayStart))) {
        const prose = withoutOrphanDollars.slice(0, displayStart).trim()
        const latex = withoutOrphanDollars.slice(displayStart).trim()
        if (latex) {
          const wrapped = toDisplayMath(latex)
          return prose ? `${prose}\n\n${wrapped}` : wrapped
        }
      }

      if (/^\\(?:int|oint|sum|prod|begin)(?![a-zA-Z])/.test(withoutOrphanDollars)) {
        return toDisplayMath(withoutOrphanDollars)
      }

      if (/\\[a-zA-Z]+/.test(withoutOrphanDollars) && /[=^\\]/.test(withoutOrphanDollars)) {
        return toInlineMath(withoutOrphanDollars)
      }

      return line
    })
    .join('\n')
}

function cleanInnerMathDollars(inner: string): string {
  return fixAiInnerDollarFragments(inner).replace(/\$/g, '')
}

function findMatchingBrace(s: string, openIdx: number): number {
  if (s[openIdx] !== '{') {
    return openIdx
  }

  let depth = 0
  for (let j = openIdx; j < s.length; j += 1) {
    if (s[j] === '{') {
      depth += 1
    } else if (s[j] === '}') {
      depth -= 1
      if (depth === 0) {
        return j
      }
    }
  }

  return s.length - 1
}

function wrapStandaloneCyrillicRuns(inner: string): string {
  let out = ''
  let i = 0

  while (i < inner.length) {
    const cmdMatch = inner.slice(i).match(/^\\(text|mathrm|mathit|mathbf|mbox)\{/)
    if (cmdMatch) {
      const braceStart = i + cmdMatch[0].length - 1
      const braceEnd = findMatchingBrace(inner, braceStart)
      out += inner.slice(i, braceEnd + 1)
      i = braceEnd + 1
      continue
    }

    const cyrMatch = inner.slice(i).match(/^[\u0400-\u04FF]+/u)
    if (cyrMatch) {
      out += `\\text{${cyrMatch[0]}}`
      i += cyrMatch[0].length
      continue
    }

    out += inner[i]
    i += 1
  }

  return out
}

/** KaTeX strict mode не принимает кириллицу в math mode — оборачиваем в \\text{...} */
function wrapCyrillicInMath(inner: string): string {
  if (!CYRILLIC_RE.test(inner)) {
    return inner
  }

  let result = inner

  result = result.replace(/(_|\^)\{([^{}]*)\}/g, (match, op: string, content: string) => {
    if (!CYRILLIC_RE.test(content) || content.includes('\\text{')) {
      return match
    }
    return `${op}{\\text{${content}}}`
  })

  result = result.replace(/(_|\^)([\u0400-\u04FF]+)/gu, (_match, op: string, word: string) => {
    return `${op}{\\text{${word}}}`
  })

  result = wrapStandaloneCyrillicRuns(result)

  return result
}

function prepareMathInner(inner: string): string {
  return wrapCyrillicInMath(cleanInnerMathDollars(inner.trim()))
}

function toInlineMath(inner: string): string {
  if (isCyrillicProseWithoutMath(inner)) {
    return inner.trim()
  }
  return `$${prepareMathInner(inner)}$`
}

function toDisplayMath(inner: string): string {
  if (isCyrillicProseWithoutMath(inner)) {
    return inner.trim()
  }
  const trimmed = prepareMathInner(inner)
  if (trimmed.includes('\n')) {
    return `$$\n${trimmed}\n$$`
  }
  return `$$${trimmed}$$`
}

/** \( \) / \[ \] и двойное экранирование \\( \\) */
function rewriteLatexBracketDelimiters(text: string): string {
  return text
    .replace(LATEX_INLINE_DELIMITER, (_, body: string) => toInlineMath(body))
    .replace(LATEX_DISPLAY_DELIMITER, (_, body: string) => toDisplayMath(body))
}

/** Теги [/math], [math], <<math>> и т.п. */
function rewriteCustomMathTags(text: string): string {
  let result = text
  for (const { pattern, display } of CUSTOM_MATH_TAGS) {
    result = result.replace(pattern, (_, body: string) =>
      display ? toDisplayMath(body) : toInlineMath(body),
    )
  }
  return result
}

/** \begin{align}...\end{align} без внешних $$ */
function wrapLatexEnvironments(text: string): string {
  return text.replace(
    LATEX_ENV_BLOCK,
    (match, _block: string, _env: string, offset: number, full: string) => {
      const before = offset > 0 ? full[offset - 1] : ''
      const after = full[offset + match.length] ?? ''
      if (before === '$' || after === '$') {
        return match
      }
      return toDisplayMath(match)
    },
  )
}

/** ИИ без бэкслэшей: [ ax^2 + b = 0 ] и многострочные [ \n ... \n ] */
function rewriteBareBracketDelimiters(text: string): string {
  let result = text

  result = result.replace(/\[\s*\n([\s\S]*?)\n\s*\]/g, (match, inner: string) => {
    const trimmed = inner.trim()
    if (!trimmed || !looksLikeMath(trimmed)) {
      return match
    }
    return toDisplayMath(trimmed)
  })

  result = result.replace(/\[([^\]\n]+)\](?!\()/g, (match, inner: string) => {
    const trimmed = inner.trim()
    if (!trimmed || !looksLikeMath(trimmed)) {
      return match
    }
    return toInlineMath(trimmed)
  })

  result = result.replace(/(?<![\\a-zA-Z])\(\s*([^()\n]*\\[a-zA-Z][^()\n]*)\s*\)/g, (match, inner: string) => {
    const trimmed = inner.trim()
    if (!trimmed || !looksLikeMath(trimmed)) {
      return match
    }
    const withoutText = trimmed.replace(/\\text\{[^{}]*\}/g, '').trim()
    if (!withoutText || !hasLatexMathSignals(withoutText)) {
      return match
    }
    return toInlineMath(trimmed)
  })

  return result
}

/** Однострочные $$x$$ от ИИ → inline $x$ */
function normalizeInlineDoubleDollars(text: string): string {
  return text.replace(/(?<!\$)\$\$([^$\n]+?)\$\$(?!\$)/g, (_, inner: string) => toInlineMath(inner))
}

/** Уже оформленные $...$ / $$...$$ — кириллица и вложенные $ */
function sanitizeExistingDollarMath(text: string): string {
  let result = text

  result = result.replace(/\$\$([\s\S]*?)\$\$/g, (_, inner: string) => toDisplayMath(inner))
  result = result.replace(/(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g, (_, inner: string) => toInlineMath(inner))

  return result
}

/** $5, $10 — не формулы (remark-math singleDollarTextMath: true).
 *  Не трогаем уже оформленные $...$ / $$...$$ (иначе $1.8^\circ ломается в \$1.8). */
function escapeCurrencyDollars(text: string): string {
  const slots = new Map<string, string>()
  let counter = 0

  let protectedText = text.replace(/\$\$[\s\S]*?\$\$/g, (match) => {
    const key = `${PROTECT}D${counter++}${PROTECT}`
    slots.set(key, match)
    return key
  })

  protectedText = protectedText.replace(/(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g, (match) => {
    const key = `${PROTECT}I${counter++}${PROTECT}`
    slots.set(key, match)
    return key
  })

  protectedText = protectedText.replace(CURRENCY_DOLLAR, '$1$2\\$')

  return restoreVerbatimRegions(protectedText, slots)
}

/** ИИ: «\30» вместо «30» (бэкслэш перед числом не LaTeX-команда). */
function stripErrantBackslashBeforeDigits(text: string): string {
  return text.replace(/\\(\d+)/g, '$1')
}

/**
 * ИИ: $24^\circ \text{C}. Русский текст дальше ещё формула$
 * → $24^\circ \text{C}$. Русский текст дальше ещё $формула$
 */
function splitInlineMathWithEmbeddedCyrillicProse(text: string): string {
  return text.replace(/(?<!\$)\$(?!\$)([^$\n]+?)\$(?!\$)/g, (match, inner: string) => {
    if (!CYRILLIC_RE.test(inner) || !hasLatexMathSignals(inner)) {
      return match
    }

    // Точка/конец предложения после math-хвоста, дальше кириллица
    const punctMatch = inner.match(
      /((?:\\circ|\\text\{[^}]*\}|\\mathrm\{[^}]*\}|[A-Za-z0-9}\)]))\s*([.!?])\s+(?=[\u0400-\u04FF])/u,
    )
    if (!punctMatch || punctMatch.index == null) {
      return match
    }

    const mathEnd = punctMatch.index + punctMatch[1].length
    const punct = punctMatch[2]
    const mathPart = inner.slice(0, mathEnd).trimEnd()
    const afterPunct = inner.slice(mathEnd).replace(/^\s*[.!?]\s*/, '')
    if (!mathPart || !hasLatexMathSignals(mathPart)) {
      return match
    }

    // Хвост вида «… выше 30^\circ \text{C}» — снова обернуть формулу в $
    const wrappedRest = afterPunct.replace(
      /^(.*?)(\d+(?:\.\d+)?\s*(?:\^\\circ|\\circ)(?:\s*\\(?:text|mathrm)\{[^}]*\})?)\s*$/u,
      (_m, prose: string, mathTail: string) => `${prose}${toInlineMath(mathTail.trim())}`,
    )

    return `${toInlineMath(mathPart)}${punct} ${wrappedRest.trimStart()}`.replace(/\s+$/u, '')
  })
}

export function normalizeMathDelimiters(text: string): string {
  const { text: protectedText, slots } = protectVerbatimRegions(text)
  let result = protectedText

  result = stripErrantBackslashBeforeDigits(result)
  result = fixAiInnerDollarFragments(result)
  result = collapseBrokenMathNewlines(result)
  result = rewriteCustomMathTags(result)
  result = rewriteLatexBracketDelimiters(result)
  result = wrapLatexEnvironments(result)
  result = rewriteBareBracketDelimiters(result)
  result = normalizeInlineDoubleDollars(result)
  result = fixUnbalancedSingleDollarsPerLine(result)
  result = wrapBareLatexEquationLines(result)
  result = splitInlineMathWithEmbeddedCyrillicProse(result)
  result = sanitizeExistingDollarMath(result)
  result = escapeCurrencyDollars(result)

  return restoreVerbatimRegions(result, slots)
}
