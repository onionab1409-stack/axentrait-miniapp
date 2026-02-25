import { apiFetch, apiStream } from './apiClient';
import type { ChatMessage } from '../types/ai';

export type AiSession = {
  id: string;
  mode: 'scenario' | 'free';
  scenarioId?: string | null;
  title?: string | null;
  createdAt: string;
  updatedAt: string;
};

type BackendAiMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
};

function mapMessage(item: BackendAiMessage): ChatMessage {
  return {
    id: item.id,
    role: item.role,
    content: item.content,
    createdAt: item.createdAt,
  };
}

export async function createAiSession(payload: { mode: 'scenario' | 'free'; scenarioId?: string }) {
  return apiFetch<AiSession>('/ai/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchAiMessages(sessionId: string): Promise<ChatMessage[]> {
  const messages = await apiFetch<BackendAiMessage[]>(`/ai/sessions/${encodeURIComponent(sessionId)}/messages`);
  return messages.map(mapMessage);
}

export function streamAiMessage(
  sessionId: string,
  payload: {
    message: string;
    scenarioKey?: string;
    clientContext?: {
      industry?: string;
      companySize?: string;
      role?: string;
    };
  },
  handlers: {
    onToken: (token: string) => void;
    onDone: (data: Record<string, unknown>) => void;
    onError: (error: unknown) => void;
  },
) {
  return apiStream(`/ai/sessions/${encodeURIComponent(sessionId)}/messages`, payload, handlers);
}
