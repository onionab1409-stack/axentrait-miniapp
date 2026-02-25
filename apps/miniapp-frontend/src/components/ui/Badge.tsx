import type { PropsWithChildren } from 'react';

export function Badge({ children }: PropsWithChildren) {
  return (
    <span
      style={{
        border: '1px solid var(--app-border)',
        borderRadius: 999,
        padding: '4px 10px',
        fontSize: '12px',
        color: 'var(--app-text-muted)',
      }}
    >
      {children}
    </span>
  );
}
