import { useEffect, useRef, useState, useCallback } from 'react';

// Small WebSocket hook for sending x/y to the Pi telemetry server
// Usage: const { connected, sendXY } = useTelemetry('ws://192.168.43.1:3000')

export function useTelemetry(url?: string) {
  const defaultUrl = url || (global as any).__PI_TELEMETRY_URL || 'ws://192.168.4.1:3000';
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<{ attempts: number; timer: any }>({ attempts: 0, timer: null });
  const [connected, setConnected] = useState(false);

  const connect = useCallback(() => {
    try {
      if (wsRef.current) wsRef.current.close();
      const ws = new WebSocket(defaultUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        reconnectRef.current.attempts = 0;
        setConnected(true);
        // send a hello or ping
        ws.send(JSON.stringify({ type: 'hello', ts: Date.now() }));
      };

      ws.onmessage = (ev) => {
        // handle server messages if needed
        try {
          const msg = JSON.parse(ev.data);
          // ignore for now
          // console.log('telemetry msg', msg);
        } catch (e) {
          // ignore
        }
      };

      ws.onclose = () => {
        setConnected(false);
        scheduleReconnect();
      };

      ws.onerror = () => {
        // will trigger onclose afterwards
        ws.close();
      };
    } catch (e) {
      scheduleReconnect();
    }
  }, [defaultUrl]);

  const scheduleReconnect = () => {
    reconnectRef.current.attempts += 1;
    const backoff = Math.min(20000, 500 * Math.pow(2, reconnectRef.current.attempts));
    if (reconnectRef.current.timer) clearTimeout(reconnectRef.current.timer);
    reconnectRef.current.timer = setTimeout(() => connect(), backoff);
  };

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current.timer) clearTimeout(reconnectRef.current.timer);
      wsRef.current?.close();
    };
  }, [connect]);

  const send = (obj: any) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(obj));
    }
  };

  const sendXY = (x: number, y: number, id?: string) => {
    send({ id: id || null, x, y });
  };

  return { connected, sendXY };
}

export default useTelemetry;
