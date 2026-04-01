"use client";

import { useEffect, useRef } from "react";
import { getOAuthFullUrl } from "@/config/api";

const LINKS = [
  { provider: "vkontakte", label: "ВКонтакте", svg: <VkIcon /> },
  { provider: "odnoklassniki", label: "Одноклассники", svg: <OkIcon /> },
  { provider: "discord", label: "Discord", svg: <DiscordIcon /> },
] as const;

export default function SocialAuthButtons() {
  const tgRef = useRef<HTMLDivElement>(null);
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "");

  useEffect(() => {
    if (!botUsername || !tgRef.current) return;
    const el = tgRef.current;
    el.innerHTML = "";
    const s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.async = true;
    s.setAttribute("data-telegram-login", botUsername);
    s.setAttribute("data-size", "small");
    s.setAttribute("data-auth-url", getOAuthFullUrl("auth/telegram/callback"));
    s.setAttribute("data-request-access", "write");
    el.appendChild(s);
  }, [botUsername]);

  return (
    <div className="login_socials_list">
      {LINKS.map(({ provider, label, svg }) => (
        <div key={provider}>
          <a href={getOAuthFullUrl(`auth/social/${provider}`)} aria-label={label} title={label}>
            {svg}
          </a>
        </div>
      ))}
      <div className="login_socials_tg" ref={tgRef} title="Telegram" />
    </div>
  );
}

function VkIcon() {
  return (
    <svg width="22" height="12" aria-hidden>
      <use xlinkHref="#vk"></use>
    </svg>
  );
}

function OkIcon() {
  return (
    <svg width="20" height="20" aria-hidden>
      <use xlinkHref="#ok"></use>
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg width="23" height="18" aria-hidden>
      <use xlinkHref="#discord"></use>
    </svg>
  );
}
