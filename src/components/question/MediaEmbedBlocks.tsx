'use client'

import SiteImage from '@/components/SiteImage'
import {
  getVimeoVideoId,
  getYouTubeVideoId,
  getYouTubeEmbedUrl,
  getVimeoEmbedUrl,
} from '@/lib/video-thumb'
import { ugcExternalAnchorProps } from '@/lib/external-link'

export function ImageTile({ href }: { href: string }) {
  return (
    <div className="answer_media_item answer_media_item--image">
      <a
        href={href}
        aria-label="Открыть изображение в новой вкладке"
        {...ugcExternalAnchorProps(href)}
      >
        <SiteImage
          src={href}
          alt=""
          width={640}
          height={400}
          sizes="(max-width: 900px) 100vw, 640px"
          style={{ width: "100%", height: "auto" }}
        />
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
