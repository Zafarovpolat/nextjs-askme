type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
  limit?: number;
  current_count?: number;
};

const FIELD_LABELS: Record<string, string> = {
  file: "Фото",
  files: "Фото",
  video: "Видео",
  videos: "Видео",
  links: "Ссылка",
  title: "Заголовок",
  description: "Текст вопроса",
  text: "Текст ответа",
  category_id: "Категория",
  subcategory_id: "Подкатегория",
  is_premium: "Премиум-вопрос",
  parent_id: "Комментарий",
  avatar: "Аватар",
};

const FIELD_PRIORITY = [
  "avatar",
  "file",
  "files",
  "video",
  "videos",
  "links",
  "title",
  "description",
  "text",
  "category_id",
  "subcategory_id",
  "is_premium",
  "parent_id",
];

const KNOWN_SERVER_MESSAGES: Record<string, string> = {
  "The file failed to upload.": "Не удалось загрузить файл. Проверьте размер (до 20 МБ) и формат.",
  "The file field must be a file of type: jpeg, jpg, png, gif, webp.":
    "Фото: разрешены только JPG, PNG, GIF, WebP.",
  "The video field must be a file of type: mp4, webm, ogg.":
    "Видео: разрешены только MP4, WebM, OGG.",
  "The file field must not be greater than 20480 kilobytes.":
    "Фото слишком большое. Максимальный размер — 20 МБ.",
  "The video field must not be greater than 20480 kilobytes.":
    "Видео слишком большое. Максимальный размер — 20 МБ.",
  "The avatar field must be a file of type: jpeg, jpg, png, gif, webp.":
    "Аватар: разрешены только JPG, PNG, GIF, WebP.",
  "The avatar field must not be greater than 5120 kilobytes.":
    "Аватар слишком большой. Максимальный размер — 5 МБ.",
  "The avatar field must be an image.":
    "Аватар: загрузите изображение в формате JPG, PNG, GIF или WebP.",
};

function localizeServerMessage(message: string): string {
  const trimmed = message.trim();
  return KNOWN_SERVER_MESSAGES[trimmed] ?? trimmed;
}

function appendQuotaDetails(message: string, body: ApiErrorBody): string {
  if (body.limit == null || body.current_count == null) {
    return message;
  }
  if (message.includes(String(body.limit)) || message.includes("24 часа") || message.includes("за сутки")) {
    return `${message} (использовано ${body.current_count} из ${body.limit} за 24 ч)`;
  }
  return message;
}

function formatFieldError(key: string, message: string): string {
  const localized = localizeServerMessage(message);
  const label = FIELD_LABELS[key];
  if (!label) return localized;
  if (localized.toLowerCase().startsWith(label.toLowerCase())) {
    return localized;
  }
  return `${label}: ${localized}`;
}

/** Подробное сообщение из тела ответа API (422, 429 и т.д.) */
export function getFormApiErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") {
    return fallback;
  }

  const body = data as ApiErrorBody;
  const parts: string[] = [];
  const seen = new Set<string>();

  if (body.errors) {
    for (const key of FIELD_PRIORITY) {
      const msgs = body.errors[key];
      const first = msgs?.[0]?.trim();
      if (first) {
        parts.push(formatFieldError(key, first));
        seen.add(key);
      }
    }

    for (const [key, msgs] of Object.entries(body.errors)) {
      if (seen.has(key)) continue;
      const first = msgs?.[0]?.trim();
      if (first) {
        parts.push(formatFieldError(key, first));
      }
    }
  }

  if (parts.length > 0) {
    return parts.join(" ");
  }

  const message = body.message?.trim();
  if (message) {
    return appendQuotaDetails(localizeServerMessage(message), body);
  }

  return fallback;
}
