import type { PropsWithChildren } from 'react';

export function Field({ label, hint, error, children }: PropsWithChildren<{ label: string; hint?: string; error?: string }>) {
  return (
    <label className="ax-col" style={{ gap: 6 }}>
      <span style={{ fontSize: '14px', fontWeight: 600 }}>{label}</span>
      {children}
      {error ? <span className="ax-error">{error}</span> : null}
      {!error && hint ? <span className="ax-muted" style={{ fontSize: 12 }}>{hint}</span> : null}
    </label>
  );
}
