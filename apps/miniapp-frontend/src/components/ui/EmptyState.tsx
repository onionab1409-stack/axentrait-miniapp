import { Button } from './Button';

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <section className="ax-card ax-col" style={{ gap: 10, textAlign: 'center', alignItems: 'center' }}>
      <h3 className="h2" style={{ fontSize: 20 }}>
        {title}
      </h3>
      {description ? <p className="p muted">{description}</p> : null}
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  );
}
