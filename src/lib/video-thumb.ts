import { getYouTubeVideoId, youtubeThumbnailUrl } from './video-youtube'

export { getYouTubeVideoId, youtubeThumbnailUrl } from './video-youtube'

const VIDEO_FILE_EXT = /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i

function pathnameOf(url: string): string {
  try {
    return new URL(url, 'https://placeholder.invalid').pathname
  } catch {
    return url
  }
}

export function isDirectVideoFileUrl(url: string): boolean {
  return VIDEO_FILE_EXT.test(pathnameOf(url))
}

export function getVimeoVideoId(url: string): string | null {
  try {
    const u = new URL(url.trim())
    if (!u.hostname.replace(/^www\./, '').endsWith('vimeo.com')) {
      return null
    }
    const m = u.pathname.match(/\/(?:video\/)?(\d+)/)
    return m ? m[1] : null
  } catch {
    return null
  }
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0`
}

export function getVimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`
}

export type VideoPlayMode =
  | { kind: 'youtube'; embedUrl: string }
  | { kind: 'vimeo'; embedUrl: string }
  | { kind: 'file'; src: string }

/** Режим встроенного просмотра: YouTube / Vimeo / прямой файл. Иначе null (открывать внешнюю ссылку). */
export function resolveVideoPlayer(url: string): VideoPlayMode | null {
  const y = getYouTubeVideoId(url)
  if (y) {
    return { kind: 'youtube', embedUrl: getYouTubeEmbedUrl(y) }
  }
  const v = getVimeoVideoId(url)
  if (v) {
    return { kind: 'vimeo', embedUrl: getVimeoEmbedUrl(v) }
  }
  if (isDirectVideoFileUrl(url)) {
    return { kind: 'file', src: url }
  }
  return null
}
