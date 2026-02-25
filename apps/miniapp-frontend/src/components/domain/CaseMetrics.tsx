import type { CaseStudy } from '../../shared/types/content';

export function CaseMetrics({ caseStudy }: { caseStudy: CaseStudy }) {
  const items = caseStudy.metrics.items ?? [];

  return (
    <div className="ax-grid ax-grid-2">
      {items.map((item) => (
        <article key={`${item.label}:${item.value}`} className="ax-card" style={{ padding: 12 }}>
          <div className="ax-col" style={{ gap: 6 }}>
            <strong className="metric" style={{ color: 'var(--app-accent)', fontSize: 18 }}>
              {item.value}
            </strong>
            <span style={{ fontWeight: 600 }}>{item.label}</span>
            <span className="ax-muted" style={{ fontSize: 13 }}>
              {item.description}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
