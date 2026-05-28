"use client";

import { useEffect, useState, useRef } from "react";
import { getOAuthFullUrl } from "@/config/api";

const LINKS = [
  { provider: "vkontakte", label: "ВКонтакте", svg: <VkIcon /> },
  { provider: "odnoklassniki", label: "Одноклассники", svg: <OkIcon /> },
  { provider: "discord", label: "Discord", svg: <DiscordIcon /> },
] as const;

export default function SocialAuthButtons() {
  const tgRef = useRef<HTMLDivElement>(null);
  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME?.replace(/^@/, "");
  const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID?.trim();

  /* Строим URL только на клиенте, чтобы избежать hydration-mismatch
     (на сервере window нет → URL null → рендерится <div>, а на клиенте <a>). */
  const [tgLoginUrl, setTgLoginUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!botId) return;
    const origin = window.location.origin;
    const returnTo = `${origin}/auth/telegram/callback`;
    const u = new URL("https://oauth.telegram.org/auth");
    u.searchParams.set("bot_id", botId);
    u.searchParams.set("origin", origin);
    u.searchParams.set("request_access", "write");
    u.searchParams.set("return_to", returnTo);
    setTgLoginUrl(u.toString());
  }, [botId]);

  useEffect(() => {
    if (!botUsername || !tgRef.current) return;
    // Если задан BOT_ID — используем прямую ссылку (без iframe/виджета), виджет не нужен.
    if (botId) return;
    const el = tgRef.current;
    el.innerHTML = "";
    el.style.width = "100%";
    el.style.height = "100%";
    const s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.async = true;
    s.setAttribute("data-telegram-login", botUsername);
    s.setAttribute("data-size", "small");
    // Telegram Login Widget ограничивает auth-url доменом из BotFather /setdomain.
    // Поэтому auth-url указываем на фронт, а фронт уже перекидывает запрос на Laravel callback.
    s.setAttribute("data-auth-url", `${window.location.origin}/auth/telegram/callback`);
    s.setAttribute("data-request-access", "write");
    el.appendChild(s);

    // Делаем кнопку/виджет кликабельным на всю площадь карточки.
    const applyFullSize = () => {
      const iframe = el.querySelector<HTMLIFrameElement>("iframe");
      if (iframe) {
        iframe.style.position = "absolute";
        iframe.style.inset = "0";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        iframe.style.opacity = "0";
        iframe.style.border = "0";
        iframe.style.margin = "0";
        iframe.style.padding = "0";
        iframe.style.display = "block";
        iframe.style.pointerEvents = "auto";
      }

      const btn = el.querySelector<HTMLButtonElement>("button.tgme_widget_login_button");
      if (btn) {
        btn.style.width = "100%";
        btn.style.height = "100%";
        btn.style.display = "block";
        btn.style.opacity = "0";
        btn.style.border = "0";
        btn.style.padding = "0";
        btn.style.margin = "0";
      }
      const photo = el.querySelector<HTMLElement>(".tgme_widget_login_user_photo");
      if (photo) {
        photo.style.display = "none";
      }
    };

    const obs = new MutationObserver(applyFullSize);
    obs.observe(el, { childList: true, subtree: true });
    // На случай, если DOM уже готов.
    applyFullSize();

    return () => obs.disconnect();
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
      {tgLoginUrl ? (
        <a className="login_socials_tg" href={tgLoginUrl} title="Telegram" aria-label="Telegram">
          <TgIcon />
        </a>
      ) : (
        <div className="login_socials_tg" title="Telegram" aria-label="Telegram" style={{ position: "relative" }}>
          <div style={{ position: "relative", zIndex: 1, pointerEvents: "none" }}>
            <TgIcon />
          </div>
          <div
            ref={tgRef}
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0,
              overflow: "hidden",
              zIndex: 2,
              pointerEvents: "auto",
            }}
          />
        </div>
      )}
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

function TgIcon() {
  return (
    <svg width="17" height="16" aria-hidden>
      <use xlinkHref="#tg"></use>
    </svg>
  );
}
