'use client'

import {
  getVimeoVideoId,
  getYouTubeVideoId,
  getYouTubeEmbedUrl,
  getVimeoEmbedUrl,
} from '@/lib/video-thumb'

export function ImageTile({ href }: { href: string }) {
  return (
    <div className="answer_media_item answer_media_item--image">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Открыть изображение в новой вкладке"
      >
        <img src={href} alt="" loading="lazy" decoding="async" />
      </a>
    </div>
  )
}

/** YouTube / Vimeo / файл (mp4, webm и т.д.). */
export function InlineVideoBlock({ href }: { href: string }) {
  const yid = getYouTubeVideoId(href)
  if (yid) {
    return (
      <div className="answer_media_item answer_media_item--inline-player">
        <div className="answer_media_frame">
          <iframe
            title="Видео"
            src={getYouTubeEmbedUrl(yid)}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          />
        </div>
      </div>
    )
  }
  const vimeoId = getVimeoVideoId(href)
  if (vimeoId) {
    return (
      <div className="answer_media_item answer_media_item--inline-player">
        <div className="answer_media_frame">
          <iframe
            title="Видео"
            src={getVimeoEmbedUrl(vimeoId)}
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture"
          />
        </div>
      </div>
    )
  }
  return (
    <div className="answer_media_item answer_media_item--inline-player answer_media_item--file-video">
      <video
        className="answer_media_inline_video"
        src={href}
        controls
        playsInline
        preload="metadata"
      />
    </div>
  )
}
