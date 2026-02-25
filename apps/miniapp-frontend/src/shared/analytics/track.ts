type EventPayload = Record<string, string | number | boolean | null | undefined>;

type QueuedEvent = {
  name: string;
  properties?: EventPayload;
  timestamp: string;
};

const FLUSH_INTERVAL_MS = 2000;
const BATCH_SIZE = 50;
const queue: QueuedEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

async function flushNow() {
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }

  if (queue.length === 0) return;

  const batch = queue.splice(0, BATCH_SIZE);

  try {
    await fetch('/api/v1/events', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ events: batch }),
    });
  } catch {
    queue.unshift(...batch);
  }

  if (queue.length > 0) {
    flushTimer = setTimeout(() => {
      void flushNow();
    }, FLUSH_INTERVAL_MS);
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    void flushNow();
  }, FLUSH_INTERVAL_MS);
}

export function track(name: string, properties: EventPayload = {}) {
  queue.push({
    name,
    properties,
    timestamp: new Date().toISOString(),
  });
  scheduleFlush();
}

export const trackEvent = track;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (queue.length === 0) return;
    const payload = JSON.stringify({ events: queue.slice(0, BATCH_SIZE) });
    try {
      navigator.sendBeacon('/api/v1/events', new Blob([payload], { type: 'application/json' }));
    } catch {
      // ignore
    }
  });
}
