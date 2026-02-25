import { useParams } from 'react-router-dom';
import { Card } from '../shared/ui/Card';
import { Page } from '../shared/layout/Page';

export function RoutePage({ title }: { title: string }) {
  const params = useParams();

  return (
    <Page>
      <Card>
        <h1>{title}</h1>
        <p>Базовый экран MVP. Дальше здесь будет реализация бизнес-логики.</p>
        {Object.keys(params).length > 0 ? <pre>{JSON.stringify(params, null, 2)}</pre> : null}
      </Card>
    </Page>
  );
}
