"use client";

import { useEffect } from "react";
import { getOAuthFullUrl } from "@/config/api";

function decodeBase64UrlToJson(raw: string): unknown {
  const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
  const bin = atob(b64 + pad);
  // RFC: данные короткие, utf-8 в JSON уже в \uXXXX, поэтому достаточно binary->string
  return JSON.parse(bin);
}

export default function LoginTelegramHashHandler() {
  useEffect(() => {
    const hash = window.location.hash || "";
    if (!hash.startsWith("#tgAuthResult=")) return;

    const encoded = hash.slice("#tgAuthResult=".length);
    if (!encoded) return;

    try {
      const data = decodeBase64UrlToJson(encoded) as Record<string, unknown>;

      // Собираем URL на Laravel callback и пробрасываем параметры как query.
      const target = new URL(getOAuthFullUrl("auth/telegram/callback"));
      for (const [k, v] of Object.entries(data)) {
        if (v === undefined || v === null) continue;
        target.searchParams.set(k, String(v));
      }

      // Уберём hash, чтобы не мешал навигации назад/вперёд.
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      window.location.assign(target.toString());
    } catch {
      // Если не получилось распарсить — просто убираем хэш, чтобы страница не \"залипала\".
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  return null;
}

