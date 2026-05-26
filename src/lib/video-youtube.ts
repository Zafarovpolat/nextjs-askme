/** ID ролика YouTube из watch / youtu.be / embed / shorts. */
export function getYouTubeVideoId(url: string): string | null {
  try {
    const u = new URL(url.trim())
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      return id || null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname === '/watch') {
        return u.searchParams.get('v')
      }
      const embed = u.pathname.match(/^\/embed\/([^/]+)/)
      if (embed) {
        return embed[1]
      }
      const shorts = u.pathname.match(/^\/shorts\/([^/]+)/)
      if (shorts) {
        return shorts[1]
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

export function youtubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}
