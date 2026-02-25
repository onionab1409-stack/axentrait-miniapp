import { Button } from './Button';

type ErrorStateProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Ошибка загрузки',
  description = 'Не удалось загрузить данные. Попробуйте снова.',
  retryLabel = 'Повторить',
  onRetry,
}: ErrorStateProps) {
  return (
    <section className="ax-card ax-col" style={{ gap: 10, textAlign: 'center', alignItems: 'center' }}>
      <h3 className="h2" style={{ fontSize: 20 }}>
        {title}
      </h3>
      <p className="p muted">{description}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </section>
  );
}
