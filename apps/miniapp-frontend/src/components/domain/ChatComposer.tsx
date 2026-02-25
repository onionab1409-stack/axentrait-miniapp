import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

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
  onOpenResult,
}: ChatComposerProps) {
  const disabled = Boolean(isStreaming || value.trim().length === 0);

  return (
    <>
      <div className="ax-row" style={{ justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm" onClick={onOpenResult}>
          Показать результат
        </Button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '10px 12px',
          background: 'rgba(12, 22, 32, 0.9)',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 14,
          position: 'sticky',
          bottom: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          zIndex: 5,
          backdropFilter: 'blur(8px)',
        }}
      >
        <textarea
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
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 12,
            padding: '12px 14px',
            color: '#F0F6FC',
            fontSize: 15,
            resize: 'none',
            outline: 'none',
            minHeight: 44,
            maxHeight: 120,
          }}
          placeholder={placeholder}
        />

        <Button
          variant="primary"
          size="sm"
          onClick={onSend}
          disabled={disabled}
          loading={Boolean(isStreaming)}
          icon={<ArrowRight size={16} />}
          style={{ borderRadius: 12, padding: '12px 14px', alignSelf: 'flex-end', minWidth: 44 }}
        >
          {!isStreaming ? '→' : ''}
        </Button>
      </div>
    </>
  );
}
