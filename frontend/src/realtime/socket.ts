// ========================= src/realtime/socket.ts =========================
type SocketOpts = {
  url: string; // ex: ws://localhost:8000/ws/admin/updates/
  token?: string | null; // JWT access token
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: any) => void;
};

export function createRealtimeSocket(opts: SocketOpts) {
  const { url, token, onMessage, onOpen, onClose, onError } = opts;

  // Si token, on l’ajoute en query (simple côté Django Channels)
  const wsUrl = token ? `${url}${url.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}` : url;

  const ws = new WebSocket(wsUrl);

  ws.onopen = () => onOpen?.();
  ws.onclose = () => onClose?.();
  ws.onerror = (e) => onError?.(e);
  ws.onmessage = (evt) => {
    try {
      const payload = JSON.parse(evt.data);
      onMessage?.(payload);
    } catch {
      onMessage?.({ type: "raw", data: evt.data });
    }
  };

  return ws;
}
