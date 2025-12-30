// ========================= src/hooks/useRealtime.ts =========================
import { useEffect, useRef, useState } from "react";
import { createRealtimeSocket } from "@/realtime/socket";

type UseRealtimeOpts = {
  url: string; // ws://.../ws/admin/updates/
  token?: string | null;
  enabled?: boolean;
  onEvent?: (evt: any) => void;
};

export function useRealtime({ url, token, enabled = true, onEvent }: UseRealtimeOpts) {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    wsRef.current = createRealtimeSocket({
      url,
      token,
      onOpen: () => setConnected(true),
      onClose: () => setConnected(false),
      onMessage: (evt) => onEvent?.(evt),
      onError: () => setConnected(false),
    });

    return () => {
      try {
        wsRef.current?.close();
      } catch {
        // ignore
      }
      wsRef.current = null;
      setConnected(false);
    };
  }, [url, token, enabled, onEvent]);

  return { connected };
}
