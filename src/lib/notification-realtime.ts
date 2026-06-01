export type RealtimeNotificationPayload = {
  id: number;
  title?: string | null;
  hint?: string | null;
  url?: string | null;
  text: string;
  is_read: boolean;
  data?: Record<string, unknown> | null;
  created_at: string;
};

/** Разбор payload из Reverb / Pusher (data может быть объектом или JSON-строкой). */
export function parseNotificationCreatedPayload(
  payload: unknown,
): RealtimeNotificationPayload | null {
  let value = payload;

  if (typeof value === "string") {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const raw = record.notification ?? record;

  if (!raw || typeof raw !== "object") {
    return null;
  }

  const item = raw as Record<string, unknown>;

  if (typeof item.id !== "number" || typeof item.text !== "string") {
    return null;
  }

  return {
    id: item.id,
    title: (item.title as string | null | undefined) ?? null,
    hint: (item.hint as string | null | undefined) ?? null,
    url: (item.url as string | null | undefined) ?? null,
    text: item.text,
    is_read: Boolean(item.is_read),
    data: (item.data as Record<string, unknown> | null | undefined) ?? null,
    created_at: typeof item.created_at === "string" ? item.created_at : new Date().toISOString(),
  };
}

/** Имя события broadcast с бэкенда (UserNotificationCreated::broadcastAs). */
export function isNotificationCreatedEvent(eventName: string): boolean {
  const normalized = eventName.replace(/^\.+/, "");
  return normalized === "notification.created";
}
