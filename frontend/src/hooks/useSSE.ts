import { useCallback, useEffect, useRef, useState } from "react";
import type { StreamEvent } from "../types";

const MAX_EVENTS = 200;
const RECONNECT_DELAY_MS = 3000;

export function useSSE(url: string, onEvent?: (ev: StreamEvent) => void) {
  const [events, setEvents] = useState<StreamEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    const es = new EventSource(url, { withCredentials: true });

    es.onopen = () => setConnected(true);

    es.onmessage = (raw) => {
      try {
        const ev: StreamEvent = JSON.parse(raw.data);
        onEventRef.current?.(ev);
        setEvents((prev) => [ev, ...prev].slice(0, MAX_EVENTS));
      } catch {
        // malformed event — skip
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
      setTimeout(connect, RECONNECT_DELAY_MS);
    };

    return es;
  }, [url]);

  useEffect(() => {
    const es = connect();
    return () => {
      es.close();
      setConnected(false);
    };
  }, [connect]);

  return { events, connected };
}
