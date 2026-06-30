"use client";

import ShareSocialIcons from "@/components/ShareSocialIcons";

type SharePopupPanelProps = {
  title: string;
  url: string;
  /** icons-only — у вопросов; full — «Поделиться / через» как на чужом профиле */
  variant?: "icons-only" | "full";
  className?: string;
};

export default function SharePopupPanel({
  title,
  url,
  variant = "icons-only",
  className = "",
}: SharePopupPanelProps) {
  const classes = [
    "profile_share_popup",
    variant === "icons-only" ? "profile_share_popup--icons-only" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role="dialog" aria-label="Поделиться">
      {variant === "full" ? (
        <>
          <div className="profile_share_popup_title">Поделиться</div>
          <div className="profile_share_popup_subtitle">через</div>
        </>
      ) : null}
      <ShareSocialIcons title={title} url={url} />
    </div>
  );
}
