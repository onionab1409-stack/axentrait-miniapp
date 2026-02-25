import type { CSSProperties } from 'react';
import type { ChatMessage } from '../../shared/types/ai';

type ChatMessageBubbleProps = {
  message: ChatMessage;
};

const avatarStyle: CSSProperties = {
  width: 32,
  height: 32,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #22D3EE, #0891B2)',
  color: '#fff',
  fontSize: 11,
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  if (message.role === 'user') {
    return <article className="bubble-user">{message.content}</article>;
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
      <div style={avatarStyle}>AX</div>
      <article className="bubble-bot">{message.content}</article>
    </div>
  );
}
