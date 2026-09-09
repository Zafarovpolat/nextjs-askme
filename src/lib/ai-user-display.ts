export type AiLikeUser = {
  is_ai?: boolean
  full_name?: string | null
  first_name?: string | null
  level_name?: string | null
  ai_type?: string | null
  ai_provider_name?: string | null
  ai_model_short?: string | null
  ai_rank_label?: string | null
  premium_is_active?: boolean
  is_premium?: boolean
  premium_package_name?: string | null
}

function humanName(u: AiLikeUser): string {
  return (u.full_name ?? u.first_name ?? "").trim()
}

export function displayUserName(u: AiLikeUser): string {
  if (u.is_ai) {
    const type = (u.ai_type ?? u.ai_provider_name ?? "").trim()
    return type || "AI"
  }
  return humanName(u) || "Пользователь"
}

export function displayUserSubtitle(u: AiLikeUser): string {
  if (!u.is_ai) {
    return (u.level_name ?? "").trim()
  }
  const rank = (u.ai_rank_label ?? "").trim()
  const model = (u.ai_model_short ?? "").trim()
  return rank || model || "AI"
}

export function displayPremiumBadge(u: AiLikeUser): string | null {
  const isPremium = Boolean(u.premium_is_active ?? u.is_premium)
  if (!isPremium) return null
  if (u.is_ai) return "Премиум"
  const t = (u.premium_package_name ?? "").trim()
  return t || "Премиум"
}

