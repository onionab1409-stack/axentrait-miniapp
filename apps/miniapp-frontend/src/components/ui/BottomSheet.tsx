type BottomSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function BottomSheet({ open, title, onClose, children }: BottomSheetProps) {
  if (!open) return null;

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.38)',
        zIndex: 65,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="ax-card ax-col"
        onClick={(event) => event.stopPropagation()}
        style={{
          width: '100%',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          minHeight: 160,
          paddingBottom: 'calc(var(--ax-space-4) + var(--ax-safe-bottom))',
        }}
      >
        <strong>{title}</strong>
        {children}
      </section>
    </div>
  );
}
