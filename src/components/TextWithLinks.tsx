'use client'

interface TextWithLinksProps {
  text: string
  className?: string
}

/**
 * Текст вопроса/ответа: без разбора URL в строке (ссылки в тексте — обычные символы).
 * Кликабельные внешние ссылки и превью — только из полей links / files / videos (см. {@link BodyAttachments}).
 */
export default function TextWithLinks({ text, className }: TextWithLinksProps) {
  if (className) {
    return (
      <div className={className} style={{ whiteSpace: 'pre-wrap' }}>
        {text}
      </div>
    )
  }
  return <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
}
