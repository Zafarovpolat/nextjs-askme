"use client";

import SharePopupPanel from "@/components/SharePopupPanel";

type ProfileSharePopupProps = {
  title: string;
  url: string;
};

/** Попап «Поделиться» в сайдбаре публичного профиля (inline, position: relative у родителя). */
export default function ProfileSharePopup({ title, url }: ProfileSharePopupProps) {
  return <SharePopupPanel title={title} url={url} variant="full" />;
}
