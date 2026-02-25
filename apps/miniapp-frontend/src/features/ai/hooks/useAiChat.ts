import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createAiSession, fetchAiMessages, streamAiMessage } from '../../../shared/api/aiApi';
import { useMe } from '../../../shared/hooks/useMe';
import type { ChatMessage } from '../../../shared/types/ai';
import { uid } from '../../../shared/utils/id';
import { ApiError } from '../../../shared/api/apiClient';

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function asErrorMessage(input: unknown): string {
  if (input instanceof ApiError) {
    if (input.code === 'RATE_LIMITED') return 'Лимит исчерпан, попробуйте позже.';
    return input.message;
  }
  if (input && typeof input === 'object') {
    const body = input as Record<string, unknown>;
    if (typeof body.message === 'string') return body.message;
  }
  if (input instanceof Error) return input.message;
  return 'Сервис AI временно недоступен';
}

type UseAiChatOptions = {
  initialSessionId?: string;
  scenarioId?: string;
};

export function useAiChat({ initialSessionId, scenarioId }: UseAiChatOptions) {
  const queryClient = useQueryClient();
  const meQuery = useMe();

  const [sessionId, setSessionId] = useState<string | null>(() =>
    initialSessionId && isUuid(initialSessionId) ? initialSessionId : null,
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const creatingSessionRef = useRef(false);

  useEffect(() => {
    if (!initialSessionId || !isUuid(initialSessionId)) return;
    setSessionId((current) => (current === initialSessionId ? current : initialSessionId));
  }, [initialSessionId]);

  const clientContext = useMemo(
    () => ({
      role: meQuery.data?.profile?.role ?? undefined,
      industry: meQuery.data?.profile?.industry ?? undefined,
      companySize: meQuery.data?.profile?.companySize ?? undefined,
    }),
    [meQuery.data?.profile?.companySize, meQuery.data?.profile?.industry, meQuery.data?.profile?.role],
  );

  async function ensureSession(): Promise<string> {
    if (sessionId) return sessionId;

    const created = await createAiSession({
      mode: 'scenario',
      scenarioId: scenarioId ?? 'ai.scenario.faq',
    });

    setSessionId(created.id);
    return created.id;
  }

  useEffect(() => {
    if (sessionId || creatingSessionRef.current) return;
    creatingSessionRef.current = true;
    setIsCreatingSession(true);

    void createAiSession({
      mode: 'scenario',
      scenarioId: scenarioId ?? 'ai.scenario.faq',
    })
      .then((created) => {
        setSessionId(created.id);
      })
      .catch((err) => {
        setError(asErrorMessage(err));
      })
      .finally(() => {
        creatingSessionRef.current = false;
        setIsCreatingSession(false);
      });
  }, [scenarioId, sessionId]);

  const messagesQuery = useQuery({
    queryKey: ['ai', 'messages', sessionId],
    queryFn: () => fetchAiMessages(sessionId || ''),
    enabled: Boolean(sessionId),
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (messagesQuery.data) {
      setMessages(messagesQuery.data);
    }
  }, [messagesQuery.data]);

  async function sendMessage(text: string, scenarioKey?: string) {
    const content = text.trim();
    if (!content || isStreaming) return;

    setError(null);

    const activeSessionId = await ensureSession();

    const userMessage: ChatMessage = {
      id: uid('msg_user'),
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    const placeholderId = uid('msg_ai');
    const assistantPlaceholder: ChatMessage = {
      id: placeholderId,
      role: 'assistant',
      content: '',
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
    setIsStreaming(true);

    await new Promise<void>((resolve, reject) => {
      const stop = streamAiMessage(
        activeSessionId,
        {
          message: content,
          scenarioKey,
          clientContext,
        },
        {
          onToken: (token) => {
            setMessages((prev) =>
              prev.map((message) =>
                message.id === placeholderId
                  ? {
                      ...message,
                      content: `${message.content}${token}`,
                      isStreaming: true,
                    }
                  : message,
              ),
            );
          },
          onDone: () => {
            stop();
            setMessages((prev) =>
              prev.map((message) =>
                message.id === placeholderId
                  ? {
                      ...message,
                      isStreaming: false,
                    }
                  : message,
              ),
            );
            void queryClient.invalidateQueries({ queryKey: ['ai', 'messages', activeSessionId] });
            resolve();
          },
          onError: (streamError) => {
            stop();
            setMessages((prev) => prev.filter((message) => message.id !== placeholderId));
            const message = asErrorMessage(streamError);
            setError(message);
            reject(streamError);
          },
        },
      );
    }).finally(() => {
      setIsStreaming(false);
    });
  }

  return {
    sessionId,
    messages,
    isStreaming,
    isLoading: isCreatingSession || messagesQuery.isLoading,
    isError: Boolean(error) || messagesQuery.isError,
    error: error ?? (messagesQuery.error ? asErrorMessage(messagesQuery.error) : null),
    sendMessage,
    refetchMessages: messagesQuery.refetch,
    clearError: () => setError(null),
  };
}
