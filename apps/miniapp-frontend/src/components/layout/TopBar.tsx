import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

type TopBarProps = {
  title: string;
  onBack?: () => void;
  rightSlot?: ReactNode;
};

export function TopBar({ title, onBack, rightSlot }: TopBarProps) {
  return (
    <header className="ax-row" style={{ justifyContent: 'space-between', minHeight: 44, borderBottom: '1px solid var(--ax-border)', boxShadow: 'var(--ax-shadow-sm)' }}>
      <div className="ax-row" style={{ minWidth: 0 }}>
        {onBack ? (
          <button
            type="button"
            className="ax-btn ax-btn-ghost"
            onClick={onBack}
            aria-label="Назад"
            style={{ minHeight: 40, minWidth: 40, paddingInline: 10 }}
          >
            <ArrowLeft size={16} />
          </button>
        ) : null}
        <strong style={{ fontSize: 18, marginLeft: onBack ? 6 : 0 }}>{title}</strong>
      </div>
      {rightSlot}
    </header>
  );
}
