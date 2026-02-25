import { useEffect } from 'react';
import { useUiStore } from '../../shared/store/uiStore';

export function ToastHost() {
  const toasts = useUiStore((s) => s.toasts);
  const removeToast = useUiStore((s) => s.removeToast);

  useEffect(() => {
    if (!toasts.length) return;
    const timer = setTimeout(() => {
      removeToast(toasts[0].id);
    }, 2800);
    return () => clearTimeout(timer);
  }, [toasts, removeToast]);

  if (!toasts.length) return null;

  return (
    <div style={{ position: 'fixed', right: 12, bottom: 20, zIndex: 50, display: 'grid', gap: 8 }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            border: '1px solid var(--app-border)',
            background: 'var(--app-card)',
            borderRadius: 12,
            padding: '8px 10px',
            minWidth: 220,
          }}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
