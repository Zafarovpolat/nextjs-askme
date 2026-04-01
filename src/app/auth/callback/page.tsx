"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    useAuthStore
      .getState()
      .loginWithToken(token)
      .then(() => {
        router.replace("/");
      })
      .catch(() => {
        setMessage("Не удалось завершить вход.");
      });
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
