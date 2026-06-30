'use client'

import { useEffect, useLayoutEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import SharePopupPanel from '@/components/SharePopupPanel'

interface SharePopupProps {
  isOpen: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLButtonElement | null>
  title?: string
  url?: string
}

function computeDocumentPosition(popup: HTMLElement, anchor: HTMLElement) {
  const margin = 8
  const viewportWidth = window.visualViewport?.width ?? window.innerWidth
  const rect = anchor.getBoundingClientRect()
  const popupWidth = popup.offsetWidth
  const anchorCenterX = rect.left + rect.width / 2

  const card = anchor.closest('.question_list_item') as HTMLElement | null
  const bounds = card
    ? card.getBoundingClientRect()
    : { left: margin, right: viewportWidth - margin }

  const boundsCenter = (bounds.left + bounds.right) / 2

  let leftViewport: number
  if (popupWidth >= bounds.right - bounds.left) {
    leftViewport = bounds.left
  } else if (anchorCenterX >= boundsCenter) {
    leftViewport = rect.right - popupWidth
  } else {
    leftViewport = rect.left
  }

  leftViewport = Math.max(leftViewport, bounds.left)
  leftViewport = Math.min(leftViewport, bounds.right - popupWidth)

  return {
    top: window.scrollY + rect.bottom + 6,
    left: window.scrollX + leftViewport,
  }
}

export default function SharePopup({ isOpen, onClose, anchorRef, title, url }: SharePopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const shareTitle = title || (typeof document !== 'undefined' ? document.title : '')
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  const applyPosition = useCallback(() => {
    const popup = popupRef.current
    const anchor = anchorRef.current
    if (!popup || !anchor) return

    const { top, left } = computeDocumentPosition(popup, anchor)
    popup.style.top = `${top}px`
    popup.style.left = `${left}px`
  }, [anchorRef])

  useLayoutEffect(() => {
    if (!isOpen) return
    applyPosition()
  }, [isOpen, applyPosition])

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const popup = popupRef.current
      const anchor = anchorRef.current
      if (!popup) return

      if (!popup.contains(e.target as Node) && e.target !== anchor && !anchor?.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleResize = () => {
      onClose()
    }

    document.addEventListener('click', handleClickOutside, true)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('click', handleClickOutside, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen, onClose, anchorRef])

  if (!isOpen || !mounted) return null

  return createPortal(
    <div ref={popupRef} className="profile_share_popup--document-anchored">
      <SharePopupPanel title={shareTitle} url={shareUrl} variant="icons-only" />
    </div>,
    document.body,
  )
}
