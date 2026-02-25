import { useAuthStore } from '../store/authStore';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

type ApiEnvelope<T> = {
  ok?: boolean;
  data?: T;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
    requestId?: string;
  };
};

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  useAuthStore.getState().setAccessToken(token);
}

export function getAccessToken() {
  return accessToken ?? useAuthStore.getState().accessToken;
}

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;
  requestId?: string;

  constructor(status: number, code: string, message: string, details?: unknown, requestId?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }
}

function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in (payload as Record<string, unknown>)) {
    return (payload as ApiEnvelope<T>).data as T;
  }
  return payload as T;
}

async function parseError(res: Response): Promise<ApiError> {
  let code = 'UNKNOWN_ERROR';
  let message = res.statusText || 'Request failed';
  let details: unknown;
  let requestId: string | undefined;

  try {
    const body = (await res.json()) as ApiErrorBody;
    if (body?.error?.code) code = body.error.code;
    if (body?.error?.message) message = body.error.message;
    details = body?.error?.details;
    requestId = body?.error?.requestId;
  } catch {
    // ignore parse error
  }

  return new ApiError(res.status, code, message, details, requestId);
}

async function refreshTokens(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'content-type': 'application/json',
      },
      body: '{}',
    });

    if (!res.ok) return false;

    const payload = (await res.json()) as ApiEnvelope<{ accessToken?: string | null }>;
    const token = payload?.data?.accessToken ?? null;
    if (!token) return false;

    setAccessToken(token);
    return true;
  } catch {
    return false;
  }
}

async function authorizedFetch(path: string, options: RequestInit = {}, retry = true): Promise<Response> {
  const token = getAccessToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('content-type') && options.body) {
    headers.set('content-type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (res.status === 401 && token && retry) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return authorizedFetch(path, options, false);
    }
  }

  return res;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await authorizedFetch(path, options);
  if (!res.ok) {
    throw await parseError(res);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const payload = (await res.json()) as ApiEnvelope<T>;
  return unwrapData<T>(payload);
}

type StreamHandlers = {
  onToken: (token: string) => void;
  onDone: (payload: Record<string, unknown>) => void;
  onError: (error: unknown) => void;
};

function handleSseBlock(block: string, handlers: StreamHandlers) {
  let eventName = 'message';
  const dataLines: string[] = [];

  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim();
      continue;
    }
    if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim());
    }
  }

  if (dataLines.length === 0) return;

  const raw = dataLines.join('\n');
  let parsed: Record<string, unknown>;

  try {
    parsed = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    parsed = { t: raw };
  }

  if (eventName === 'token') {
    const token = parsed.t;
    if (typeof token === 'string') handlers.onToken(token);
    return;
  }

  if (eventName === 'done') {
    handlers.onDone(parsed);
    return;
  }

  if (eventName === 'error') {
    handlers.onError(parsed);
    return;
  }

  if (typeof parsed.t === 'string') {
    handlers.onToken(parsed.t);
  }
}

export function apiStream(path: string, body: unknown, handlers: StreamHandlers) {
  const controller = new AbortController();

  void (async () => {
    try {
      const response = await authorizedFetch(
        path,
        {
          method: 'POST',
          body: JSON.stringify(body),
          signal: controller.signal,
        },
        true,
      );

      if (!response.ok) {
        handlers.onError(await parseError(response));
        return;
      }

      if (!response.body) {
        handlers.onError(new ApiError(500, 'STREAM_ERROR', 'Response body is empty'));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let delimiter = buffer.indexOf('\n\n');
        while (delimiter !== -1) {
          const block = buffer.slice(0, delimiter);
          buffer = buffer.slice(delimiter + 2);
          delimiter = buffer.indexOf('\n\n');
          handleSseBlock(block, handlers);
        }
      }
    } catch (error) {
      const aborted = error instanceof Error && error.name === 'AbortError';
      if (!aborted) handlers.onError(error);
    }
  })();

  return () => controller.abort();
}
