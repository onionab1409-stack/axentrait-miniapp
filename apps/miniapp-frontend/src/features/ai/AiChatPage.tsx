import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { BottomNav } from '../../components/layout/BottomNav';
import { ToastHost } from '../../components/ui/ToastHost';
import { MjImage } from '../../components/ui/MjImage';
import { ErrorState } from '../../components/ui/ErrorState';
import { Skeleton } from '../../components/ui/Skeleton';
import { lookupScenarioMeta } from '../../shared/data';
import { track } from '../../shared/analytics/track';
import { uid } from '../../shared/utils/id';
import { useUiStore } from '../../shared/store/uiStore';
import { ChatMessageBubble } from '../../components/domain/ChatMessageBubble';
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
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Fullscreen background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MjImage id="hero-ai-hub" height="100%" borderRadius={0} scrim={false} alt="AI bg" />
      </div>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 1, height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: '64px 20px 80px',
      }}>
        <h1 style={{
          fontSize: 26,
          fontWeight: 300,
          color: '#7EE8F2',
          letterSpacing: '0.5px',
          textShadow: '0 0 30px rgba(34,211,238,0.2)',
          margin: 0,
          marginBottom: 20,
        }}>
          Задайте вопрос<br/>искусственному интеллекту
        </h1>

        {!isOnline ? (
          <ErrorState
            title="AI недоступен офлайн"
            description="Подключитесь к интернету, чтобы отправлять сообщения и получать ответы."
          />
        ) : null}

        {chat.error ? (
          <p style={{ color: 'var(--ax-error-500)', fontSize: 14, margin: '0 0 12px' }}>
            {chat.error}
          </p>
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
            <div ref={listRef} style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              gap: 12,
              marginBottom: 16,
              overflowY: 'auto',
            }}>
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
      </div>

      <BottomNav />
      <ToastHost />
    </div>
  );
}
