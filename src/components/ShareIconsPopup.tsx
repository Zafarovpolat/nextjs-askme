"use client";

import { useEffect, useRef, useCallback } from "react";
import ShareSocialIcons from "@/components/ShareSocialIcons";

interface ShareIconsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  title?: string;
  url?: string;
}

export default function ShareIconsPopup({
  isOpen,
  onClose,
  anchorRef,
  title,
  url,
}: ShareIconsPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  const shareTitle = title || (typeof document !== "undefined" ? document.title : "");
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const updatePosition = useCallback(() => {
    const popup = popupRef.current;
    const anchor = anchorRef.current;
    if (!popup || !anchor) return;

    const rect = anchor.getBoundingClientRect();
    popup.style.top = `${window.scrollY + rect.bottom + 6}px`;
    popup.style.left = `${window.scrollX + rect.left + rect.width / 2}px`;
  }, [anchorRef]);

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleClickOutside = (e: MouseEvent) => {
      const popup = popupRef.current;
      const anchor = anchorRef.current;
      if (!popup) return;

      if (
        !popup.contains(e.target as Node) &&
        e.target !== anchor &&
        !anchor?.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleResize = () => {
      onClose();
    };

    document.addEventListener("click", handleClickOutside, true);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("click", handleClickOutside, true);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, onClose, anchorRef, updatePosition]);

  if (!isOpen) return null;

  return (
    <div
      className="profile_share_popup profile_share_popup--icons-only profile_share_popup--anchored"
      ref={popupRef}
      role="dialog"
      aria-label="Поделиться"
    >
      <ShareSocialIcons title={shareTitle} url={shareUrl} />
    </div>
  );
}
