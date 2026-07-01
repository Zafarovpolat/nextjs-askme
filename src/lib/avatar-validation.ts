/** Совпадает с API: max:5120 (КБ) */
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export const AVATAR_MIN_WIDTH = 100;
export const AVATAR_MIN_HEIGHT = 100;
export const AVATAR_MAX_WIDTH = 4096;
export const AVATAR_MAX_HEIGHT = 4096;

export const AVATAR_REQUIREMENTS_HINT =
  "JPG, PNG, GIF или WebP; от 100×100 до 4096×4096 пикселей; не более 5 МБ.";

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

function fileExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

function isAvatarImageFile(file: File): boolean {
  const ext = fileExtension(file.name);
  if (IMAGE_EXTENSIONS.has(ext)) return true;
  if (!file.type) return false;
  return IMAGE_MIME_TYPES.has(file.type.toLowerCase());
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("invalid image"));
    };
    img.src = url;
  });
}

/** null — файл подходит; иначе текст ошибки для пользователя */
export async function validateAvatarFile(file: File): Promise<string | null> {
  if (!isAvatarImageFile(file)) {
    return `Неподдерживаемый формат. Допустимо: ${AVATAR_REQUIREMENTS_HINT}`;
  }

  if (file.size === 0) {
    return "Файл пустой. Выберите другое изображение.";
  }

  if (file.size > AVATAR_MAX_BYTES) {
    return `Файл слишком большой (макс. 5 МБ). Допустимо: ${AVATAR_REQUIREMENTS_HINT}`;
  }

  let width: number;
  let height: number;
  try {
    ({ width, height } = await readImageDimensions(file));
  } catch {
    return `Не удалось прочитать изображение. Допустимо: ${AVATAR_REQUIREMENTS_HINT}`;
  }

  if (width < AVATAR_MIN_WIDTH || height < AVATAR_MIN_HEIGHT) {
    return `Слишком маленькое изображение (${width}×${height}). Минимум ${AVATAR_MIN_WIDTH}×${AVATAR_MIN_HEIGHT} пикселей.`;
  }

  if (width > AVATAR_MAX_WIDTH || height > AVATAR_MAX_HEIGHT) {
    return `Слишком большое изображение (${width}×${height}). Максимум ${AVATAR_MAX_WIDTH}×${AVATAR_MAX_HEIGHT} пикселей.`;
  }

  return null;
}
