import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { lookupScenarioMeta } from '../../shared/data';
import { track } from '../../shared/analytics/track';
import { uid } from '../../shared/utils/id';
import { useUiStore } from '../../shared/store/uiStore';
import { ChatMessageBubble } from '../../components/domain/ChatMessageBubble';
import { QuickPromptChips } from '../../components/domain/QuickPromptChips';
import { ChatComposer } from '../../components/domain/ChatComposer';
import { useAiChat } from './hooks/useAiChat';

const AI_MAX_MESSAGE_LENGTH = 4000;

export default function AiChatPage() {
  const navigate = useNavigate();
  const { sessionId: routeSessionId = 'new' } = useParams();
  const [searchParams] = useSearchParams();
  const [draft, setDraft] = useState('');
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const listRef = useRef<HTMLDivElement | null>(null);

  const scenarioRaw = searchParams.get('scenario') ?? 'ai.scenario.faq';
  const scenario = lookupScenarioMeta(scenarioRaw);
  const scenarioKey = scenario?.key ?? 'ai.scenario.faq';

  const chat = useAiChat({
    initialSessionId: routeSessionId,
    scenarioId: scenarioKey,
  });

  const pushToast = useUiStore((state) => state.pushToast);

  useEffect(() => {
    if (!chat.sessionId || chat.sessionId === routeSessionId) return;
    navigate(`/ai/chat/${chat.sessionId}?scenario=${encodeURIComponent(scenarioKey)}`, { replace: true });
  }, [chat.sessionId, navigate, routeSessionId, scenarioKey]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [chat.messages]);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const maxTurns = Math.max(1, scenario?.maxTurns ?? 6);
  const usedTurns = chat.messages.filter((message) => message.role === 'user').length;

  const quickPrompts = useMemo(() => {
    if (scenarioKey === 'ai.scenario.audit') {
      return [
        'Ручной процесс закупок в ERP',
        'Обработка обращений в техподдержке',
        'Согласование договоров между отделами',
      ];
    }
    if (scenarioKey === 'ai.scenario.usecase_finder') {
      return [
        'Подберите AI-сценарии для e-commerce поддержки',
        'Нужны идеи AI-пилота для логистики',
        'Где быстрее всего получить эффект в SaaS-команде?',
      ];
    }
    if (scenarioKey === 'ai.scenario.roi') {
      return [
        'Оцените ROI автоматизации обработки заявок',
        'Посчитайте окупаемость внедрения AI-ассистента',
        'Сравните экономику “как есть” и “как будет”',
      ];
    }
    return [
      'Сколько обычно длится пилот?',
      'Как выбрать подходящий пакет?',
      'С чего начать внедрение безопасно?',
    ];
  }, [scenarioKey]);

  const send = async (messageText: string) => {
    const content = messageText.trim().slice(0, AI_MAX_MESSAGE_LENGTH);
    if (!content || chat.isStreaming) return;

    if (!isOnline) {
      pushToast({
        id: uid('toast'),
        text: 'Нет сети. AI-чат недоступен офлайн.',
        tone: 'error',
      });
      return;
    }

    if (usedTurns >= maxTurns) {
      pushToast({
        id: uid('toast'),
        text: `Лимит сценария: ${maxTurns} сообщений. Откройте новый диалог.`,
        tone: 'info',
      });
      return;
    }

    const startedAt = Date.now();
    setDraft('');

    track('ai_message_sent', {
      scenario_id: scenarioKey,
      mode: scenario?.outputFormat ?? 'text',
    });

    try {
      await chat.sendMessage(content, scenarioKey);
      track('ai_response_received', {
        latency_ms: Date.now() - startedAt,
        scenario_id: scenarioKey,
      });
    } catch (err) {
      console.error('AI send error:', err);
      pushToast({
        id: uid('toast'),
        text: 'Не удалось отправить сообщение. Попробуйте ещё раз.',
        tone: 'error',
      });
    }
  };

  return (
    <AppShell title="Задайте вопрос искусственному интеллекту" showBack showBottomNav>
      {!isOnline ? (
        <ErrorState
          title="AI недоступен офлайн"
          description="Подключитесь к интернету, чтобы отправлять сообщения и получать ответы."
        />
      ) : null}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          background: 'rgba(245, 158, 11, 0.06)',
          borderRadius: 10,
          fontSize: 12,
          color: 'rgba(240, 246, 252, 0.5)',
          marginBottom: 12,
          border: '1px solid rgba(245, 158, 11, 0.1)',
        }}
      >
        <span style={{ fontSize: 14 }}>⚠️</span>
        <span>Не передавайте ПДн и коммерческие тайны</span>
        <span style={{ marginLeft: 'auto', color: '#22D3EE', fontWeight: 600 }}>
          {usedTurns}/{maxTurns}
        </span>
      </div>

      {chat.error ? (
        <Card>
          <p className="p" style={{ color: 'var(--ax-error-500)' }}>
            {chat.error}
          </p>
        </Card>
      ) : null}

      {chat.isLoading && chat.messages.length === 0 ? (
        <div className="ax-col" style={{ gap: 12 }}>
          <Skeleton height={120} />
          <Skeleton height={100} />
        </div>
      ) : null}

      {!chat.isLoading && chat.isError && chat.messages.length === 0 ? (
        <ErrorState
          title="Не удалось открыть чат"
          description={chat.error ?? 'Сервис AI временно недоступен'}
          onRetry={() => {
            void chat.refetchMessages();
            chat.clearError();
          }}
        />
      ) : null}

      {!chat.isLoading ? (
        <>
          <div ref={listRef} className="ax-chat-list">
            {chat.messages.length === 0 ? (
              <ChatMessageBubble
                message={{
                  id: 'welcome',
                  role: 'assistant',
                  content: 'Здравствуйте! Я AI-ассистент Axentrait. Задайте вопрос о наших услугах, кейсах или опишите вашу задачу.',
                  createdAt: new Date().toISOString(),
                }}
              />
            ) : null}

            {chat.messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}

            {chat.isStreaming ? (
              <article className="bubble-bot" style={{ width: 'fit-content' }}>
                <div className="ai-loading-dots" style={{ padding: 0 }}>
                  <div className="ai-loading-dot" />
                  <div className="ai-loading-dot" />
                  <div className="ai-loading-dot" />
                </div>
              </article>
            ) : null}
          </div>

          <QuickPromptChips prompts={quickPrompts} onSelect={(prompt) => setDraft(prompt)} />

          <ChatComposer
            value={draft}
            placeholder="Напишите сообщение..."
            maxLength={AI_MAX_MESSAGE_LENGTH}
            isStreaming={chat.isStreaming || !isOnline}
            onChange={setDraft}
            onSend={() => {
              void send(draft);
            }}
            onOpenResult={() => navigate(`/ai/result/${chat.sessionId ?? routeSessionId}`)}
          />
        </>
      ) : null}
    </AppShell>
  );
}
