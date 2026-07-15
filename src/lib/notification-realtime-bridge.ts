import type { RealtimeNotificationPayload } from "@/lib/notification-realtime";

type IncomingHandler = (notification: RealtimeNotificationPayload) => void;

const handlers = new Set<IncomingHandler>();

export function subscribeIncomingNotifications(handler: IncomingHandler): () => void {
  handlers.add(handler);
  return () => {
    handlers.delete(handler);
  };
}

export function dispatchIncomingNotification(notification: RealtimeNotificationPayload): void {
  handlers.forEach((handler) => {
    handler(notification);
  });
}
