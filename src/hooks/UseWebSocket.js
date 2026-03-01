// src/hooks/useWebSocket.js
import { useEffect, useRef, useCallback } from "react";

const WS_URL = "ws://localhost:8080";
const RECONNECT_DELAY = 3000;

const UseWebSocket = (handlers = {}) => {
  const wsRef        = useRef(null);
  const handlersRef  = useRef(handlers);
  const reconnectRef = useRef(null);
  const mountedRef   = useRef(true);

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    console.log("🔌 [WS] Connecting...");
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("✅ [WS] Connected");
      clearTimeout(reconnectRef.current);

      // ✅ Gửi join-kiosk để backend đánh dấu client này
      ws.send(JSON.stringify({ type: "join-kiosk" }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        // Backend gửi 2 format: { type, data } và { event, message }
        // Chỉ xử lý format { type, data } cho business events
        const { type, data } = msg;
        const handler = handlersRef.current[type];
        if (typeof handler === "function") {
          handler(data);
        }
      } catch (err) {
        console.error("❌ [WS] Parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.warn("⚠️ [WS] Error:", err);
    };

    ws.onclose = () => {
      console.warn("🔴 [WS] Disconnected, reconnecting...");
      if (mountedRef.current) {
        reconnectRef.current = setTimeout(connect, RECONNECT_DELAY);
      }
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);
};

export default UseWebSocket;