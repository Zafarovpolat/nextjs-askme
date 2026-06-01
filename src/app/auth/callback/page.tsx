"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  clearOAuthCallbackGuard,
  markOAuthCallbackStarted,
  shouldSkipOAuthCallback,
} from "@/lib/auth-constants";
import { useAuthStore } from "@/store/authStore";

function CallbackBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Вход…");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setMessage("Нет данных авторизации.");
      return;
    }
    if (shouldSkipOAuthCallback(token)) {
      return;
    }
    markOAuthCallbackStarted(token);

    let cancelled = false;
    useAuthStore
      .getState()
      .loginWithToken(token)
      .then(() => {
        if (cancelled) return;
        router.replace("/");
      })
      .catch(() => {
        if (cancelled) return;
        clearOAuthCallbackGuard();
        setMessage("Не удалось завершить вход.");
      });

    return () => {
      cancelled = true;
    };
  }, [searchParams, router]);

  return (
    <div className="container" style={{ padding: "48px 16px", textAlign: "center" }}>
      <p style={{ color: "#5F68FF" }}>{message}</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: "48px 16px", textAlign: "center" }}>
          <p style={{ color: "#899AB5" }}>Загрузка…</p>
        </div>
      }
    >
      <CallbackBody />
    </Suspense>
  );
}
