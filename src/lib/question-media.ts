import {
  getVimeoVideoId,
  getYouTubeVideoId,
  isDirectVideoFileUrl,
} from '@/lib/video-thumb'

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|svg|bmp)(\?[^#]*)?(#.*)?$/i

export function pathnameOf(url: string): string {
  try {
    return new URL(url, 'https://placeholder.invalid').pathname
  } catch {
    return url
  }
}

export function isImageFileUrl(url: string): boolean {
  return IMAGE_EXT.test(pathnameOf(url))
}

/** YouTube / Vimeo / прямой файл — можно встроить плеером. */
export function isEmbeddableVideoUrl(url: string): boolean {
  return (
    !!getYouTubeVideoId(url) ||
    !!getVimeoVideoId(url) ||
    isDirectVideoFileUrl(url)
  )
}
