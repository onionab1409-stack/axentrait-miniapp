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
        padding: '4px 10px',
        fontSize: 11,
        fontWeight: 500,
        borderRadius: 8,
        background: active ? 'rgba(34, 211, 238, 0.12)' : 'transparent',
        color: active ? '#22D3EE' : 'rgba(126, 232, 242, 0.5)',
        border: `1px solid ${active ? 'rgba(34, 211, 238, 0.2)' : 'rgba(126, 232, 242, 0.15)'}`,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
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
