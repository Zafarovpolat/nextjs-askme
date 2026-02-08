'use client'

import { useEffect, useRef, useCallback } from 'react'

interface SharePopupProps {
  isOpen: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLButtonElement | null>
  title?: string
  description?: string
  url?: string
}

export default function SharePopup({ isOpen, onClose, anchorRef, title, description, url }: SharePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  const shareTitle = title || (typeof document !== 'undefined' ? document.title : '')
  const shareDescription = description || ''
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  // Позиционирование попапа
  const updatePosition = useCallback(() => {
    const popup = popupRef.current
    const anchor = anchorRef.current
    if (!popup || !anchor) return

    const rect = anchor.getBoundingClientRect()
    popup.style.top = `${window.scrollY + rect.bottom}px`
    popup.style.left = `${window.scrollX + rect.left}px`
  }, [anchorRef])

  useEffect(() => {
    if (!isOpen) return

    updatePosition()

    // Закрытие по клику вне попапа
    const handleClickOutside = (e: MouseEvent) => {
      const popup = popupRef.current
      const anchor = anchorRef.current
      if (!popup) return

      if (!popup.contains(e.target as Node) && e.target !== anchor && !anchor?.contains(e.target as Node)) {
        onClose()
      }
    }

    // Закрытие при ресайзе
    const handleResize = () => {
      onClose()
    }

    document.addEventListener('click', handleClickOutside, true)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen, onClose, anchorRef, updatePosition])

  if (!isOpen) return null

  const encodedTitle = encodeURIComponent(shareTitle)
  const encodedDescription = encodeURIComponent(shareDescription)
  const encodedUrl = encodeURIComponent(shareUrl)

  return (
    <div className="share-popup" ref={popupRef}>
      <div className="share-popup__inner">
        <a
          href={`https://vk.com/share.php?title=${encodedTitle}&description=${encodedDescription}&url=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          title="VK"
        >
          <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M475.515,137.899c3.16-10.674,0-18.53-15.2-18.53h-50.297c-12.809,0-18.702,6.746-21.861,14.261 c0,0-25.617,62.422-61.825,102.899c-11.698,11.699-17.078,15.457-23.482,15.457c-3.158,0-8.027-3.758-8.027-14.432v-99.655 c0-12.809-3.588-18.53-14.176-18.53h-79.075c-8.027,0-12.809,5.978-12.809,11.528c0,12.125,18.104,14.943,19.983,49.101v74.123 c0,16.225-2.904,19.212-9.308,19.212c-17.079,0-58.581-62.678-83.174-134.409c-4.952-13.919-9.821-19.555-22.715-19.555H43.25 c-14.346,0-17.25,6.746-17.25,14.261c0,13.32,17.079,79.502,79.502,166.945c41.587,59.689,100.167,92.056,153.453,92.056 c32.022,0,35.951-7.173,35.951-19.555c0-57.045-2.903-62.425,13.152-62.425c7.428,0,20.237,3.757,50.127,32.534 c34.155,34.158,39.792,49.445,58.92,49.445h50.297c14.347,0,21.606-7.173,17.421-21.351 c-9.564-29.801-74.208-91.114-77.111-95.213c-7.429-9.564-5.295-13.835,0-22.375 C407.799,253.608,469.195,167.189,475.515,137.899L475.515,137.899z" style={{ fill: '#5181B8' }} />
          </svg>
        </a>

        <a
          href={`https://connect.ok.ru/dk?st.cmd=WidgetSharePreview&st.shareUrl=${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          title="OK"
        >
          <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M359.338,325.984c-24.609,15.628-58.469,21.824-80.834,24.16l18.771,18.502l68.529,68.529 c25.059,25.688-15.719,65.835-41.045,41.046c-17.154-17.425-42.305-42.573-68.53-68.799l-68.529,68.709 c-25.328,24.7-66.104-15.809-40.776-41.047c17.424-17.425,42.303-42.572,68.529-68.528l18.502-18.502 c-22.094-2.336-56.493-8.174-81.373-24.158c-29.28-18.863-42.123-29.91-30.807-52.993c6.646-13.113,24.878-24.16,49.039-5.119 c0,0,32.603,25.956,85.235,25.956c52.631,0,85.234-25.956,85.234-25.956c24.16-18.952,42.303-7.994,49.039,5.119 C401.463,295.986,388.619,307.033,359.338,325.984L359.338,325.984z M139.47,142.491c0-64.397,52.362-116.49,116.491-116.49 s116.49,52.093,116.49,116.49c0,64.129-52.361,116.221-116.49,116.221S139.47,206.62,139.47,142.491L139.47,142.491z M198.749,142.491c0,31.525,25.687,57.212,57.212,57.212c31.523,0,57.213-25.687,57.213-57.212 c0-31.795-25.689-57.481-57.213-57.481C224.435,85.01,198.749,110.696,198.749,142.491z" style={{ fill: '#FF7E00' }} />
          </svg>
        </a>

        <a
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Telegram"
        >
          <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M477,43.86,13.32,223.29a5.86,5.86,0,0,0-.8.38c-3.76,2.13-30,18.18,7,32.57l.38.14,110.41,35.67a6.08,6.08,0,0,0,5.09-.62L409.25,120.57a6,6,0,0,1,2.2-.83c3.81-.63,14.78-1.81,7.84,7-7.85,10-194.9,177.62-215.66,196.21a6.3,6.3,0,0,0-2.07,4.17l-9.06,108a7.08,7.08,0,0,0,2.83,5.67,6.88,6.88,0,0,0,8.17-.62l65.6-58.63a6.09,6.09,0,0,1,7.63-.39l114.45,83.1.37.25c2.77,1.71,32.69,19.12,41.33-19.76l79-375.65c.11-1.19,1.18-14.27-8.17-22-9.82-8.08-23.72-4-25.81-3.56A6,6,0,0,0,477,43.86Z" style={{ fill: '#009eeb' }} />
          </svg>
        </a>

        <a
          href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          title="WhatsApp"
        >
          <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M500.4,241.8c-0.6,63.4-16.9,113-50.8,156.1c-36.4,46.3-83.8,75.7-141.8,87.6 c-44.8,9.1-88.4,5.1-131.2-10.4c-9.5-3.5-18.8-7.6-27.7-12.5c-2.7-1.5-5-1.7-8-0.7c-40.5,13.1-81.1,26.1-121.7,39 c-1.8,0.6-4.2,2.3-5.6,1c-1.6-1.6,0.4-4,1-5.9c8.1-24.1,16.2-48.3,24.4-72.4c5-14.7,9.8-29.3,15-43.9c1.4-3.8,0.9-6.7-1.2-10.2 c-10.3-17.6-17.9-36.4-23.3-56.1c-10.1-37-11.2-74.4-3.3-111.8c8.6-40.8,26.6-77.2,54.3-108.6c33.5-38,74.8-63.1,123.9-75.2 c31.3-7.7,62.9-8.9,94.7-3.7c41.6,6.8,79.1,23.3,111.8,49.9c34,27.7,58.8,62.1,74.4,103.4C493.9,189.7,500.7,226.2,500.4,241.8z M74.6,441.5c24.8-8,48.5-15.6,72-23.3c3.1-1,5.6-0.8,8.3,1c9,6,18.7,10.8,28.7,15c32.5,13.8,66.3,18.8,101.2,14.3 c42.8-5.5,80.4-22.7,112-52.6c39.8-37.7,61.1-83.9,63-138.5c1.8-53.5-15.4-100.5-51.3-140.4c-34.1-37.9-76.9-59.5-127.4-64.9 c-43.9-4.7-85,4.8-123,27.6c-32.5,19.6-57.4,46.3-74.7,80c-19.1,37.1-25.6,76.5-20.1,117.8c4.1,31.2,15.3,59.9,33.3,85.7 c2,2.9,2.6,5.3,1.4,8.7c-3.7,10.2-7,20.5-10.5,30.7C83.3,415.2,79.2,427.8,74.6,441.5z" fill="#51C85D" />
            <path d="M141,194.7c0.5-23.8,8.9-41.5,24.8-55.6c5.1-4.6,11.4-6.6,18.5-5.6c3,0.4,6,0.7,9,0.5 c5.6-0.3,9.4,2.4,11.3,7.3c6.7,17.4,13.2,34.8,19.7,52.3c2.2,6-1.6,10.7-4.8,15c-3.7,5.1-8.2,9.6-12.6,14.1 c-4.5,4.6-5.1,7.2-2,12.8c18.1,32.9,43.5,58.2,78,73.8c1.2,0.5,2.4,1.2,3.6,1.8c4.6,2.1,8.7,1.6,12.2-2.4 c6.4-7.5,13.4-14.4,19.3-22.3c3.9-5.2,6.6-6.1,12.5-3.5c17.6,7.6,34.1,17.2,50.9,26.5c3.1,1.7,4.2,4.3,4.1,7.9 c-0.9,29.5-17.8,44.9-47.5,51.7c-14.4,3.3-27.7-0.3-40.9-5.1c-27.7-10-54.4-21.8-76.8-41.6c-17.8-15.8-33.5-33.4-46.8-53.1 c-10.2-15.2-20.8-30.1-26.7-47.8C143.4,212,140.9,202.4,141,194.7z" fill="#51C85D" />
          </svg>
        </a>

        <a
          href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Twitter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">
            <path d="M 5.9199219 6 L 20.582031 27.375 L 6.2304688 44 L 9.4101562 44 L 21.986328 29.421875 L 31.986328 44 L 44 44 L 28.681641 21.669922 L 42.199219 6 L 39.029297 6 L 27.275391 19.617188 L 17.933594 6 L 5.9199219 6 z M 9.7167969 8 L 16.880859 8 L 40.203125 42 L 33.039062 42 L 9.7167969 8 z" />
          </svg>
        </a>
      </div>
    </div>
  )
}
