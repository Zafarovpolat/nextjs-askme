import Echo from "laravel-echo";
import type Pusher from "pusher-js";

export type NotificationRealtimeConfig = {
  channel: string;
  auth_endpoint: string;
  key: string;
  websocket: {
    host: string;
    port: number;
    scheme: string;
  };
};

type EchoInstance = Echo<"reverb">;

let echoSingleton: EchoInstance | null = null;
let echoUserId: number | null = null;

async function authorizePrivateChannel(
  authEndpoint: string,
  token: string,
  socketId: string,
  channelName: string,
): Promise<{ auth: string; channel_data?: string }> {
  const body = new URLSearchParams({
    socket_id: socketId,
    channel_name: channelName,
  });

  const response = await fetch(authEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
    body: body.toString(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof (data as { message?: string }).message === "string"
        ? (data as { message: string }).message
        : `Broadcast auth failed (${response.status})`;
    throw new Error(message);
  }

  return data as { auth: string; channel_data?: string };
}

export async function createNotificationEcho(
  userId: number,
  token: string,
  realtime: NotificationRealtimeConfig,
): Promise<EchoInstance> {
  if (echoSingleton && echoUserId === userId) {
    return echoSingleton;
  }

  if (echoSingleton) {
    try {
      echoSingleton.disconnect();
    } catch {
      // noop
    }
    echoSingleton = null;
    echoUserId = null;
  }

  const { default: PusherClient } = await import("pusher-js");

  if (typeof window !== "undefined") {
    (window as Window & { Pusher?: typeof Pusher }).Pusher = PusherClient;
    if (process.env.NODE_ENV === "development") {
      PusherClient.logToConsole = true;
    }
  }

  const forceTLS =
    realtime.websocket.scheme === "https" || realtime.websocket.scheme === "wss";

  const wsHost =
    realtime.websocket.host === "127.0.0.1" ? "localhost" : realtime.websocket.host;

  const echo = new Echo({
    broadcaster: "reverb",
    key: realtime.key,
    wsHost,
    wsPort: realtime.websocket.port,
    wssPort: realtime.websocket.port,
    forceTLS,
    encrypted: forceTLS,
    enabledTransports: ["ws", "wss"],
    disableStats: true,
    namespace: false,
    authEndpoint: realtime.auth_endpoint,
    authorizer: (channel: { name: string }) => ({
      authorize: (
        socketId: string,
        callback: (error: Error | null, data: { auth: string } | null) => void,
      ) => {
        void authorizePrivateChannel(
          realtime.auth_endpoint,
          token,
          socketId,
          channel.name,
        )
          .then((data) => callback(null, data))
          .catch((error: unknown) => {
            callback(error instanceof Error ? error : new Error(String(error)), null);
          });
      },
    }),
  });

  echoSingleton = echo;
  echoUserId = userId;

  return echo;
}

export function disconnectNotificationEcho(): void {
  if (!echoSingleton) {
    return;
  }

  try {
    echoSingleton.disconnect();
  } catch {
    // noop
  }

  echoSingleton = null;
  echoUserId = null;
}

export type { EchoInstance };
