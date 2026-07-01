/** Совпадает с API: max:20480 (КБ) → 20 МБ */
export const ATTACHMENT_MAX_BYTES = 20 * 1024 * 1024;

const IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/webm", "video/ogg"]);

const VIDEO_EXTENSIONS = new Set(["mp4", "webm", "ogg"]);

function fileExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

function formatMaxSize(): string {
  return "20 МБ";
}

function isImageFile(file: File): boolean {
  const ext = fileExtension(file.name);
  if (IMAGE_EXTENSIONS.has(ext)) return true;
  if (!file.type) return false;
  return IMAGE_MIME_TYPES.has(file.type.toLowerCase());
}

function isVideoFile(file: File): boolean {
  const ext = fileExtension(file.name);
  if (VIDEO_EXTENSIONS.has(ext)) return true;
  if (!file.type) return false;
  return VIDEO_MIME_TYPES.has(file.type.toLowerCase());
}

/** null — файл подходит; иначе текст ошибки для пользователя */
export function validateImageAttachment(file: File): string | null {
  if (!isImageFile(file)) {
    return "Неподдерживаемый формат фото. Разрешены: JPG, PNG, GIF, WebP.";
  }
  if (file.size > ATTACHMENT_MAX_BYTES) {
    return `Фото слишком большое. Максимальный размер — ${formatMaxSize()}.`;
  }
  if (file.size === 0) {
    return "Файл пустой. Выберите другое фото.";
  }
  return null;
}

/** null — файл подходит; иначе текст ошибки для пользователя */
export function validateVideoAttachment(file: File): string | null {
  if (!isVideoFile(file)) {
    return "Неподдерживаемый формат видео. Разрешены: MP4, WebM, OGG.";
  }
  if (file.size > ATTACHMENT_MAX_BYTES) {
    return `Видео слишком большое. Максимальный размер — ${formatMaxSize()}.`;
  }
  if (file.size === 0) {
    return "Файл пустой. Выберите другое видео.";
  }
  return null;
}
