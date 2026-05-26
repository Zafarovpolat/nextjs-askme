const DEFAULT_AVATAR = "/images/icons/avatar.svg";

/** Полный URL или путь к дефолтной svg — без второго размера в srcset */
export function isDefaultAvatarPath(src: string | null | undefined): boolean {
  if (!src) return true;
  return src.includes("avatar.svg");
}

/**
 * Атрибуты для <img>: 1x + 2x для ретины. Если нет второго файла или дефолтная иконка — только src.
 */
export function avatarImgProps(
  avatarUrl: string | null | undefined,
  avatarUrl2x: string | null | undefined,
): { src: string; srcSet?: string } {
  const src = avatarUrl?.trim() || DEFAULT_AVATAR;
  if (isDefaultAvatarPath(src)) {
    return { src };
  }
  const u2 = avatarUrl2x?.trim();
  if (!u2 || u2 === src) {
    return { src };
  }
  return { src, srcSet: `${src} 1x, ${u2} 2x` };
}
