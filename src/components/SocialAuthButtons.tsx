"use client";

import { getOAuthFullUrl } from "@/config/api";

const LINKS = [
  { provider: "yandex", label: "Яндекс ID", svg: <YandexIdIcon /> },
  { provider: "vkontakte", label: "ВКонтакте", svg: <VkIcon /> },
  { provider: "odnoklassniki", label: "Одноклассники", svg: <OkIcon /> },
] as const;

export default function SocialAuthButtons() {
  return (
    <div className="login_socials_list">
      {LINKS.map(({ provider, label, svg }) => (
        <div key={provider}>
          <a href={getOAuthFullUrl(`auth/social/${provider}`)} aria-label={label} title={label}>
            {svg}
          </a>
        </div>
      ))}
    </div>
  );
}

function YandexIdIcon() {
  return (
    <svg width="24" height="16" viewBox="0 0 24 16" aria-hidden>
      <text
        x="12"
        y="13"
        textAnchor="middle"
        fontFamily="Nunito, Arial Black, sans-serif"
        fontWeight="800"
        fontSize="14"
        letterSpacing="-0.4"
      >
        ID
      </text>
    </svg>
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
