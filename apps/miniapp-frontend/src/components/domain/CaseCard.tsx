import { getTagLabel } from '../../config/tagLabels';
import type { CaseStudy } from '../../shared/types/content';
import { MjImage } from '../ui/MjImage';

const CASE_IMAGE_MAP: Record<string, string> = {
  'E-commerce': 'case-ecommerce',
  'Финтех': 'case-fintech',
  'Ритейл': 'case-retail',
  'Логистика': 'case-logistics',
  'Медтех': 'case-medtech',
  'SaaS': 'case-saas',
  'Производство': 'case-manufacturing',
};

export function CaseCard({ caseStudy, onClick }: { caseStudy: CaseStudy; onClick?: () => void }) {
  const imageId = CASE_IMAGE_MAP[caseStudy.clientIndustry] ?? 'case-ecommerce';

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: '1px solid var(--app-border)',
        borderRadius: 16,
        overflow: 'hidden',
        background: 'var(--app-card)',
        padding: 0,
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <MjImage id={imageId} height={180} borderRadius={0} alt={caseStudy.title}>
        <div style={{ fontSize: 11, color: 'rgba(240,246,252,0.45)', marginBottom: 4 }}>{caseStudy.clientIndustry}</div>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.25, marginBottom: 6, color: '#fff' }}>{caseStudy.title}</div>
        {caseStudy.metrics.headline ? (
          <div style={{ fontSize: 14, color: '#22D3EE', fontWeight: 600, marginBottom: 8 }}>{caseStudy.metrics.headline}</div>
        ) : null}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {caseStudy.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 11,
                color: 'rgba(240,246,252,0.9)',
                border: '1px solid rgba(240,246,252,0.24)',
                borderRadius: 999,
                padding: '2px 8px',
              }}
            >
              {getTagLabel(tag)}
            </span>
          ))}
        </div>
      </MjImage>
    </button>
  );
}
