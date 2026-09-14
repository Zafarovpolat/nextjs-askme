function decodePath(pathname: string): string {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return pathname;
  }
}

/**
 * Канонический путь: нижний регистр, без завершающего слэша (кроме `/`).
 */
export function canonicalSitePathname(pathname: string): string {
  const pathOnly = pathname.split("?")[0] ?? pathname;
  if (pathOnly === "/" || pathOnly === "") {
    return "/";
  }

  const stripped = pathOnly.replace(/\/+$/, "") || "/";
  if (stripped === "/") {
    return "/";
  }

  const segments = stripped.split("/").map((seg, i) => {
    if (i === 0 || !seg) return "";
    return decodePath(seg).toLowerCase();
  });

  return segments.join("/") || "/";
}

/** В пути есть буквы не в том регистре, что эталон (нижний, как slug в БД). */
export function pathnameHasWrongCase(pathname: string): boolean {
  const pathOnly = pathname.split("?")[0] ?? pathname;
  const decoded = decodePath(pathOnly);
  return decoded !== decoded.toLowerCase();
}

/** Slug как пишется в БД после Str::slug / CustomPage::normalizeSlug. */
export function isStoredUrlSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
