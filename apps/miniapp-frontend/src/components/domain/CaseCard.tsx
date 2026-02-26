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
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 18,
        overflow: 'hidden',
        height: 200,
        background: 'transparent',
        padding: 0,
        textAlign: 'left',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        width: '100%',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <MjImage id={imageId} height="100%" borderRadius={0} scrim={false} alt={caseStudy.title} />
      </div>
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: 'linear-gradient(180deg, transparent 40%, rgba(5,10,15,0.8) 100%)',
        borderRadius: 18,
      }} />
      <span style={{
        fontSize: 16,
        fontWeight: 300,
        lineHeight: 1.25,
        letterSpacing: '0.5px',
        color: '#7EE8F2',
        position: 'relative',
        zIndex: 2,
        padding: 16,
      }}>
        {caseStudy.title}
      </span>
    </button>
  );
}
