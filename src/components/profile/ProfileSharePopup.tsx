"use client";

import ShareSocialIcons from "@/components/ShareSocialIcons";

type ProfileSharePopupProps = {
  title: string;
  url: string;
};

/** Попап «Поделиться» в сайдбаре публичного профиля — те же соцсети и URL, что в SharePopup для вопросов. */
export default function ProfileSharePopup({ title, url }: ProfileSharePopupProps) {
  return (
    <div className="profile_share_popup" role="dialog" aria-label="Поделиться профилем">
      <div className="profile_share_popup_title">Поделиться</div>
      <div className="profile_share_popup_subtitle">через</div>
      <ShareSocialIcons title={title} url={url} />
    </div>
  );
}
