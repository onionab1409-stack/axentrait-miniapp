import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AiResultCard } from '../../components/domain/AiResultCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { fetchAiMessages } from '../../shared/api/aiApi';
import { track } from '../../shared/analytics/track';

type StructuredResult = {
  context?: string;
  assumptions?: string[];
  recommendations?: string[];
  implementation_plan?: string[];
  risks_and_mitigations?: string[];
  next_step?: string;
};

function parseStructured(raw: string | null): StructuredResult | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StructuredResult;
  } catch {
    return null;
  }
}

export default function AiResultPage() {
  const navigate = useNavigate();
  const { sessionId = '' } = useParams();

  const messagesQuery = useQuery({
    queryKey: ['ai', 'messages', sessionId],
    queryFn: () => fetchAiMessages(sessionId),
    enabled: Boolean(sessionId),
    refetchOnWindowFocus: false,
  });

  const { structured, latestAssistantText } = useMemo(() => {
    const messages = messagesQuery.data ?? [];
    const lastAssistant = [...messages].reverse().find((item) => item.role === 'assistant');
    if (!lastAssistant) return { structured: null, latestAssistantText: '' };

    const parsed = parseStructured(lastAssistant.content);
    if (parsed) return { structured: parsed, latestAssistantText: '' };

    return { structured: null, latestAssistantText: lastAssistant.content };
  }, [messagesQuery.data]);

  useEffect(() => {
    track('ai_result_generated', { screen_id: 'SCR-AI-030', session_id: sessionId });
  }, [sessionId]);

  const hasMessages = (messagesQuery.data?.length ?? 0) > 0;

  return (
    <AppShell title="Результат AI" showBack showBottomNav>
      {messagesQuery.isLoading ? (
        <div className="ax-col" style={{ gap: 12 }}>
          <Skeleton height={170} />
          <Skeleton height={120} />
        </div>
      ) : null}

      {!messagesQuery.isLoading && messagesQuery.isError ? (
        <ErrorState
          title="Результат AI недоступен"
          description="Не удалось загрузить сообщения с сервера."
          onRetry={() => {
            void messagesQuery.refetch();
          }}
        />
      ) : null}

      {!messagesQuery.isLoading && !messagesQuery.isError && !hasMessages ? (
        <EmptyState
          title="Пока нет результата"
          description="Отправьте хотя бы одно сообщение в AI-чат, чтобы получить структурированный вывод."
          actionLabel="Открыть чат"
          onAction={() => navigate(`/ai/chat/${sessionId}`)}
        />
      ) : null}

      {!messagesQuery.isLoading && !messagesQuery.isError && hasMessages ? (
        <>
          {structured ? (
            <AiResultCard
              result={structured}
              onCta={() => {
                track('ai_to_lead_conversion', { session_id: sessionId });
                const summary = structured.next_step ?? structured.context ?? 'Нужна консультация по AI-сценарию';
                navigate('/lead', {
                  state: {
                    prefill: {
                      problemStatement: summary,
                      source: 'ai_result',
                    },
                  },
                });
              }}
            />
          ) : (
            <Card>
              <div className="ax-col" style={{ gap: 10 }}>
                <h1 className="h2" style={{ fontSize: 22 }}>
                  Структурированный JSON пока не получен
                </h1>
                <p className="p muted">
                  Показываем последний ответ ассистента. Можно продолжить чат и запросить формат JSON.
                </p>
                {latestAssistantText ? <ReactMarkdown>{latestAssistantText}</ReactMarkdown> : null}
              </div>
            </Card>
          )}

          <div className="ax-row ax-row-wrap">
            <Button variant="secondary" onClick={() => navigate(`/ai/chat/${sessionId}`)}>
              Вернуться в чат
            </Button>
            <Button
              onClick={() => {
                track('ai_to_lead_conversion', { session_id: sessionId, source: 'manual_cta' });
                navigate('/lead');
              }}
            >
              Создать заявку
            </Button>
          </div>
        </>
      ) : null}
    </AppShell>
  );
}
