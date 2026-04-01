"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function LoginOAuthError() {
  const searchParams = useSearchParams();
  const message = useMemo(() => {
    const err = searchParams.get("error");
    if (err === "blocked") return "Аккаунт заблокирован.";
    if (err === "social") return "Не удалось войти через соцсеть. Попробуйте ещё раз.";
    return null;
  }, [searchParams]);

  if (!message) return null;

  return (
    <p className="login_error" style={{ color: "#c00", marginBottom: 8 }}>
      {message}
    </p>
  );
}
