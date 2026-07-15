"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/api-client";
import { getToken } from "@/lib/cookies";
import {
  createNotificationEcho,
  disconnectNotificationEcho,
  type NotificationRealtimeConfig,
} from "@/lib/notification-echo";
import { dispatchIncomingNotification } from "@/lib/notification-realtime-bridge";
import {
  isNotificationCreatedEvent,
  parseNotificationCreatedPayload,
} from "@/lib/notification-realtime";
import { useAuthStore } from "@/store/authStore";

type RealtimeConfigResponse = NotificationRealtimeConfig & {
  subscription_type: "private";
  driver: string;
};

let realtimeConfigPromise: Promise<RealtimeConfigResponse> | null = null;

const getRealtimeConfig = async (): Promise<RealtimeConfigResponse> => {
  if (!realtimeConfigPromise) {
    realtimeConfigPromise = api
      .get<RealtimeConfigResponse>("v1/notifications/realtime")
      .catch((error) => {
        realtimeConfigPromise = null;
        throw error;
      });
  }

  return realtimeConfigPromise;
};

const NOTIFICATION_EVENT = ".notification.created";

export default function NotificationRealtimeProvider() {
  const userId = useAuthStore((s) => s.user?.id ?? null);
  const channelRef = useRef<{ stopListening: (event: string) => void } | null>(null);

  useEffect(() => {
    if (!userId) {
      disconnectNotificationEcho();
      return;
    }

    const token = getToken();
    if (!token) {
      disconnectNotificationEcho();
      return;
    }

    let cancelled = false;

    const handleEvent = (eventName: string, payload: unknown) => {
      if (!isNotificationCreatedEvent(eventName)) {
        return;
      }

      const notification = parseNotificationCreatedPayload(payload);
      if (!notification) {
        if (process.env.NODE_ENV === "development") {
          console.warn("[notifications] Не удалось разобрать payload:", payload);
        }
        return;
      }

      if (process.env.NODE_ENV === "development") {
        console.debug("[notifications] Realtime уведомление:", notification);
      }

      dispatchIncomingNotification(notification);
    };

    const connect = async () => {
      try {
        const realtime = await getRealtimeConfig();
        if (cancelled) {
          return;
        }

        const echo = await createNotificationEcho(userId, token, realtime);
        if (cancelled) {
          return;
        }

        if (channelRef.current) {
          channelRef.current.stopListening(NOTIFICATION_EVENT);
        }

        const channel = echo.private(realtime.channel);
        channelRef.current = channel;

        channel.listen(NOTIFICATION_EVENT, (payload: unknown) => {
          handleEvent("notification.created", payload);
        });

        channel.error((error: unknown) => {
          console.warn("[notifications] Ошибка подписки на канал:", error);
        });

        if (process.env.NODE_ENV === "development") {
          echo.connector.pusher.connection.bind("state_change", (states: { current: string }) => {
            console.debug("[notifications] WebSocket:", states.current);
          });
          echo.connector.pusher.connection.bind("error", (error: unknown) => {
            console.warn("[notifications] WebSocket error:", error);
          });
        }
      } catch (error) {
        console.warn("[notifications] Не удалось подключить realtime:", error);
      }
    };

    void connect();

    return () => {
      cancelled = true;
      channelRef.current?.stopListening(NOTIFICATION_EVENT);
      channelRef.current = null;
    };
  }, [userId]);

  return null;
}
