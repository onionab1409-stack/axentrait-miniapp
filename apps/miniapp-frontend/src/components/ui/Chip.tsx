import type { PropsWithChildren } from 'react';

type ChipProps = {
  active?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
};

export function Chip({ children, active, onClick, style }: PropsWithChildren<ChipProps>) {
  return (
    <span
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(event) => {
        if (!onClick) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 36,
        padding: '6px 12px',
        fontSize: 12,
        fontWeight: 500,
        borderRadius: 8,
        background: active ? 'rgba(34, 211, 238, 0.12)' : 'rgba(255, 255, 255, 0.04)',
        color: active ? '#22D3EE' : 'rgba(240, 246, 252, 0.65)',
        border: `1px solid ${active ? 'rgba(34, 211, 238, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all var(--ax-duration-fast, 150ms) var(--ax-ease, cubic-bezier(0.16,1,0.3,1))',
        whiteSpace: 'nowrap',
        letterSpacing: '0.01em',
        userSelect: 'none',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
