import { ArrowRight } from 'lucide-react';

type ChatComposerProps = {
  value: string;
  placeholder: string;
  maxLength?: number;
  isStreaming?: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onOpenResult: () => void;
};

export function ChatComposer({
  value,
  placeholder,
  maxLength = 4000,
  isStreaming,
  onChange,
  onSend,
}: ChatComposerProps) {
  const disabled = Boolean(isStreaming || value.trim().length === 0);

  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <textarea
        className="chat-input"
        rows={1}
        maxLength={maxLength}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (!disabled) onSend();
          }
        }}
        style={{
          flex: 1,
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(126,232,242,0.15)',
          borderRadius: 14,
          padding: '14px 16px',
          color: '#F0F6FC',
          fontSize: 14,
          fontWeight: 300,
          resize: 'none',
          outline: 'none',
          minHeight: 44,
          maxHeight: 120,
        }}
        placeholder={placeholder}
      />

      <button
        type="button"
        onClick={onSend}
        disabled={disabled}
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'rgba(34,211,238,0.15)',
          border: 'none',
          boxShadow: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          flexShrink: 0,
          opacity: disabled ? 0.4 : 1,
        }}
      >
        {isStreaming ? (
          <span style={{
            width: 16, height: 16,
            border: '2px solid rgba(34,211,238,0.5)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block',
          }} />
        ) : (
          <ArrowRight size={18} color="rgba(34,211,238,0.5)" />
        )}
      </button>
    </div>
  );
}
