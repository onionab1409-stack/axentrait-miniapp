import type { CSSProperties, PropsWithChildren } from 'react';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass' | 'elevated' | 'interactive';
  padding?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  onClick?: () => void;
  className?: string;

  // Legacy compatibility
  interactive?: boolean;
  elevation?: 'none' | 'sm' | 'md';
}

const cardVariants: Record<Exclude<CardProps['variant'], undefined>, CSSProperties> = {
  default: {
    background: 'var(--ax-surface-card, rgba(12, 22, 32, 0.85))',
    border: '1px solid var(--ax-border, rgba(255,255,255,0.06))',
    boxShadow: 'var(--ax-shadow-sm)',
  },
  glass: {
    background: 'var(--ax-glass-bg, rgba(15, 30, 45, 0.45))',
    backdropFilter: 'blur(var(--ax-glass-blur, 16px))',
    WebkitBackdropFilter: 'blur(var(--ax-glass-blur, 16px))',
    border: '1px solid var(--ax-glass-border, rgba(255,255,255,0.08))',
    boxShadow: 'var(--ax-shadow-md)',
  },
  elevated: {
    background: 'linear-gradient(145deg, rgba(15, 30, 45, 0.8), rgba(8, 16, 25, 0.95))',
    border: '1px solid rgba(34, 211, 238, 0.08)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), var(--ax-shadow-glow)',
  },
  interactive: {
    background: 'var(--ax-surface-card, rgba(12, 22, 32, 0.85))',
    border: '1px solid var(--ax-border, rgba(255,255,255,0.06))',
    boxShadow: 'var(--ax-shadow-sm)',
    cursor: 'pointer',
    transition: 'all var(--ax-duration-base, 250ms) var(--ax-ease, cubic-bezier(0.16,1,0.3,1))',
  },
};

const cardPaddings: Record<Exclude<CardProps['padding'], undefined>, string> = {
  sm: '12px',
  md: '16px',
  lg: '20px',
};

export function Card({
  children,
  variant,
  padding = 'md',
  style,
  onClick,
  className,
  interactive,
  elevation,
}: PropsWithChildren<CardProps>) {
  const resolvedVariant = variant ?? (interactive ? 'interactive' : elevation === 'md' ? 'elevated' : 'default');

  return (
    <section
      className={className}
      onClick={onClick}
      style={{
        ...cardVariants[resolvedVariant],
        padding: cardPaddings[padding],
        borderRadius: 'var(--ax-radius-lg, 18px)',
        ...style,
      }}
    >
      {children}
    </section>
  );
}
