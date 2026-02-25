import { Button } from '../ui/Button';

type AiResult = {
  context?: string;
  assumptions?: string[];
  recommendations?: string[];
  implementation_plan?: string[];
  risks_and_mitigations?: string[];
  next_step?: string;
};

export function AiResultCard({ result, onCta }: { result: AiResult; onCta: () => void }) {
  return (
    <section className="ax-card ax-col" style={{ gap: 12 }}>
      <h2 className="h2">AI Result</h2>

      <div className="ax-col">
        <strong>Context</strong>
        <span className="ax-muted">{result.context ?? 'Контекст не определен.'}</span>
      </div>

      <div className="ax-col">
        <strong>Assumptions</strong>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {(result.assumptions ?? []).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="ax-col">
        <strong>Recommendations</strong>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          {(result.recommendations ?? []).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </div>

      <div className="ax-col">
        <strong>Implementation plan</strong>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {(result.implementation_plan ?? []).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="ax-col">
        <strong>Risks & Mitigations</strong>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {(result.risks_and_mitigations ?? []).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      {result.next_step ? <p className="p muted">{result.next_step}</p> : null}
      <Button onClick={onCta} fullWidth>
        Создать заявку
      </Button>
    </section>
  );
}
