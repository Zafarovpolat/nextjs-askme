'use client'

import AnswerLinkUrl from '@/components/AnswerLinkUrl'
import { ImageTile, InlineVideoBlock } from '@/components/question/MediaEmbedBlocks'
import { displayUrlLabel } from '@/lib/external-link'
import { isEmbeddableVideoUrl, isImageFileUrl } from '@/lib/question-media'

function fileDisplayName(href: string): string {
  try {
    const u = new URL(
      href,
      typeof window !== 'undefined' ? window.location.origin : 'https://local.test',
    )
    const seg = u.pathname.split('/').filter(Boolean).pop()
    return seg || displayUrlLabel(href)
  } catch {
    return href.slice(-48)
  }
}

export default function BodyAttachments({
  files = [],
  videos = [],
  links = [],
}: {
  files?: string[]
  videos?: string[]
  links?: string[]
}) {
  const file0 = files.slice(0, 1)[0]
  const video0 = videos.slice(0, 1)[0]
  const link0 = links.slice(0, 1)[0]

  const photoUrl = file0 && isImageFileUrl(file0) ? file0 : undefined

  const videoFromVideosField =
    video0 && isEmbeddableVideoUrl(video0) ? video0 : undefined
  const videoFromFile =
    file0 && !photoUrl && isEmbeddableVideoUrl(file0) && !videoFromVideosField
      ? file0
      : undefined
  const videoUrl = videoFromVideosField ?? videoFromFile

  const fileRowHref =
    file0 &&
    !photoUrl &&
    !(
      isEmbeddableVideoUrl(file0) &&
      (videoFromVideosField !== undefined || videoUrl === file0)
    )
      ? file0
      : undefined

  const hasUrlRows = Boolean(link0 || fileRowHref)
  const hasMedia = Boolean(photoUrl || videoUrl)

  if (!hasUrlRows && !hasMedia) {
    return null
  }

  return (
    <>
      {link0 ? <AnswerLinkUrl key={`link-${link0}`} href={link0} /> : null}
      {fileRowHref ? (
        <AnswerLinkUrl
          key={`file-${fileRowHref}`}
          href={fileRowHref}
          label={fileDisplayName(fileRowHref)}
        />
      ) : null}
      {hasMedia ? (
        <div className="answer_media" style={{ marginTop: 15 }}>
          {photoUrl ? <ImageTile key={`img-${photoUrl}`} href={photoUrl} /> : null}
          {videoUrl ? (
            <InlineVideoBlock key={`vid-${videoUrl}`} href={videoUrl} />
          ) : null}
        </div>
      ) : null}
    </>
  )
}
