export function OfflineBanner() {
  return (
    <div
      role="status"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        background: 'var(--ax-warning-500)',
        color: '#1a1300',
        padding: '8px 12px',
        fontSize: '13px',
        textAlign: 'center',
      }}
    >
      Нет сети. Offline mode: каталог доступен из кэша, AI и отправка заявок временно недоступны.
    </div>
  );
}
